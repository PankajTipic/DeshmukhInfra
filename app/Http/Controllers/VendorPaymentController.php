<?php

namespace App\Http\Controllers;

use App\Models\VendorPayment;
use App\Models\VendorPaymentLog;
use App\Models\VendorOnBehalfPaymentLog;
use App\Models\Operator;
use App\Models\Expense;
use App\Models\ExpenseType;
use App\Models\ExpenseSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VendorPaymentController extends Controller
{
    /**
     * Get or create vendor payment expense type
     */
    private function getVendorPaymentExpenseType($user = null)
    {
        if (!$user) {
            $user = Auth::user();
        }
        
        if (!$user) {
            throw new \Exception('User authentication required');
        }
        
        return ExpenseType::firstOrCreate(
            [
                'name' => 'Vendor Payment',
                'company_id' => $user->company_id,
            ],
            [
                'slug' => 'vendor-payment',
                'localName' => 'Vendor Payment',
                'expense_category' => 'vendor_payment',
                'desc' => 'Payment made to vendors/contractors',
                'show' => true,
            ]
        );
    }

    /**
     * Get or create on behalf payment expense type
     */
    private function getOnBehalfPaymentExpenseType($user = null)
    {
        if (!$user) {
            $user = Auth::user();
        }
        
        if (!$user) {
            throw new \Exception('User authentication required');
        }
        
        return ExpenseType::firstOrCreate(
            [
                'name' => 'On Behalf Vendor Payment',
                'company_id' => $user->company_id,
            ],
            [
                'slug' => 'on-behalf-vendor-payment',
                'localName' => 'On Behalf Vendor Payment',
                'expense_category' => 'on_behalf_vendor_payment',
                'desc' => 'Payment made on behalf of vendors',
                'show' => true,
            ]
        );
    }

    /**
     * Create expense entry for vendor payment
     */
    private function createExpenseForVendorPayment($vendorPayment, $log, $user = null)
    {
        if (!$user) {
            $user = Auth::user();
        }
        
        if (!$user) {
            throw new \Exception('User authentication required');
        }
        
        $expenseType = $this->getVendorPaymentExpenseType($user);

        $expense = Expense::create([
            'project_id' => $vendorPayment->project_id,
            'name' => "Vendor Payment - " . ($vendorPayment->vendor->name ?? 'Unknown Vendor'),
            'expense_date' => $log->payment_date,
            'price' => $log->amount,
            'qty' => 1,
            'total_price' => $log->amount,
            'expense_id' => $expenseType->id,
            'payment_by' => $log->paid_by,
            'payment_type' => $log->payment_type ?? 'cash',
            'show' => true,
            'company_id' => $user->company_id,
            'created_by' => $user->id,
            'updated_by' => $user->id,
            'isGst' => $log->isGst ?? 0,
        ]);

        // Update expense summary
        ExpenseSummary::updateOrCreate(
            [
                'expense_date' => $log->payment_date,
                'company_id' => $user->company_id,
                'project_id' => $vendorPayment->project_id,
            ],
            [
                'total_expense' => DB::raw('total_expense + ' . $log->amount),
                'expense_count' => DB::raw('expense_count + 1'),
            ]
        );

        return $expense;
    }

    /**
     * Create expense entry for on behalf payment
     */
    private function createExpenseForOnBehalfPayment($vendorPayment, $log, $user = null)
    {
        if (!$user) {
            $user = Auth::user();
        }
        
        if (!$user) {
            throw new \Exception('User authentication required');
        }
        
        $expenseType = $this->getOnBehalfPaymentExpenseType($user);

        $expense = Expense::create([
            'project_id' => $vendorPayment->project_id,
            'name' => "On Behalf Payment - " . ($vendorPayment->vendor->name ?? 'Unknown Vendor'),
            'expense_date' => $log->payment_date,
            'price' => $log->amount,
            'qty' => 1,
            'total_price' => $log->amount,
            'expense_id' => $expenseType->id,
            'payment_by' => $log->paid_by,
            'payment_type' => $log->payment_type ?? 'cash',
            'show' => true,
            'company_id' => $user->company_id,
            'created_by' => $user->id,
            'updated_by' => $user->id,
            'isGst' => 0,
        ]);

        // Update expense summary
        ExpenseSummary::updateOrCreate(
            [
                'expense_date' => $log->payment_date,
                'company_id' => $user->company_id,
                'project_id' => $vendorPayment->project_id,
            ],
            [
                'total_expense' => DB::raw('total_expense + ' . $log->amount),
                'expense_count' => DB::raw('expense_count + 1'),
            ]
        );

        return $expense;
    }

    /**
     * Update expense entry for vendor payment
     */
    private function updateExpenseForVendorPayment($expense, $vendorPayment, $log, $oldAmount = null, $user = null)
    {
        if (!$user) {
            $user = Auth::user();
        }
        
        if (!$user) {
            throw new \Exception('User authentication required');
        }
        
        $oldDate = $expense->expense_date;
        $oldProjectId = $expense->project_id;
        $newDate = $log->payment_date;
        $newAmount = $log->amount;

        if ($oldAmount !== null) {
            // Subtract old amount from old date's summary
            ExpenseSummary::where('expense_date', $oldDate)
                ->where('company_id', $user->company_id)
                ->where('project_id', $oldProjectId)
                ->update([
                    'total_expense' => DB::raw('total_expense - ' . $oldAmount),
                ]);
        }

        $expense->update([
            'name' => "Vendor Payment - " . ($vendorPayment->vendor->name ?? 'Unknown Vendor'),
            'expense_date' => $newDate,
            'price' => $newAmount,
            'total_price' => $newAmount,
            'payment_by' => $log->paid_by,
            'payment_type' => $log->payment_type ?? 'cash',
            'updated_by' => $user->id,
        ]);

        // Add new amount to new date's summary
        ExpenseSummary::updateOrCreate(
            [
                'expense_date' => $newDate,
                'company_id' => $user->company_id,
                'project_id' => $vendorPayment->project_id,
            ],
            [
                'total_expense' => DB::raw('total_expense + ' . $newAmount),
            ]
        );

        return $expense;
    }

    /**
     * Update expense entry for on behalf payment
     */
    private function updateExpenseForOnBehalfPayment($expense, $vendorPayment, $log, $oldAmount = null, $user = null)
    {
        if (!$user) {
            $user = Auth::user();
        }
        
        if (!$user) {
            throw new \Exception('User authentication required');
        }
        
        $oldDate = $expense->expense_date;
        $oldProjectId = $expense->project_id;
        $newDate = $log->payment_date;
        $newAmount = $log->amount;

        if ($oldAmount !== null) {
            // Subtract old amount from old date's summary
            ExpenseSummary::where('expense_date', $oldDate)
                ->where('company_id', $user->company_id)
                ->where('project_id', $oldProjectId)
                ->update([
                    'total_expense' => DB::raw('total_expense - ' . $oldAmount),
                ]);
        }

        $expense->update([
            'name' => "On Behalf Payment - " . ($vendorPayment->vendor->name ?? 'Unknown Vendor'),
            'expense_date' => $newDate,
            'price' => $newAmount,
            'total_price' => $newAmount,
            'payment_by' => $log->paid_by,
            'payment_type' => $log->payment_type ?? 'cash',
            'updated_by' => $user->id,
        ]);

        // Add new amount to new date's summary
        ExpenseSummary::updateOrCreate(
            [
                'expense_date' => $newDate,
                'company_id' => $user->company_id,
                'project_id' => $vendorPayment->project_id,
            ],
            [
                'total_expense' => DB::raw('total_expense + ' . $newAmount),
            ]
        );

        return $expense;
    }

    /**
     * Delete expense entry for vendor payment
     */
    private function deleteExpenseForVendorPayment($expense, $vendorPayment, $user = null)
    {
        if (!$user) {
            $user = Auth::user();
        }
        
        if (!$user) {
            throw new \Exception('User authentication required');
        }
        
        if ($expense) {
            $amount = $expense->total_price;
            $date = $expense->expense_date;
            $projectId = $expense->project_id;

            $expense->delete();

            // Update expense summary
            ExpenseSummary::where('expense_date', $date)
                ->where('company_id', $user->company_id)
                ->where('project_id', $projectId)
                ->update([
                    'total_expense' => DB::raw("total_expense - $amount"),
                    'expense_count' => DB::raw('expense_count - 1'),
                ]);
        }
    }

    /**
     * Get all vendor payments for a project
     */
    public function index($projectId)
    {
        try {
            Log::info("Fetching vendor payments for project: $projectId");

            $payments = VendorPayment::with(['vendor', 'logs', 'onBehalfLogs'])
                ->where('project_id', $projectId)
                ->get();

            Log::info("Found " . $payments->count() . " vendor payments for project $projectId");

            if ($payments->isEmpty()) {
                $budgetExists = \App\Models\Budget::where('project_id', $projectId)->exists();
                
                return response()->json([
                    'data' => [],
                    'message' => $budgetExists 
                        ? 'No vendor payments found. You may need to sync vendor payments for this project.' 
                        : 'No budgets found for this project. Create a budget first.',
                    'budget_exists' => $budgetExists,
                    'project_id' => $projectId
                ]);
            }

            return response()->json($payments);

        } catch (\Exception $e) {
            Log::error("Error fetching vendor payments for project $projectId: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch vendor payments',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add direct payment to a vendor
     */
    public function storePayment(Request $request, $vendorPaymentId)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'paid_by' => 'required|string|max:255',
            'payment_type' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:1000'
        ]);

        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'Authentication required',
                    'message' => 'User must be authenticated to record payments'
                ], 401);
            }

            DB::beginTransaction();
            
            $vp = VendorPayment::with('vendor')->findOrFail($vendorPaymentId);

            // Validate payment amount doesn't exceed balance
            if ($request->amount > $vp->balance_amount) {
                return response()->json([
                    'error' => 'Payment amount cannot exceed balance amount',
                    'balance_amount' => $vp->balance_amount,
                    'requested_amount' => $request->amount
                ], 400);
            }

            // Create expense entry (this also updates expense summary)
            $expense = $this->createExpenseForVendorPayment($vp, (object) $request->all(), $user);

            // Create payment log with expense_id and payment_type
            $log = VendorPaymentLog::create([
                'vendor_payment_id' => $vp->id,
                'expense_id' => $expense->id,
                'paid_by' => $request->paid_by,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'payment_type' => $request->payment_type,
                'description' => $request->description
            ]);

            // Update vendor payment summary
            $vp->paid_amount = ($vp->paid_amount ?? 0) + $request->amount;
            $vp->balance_amount = $vp->total_amount - $vp->paid_amount;
            $vp->save();

            DB::commit();

            // Load fresh data with relationships
            $vp->load(['vendor', 'logs', 'onBehalfLogs']);

            Log::info("Payment recorded successfully for vendor payment ID: $vendorPaymentId, Amount: {$request->amount}");

            return response()->json([
                'message' => 'Payment recorded successfully',
                'vendor_payment' => $vp,
                'log' => $log,
                'expense' => $expense
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error recording payment for vendor payment ID $vendorPaymentId: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to record payment',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add on behalf payment for a vendor (now subtracts from vendor balance)
     */
    public function storeOnBehalfPayment(Request $request, $vendorPaymentId)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'paid_by' => 'required|string|max:255',
            'payment_type' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:1000'
        ]);

        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'Authentication required',
                    'message' => 'User must be authenticated to record payments'
                ], 401);
            }

            DB::beginTransaction();
            
            $vp = VendorPayment::with('vendor')->findOrFail($vendorPaymentId);

            // Validate payment amount doesn't exceed balance
            if ($request->amount > $vp->balance_amount) {
                return response()->json([
                    'error' => 'Payment amount cannot exceed balance amount',
                    'balance_amount' => $vp->balance_amount,
                    'requested_amount' => $request->amount
                ], 400);
            }

            // Create expense entry for on behalf payment (this also updates expense summary)
            $logData = (object) $request->all();
            $expense = $this->createExpenseForOnBehalfPayment($vp, $logData, $user);

            // Create on behalf payment log
            $log = VendorOnBehalfPaymentLog::create([
                'vendor_payment_id' => $vp->id,
                'expense_id' => $expense->id,
                'paid_by' => $request->paid_by,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'payment_type' => $request->payment_type ?? 'cash',
                'description' => $request->description
            ]);

            // Update vendor payment summary - on behalf payments now reduce balance
            $vp->paid_amount = ($vp->paid_amount ?? 0) + $request->amount;
            $vp->balance_amount = $vp->total_amount - $vp->paid_amount;
            $vp->save();

            DB::commit();

            // Load fresh data with relationships
            $vp->load(['vendor', 'logs', 'onBehalfLogs']);

            Log::info("On behalf payment recorded successfully for vendor payment ID: $vendorPaymentId, Amount: {$request->amount}");

            return response()->json([
                'message' => 'On behalf payment recorded successfully',
                'vendor_payment' => $vp,
                'on_behalf_log' => $log,
                'expense' => $expense
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error recording on behalf payment for vendor payment ID $vendorPaymentId: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to record on behalf payment',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show direct payment logs for a vendor payment
     */
    public function logs($vendorPaymentId)
    {
        try {
            $logs = VendorPaymentLog::with('expense')
                ->where('vendor_payment_id', $vendorPaymentId)
                ->orderBy('payment_date', 'desc')
                ->get();

            return response()->json($logs);

        } catch (\Exception $e) {
            Log::error("Error fetching logs for vendor payment ID $vendorPaymentId: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch payment logs',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show on behalf payment logs for a vendor payment
     */
    public function onBehalfLogs($vendorPaymentId)
    {
        try {
            $logs = VendorOnBehalfPaymentLog::with('expense')
                ->where('vendor_payment_id', $vendorPaymentId)
                ->orderBy('payment_date', 'desc')
                ->get();

            return response()->json($logs);

        } catch (\Exception $e) {
            Log::error("Error fetching on behalf logs for vendor payment ID $vendorPaymentId: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch on behalf payment logs',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a direct payment log
     */
    public function updateLog(Request $request, $logId)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'paid_by' => 'required|string|max:255',
            'payment_type' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:1000'
        ]);

        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'Authentication required',
                    'message' => 'User must be authenticated to update payments'
                ], 401);
            }

            DB::beginTransaction();
            
            $log = VendorPaymentLog::with('expense')->findOrFail($logId);
            $vendorPayment = VendorPayment::with('vendor')->findOrFail($log->vendor_payment_id);
            
            // Store old amount for calculation
            $oldAmount = $log->amount;
            $newAmount = $request->amount;

            // Update associated expense if exists (this handles expense summary updates)
            if ($log->expense) {
                $this->updateExpenseForVendorPayment($log->expense, $vendorPayment, (object) $request->all(), $oldAmount, $user);
            }

            // Update the log
            $log->update([
                'amount' => $newAmount,
                'payment_date' => $request->payment_date,
                'paid_by' => $request->paid_by,
                'payment_type' => $request->payment_type,
                'description' => $request->description
            ]);

            // Recalculate vendor payment totals
            $this->recalculateVendorPaymentTotals($vendorPayment);

            DB::commit();

            Log::info("Payment log updated successfully. Log ID: $logId, Old Amount: $oldAmount, New Amount: $newAmount");

            return response()->json([
                'message' => 'Payment log updated successfully',
                'log' => $log
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error updating payment log ID $logId: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update payment log',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an on behalf payment log
     */
    public function updateOnBehalfLog(Request $request, $logId)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'paid_by' => 'required|string|max:255',
            'payment_type' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:1000'
        ]);

        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'Authentication required',
                    'message' => 'User must be authenticated to update payments'
                ], 401);
            }

            DB::beginTransaction();
            
            $log = VendorOnBehalfPaymentLog::with('expense')->findOrFail($logId);
            $vendorPayment = VendorPayment::with('vendor')->findOrFail($log->vendor_payment_id);
            
            // Store old amount for calculation
            $oldAmount = $log->amount;
            $newAmount = $request->amount;

            // Update associated expense if exists (this handles expense summary updates)
            if ($log->expense) {
                $this->updateExpenseForOnBehalfPayment($log->expense, $vendorPayment, (object) $request->all(), $oldAmount, $user);
            }

            // Update the log
            $log->update([
                'amount' => $newAmount,
                'payment_date' => $request->payment_date,
                'paid_by' => $request->paid_by,
                'payment_type' => $request->payment_type,
                'description' => $request->description
            ]);

            // Recalculate vendor payment totals (on behalf payments now affect balance)
            $this->recalculateVendorPaymentTotals($vendorPayment);

            DB::commit();

            Log::info("On behalf payment log updated successfully. Log ID: $logId, Old Amount: $oldAmount, New Amount: $newAmount");

            return response()->json([
                'message' => 'On behalf payment log updated successfully',
                'log' => $log
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error updating on behalf payment log ID $logId: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update on behalf payment log',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a direct payment log
     */
    public function deleteLog($logId)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'Authentication required',
                    'message' => 'User must be authenticated to delete payments'
                ], 401);
            }

            DB::beginTransaction();
            
            $log = VendorPaymentLog::with('expense')->findOrFail($logId);
            $vendorPayment = VendorPayment::with('vendor')->findOrFail($log->vendor_payment_id);
            
            // Store amount for logging
            $deletedAmount = $log->amount;

            // Delete associated expense if exists (this handles expense summary updates)
            if ($log->expense) {
                $this->deleteExpenseForVendorPayment($log->expense, $vendorPayment, $user);
            }

            // Delete the log
            $log->delete();

            // Recalculate vendor payment totals
            $this->recalculateVendorPaymentTotals($vendorPayment);

            DB::commit();

            Log::info("Payment log deleted successfully. Log ID: $logId, Amount: $deletedAmount");

            return response()->json([
                'message' => 'Payment log deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error deleting payment log ID $logId: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to delete payment log',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an on behalf payment log
     */
    public function deleteOnBehalfLog($logId)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'Authentication required',
                    'message' => 'User must be authenticated to delete payments'
                ], 401);
            }

            DB::beginTransaction();
            
            $log = VendorOnBehalfPaymentLog::with('expense')->findOrFail($logId);
            $vendorPayment = VendorPayment::with('vendor')->findOrFail($log->vendor_payment_id);
            
            // Store amount for logging
            $deletedAmount = $log->amount;

            // Delete associated expense if exists (this handles expense summary updates)
            if ($log->expense) {
                $this->deleteExpenseForVendorPayment($log->expense, $vendorPayment, $user);
            }

            // Delete the log
            $log->delete();

            // Recalculate vendor payment totals (on behalf payments now affect balance)
            $this->recalculateVendorPaymentTotals($vendorPayment);

            DB::commit();

            Log::info("On behalf payment log deleted successfully. Log ID: $logId, Amount: $deletedAmount");

            return response()->json([
                'message' => 'On behalf payment log deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error deleting on behalf payment log ID $logId: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to delete on behalf payment log',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Recalculate vendor payment totals based on existing logs (now includes on behalf payments)
     */
    private function recalculateVendorPaymentTotals(VendorPayment $vendorPayment)
    {
        // Get sum of all direct payment logs
        $totalDirectPaid = VendorPaymentLog::where('vendor_payment_id', $vendorPayment->id)
            ->sum('amount');

        // Get sum of all on behalf payment logs (now they reduce balance too)
        $totalOnBehalfPaid = VendorOnBehalfPaymentLog::where('vendor_payment_id', $vendorPayment->id)
            ->sum('amount');

        // Total paid is sum of both direct and on behalf payments
        $totalPaid = $totalDirectPaid + $totalOnBehalfPaid;

        // Update the vendor payment record
        $vendorPayment->paid_amount = $totalPaid;
        $vendorPayment->balance_amount = $vendorPayment->total_amount - $totalPaid;
        $vendorPayment->save();

        Log::info("Vendor payment totals recalculated. ID: {$vendorPayment->id}, Total: {$vendorPayment->total_amount}, Direct Paid: {$totalDirectPaid}, On Behalf Paid: {$totalOnBehalfPaid}, Total Paid: {$totalPaid}, Balance: {$vendorPayment->balance_amount}");
    }

    /**
     * Debug endpoint - Get all vendor info for a project
     */
    public function debugProject($projectId)
    {
        try {
            $budgets = \App\Models\Budget::where('project_id', $projectId)->with('works')->get();
            $vendorPayments = VendorPayment::where('project_id', $projectId)->with('vendor')->get();
            $operators = Operator::all();

            return response()->json([
                'project_id' => $projectId,
                'budgets_count' => $budgets->count(),
                'budgets' => $budgets,
                'vendor_payments_count' => $vendorPayments->count(),
                'vendor_payments' => $vendorPayments,
                'operators_count' => $operators->count(),
                'total_budget_works' => $budgets->sum(function($budget) {
                    return $budget->works->count();
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Debug failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}