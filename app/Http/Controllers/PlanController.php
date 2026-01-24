<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\CompanyInfo;
use Illuminate\Http\Request;
use carbon\carbon;
use Illuminate\Support\Str;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Plan::all();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'=>'required',
            'description'=> 'required',
            'price'=> 'required',
            'userLimit'=> 'required',
            'accessLevel'=> 'required',
            'isActive'=> 'required'
        ]);
        return Plan::create($request->all());
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Plan::find($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name'=>'required',
            'description'=> 'required',
            'price'=> 'required',
            'userLimit'=> 'required',
            'accessLevel'=> 'required',
            'isActive'=> 'required'
        ]);
        $Plan = Plan::find($id);
        $Plan->update($request->all());
        return $Plan;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return Plan::destroy($id);
    }

    // PlanController.php

public function previewUpgrade(Request $request)
{
    $user = auth()->user();

    $company = CompanyInfo::where('company_id', $user->company_id)->first();
    if (!$company) {
        return response()->json(['error' => 'Company not found'], 404);
    }

    // Plan multiplier helper based on name
    $getPlanMultiplier = function ($name) {
        $name = strtolower($name);
        return match (true) {
            str_contains($name, 'monthly') => 1,
            str_contains($name, 'quarterly') => 3,
            str_contains($name, 'half-yearly') => 6,
            str_contains($name, 'annually') => 12,
            default => 1,
        };
    };

    // Fetch current plan
    $currentPlan = Plan::find($company->subscribed_plan);
    $currentPlanName = $currentPlan?->name ?? 'N/A';
    $currentPlanBasePrice = (float) ($currentPlan?->price ?? 0);
    $currentMultiplier = $getPlanMultiplier($currentPlanName);
    $currentPlanPrice = $currentPlanBasePrice * $currentMultiplier;

    // Get new plan from request
    $newPlanId = $request->input('new_plan_id');
    $newPlan = Plan::findOrFail($newPlanId);
    $newMultiplier = $getPlanMultiplier($newPlan->name);
    $newPlanBasePrice = (float) $newPlan->price;
    $newPlanPrice = $newPlanBasePrice * $newMultiplier;

    // Remaining days
    $validity = Carbon::parse($company->subscription_validity);
    $today = Carbon::today();
    $remainingDays = $today->diffInDays($validity, false);
    if ($remainingDays < 0) $remainingDays = 0;

    // Per-day value from current plan
    $perDayValue = match ($currentMultiplier) {
    12 => $currentPlanPrice / 365,
    6  => $currentPlanPrice / 180,
    3  => $currentPlanPrice / 90,
    1  => $currentPlanPrice / 30,
    default => $currentPlanPrice / 30, // fallback for safety
};


    $unusedValue = $perDayValue * $remainingDays;

    // Final payable
    $payableAmount = max(0, $newPlanPrice - $unusedValue);

    // Round to nearest 0.2
    $roundToPointTwo = fn($value) => round($value * 5) / 5;

    return response()->json([
        'current_plan' => $currentPlanName,
        'current_plan_price' => $roundToPointTwo($currentPlanPrice),
        'remaining_days' => $remainingDays,
        'unused_value' => $roundToPointTwo($unusedValue),
        'new_plan' => $newPlan->name,
        'new_plan_price' => $roundToPointTwo($newPlanPrice),
        'payable_amount' => $roundToPointTwo($payableAmount),
    ]);
}



}
