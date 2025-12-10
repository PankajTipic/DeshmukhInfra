<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\BudgetWork;
use App\Models\VendorPayment;
use App\Models\Operator; // Make sure this is imported
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BudgetController extends Controller
{
    /**
     * Display a listing of budgets
     */
    public function index(Request $request)
    {
        $query = Budget::with('works');

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        return response()->json($query->get());
    }

    /**
     * Store a newly created budget in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|integer|exists:projects,id',
            'project_name' => 'required|string|max:255',
            
            'budget' => 'required|numeric|min:1',
            'project_amount' => 'required|numeric|min:1',
            'works' => 'required|array|min:1',
            'works.*.operator' => 'required|integer|exists:operators,id',
            'works.*.workType' => 'required|string',
            'works.*.points' => 'required|numeric|min:1',
            'works.*.rate' => 'required|numeric|min:0.01',
        ]);

        DB::beginTransaction();

        try {
            $budget = Budget::create([
                'project_id' => $request->project_id,
                'company_id' => auth()->user()->company_id,
                'project_name' => $request->project_name,
                'budget' => $request->budget,
                'project_amount' => $request->project_amount,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'work_place' => $request->work_place,
            ]);

            foreach ($request->works as $work) {
                BudgetWork::create([
                    'budget_id' => $budget->id,
                    'operator_id' => $work['operator'],
                    'work_type' => $work['workType'],
                    'points' => $work['points'],
                    'rate' => $work['rate'],
                ]);
            }

            // Sync vendor payments with better error handling
            $this->syncVendorPayments($budget->project_id, $request->works);

            DB::commit();

            return response()->json([
                'message' => 'Budget created successfully', 
                'budget' => $budget,
                'vendor_payments_created' => $this->getVendorPaymentsCount($budget->project_id)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Budget creation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Error creating budget', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified budget in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'project_id' => 'required|integer|exists:projects,id',
            'project_name' => 'required|string|max:255',
            'budget' => 'required|numeric|min:1',
            'project_amount' => 'required|numeric|min:1',
            'works' => 'required|array|min:1',
            'works.*.operator' => 'required|integer|exists:operators,id',
            'works.*.workType' => 'required|string',
            'works.*.points' => 'required|numeric|min:1',
            'works.*.rate' => 'required|numeric|min:0.01',
        ]);

        DB::beginTransaction();

        try {
            $budget = Budget::findOrFail($id);

            $budget->update([
                'project_id' => $request->project_id,
                'project_name' => $request->project_name,
                'budget' => $request->budget,
                'project_amount' => $request->project_amount,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'work_place' => $request->work_place,
            ]);

            // Remove old works and insert new
            BudgetWork::where('budget_id', $budget->id)->delete();

            foreach ($request->works as $work) {
                BudgetWork::create([
                    'budget_id' => $budget->id,
                    'operator_id' => $work['operator'],
                    'work_type' => $work['workType'],
                    'points' => $work['points'],
                    'rate' => $work['rate'],
                ]);
            }

            // Sync vendor payments
            $this->syncVendorPayments($budget->project_id, $request->works);

            DB::commit();

            return response()->json([
                'message' => 'Budget updated successfully', 
                'budget' => $budget,
                'vendor_payments_updated' => $this->getVendorPaymentsCount($budget->project_id)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Budget update failed: ' . $e->getMessage());
            return response()->json(['message' => 'Error updating budget', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified budget from storage.
     */
    public function destroy($id)
    {
        try {
            $budget = Budget::findOrFail($id);
            $projectId = $budget->project_id;
            
            // Delete budget (this will also delete related BudgetWork due to foreign key)
            $budget->delete();
            
            // Optionally, you might want to recalculate vendor payments after deletion
            // $this->recalculateVendorPayments($projectId);
            
            return response()->json(['message' => 'Budget deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Budget deletion failed: ' . $e->getMessage());
            return response()->json(['message' => 'Error deleting budget', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Sync vendor payments summary table when budget is created or updated.
     */
    private function syncVendorPayments($projectId, $works)
    {
        try {
            Log::info("Syncing vendor payments for project: $projectId");
            
            // Group totals per vendor (operator)
            $vendorTotals = [];
            foreach ($works as $work) {
                $vendorId = $work['operator'];
                $amount = floatval($work['points']) * floatval($work['rate']);
                
                if (!isset($vendorTotals[$vendorId])) {
                    $vendorTotals[$vendorId] = 0;
                }
                $vendorTotals[$vendorId] += $amount;
                
                Log::info("Vendor $vendorId: Adding amount $amount (total now: {$vendorTotals[$vendorId]})");
            }

            // Create or update vendor payment records
            foreach ($vendorTotals as $vendorId => $totalAmount) {
                // Check if operator exists
                $operator = Operator::find($vendorId);
                if (!$operator) {
                    Log::warning("Operator with ID $vendorId not found, skipping vendor payment creation");
                    continue;
                }

                $vendorPayment = VendorPayment::firstOrNew([
                    'project_id' => $projectId,
                    'vendor_id' => $vendorId,
                ]);

                $oldPaidAmount = $vendorPayment->paid_amount ?? 0;
                
                $vendorPayment->total_amount = $totalAmount;
                $vendorPayment->paid_amount = $oldPaidAmount; // Keep existing paid amount
                $vendorPayment->balance_amount = $totalAmount - $oldPaidAmount;
                
                $vendorPayment->save();
                
                Log::info("Created/Updated vendor payment: Project $projectId, Vendor $vendorId, Total: $totalAmount, Balance: {$vendorPayment->balance_amount}");
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Vendor payment sync failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get count of vendor payments for a project
     */
    private function getVendorPaymentsCount($projectId)
    {
        return VendorPayment::where('project_id', $projectId)->count();
    }

    /**
     * Manual endpoint to sync vendor payments for a project
     * Useful for debugging
     */
    public function syncVendorPaymentsForProject(Request $request, $projectId)
    {
        try {
            // Get all budget works for this project
            $budgetWorks = BudgetWork::whereHas('budget', function($query) use ($projectId) {
                $query->where('project_id', $projectId);
            })->with('budget')->get();

            if ($budgetWorks->isEmpty()) {
                return response()->json([
                    'message' => 'No budget works found for this project',
                    'project_id' => $projectId
                ]);
            }

            // Convert to the format expected by syncVendorPayments
            $works = $budgetWorks->map(function($work) {
                return [
                    'operator' => $work->operator_id,
                    'points' => $work->points,
                    'rate' => $work->rate
                ];
            })->toArray();

            $this->syncVendorPayments($projectId, $works);

            $vendorPayments = VendorPayment::where('project_id', $projectId)->with('vendor')->get();

            return response()->json([
                'message' => 'Vendor payments synced successfully',
                'project_id' => $projectId,
                'vendor_payments_count' => $vendorPayments->count(),
                'vendor_payments' => $vendorPayments
            ]);

        } catch (\Exception $e) {
            Log::error('Manual vendor payment sync failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to sync vendor payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}