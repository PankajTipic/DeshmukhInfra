<?php

// namespace App\Http\Controllers;

// use App\Models\SubcontractVendor;
// use App\Models\SubcontractVendorPaymentLog;
// use App\Models\Operator;                    // ← Added
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\DB;

// class SubcontractVendorController extends Controller
// {
//     public function index(Request $request)
//     {
//         $query = SubcontractVendor::with(['project', 'operator', 'order']);   // Changed 'vendor' to 'operator'

//         if ($request->has('order_id')) {
//             $query->where('order_id', $request->order_id);
//         }

//         $data = $query->get();

//         return response()->json([
//             'success' => true,
//             'data' => $data
//         ]);
//     }

//     public function show($id)
//     {
//         $subcontract = SubcontractVendor::with(['project', 'operator', 'order'])   // Changed 'vendor' to 'operator'
//                         ->findOrFail($id);

//         return response()->json([
//             'success' => true,
//             'data' => $subcontract
//         ]);
//     }

//     public function payments($id)
//     {
//         $payments = SubcontractVendorPaymentLog::where('subcontract_vendor_id', $id)
//                     ->orderBy('payment_date', 'desc')
//                     ->orderBy('created_at', 'desc')
//                     ->get();

//         return response()->json([
//             'success' => true,
//             'data' => $payments
//         ]);
//     }

//     public function recordPayment(Request $request, $id)
//     {
//         $user = auth()->user();

//         $validated = $request->validate([
//             'amount'          => 'required|numeric|min:0.01',
//             'payment_type'    => 'required|string|max:50',
//             'paid_by'         => 'required|string|max:255',
//             'payment_date'    => 'required|date',
//             'description'     => 'nullable|string|max:500',
//         ]);

//         DB::beginTransaction();

//         try {
//             $subcontract = SubcontractVendor::findOrFail($id);

//             if ($subcontract->company_id !== $user->company_id) {
//                 return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
//             }

//             $paymentAmount = round($validated['amount'], 2);

//             if ($paymentAmount > $subcontract->pending_amount) {
//                 return response()->json([
//                     'success' => false,
//                     'message' => 'Payment exceeds pending amount'
//                 ], 400);
//             }

//             // Create Payment Log
//             $paymentLog = SubcontractVendorPaymentLog::create([
//                 'subcontract_vendor_id' => $subcontract->id,
//                 'payment_type'          => $validated['payment_type'],
//                 'paid_by'               => $validated['paid_by'],
//                 'amount'                => $paymentAmount,
//                 'payment_date'          => $validated['payment_date'],
//                 'description'           => $validated['description'] ?? 'Payment recorded',
//             ]);

//             // Update Subcontract Vendor
//             $newPaid = round($subcontract->paid_amount + $paymentAmount, 2);
//             $newPending = round($subcontract->total_amount - $newPaid, 2);

//             $subcontract->update([
//                 'paid_amount'    => $newPaid,
//                 'pending_amount' => max(0, $newPending),
//             ]);

//             DB::commit();

//             return response()->json([
//                 'success' => true,
//                 'message' => 'Payment recorded successfully',
//                 'data' => $paymentLog
//             ]);

//         } catch (\Exception $e) {
//             DB::rollBack();
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Failed to record payment',
//                 'error'   => $e->getMessage()
//             ], 500);
//         }
//     }
// }









namespace App\Http\Controllers;

use App\Models\SubcontractVendor;
use App\Models\SubcontractVendorPaymentLog;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;



class SubcontractVendorController extends Controller
{
    public function index(Request $request)
    {
        $query = SubcontractVendor::with(['project', 'operator', 'order']);

        if ($request->has('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        $data = $query->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function show($id)
    {
        $subcontract = SubcontractVendor::with(['project', 'operator', 'order'])
                        ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $subcontract
        ]);
    }

    public function payments($id)
    {
        $payments = SubcontractVendorPaymentLog::where('subcontract_vendor_id', $id)
                    ->orderBy('payment_date', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    // ==================== RECORD NEW PAYMENT ====================
    public function recordPayment(Request $request, $id)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'amount'          => 'required|numeric|min:0.01',
            'payment_type'    => 'required|string|max:50',
            'paid_by'         => 'required|string|max:255',
            'payment_date'    => 'required|date',
            'description'     => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            $subcontract = SubcontractVendor::findOrFail($id);

            if ($subcontract->company_id !== $user->company_id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $paymentAmount = round($validated['amount'], 2);

            if ($paymentAmount > $subcontract->pending_amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment exceeds pending amount'
                ], 400);
            }

            // Create Payment Log
            $paymentLog = SubcontractVendorPaymentLog::create([
                'subcontract_vendor_id' => $subcontract->id,
                'payment_type'          => $validated['payment_type'],
                'paid_by'               => $validated['paid_by'],
                'amount'                => $paymentAmount,
                'payment_date'          => $validated['payment_date'],
                'description'           => $validated['description'] ?? 'Payment recorded',
            ]);

            // Update Subcontract Vendor
            $newPaid = round($subcontract->paid_amount + $paymentAmount, 2);
            $newPending = round($subcontract->total_amount - $newPaid, 2);

            $subcontract->update([
                'paid_amount'    => $newPaid,
                'pending_amount' => max(0, $newPending),
            ]);

            // ✅ Update Order Table (paidAmount)
            if ($subcontract->order_id) {
                $order = Order::find($subcontract->order_id);
                if ($order) {
                    $order->update([
                        'paidAmount' => ($order->paidAmount ?? 0) + $paymentAmount,
                        'updated_by' => $user->id,
                        'updated_at' => now()
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully',
                'data' => $paymentLog
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to record payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== UPDATE EXISTING PAYMENT ====================
    // public function updatePayment(Request $request, $paymentId)
    // {
    //     $user = auth()->user();

    //     $validated = $request->validate([
    //         'amount'          => 'required|numeric|min:0.01',
    //         'payment_type'    => 'required|string|max:50',
    //         'paid_by'         => 'required|string|max:255',
    //         'payment_date'    => 'required|date',
    //         'description'     => 'nullable|string|max:500',
    //     ]);

    //     DB::beginTransaction();

    //     try {
    //         $payment = SubcontractVendorPaymentLog::findOrFail($paymentId);
    //         $subcontract = SubcontractVendor::findOrFail($payment->subcontract_vendor_id);

    //         if ($subcontract->company_id !== $user->company_id) {
    //             return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
    //         }

    //         $oldAmount = $payment->amount;
    //         $newAmount = round($validated['amount'], 2);
    //         $diff = $newAmount - $oldAmount;

    //         // Update Payment Log
    //         $payment->update([
    //             'amount'          => $newAmount,
    //             'payment_type'    => $validated['payment_type'],
    //             'paid_by'         => $validated['paid_by'],
    //             'payment_date'    => $validated['payment_date'],
    //             'description'     => $validated['description'],
    //         ]);

    //         // Update Subcontract Vendor
    //         $newPaid = round($subcontract->paid_amount + $diff, 2);
    //         $newPending = round($subcontract->total_amount - $newPaid, 2);

    //         $subcontract->update([
    //             'paid_amount'    => $newPaid,
    //             'pending_amount' => max(0, $newPending),
    //         ]);

    //         // ✅ Update Order Table (paidAmount)
    //         if ($subcontract->order_id) {
    //             $order = Order::find($subcontract->order_id);
    //             if ($order) {
    //                 $order->update([
    //                     'paidAmount' => round(($order->paidAmount ?? 0) + $diff, 2),
    //                     'updated_by' => $user->id,
    //                     'updated_at' => now()
    //                 ]);
    //             }
    //         }

    //         DB::commit();

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Payment updated successfully',
    //             'data' => $payment
    //         ]);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to update payment',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }


    public function updatePayment(Request $request, $paymentId)
{
    $user = auth()->user();

    $validated = $request->validate([
        'amount'          => 'required|numeric|min:0.01',
        'payment_type'    => 'required|string|max:50',
        'paid_by'         => 'required|string|max:255',
        'payment_date'    => 'required|date',
        'description'     => 'nullable|string|max:500',
    ]);

    DB::beginTransaction();

    try {
        $payment = SubcontractVendorPaymentLog::findOrFail($paymentId);
        $subcontract = SubcontractVendor::findOrFail($payment->subcontract_vendor_id);

        if ($subcontract->company_id !== $user->company_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $oldAmount = round($payment->amount, 2);
        $newAmount = round($validated['amount'], 2);
        $diff = $newAmount - $oldAmount;

        // ✅ NEW VALIDATION: Check if new total paid exceeds total_amount
        $newTotalPaid = round($subcontract->paid_amount + $diff, 2);

        if ($newTotalPaid > $subcontract->total_amount) {
            return response()->json([
                'success' => false,
                'message' => 'Payment update exceeds total subcontract amount'
            ], 400);
        }

        // Update Payment Log
        $payment->update([
            'amount'          => $newAmount,
            'payment_type'    => $validated['payment_type'],
            'paid_by'         => $validated['paid_by'],
            'payment_date'    => $validated['payment_date'],
            'description'     => $validated['description'],
        ]);

        // Update Subcontract Vendor
        $newPaid = round($subcontract->paid_amount + $diff, 2);
        $newPending = round($subcontract->total_amount - $newPaid, 2);

        $subcontract->update([
            'paid_amount'    => $newPaid,
            'pending_amount' => max(0, $newPending),
        ]);

        // ✅ Update Order Table (paidAmount)
        if ($subcontract->order_id) {
            $order = Order::find($subcontract->order_id);
            if ($order) {
                $order->update([
                    'paidAmount' => round(($order->paidAmount ?? 0) + $diff, 2),
                    'updated_by' => $user->id,
                    'updated_at' => now()
                ]);
            }
        }

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Payment updated successfully',
            'data' => $payment->fresh()
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Failed to update payment',
            'error' => $e->getMessage()
        ], 500);
    }
}



public function subcontractLedgerReport(Request $request)
{
    try {
        $request->validate([
            'project_id'   => 'nullable|integer',
            'vendor_id'    => 'nullable|integer',
            'start_date'   => 'nullable|date',
            'end_date'     => 'nullable|date|after_or_equal:start_date',
        ]);

        $projectId = $request->input('project_id');
        $vendorId  = $request->input('vendor_id');
        $startDate = $request->input('start_date');
        $endDate   = $request->input('end_date');

        // Query all subcontracts matching filters (excluding date, date filters entries)
        $subcontracts = SubcontractVendor::with(['project', 'operator', 'order', 'paymentLogs'])
            ->when($projectId, fn($q) => $q->where('project_id', $projectId))
            ->when($vendorId, fn($q) => $q->where('vendor_id', $vendorId))
            ->get();

        // Group by Vendor (operator)
        $groupedSubcontracts = $subcontracts->groupBy('vendor_id');

        $grandTotal = [
            'vendor_count'   => 0,
            'total_debit'    => 0, // Total Subcontract Value
            'total_credit'   => 0, // Total Paid
            'net_balance'    => 0,
        ];

        $ledger = [];

        foreach ($groupedSubcontracts as $vid => $vendorSubcontracts) {
            $operator = $vendorSubcontracts->first()->operator;
            if (!$operator) continue;

            $openingBalance = 0;
            $entries = collect();

            $lifetimeDebit = 0;
            $lifetimeCredit = 0;

            foreach ($vendorSubcontracts as $subcontract) {
                $projectName = $subcontract->project->project_name ?? 'N/A';

                // Subcontract Value (Debit)
                $subDate = $subcontract->created_at ? $subcontract->created_at->format('Y-m-d') : date('Y-m-d');
                $lifetimeDebit += (float)$subcontract->total_amount;

                if ($startDate && $subDate < $startDate) {
                    $openingBalance += (float)$subcontract->total_amount;
                } else if (!$endDate || $subDate <= $endDate) {
                    $entries->push([
                        'date'        => $subDate,
                        'particulars' => 'Subcontract Created - [Project: ' . $projectName . ']',
                        'vch_type'    => 'Subcontract',
                        'vch_no'      => 'SC-' . $subcontract->id,
                        'debit'       => (float)$subcontract->total_amount, // We owe them (Credit balance technically, but Tally standard usually lists Bill as Credit, wait. Subcontract value increases payable. Payable is Credit. Debit decreases payable.
                        // wait, in my previous ledger, Purchase is Credit, Payment is Debit.
                        // Let's stick to the same: Bill = Credit, Paid = Debit.
                        'credit'      => (float)$subcontract->total_amount,
                        'debit'       => 0,
                        'type'        => 'subcontract_bill',
                    ]);
                }

                // Payment Logs (Debit / Reduces Payable)
                foreach ($subcontract->paymentLogs as $payment) {
                    $pDate = $payment->payment_date ? date('Y-m-d', strtotime($payment->payment_date)) : null;
                    $lifetimeCredit += (float)$payment->amount;

                    if ($startDate && $pDate && $pDate < $startDate) {
                        $openingBalance -= (float)$payment->amount;
                    } else if (!$endDate || !$pDate || $pDate <= $endDate) {
                        $entries->push([
                            'date'        => $pDate,
                            'particulars' => 'Payment - ' . ($payment->payment_type ?? 'Cash') .
                                             ($payment->description ? ' - ' . $payment->description : ''),
                            'vch_type'    => 'Payment',
                            'vch_no'      => 'SCP-' . $payment->id,
                            'debit'       => (float)$payment->amount,
                            'credit'      => 0,
                            'type'        => 'payment',
                        ]);
                    }
                }
            }

            $lifetimeBalance = $lifetimeDebit - $lifetimeCredit;

            $entries = $entries->sortBy('date')->values();

            $running = $openingBalance;
            $ledgerEntries = collect();

            if ($startDate) {
                $ledgerEntries->push([
                    'date'         => $startDate,
                    'particulars'  => 'Opening Balance',
                    'vch_type'     => '',
                    'vch_no'       => '',
                    'debit'        => $openingBalance < 0 ? abs($openingBalance) : 0,
                    'credit'       => $openingBalance > 0 ? abs($openingBalance) : 0,
                    'balance'      => abs($openingBalance),
                    'balance_type' => $openingBalance >= 0 ? 'Cr' : 'Dr',
                    'is_opening'   => true
                ]);
            }

            foreach ($entries as $entry) {
                $running += ($entry['credit'] - $entry['debit']);
                $entry['balance']      = abs($running);
                $entry['balance_type'] = $running >= 0 ? 'Cr' : 'Dr';
                $ledgerEntries->push($entry);
            }

            $periodPurchase = $entries->where('type', 'subcontract_bill')->sum('credit');
            $periodPaid     = $entries->where('type', 'payment')->sum('debit');

            $grandTotal['vendor_count']++;
            $grandTotal['total_debit']  += $lifetimeDebit;
            $grandTotal['total_credit'] += $lifetimeCredit;
            $grandTotal['net_balance']  += $lifetimeBalance;

            $ledger[] = [
                'vendor' => [
                    'id'      => $operator->id,
                    'name'    => $operator->name,
                    'mobile'  => $operator->mobile,
                    'address' => $operator->address,
                    'project_id' => $operator->project_id,
                ],
                'ledger_entries' => $ledgerEntries,
                'summary' => [
                    'opening_balance' => round($openingBalance, 2),
                    'period_purchase' => round($periodPurchase, 2),
                    'period_paid'     => round($periodPaid, 2),
                    'closing_balance' => round($running, 2),
                    'balance_status'  => $running >= 0 ? 'payable' : 'receivable',
                    'entry_count'     => $ledgerEntries->count(),
                ],
            ];
        }

        $grandTotal = array_map(fn($v) => round($v, 2), $grandTotal);
        $grandTotal['overall_status'] = $grandTotal['net_balance'] >= 0 ? 'payable' : 'receivable';

        return response()->json([
            'success'     => true,
            'data'        => $ledger,
            'grand_total' => $grandTotal,
            'filters_applied' => $request->only(['project_id', 'vendor_id', 'start_date', 'end_date'])
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}



}