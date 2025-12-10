<?php

namespace App\Http\Controllers;

use App\Models\CompanyInfo;
use App\Models\CompanyReceipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CompanyValidityController extends Controller
{
    /**
     * Update company subscription validity
     */

     public function updatePlan(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|integer|exists:company_info,company_id',
            'plan_id' => 'required|integer',
        ]);

        $company = CompanyInfo::where('company_id', $validated['company_id'])->first();
        $company->subscribed_plan = $validated['plan_id'];
        $company->save();

        return response()->json([
            'success' => true,
            'message' => 'Company plan upgraded successfully!',
            'data' => $company
        ]);
    }
    
    public function updateValidity(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|integer|exists:company_info,company_id',
            'valid_till' => 'required|date',
        ]);

        try {
            DB::beginTransaction();

            $company = CompanyInfo::where('company_id', $validated['company_id'])->first();

            if (!$company) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company not found',
                ], 404);
            }

            $company->subscription_validity = $validated['valid_till'];
            $company->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Company validity updated successfully!',
                'data' => [
                    'company_id' => $company->company_id,
                    'subscription_validity' => $company->subscription_validity,
                ]
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to update company validity', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update company validity: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check company subscription status
     */
    public function checkSubscriptionStatus(Request $request)
    {
        $companyId = $request->input('company_id');

        if (!$companyId) {
            return response()->json([
                'success' => false,
                'message' => 'Company ID is required',
            ], 400);
        }

        $company = CompanyInfo::where('company_id', $companyId)->first();

        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'Company not found',
            ], 404);
        }

        $validityDate = new \DateTime($company->subscription_validity);
        $today = new \DateTime();
        $interval = $today->diff($validityDate);
        $daysRemaining = $interval->invert ? -$interval->days : $interval->days;

        $status = 'active';
        if ($daysRemaining <= 0) {
            $status = 'expired';
        } elseif ($daysRemaining <= 30) {
            $status = 'expiring_soon';
        }

        return response()->json([
            'success' => true,
            'data' => [
                'company_id' => $company->company_id,
                'company_name' => $company->company_name,
                'subscription_validity' => $company->subscription_validity,
                'days_remaining' => $daysRemaining,
                'status' => $status,
            ]
        ], 200);
    }

    /**
     * Get company renewal history
     */
    public function renewalHistory(Request $request)
    {
        $companyId = $request->input('company_id');

        if (!$companyId) {
            return response()->json([
                'success' => false,
                'message' => 'Company ID is required',
            ], 400);
        }

        $renewals = CompanyReceipt::with([
                'user:id,name,email',
                'plan',
                'company:company_id,company_name'
            ])
            ->where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $renewals
        ], 200);
    }
}
