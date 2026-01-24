<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use App\Models\PaymentTracker;
use App\Models\OrderSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CustomerOrdersController extends Controller
{
    protected $user;

    public function __construct()
    {
        $this->user = Auth::user();
    }

    /**
     * Get unpaid orders for a specific customer (orders with balance > 0)
     *
     * @param  int  $customerId
     * @return \Illuminate\Http\Response
     */
    public function getUnpaidOrders($customerId)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;

        Log::info("Fetching unpaid orders for customer ID: " . $customerId);

        try {
            // Verify customer belongs to company (for non-admin users)
            if ($userType != 0) {
                $customer = Customer::where('id', $customerId)
                    ->where('company_id', $companyId)
                    ->first();
                
                if (!$customer) {
                    return response()->json(['error' => 'Customer not found or access denied'], 404);
                }
            }

            // Fetch orders with unpaid balance (finalAmount > paidAmount)
            // ✅ FIXED: Using correct column names (camelCase)
            $unpaidOrders = Order::where('customer_id', $customerId)
                ->where(function ($query) use ($userType, $companyId) {
                    if ($userType != 0) {
                        $query->where('company_id', $companyId);
                    }
                })
                ->whereRaw('finalAmount > COALESCE(paidAmount, 0)')
                ->select([
                    'id',
                    'deliveryDate',
                    'deliveryTime', 
                    'finalAmount',
                    'paidAmount',
                    DB::raw('(finalAmount - COALESCE(paidAmount, 0)) as unpaidAmount'),
                    'orderStatus',
                    'created_at',
                    'updated_at'
                ])
                ->orderBy('deliveryDate', 'asc') // Show oldest orders first for payment priority
                ->get();

            // Format the response
            $formattedOrders = $unpaidOrders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'deliveryDate' => $order->deliveryDate,
                    'deliveryTime' => $order->deliveryTime,
                    'finalAmount' => (float) $order->finalAmount,
                    'paidAmount' => (float) ($order->paidAmount ?? 0),
                    'unpaidAmount' => (float) $order->unpaidAmount,
                    'orderStatus' => $order->orderStatus,
                    'createdAt' => $order->created_at,
                    'updatedAt' => $order->updated_at
                ];
            });

            Log::info("Found " . $formattedOrders->count() . " unpaid orders for customer ID: " . $customerId);

            return response()->json($formattedOrders, 200);

        } catch (\Exception $e) {
            Log::error("Error fetching unpaid orders for customer ID: " . $customerId . " - " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch unpaid orders', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update payment for a specific order with smart allocation
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $orderId
     * @return \Illuminate\Http\Response
     */
    public function updateOrderPayment(Request $request, $orderId)
    {
        $request->validate([
            'paymentAmount' => 'required|numeric|min:0.01',
        ]);

        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;
        $paymentAmount = (float) $request->input('paymentAmount');

        Log::info("Updating payment for order ID: " . $orderId . " with amount: " . $paymentAmount);

        DB::beginTransaction();

        try {
            // Find the order
            $order = Order::where('id', $orderId)
                ->where(function ($query) use ($userType, $companyId) {
                    if ($userType != 0) {
                        $query->where('company_id', $companyId);
                    }
                })
                ->first();

            if (!$order) {
                return response()->json(['error' => 'Order not found or access denied'], 404);
            }

            // Calculate current unpaid amount
            $currentPaidAmount = (float) ($order->paidAmount ?? 0);
            $unpaidAmount = (float) ($order->finalAmount - $currentPaidAmount);

            // Validate payment amount
            if ($paymentAmount > $unpaidAmount) {
                return response()->json([
                    'error' => 'Payment amount cannot exceed unpaid amount',
                    'unpaid_amount' => $unpaidAmount,
                    'max_allowed' => $unpaidAmount
                ], 400);
            }

            // Update the paid amount for this order
            $newPaidAmount = $currentPaidAmount + $paymentAmount;
            $order->update([
                'paidAmount' => $newPaidAmount,
                'updated_by' => $user->id,
                'updated_at' => now()
            ]);

            // ✅ NEW: Update OrderSummary when payment is made
            $this->updateOrderSummaryPayment($order->deliveryDate, $order->company_id, $paymentAmount);

            // Update payment tracker
            $this->updatePaymentTracker($order->customer_id, $paymentAmount);

            // Return updated order information
            $updatedOrder = [
                'id' => $order->id,
                'finalAmount' => (float) $order->finalAmount,
                'paidAmount' => (float) $newPaidAmount,
                'unpaidAmount' => (float) ($order->finalAmount - $newPaidAmount),
                'deliveryDate' => $order->deliveryDate,
                'deliveryTime' => $order->deliveryTime,
            ];

            DB::commit();

            Log::info("Payment updated successfully for order ID: " . $orderId);

            return response()->json([
                'success' => true,
                'message' => 'Payment updated successfully',
                'order' => $updatedOrder
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating payment for order ID: " . $orderId . " - " . $e->getMessage());
            return response()->json(['error' => 'Failed to update payment', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Smart payment allocation - pay oldest orders first
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $customerId
     * @return \Illuminate\Http\Response
     */
    public function allocatePaymentSmartly(Request $request, $customerId)
    {
        $request->validate([
            'paymentAmount' => 'required|numeric|min:0.01',
        ]);

        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;
        $totalPaymentAmount = (float) $request->input('paymentAmount');

        Log::info("Smart payment allocation for customer ID: " . $customerId . " with amount: " . $totalPaymentAmount);

        DB::beginTransaction();

        try {
            // Verify customer access
            if ($userType != 0) {
                $customer = Customer::where('id', $customerId)
                    ->where('company_id', $companyId)
                    ->first();
                
                if (!$customer) {
                    return response()->json(['error' => 'Customer not found or access denied'], 404);
                }
            }

            // Get unpaid orders sorted by delivery date (oldest first)
            $unpaidOrders = Order::where('customer_id', $customerId)
                ->where(function ($query) use ($userType, $companyId) {
                    if ($userType != 0) {
                        $query->where('company_id', $companyId);
                    }
                })
                ->whereRaw('finalAmount > COALESCE(paidAmount, 0)')
                ->orderBy('deliveryDate', 'asc')
                ->get();

            if ($unpaidOrders->isEmpty()) {
                return response()->json(['error' => 'No unpaid orders found for this customer'], 404);
            }

            $remainingAmount = $totalPaymentAmount;
            $updatedOrders = [];
            $paymentsApplied = [];
            $orderSummaryUpdates = []; // Track OrderSummary updates by date

            // Allocate payment to orders starting from oldest
            foreach ($unpaidOrders as $order) {
                if ($remainingAmount <= 0) {
                    break;
                }

                $currentPaidAmount = (float) ($order->paidAmount ?? 0);
                $unpaidAmount = (float) ($order->finalAmount - $currentPaidAmount);

                if ($unpaidAmount <= 0) {
                    continue; // Skip if already fully paid
                }

                // Calculate how much to pay for this order
                $paymentForThisOrder = min($remainingAmount, $unpaidAmount);
                $newPaidAmount = $currentPaidAmount + $paymentForThisOrder;

                // Update the order
                $order->update([
                    'paidAmount' => $newPaidAmount,
                    'updated_by' => $user->id,
                    'updated_at' => now()
                ]);

                // ✅ NEW: Track OrderSummary updates by delivery date
                $deliveryDate = $order->deliveryDate;
                if (!isset($orderSummaryUpdates[$deliveryDate])) {
                    $orderSummaryUpdates[$deliveryDate] = ['company_id' => $order->company_id, 'payment' => 0];
                }
                $orderSummaryUpdates[$deliveryDate]['payment'] += $paymentForThisOrder;

                $paymentsApplied[] = [
                    'order_id' => $order->id,
                    'payment_applied' => $paymentForThisOrder,
                    'previous_paid' => $currentPaidAmount,
                    'new_paid' => $newPaidAmount,
                    'remaining_unpaid' => $order->finalAmount - $newPaidAmount
                ];

                $updatedOrders[] = [
                    'id' => $order->id,
                    'finalAmount' => (float) $order->finalAmount,
                    'paidAmount' => (float) $newPaidAmount,
                    'unpaidAmount' => (float) ($order->finalAmount - $newPaidAmount),
                    'deliveryDate' => $order->deliveryDate,
                    'paymentApplied' => $paymentForThisOrder
                ];

                $remainingAmount -= $paymentForThisOrder;
            }

            // ✅ NEW: Update OrderSummary for each affected delivery date
            foreach ($orderSummaryUpdates as $deliveryDate => $data) {
                $this->updateOrderSummaryPayment($deliveryDate, $data['company_id'], $data['payment']);
            }

            // Update payment tracker
            $this->updatePaymentTracker($customerId, $totalPaymentAmount);

            DB::commit();

            Log::info("Smart payment allocation completed for customer ID: " . $customerId);

            return response()->json([
                'success' => true,
                'message' => 'Payment allocated successfully',
                'total_payment' => $totalPaymentAmount,
                'amount_used' => $totalPaymentAmount - $remainingAmount,
                'amount_remaining' => $remainingAmount,
                'payments_applied' => $paymentsApplied,
                'updated_orders' => $updatedOrders
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error in smart payment allocation for customer ID: " . $customerId . " - " . $e->getMessage());
            return response()->json(['error' => 'Failed to allocate payment', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle customer return money and update credit report
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $customerId
     * @return \Illuminate\Http\Response
     */
    public function processReturnMoney(Request $request, $customerId)
    {
        $request->validate([
            'returnAmount' => 'required|numeric|min:0.01',
            'deliveryDate' => 'required|date',
            'reason' => 'nullable|string|max:255'
        ]);

        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;
        $returnAmount = (float) $request->input('returnAmount');
        $deliveryDate = $request->input('deliveryDate');
        $reason = $request->input('reason', 'Customer return money');

        Log::info("Processing return money for customer ID: " . $customerId . " with amount: " . $returnAmount);

        DB::beginTransaction();

        try {
            // Verify customer access
            if ($userType != 0) {
                $customer = Customer::where('id', $customerId)
                    ->where('company_id', $companyId)
                    ->first();
                
                if (!$customer) {
                    return response()->json(['error' => 'Customer not found or access denied'], 404);
                }
            }

            // ✅ NEW: Update PaymentTracker (reduce amount = increase credit)
            $paymentTracker = PaymentTracker::firstOrNew(['customer_id' => $customerId]);
            $paymentTracker->amount = ($paymentTracker->amount ?? 0) - $returnAmount; // Reduce amount (increase credit)
            $paymentTracker->updated_by = $user->id;
            $paymentTracker->company_id = $companyId;
            $paymentTracker->save();

            // ✅ NEW: Update OrderSummary - reduce paid_amount for the delivery date
            $this->updateOrderSummaryPayment($deliveryDate, $companyId, -$returnAmount);

            // ✅ Optional: Log the return transaction
            Log::info("Return money processed: Customer ID: " . $customerId . ", Amount: " . $returnAmount . ", Reason: " . $reason);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Return money processed successfully',
                'return_amount' => $returnAmount,
                'customer_id' => $customerId,
                'new_credit_balance' => $paymentTracker->amount
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error processing return money for customer ID: " . $customerId . " - " . $e->getMessage());
            return response()->json(['error' => 'Failed to process return money', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update payment tracker when order payment is made
     *
     * @param  int  $customerId
     * @param  float  $paymentAmount
     * @return void
     */
    private function updatePaymentTracker($customerId, $paymentAmount)
    {
        try {
            $paymentTracker = PaymentTracker::where('customer_id', $customerId)->first();
            
            if ($paymentTracker) {
                // Update existing tracker - add payment (reduce debt)
                $paymentTracker->update([
                    'amount' => $paymentTracker->amount + $paymentAmount,
                    'updated_by' => $this->user->id,
                    'updated_at' => now()
                ]);
                
                Log::info("Updated payment tracker for customer ID: " . $customerId . " with amount: " . $paymentAmount);
            } else {
                // Create new payment tracker entry
                PaymentTracker::create([
                    'customer_id' => $customerId,
                    'amount' => $paymentAmount,
                    'isCredit' => false, // This is a payment, not credit
                    'created_by' => $this->user->id,
                    'company_id' => $this->user->company_id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                Log::info("Created new payment tracker for customer ID: " . $customerId . " with amount: " . $paymentAmount);
            }
        } catch (\Exception $e) {
            Log::error("Error updating payment tracker for customer ID: " . $customerId . " - " . $e->getMessage());
            // Don't throw error as order payment was successful
        }
    }

    /**
     * ✅ NEW: Update OrderSummary paid_amount for a specific delivery date
     *
     * @param  string  $deliveryDate
     * @param  int  $companyId
     * @param  float  $paymentAmount (can be negative for returns)
     * @return void
     */
    private function updateOrderSummaryPayment($deliveryDate, $companyId, $paymentAmount)
    {
        try {
            OrderSummary::updateOrCreate(
                [
                    'invoice_date' => $deliveryDate, // Using deliveryDate as invoice_date
                    'company_id' => $companyId
                ],
                [
                    'paid_amount' => DB::raw("COALESCE(paid_amount, 0) + {$paymentAmount}")
                ]
            );
            
            Log::info("Updated OrderSummary for delivery date: " . $deliveryDate . " with payment amount: " . $paymentAmount);
        } catch (\Exception $e) {
            Log::error("Error updating OrderSummary for delivery date: " . $deliveryDate . " - " . $e->getMessage());
            throw $e; // Re-throw to trigger transaction rollback
        }
    }

    /**
     * Get customer order summary
     *
     * @param  int  $customerId
     * @return \Illuminate\Http\Response
     */
    public function getCustomerOrderSummary($customerId)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;

        try {
            $summary = Order::where('customer_id', $customerId)
                ->where(function ($query) use ($userType, $companyId) {
                    if ($userType != 0) {
                        $query->where('company_id', $companyId);
                    }
                })
                ->selectRaw('
                    COUNT(*) as total_orders,
                    SUM(finalAmount) as total_amount,
                    SUM(COALESCE(paidAmount, 0)) as total_paid,
                    SUM(finalAmount - COALESCE(paidAmount, 0)) as total_unpaid,
                    COUNT(CASE WHEN finalAmount > COALESCE(paidAmount, 0) THEN 1 END) as unpaid_orders_count
                ')
                ->first();

            return response()->json([
                'total_orders' => (int) $summary->total_orders,
                'total_amount' => (float) ($summary->total_amount ?? 0),
                'total_paid' => (float) ($summary->total_paid ?? 0),
                'total_unpaid' => (float) ($summary->total_unpaid ?? 0),
                'unpaid_orders_count' => (int) $summary->unpaid_orders_count
            ], 200);

        } catch (\Exception $e) {
            Log::error("Error fetching customer order summary for customer ID: " . $customerId . " - " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch order summary', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get customer payment history
     *
     * @param  int  $customerId
     * @return \Illuminate\Http\Response
     */
    public function getCustomerPaymentHistory($customerId)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;

        try {
            // Verify customer access
            if ($userType != 0) {
                $customer = Customer::where('id', $customerId)
                    ->where('company_id', $companyId)
                    ->first();
                
                if (!$customer) {
                    return response()->json(['error' => 'Customer not found or access denied'], 404);
                }
            }

            // Get payment tracker
            $paymentTracker = PaymentTracker::where('customer_id', $customerId)->first();
            
            // Get recent orders with payment info
            $recentOrders = Order::where('customer_id', $customerId)
                ->where(function ($query) use ($userType, $companyId) {
                    if ($userType != 0) {
                        $query->where('company_id', $companyId);
                    }
                })
                ->select([
                    'id',
                    'deliveryDate',
                    'finalAmount',
                    'paidAmount',
                    'orderStatus',
                    'created_at',
                    'updated_at'
                ])
                ->orderBy('deliveryDate', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'current_balance' => (float) ($paymentTracker->amount ?? 0),
                'recent_orders' => $recentOrders->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'deliveryDate' => $order->deliveryDate,
                        'finalAmount' => (float) $order->finalAmount,
                        'paidAmount' => (float) ($order->paidAmount ?? 0),
                        'unpaidAmount' => (float) ($order->finalAmount - ($order->paidAmount ?? 0)),
                        'orderStatus' => $order->orderStatus,
                        'created_at' => $order->created_at,
                        'updated_at' => $order->updated_at
                    ];
                })
            ], 200);

        } catch (\Exception $e) {
            Log::error("Error fetching customer payment history for customer ID: " . $customerId . " - " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch payment history', 'message' => $e->getMessage()], 500);
        }
    }
}