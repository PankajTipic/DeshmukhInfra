<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\WorkPointDetail;
use App\Models\SurveyDetail;
use App\Models\Expense;
use App\Models\Income;
use Illuminate\Support\Facades\DB;

class ProjectSummaryController extends Controller
{
    // public function index(Request $request)
    // {
    //     $companyId = auth()->user()->company_id;
    //     $projectId = $request->project_id;

    //     $projects = Project::where('company_id', $companyId)
    //         ->when($projectId, fn($q) => $q->where('id', $projectId))
    //         ->get();

    //     $response = [];

    //     foreach ($projects as $project) {
    //         // ---------- DTH ----------
    //         $totalDthPoints = WorkPointDetail::where('company_id', $companyId)
    //             ->where('project_id', $project->id)
    //             ->sum(DB::raw('CAST(work_point AS DECIMAL(12,2))'));

    //         $totalDthBilling = WorkPointDetail::where('company_id', $companyId)
    //             ->where('project_id', $project->id)
    //             ->sum('total');

    //         // ---------- Survey ----------
    //         $totalSurveyPoints = SurveyDetail::where('company_id', $companyId)
    //             ->where('project_id', $project->id)
    //             ->sum(DB::raw('CAST(survey_point AS DECIMAL(12,2))'));

    //         $totalSurveyBilling = SurveyDetail::where('company_id', $companyId)
    //             ->where('project_id', $project->id)
    //             ->sum('total');

    //         // ---------- Expenses ----------
    //         // Transport (only expense_types.name = 'Transportation')
    //         $transport = Expense::join('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
    //             ->where('expenses.company_id', $companyId)
    //             ->where('expenses.project_id', $project->id)
    //             ->where('expense_types.name', 'Transportation')
    //             ->sum('expenses.total_price');

    //         // Diesel / Fuel (expense_types.name = 'Fuel Expense')
    //         $diesel = Expense::join('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
    //             ->where('expenses.company_id', $companyId)
    //             ->where('expenses.project_id', $project->id)
    //             ->where('expense_types.name', 'Fuel Expense')
    //             ->sum('expenses.total_price');

    //         // Other Billing (everything except Transportation & Fuel Expense)
    //         $otherBilling = Expense::leftJoin('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
    //             ->where('expenses.company_id', $companyId)
    //             ->where('expenses.project_id', $project->id)
    //             ->where(function ($q) {
    //                 $q->whereNull('expense_types.name')
    //                   ->orWhereNotIn('expense_types.name', ['Transportation', 'Fuel Expense']);
    //             })
    //             ->sum('expenses.total_price');

    //         // ---------- Final Bill ----------
    //         $finalBill = $totalDthBilling + $totalSurveyBilling + $transport + $otherBilling;
    //         $gstBill   = round($finalBill * 0.18, 2);
    //         $totalBill = $finalBill + $gstBill;

    //         // ---------- Income ----------
    //         $paidAmount = Income::where('company_id', $companyId)
    //             ->where('project_id', $project->id)
    //             ->sum('received_amount');

    //         $pendingAmount = Income::where('company_id', $companyId)
    //             ->where('project_id', $project->id)
    //             ->sum('pending_amount');

    //         // Receiver Banks
    //         $receiverBanks = Income::select('receivers_bank', DB::raw('SUM(received_amount) as amount'))
    //             ->where('company_id', $companyId)
    //             ->where('project_id', $project->id)
    //             ->groupBy('receivers_bank')
    //             ->get()
    //             ->map(fn($r) => ['bank_name' => $r->receivers_bank, 'amount' => (float) $r->amount]);

    //         $extraBilling = 0;
    //         $bankTotal = $receiverBanks->sum('amount');

    //         $profitLoss = $bankTotal - $totalBill - $extraBilling;
    //         $isProfit   = $profitLoss >= 0;

    //         $response[] = [
    //             'sr_no'                     => $project->id,
    //             'site_name'                => $project->project_name,
    //             'company_name'             => $project->customer_name,
    //             'total_dth_points'         => $totalDthPoints,
    //             'total_dth_billing_amount' => $totalDthBilling,
    //             'total_survey_points'      => $totalSurveyPoints,
    //             'total_survey_billing_amount' => $totalSurveyBilling,
    //             'transport'                => $transport,
    //             'other_billing'            => $otherBilling,
    //             'final_bill'               => $finalBill,
    //             'gst_bill'                 => $gstBill,
    //             'total_bill'               => $totalBill,
    //             'paid_amount'              => $paidAmount,
    //             'pending_amount'           => $pendingAmount,
    //             'total_diesel_amount'      => $diesel,
    //             'extra_billing'            => $extraBilling,
    //             'receiver_banks'           => $receiverBanks,
    //             'profit_or_loss'           => $profitLoss,
    //             'is_profit'                => $isProfit,
    //         ];
    //     }

    //     return response()->json(['data' => $response], 200);
    // }


public function index(Request $request)
{
    $companyId = auth()->user()->company_id;
    $projectId = $request->project_id;

    $projects = Project::where('company_id', $companyId)
        ->when($projectId, fn($q) => $q->where('id', $projectId))
        ->get();

    $response = [];

    foreach ($projects as $project) {
        // ---------- DTH ----------
        $totalDthPoints = WorkPointDetail::where('company_id', $companyId)
            ->where('project_id', $project->id)
            ->sum(DB::raw('CAST(work_point AS DECIMAL(12,2))'));

        $totalDthBilling = WorkPointDetail::where('company_id', $companyId)
            ->where('project_id', $project->id)
            ->sum('total');

        // ---------- Survey ----------
        $totalSurveyPoints = SurveyDetail::where('company_id', $companyId)
            ->where('project_id', $project->id)
            ->sum(DB::raw('CAST(survey_point AS DECIMAL(12,2))'));

        $totalSurveyBilling = SurveyDetail::where('company_id', $companyId)
            ->where('project_id', $project->id)
            ->sum('total');

        // ---------- Expenses ----------
        $transport = Expense::join('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
            ->where('expenses.company_id', $companyId)
            ->where('expenses.project_id', $project->id)
            ->where('expense_types.name', 'Transportation')
            ->sum('expenses.total_price');

        $diesel = Expense::join('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
            ->where('expenses.company_id', $companyId)
            ->where('expenses.project_id', $project->id)
            ->where('expense_types.name', 'Fuel Expense')
            ->sum('expenses.total_price');

        $otherBilling = Expense::leftJoin('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
            ->where('expenses.company_id', $companyId)
            ->where('expenses.project_id', $project->id)
            ->where(function ($q) {
                $q->whereNull('expense_types.name')
                  ->orWhereNotIn('expense_types.name', ['Transportation', 'Fuel Expense']);
            })
            ->sum('expenses.total_price');

        // ---------- Billing ----------
        $finalBill = $totalDthBilling + $totalSurveyBilling;            // DTH + Survey only
        $gstBill   = round($finalBill * 0.18, 2);                       // GST on final bill
        $totalBill = $finalBill + $gstBill;                              // Total invoice

        // ---------- Expenses Total ----------
        $totalExpenses = $transport + $otherBilling + $diesel;

        // ---------- Profit / Loss ----------
        // Profit/Loss = Total Bill (with GST) - Total Expenses
        $profitLoss = $totalBill - $totalExpenses;
        $isProfit   = $profitLoss >= 0;

        // ---------- Income (for display only) ----------
        $paidAmount = Income::where('company_id', $companyId)
            ->where('project_id', $project->id)
            ->sum('received_amount');

        $pendingAmount = Income::where('company_id', $companyId)
            ->where('project_id', $project->id)
            ->sum('pending_amount');

        $receiverBanks = Income::select('receivers_bank', DB::raw('SUM(received_amount) as amount'))
            ->where('company_id', $companyId)
            ->where('project_id', $project->id)
            ->groupBy('receivers_bank')
            ->get()
            ->map(fn($r) => [
                'bank_name' => $r->receivers_bank,
                'amount'    => (float) $r->amount
            ]);

        // ---------- Response ----------
        $response[] = [
            'sr_no'                      => $project->id,
            'site_name'                   => $project->project_name,
            'company_name'                => $project->customer_name,
            'total_dth_points'            => $totalDthPoints,
            'total_dth_billing_amount'    => $totalDthBilling,
            'total_survey_points'         => $totalSurveyPoints,
            'total_survey_billing_amount' => $totalSurveyBilling,

            'final_bill'                  => $finalBill,      // DTH + Survey
            'gst_bill'                    => $gstBill,        // GST on final bill
            'total_bill'                  => $totalBill,      // Final + GST

            'transport'                   => $transport,
            'other_billing'               => $otherBilling,
            'total_diesel_amount'         => $diesel,

            'paid_amount'                 => $paidAmount,
            'pending_amount'              => $pendingAmount,
            'receiver_banks'              => $receiverBanks,

            // Expenses vs Total Bill
            'total_expenses'              => $totalExpenses,
            'profit_or_loss'              => $profitLoss,
            'is_profit'                   => $isProfit,
        ];
    }

    return response()->json(['data' => $response], 200);
}


// public function index(Request $request)
// {
//     $companyId = auth()->user()->company_id;
//     $projectId = $request->project_id;

//     $projects = Project::where('company_id', $companyId)
//         ->when($projectId, fn($q) => $q->where('id', $projectId))
//         ->get();

//     $response = [];

//     foreach ($projects as $project) {
//         // ---------- DTH ----------
//         $totalDthPoints = WorkPointDetail::where('company_id', $companyId)
//             ->where('project_id', $project->id)
//             ->sum(DB::raw('CAST(work_point AS DECIMAL(12,2))'));

//         $totalDthBilling = WorkPointDetail::where('company_id', $companyId)
//             ->where('project_id', $project->id)
//             ->sum('total');

//         // ---------- Survey ----------
//         $totalSurveyPoints = SurveyDetail::where('company_id', $companyId)
//             ->where('project_id', $project->id)
//             ->sum(DB::raw('CAST(survey_point AS DECIMAL(12,2))'));

//         $totalSurveyBilling = SurveyDetail::where('company_id', $companyId)
//             ->where('project_id', $project->id)
//             ->sum('total');

//         // ---------- Expenses ----------
//         $transport = Expense::join('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
//             ->where('expenses.company_id', $companyId)
//             ->where('expenses.project_id', $project->id)
//             ->where('expense_types.name', 'Transportation')
//             ->sum('expenses.total_price');

//         $diesel = Expense::join('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
//             ->where('expenses.company_id', $companyId)
//             ->where('expenses.project_id', $project->id)
//             ->where('expense_types.name', 'Fuel Expense')
//             ->sum('expenses.total_price');

//         $otherBilling = Expense::leftJoin('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
//             ->where('expenses.company_id', $companyId)
//             ->where('expenses.project_id', $project->id)
//             ->where(function ($q) {
//                 $q->whereNull('expense_types.name')
//                   ->orWhereNotIn('expense_types.name', ['Transportation', 'Fuel Expense']);
//             })
//             ->sum('expenses.total_price');

//         // If you have a separate “extra billing” table/logic, replace 0 with query
//         $extraBilling = 0;

//         // ---------- Billing ----------
//         $grossBill = $totalDthBilling + $totalSurveyBilling;      // DTH + Survey only
//         $gstBill   = round($grossBill * 0.18, 2);                 // GST on gross bill
//         $totalBill = $grossBill + $gstBill;                       // Invoice before expense deduction

//         // ---------- Net after expenses ----------
//         $totalExpenses = $transport + $otherBilling + $diesel + $extraBilling;

//         // Final bill = Gross (DTH+Survey) - expenses
//         $finalBill = $grossBill - $totalExpenses;

//         // Profit/Loss (same as final_bill if you treat final_bill as net income)
//         $profitLoss = $finalBill;
//         $isProfit   = $profitLoss >= 0;

//         // ---------- Income (for display) ----------
//         $paidAmount = Income::where('company_id', $companyId)
//             ->where('project_id', $project->id)
//             ->sum('received_amount');

//         $pendingAmount = Income::where('company_id', $companyId)
//             ->where('project_id', $project->id)
//             ->sum('pending_amount');

//         $receiverBanks = Income::select('receivers_bank', DB::raw('SUM(received_amount) as amount'))
//             ->where('company_id', $companyId)
//             ->where('project_id', $project->id)
//             ->groupBy('receivers_bank')
//             ->get()
//             ->map(fn($r) => [
//                 'bank_name' => $r->receivers_bank,
//                 'amount'    => (float) $r->amount
//             ]);

//         // ---------- Response ----------
//         $response[] = [
//             'sr_no'                      => $project->id,
//             'site_name'                   => $project->project_name,
//             'company_name'                => $project->customer_name,

//             'total_dth_points'            => $totalDthPoints,
//             'total_dth_billing_amount'    => $totalDthBilling,
//             'total_survey_points'         => $totalSurveyPoints,
//             'total_survey_billing_amount' => $totalSurveyBilling,

//             // Billing
//             'final_bill'                  => $finalBill,    // (DTH + Survey) – Expenses
//             'gst_bill'                    => $gstBill,      // GST on gross bill
//             'total_bill'                  => $totalBill,    // Gross + GST (invoice amount)

//             // Expenses
//             'transport'                   => $transport,
//             'other_billing'               => $otherBilling,
//             'total_diesel_amount'         => $diesel,
//             'extra_billing'               => $extraBilling,
//             'total_expenses'              => $totalExpenses,

//             // Income
//             'paid_amount'                 => $paidAmount,
//             'pending_amount'              => $pendingAmount,
//             'receiver_banks'              => $receiverBanks,

//             // Profit / Loss (net after expenses)
//             'profit_or_loss'              => $profitLoss,
//             'is_profit'                   => $isProfit,
//         ];
//     }

//     return response()->json(['data' => $response], 200);
// }


}
