<?php

namespace App\Http\Controllers;

use App\Models\CompanyReceipt;
use App\Models\CompanyInfo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CompanyReceiptController extends Controller
{
    /**
     * Store a newly created company receipt in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Incoming company receipt request', $request->all());

            // Validate request
            $validatedData = $request->validate([
                'company_id' => 'required|integer|exists:company_info,company_id',
                'plan_id' => 'required|integer',
                'user_id' => 'required|integer',
                'total_amount' => 'required|numeric',
                'valid_till' => 'required|date',
                'transaction_id' => 'required|string',
                'transaction_status' => 'required|string',
                'renewal_type' => 'nullable|string',
            ]);

            // Create receipt
            CompanyReceipt::create($validatedData);

            // Update or create company_info entry
            CompanyInfo::updateOrCreate(
                ['company_id' => $request->company_id],
                ['subscription_validity' => $request->valid_till]
            );

            return response()->json([
                'success' => true,
                'message' => 'Receipt stored and validity updated.',
            ], 200);
        } catch (\Exception $e) {
            Log::error('CompanyReceipt store error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error',
            ], 500);
        }
    }

  

public function index(Request $request)
{
    try {
        $query = CompanyReceipt::with([
            'user:id,name,email,mobile',
            'plan:id,name,price', // Removed 'duration'
            'company:company_id,company_name,email_id,phone_no,subscription_validity', // Corrected to company_id
        ]);

        // Filter by company ID if provided
        if ($request->has('company_id') && !empty($request->company_id)) {
            $query->where('company_id', $request->company_id);
        }

        // Filter by transaction status if provided
        if ($request->has('status') && !empty($request->status)) {
            $query->where('transaction_status', $request->status);
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('transaction_id', 'LIKE', "%{$searchTerm}%")
                  ->orWhereHas('company', function ($companyQuery) use ($searchTerm) {
                      $companyQuery->where('company_name', 'LIKE', "%{$searchTerm}%")
                                   ->orWhere('email_id', 'LIKE', "%{$searchTerm}%")
                                   ->orWhere('phone_no', 'LIKE', "%{$searchTerm}%");
                  })
                  ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                      $userQuery->where('name', 'LIKE', "%{$searchTerm}%")
                                ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                                ->orWhere('mobile', 'LIKE', "%{$searchTerm}%");
                  })
                  ->orWhereHas('plan', function ($planQuery) use ($searchTerm) {
                      $planQuery->where('name', 'LIKE', "%{$searchTerm}%");
                  });
            });
        }

        // Get paginated results ordered by latest first
        $receipts = $query->orderBy('id', 'desc')->paginate(25);

        // Add register_date field from created_at
        $receipts->getCollection()->transform(function ($item) {
            $item->register_date = $item->created_at ? $item->created_at->format('Y-m-d') : null;
            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $receipts,
            'message' => 'Company receipts fetched successfully.',
        ]);

    } catch (\Exception $e) {
        Log::error('Error fetching company receipts', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'request' => $request->all(),
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch company receipts.',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
        ], 500);
    }
}



    /**
     * Get company's subscription history.
     */
    public function getSubscriptionHistory(Request $request)
    {
        $request->validate([
            'company_id' => 'required|integer|exists:company_info,company_id',
        ]);

        try {
            $history = CompanyReceipt::with([
                'user:id,name,email',
                'plan:id,name,price,duration',
                'company:company_id,company_name',
            ])
                ->where('company_id', $request->company_id)
                ->where('transaction_status', 'success')
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $history,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching subscription history', [
                'error' => $e->getMessage(),
                'company_id' => $request->company_id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subscription history.',
            ], 500);
        }
    }

    /**
     * Get renewal statistics for admin dashboard.
     */
    public function getRenewalStats()
    {
        try {
            $stats = [
                'total_renewals_today' => CompanyReceipt::whereDate('created_at', today())
                    ->where('transaction_status', 'success')
                    ->count(),

                'total_renewals_this_month' => CompanyReceipt::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->where('transaction_status', 'success')
                    ->count(),

                'total_revenue_today' => CompanyReceipt::whereDate('created_at', today())
                    ->where('transaction_status', 'success')
                    ->sum('total_amount'),

                'total_revenue_this_month' => CompanyReceipt::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->where('transaction_status', 'success')
                    ->sum('total_amount'),

                'failed_payments_today' => CompanyReceipt::whereDate('created_at', today())
                    ->where('transaction_status', 'failed')
                    ->count(),

                'companies_expiring_soon' => CompanyInfo::whereBetween('subscription_validity', [
                    now()->toDateString(),
                    now()->addDays(30)->toDateString(),
                ])->count(),

                'expired_companies' => CompanyInfo::where('subscription_validity', '<', now()->toDateString())->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching renewal stats', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch renewal statistics.',
            ], 500);
        }
    }

    /**
     * Update receipt status (admin use).
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'transaction_status' => 'required|string|in:success,failed,pending',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $receipt = CompanyReceipt::findOrFail($id);
            $oldStatus = $receipt->transaction_status;

            $receipt->transaction_status = $validated['transaction_status'];
            $receipt->admin_notes = $validated['admin_notes'] ?? null;
            $receipt->save();

            if ($oldStatus !== 'success' && $validated['transaction_status'] === 'success') {
                $company = CompanyInfo::where('company_id', $receipt->company_id)->first();
                if ($company) {
                    $company->subscription_validity = $receipt->valid_till;
                    $company->save();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Receipt status updated.',
                'data' => $receipt->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating receipt status', [
                'error' => $e->getMessage(),
                'receipt_id' => $id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update receipt status.',
            ], 500);
        }
    }

    /**
     * Get detailed receipt information.
     */
    public function show($id)
    {
        try {
            $receipt = CompanyReceipt::with([
                'user:id,name,email,mobile',
                'plan:id,name,price,duration',
                'company:company_id,company_name,email_id,phone_no,subscription_validity',
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $receipt,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching receipt details', [
                'error' => $e->getMessage(),
                'receipt_id' => $id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Receipt not found or error occurred.',
            ], 404);
        }
    }

    /**
     * Delete a receipt (only if failed).
     */
    public function destroy($id)
    {
        try {
            $receipt = CompanyReceipt::findOrFail($id);

            if ($receipt->transaction_status === 'success') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete successful payment receipt.',
                ], 400);
            }

            $receipt->delete();

            return response()->json([
                'success' => true,
                'message' => 'Receipt deleted successfully.',
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting receipt', [
                'error' => $e->getMessage(),
                'receipt_id' => $id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete receipt.',
            ], 500);
        }
    }
}
