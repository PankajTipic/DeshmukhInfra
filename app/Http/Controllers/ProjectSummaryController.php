<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\WorkPointDetail;
use App\Models\OrderDetail;
use App\Models\SurveyDetail;
use App\Models\Expense;
use App\Models\Order;
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

    //         // Calculate average DTH rate
    //         $avgDthRate = $totalDthPoints > 0 ? round($totalDthBilling / $totalDthPoints, 2) : 0;

    //         // ---------- Survey ----------
    //         $totalSurveyPoints = SurveyDetail::where('company_id', $companyId)
    //             ->where('project_id', $project->id)
    //             ->sum(DB::raw('CAST(survey_point AS DECIMAL(12,2))'));

    //         $totalSurveyBilling = SurveyDetail::where('company_id', $companyId)
    //             ->where('project_id', $project->id)
    //             ->sum('total');

    //         // Calculate average Survey rate
    //         $avgSurveyRate = $totalSurveyPoints > 0 ? round($totalSurveyBilling / $totalSurveyPoints, 2) : 0;

    //         // ---------- Expenses ----------
    //         // Transportation expenses
    //         $transport = Expense::join('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
    //             ->where('expenses.company_id', $companyId)
    //             ->where('expenses.project_id', $project->id)
    //             ->where('expense_types.name', 'Transportation')
    //             ->sum('expenses.total_price');

    //         // Fuel/Diesel expenses
    //         $diesel = Expense::join('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
    //             ->where('expenses.company_id', $companyId)
    //             ->where('expenses.project_id', $project->id)
    //             ->where('expense_types.name', 'Fuel Expense')
    //             ->sum('expenses.total_price');

    //         // Other expenses (excluding Transportation and Fuel)
    //         $otherBilling = Expense::leftJoin('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
    //             ->where('expenses.company_id', $companyId)
    //             ->where('expenses.project_id', $project->id)
    //             ->where(function ($q) {
    //                 $q->whereNull('expense_types.name')
    //                   ->orWhereNotIn('expense_types.name', [
    //                       'Transportation', 
    //                       'Fuel Expense'
    //                   ]);
    //             })
    //             ->sum('expenses.total_price');

    //         // Extra billing from project table
    //         $extraBilling = $project->extra_billing ?? 0;

    //         // ---------- Total Expenses ----------
    //         $totalExpenses = $transport + $otherBilling + $diesel + $extraBilling;

    //         // ---------- Expense Breakdown ----------
    //         $expenseBreakdown = Expense::leftJoin('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
    //             ->where('expenses.company_id', $companyId)
    //             ->where('expenses.project_id', $project->id)
    //             ->select(
    //                 DB::raw('COALESCE(expense_types.name, "Uncategorized") as expense_type'),
    //                 DB::raw('SUM(expenses.total_price) as total')
    //             )
    //             ->groupBy('expense_types.name')
    //             ->get()
    //             ->map(fn($item) => [
    //                 'type' => $item->expense_type,
    //                 'amount' => (float) $item->total
    //             ]);

    //         // ---------- Orders Data with All Required Fields ----------
    //         $ordersData = Order::where('company_id', $companyId)
    //             ->where('project_id', $project->id)
    //             ->selectRaw('
    //                 SUM(totalAmount) as total_amount_without_gst,
    //                 SUM(finalAmount) as final_amount_with_gst,
    //                 SUM(paidAmount) as paid_amount,
    //                 SUM(finalAmount - paidAmount) as pending_amount,
    //                 SUM(cgst) as total_cgst,
    //                 SUM(sgst) as total_sgst,
    //                 SUM(igst) as total_igst,
    //                 SUM(gst) as total_gst,
    //                 SUM(discount) as total_discount
    //             ')
    //             ->first();

    //         // Extract values
    //         $totalAmountWithoutGST = $ordersData->total_amount_without_gst ?? 0;
    //         $finalAmountWithGST = $ordersData->final_amount_with_gst ?? 0;
    //         $paidAmount = $ordersData->paid_amount ?? 0;
    //         $pendingAmount = $ordersData->pending_amount ?? 0;
            
    //         // GST breakdown
    //         $totalCGST = $ordersData->total_cgst ?? 0;
    //         $totalSGST = $ordersData->total_sgst ?? 0;
    //         $totalIGST = $ordersData->total_igst ?? 0;
    //         $totalGST = $ordersData->total_gst ?? 0;
    //         $totalDiscount = $ordersData->total_discount ?? 0;

    //         // Get individual order details with all required fields
    //         $orderDetails = Order::where('company_id', $companyId)
    //             ->where('project_id', $project->id)
    //             ->select([
    //                 'id',
    //                 'customer_id',
    //                 'project_id',
    //                 'company_id',
    //                 'long',
    //                 'lat',
    //                 'profit',
    //                 'finalAmount',
    //                 'totalAmount',
    //                 'paidAmount',
    //                 'discount',
    //                 'paymentType',
    //                 'invoiceType',
    //                 'orderStatus',
    //                 'deliveryTime',
    //                 'deliveryDate',
    //                 'invoiceDate',
    //                 'show',
    //                 'payLater',
    //                 'isSettled',
    //                 'invoice_number',
    //                 'cgst',
    //                 'sgst',
    //                 'gst',
    //                 'igst'
    //             ])
    //             ->get()
    //             ->map(fn($order) => [
    //                 'id' => $order->id,
    //                 'customer_id' => $order->customer_id,
    //                 'project_id' => $order->project_id,
    //                 'company_id' => $order->company_id,
    //                 'long' => $order->long,
    //                 'lat' => $order->lat,
    //                 'profit' => (float) $order->profit,
    //                 'final_amount' => (float) $order->finalAmount, // totalAmount + GST
    //                 'total_amount' => (float) $order->totalAmount, // Amount without GST
    //                 'paid_amount' => (float) $order->paidAmount,
    //                 'pending_amount' => (float) ($order->finalAmount - $order->paidAmount),
    //                 'discount' => (float) $order->discount,
    //                 'payment_type' => $order->paymentType,
    //                 'invoice_type' => $order->invoiceType,
    //                 'order_status' => $order->orderStatus,
    //                 'delivery_time' => $order->deliveryTime,
    //                 'delivery_date' => $order->deliveryDate,
    //                 'invoice_date' => $order->invoiceDate,
    //                 'show' => $order->show,
    //                 'pay_later' => $order->payLater,
    //                 'is_settled' => $order->isSettled,
    //                 'invoice_number' => $order->invoice_number,
    //                 'cgst' => (float) $order->cgst,
    //                 'sgst' => (float) $order->sgst,
    //                 'gst' => (float) $order->gst,
    //                 'igst' => (float) $order->igst,
    //                 'gst_amount' => (float) ($order->cgst + $order->sgst + $order->igst),
    //             ]);

    //         // ---------- Income (Bank-wise payment tracking ONLY) ----------
    //         $receiverBanks = Income::select('receivers_bank', DB::raw('SUM(received_amount) as amount'))
    //             ->where('company_id', $companyId)
    //             ->where('project_id', $project->id)
    //             ->groupBy('receivers_bank')
    //             ->get()
    //             ->map(fn($r) => [
    //                 'bank_name' => $r->receivers_bank,
    //                 'amount' => (float) $r->amount
    //             ]);

    //         // ---------- Sales Calculation (Renamed from Profit/Loss) ----------
    //         // Net Balance = Final Amount (with GST) - Total Expenses
    //         $netBalance = $finalAmountWithGST - $totalExpenses;
    //         $isPositiveBalance = $netBalance >= 0;

    //         // ---------- Response ----------
    //         $response[] = [
    //             'sr_no' => $project->id,
    //             'site_name' => $project->project_name,
    //             'company_name' => $project->customer_name,
                
    //             // DTH Details
    //             'total_dth_points' => (float) $totalDthPoints,
    //             'avg_dth_rate' => (float) $avgDthRate,
    //             'total_dth_billing_amount' => (float) $totalDthBilling,
                
    //             // Survey Details
    //             'total_survey_points' => (float) $totalSurveyPoints,
    //             'avg_survey_rate' => (float) $avgSurveyRate,
    //             'total_survey_billing_amount' => (float) $totalSurveyBilling,

    //             // Sales Section (4 key blocks)
    //             'sales' => [
    //                 'total_amount' => (float) $totalAmountWithoutGST, // Amount without GST
    //                 'gst_amount' => (float) $totalGST, // Total GST
    //                 'expense_amount' => (float) $totalExpenses, // Total Expenses
    //                 'net_balance' => (float) $netBalance, // Net Balance (not profit/loss)
    //                 'is_positive_balance' => $isPositiveBalance,
                    
    //                 // GST breakdown for reference
    //                 'gst_breakdown' => [
    //                     'cgst' => (float) $totalCGST,
    //                     'sgst' => (float) $totalSGST,
    //                     'igst' => (float) $totalIGST,
    //                     'total_gst' => (float) $totalGST,
    //                 ],
    //             ],

    //             // Payment / Order Details (with GST indication)
    //             'order_summary' => [
    //                 'total_amount_without_gst' => (float) $totalAmountWithoutGST,
    //                 'gst_amount' => (float) $totalGST,
    //                 'final_amount_with_gst' => (float) $finalAmountWithGST, // This includes GST
    //                 'paid_amount' => (float) $paidAmount,
    //                 'pending_amount' => (float) $pendingAmount,
    //                 'total_discount' => (float) $totalDiscount,
    //                 'note' => 'Final Amount includes GST (Total Amount + GST Amount)',
    //             ],

    //             // Individual order details with all required fields
    //             'order_details' => $orderDetails,

    //             // Expenses breakdown
    //             'expenses' => [
    //                 'transport' => (float) $transport,
    //                 'other_billing' => (float) $otherBilling,
    //                 'diesel' => (float) $diesel,
    //                 'extra_billing' => (float) $extraBilling,
    //                 'total_expenses' => (float) $totalExpenses,
    //             ],

    //             // Receiver banks (bank-wise payment tracking from Income table)
    //             'receiver_banks' => $receiverBanks,

    //             // Expense breakdown for analysis
    //             'expense_breakdown' => $expenseBreakdown,
                
    //             // Calculation details for transparency
    //             'calculation_details' => [
    //                 'total_amount_without_gst' => (float) $totalAmountWithoutGST,
    //                 'gst_amount' => (float) $totalGST,
    //                 'final_amount_with_gst' => (float) $finalAmountWithGST,
    //                 'total_expenses' => (float) $totalExpenses,
    //                 'net_balance' => (float) $netBalance,
    //                 'formula' => 'Net Balance = Final Amount (with GST) - Total Expenses',
    //             ],
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

            $avgDthRate = $totalDthPoints > 0 ? round($totalDthBilling / $totalDthPoints, 2) : 0;

            // ---------- Survey ----------
            $totalSurveyPoints = SurveyDetail::where('company_id', $companyId)
                ->where('project_id', $project->id)
                ->sum(DB::raw('CAST(survey_point AS DECIMAL(12,2))'));

            $totalSurveyBilling = SurveyDetail::where('company_id', $companyId)
                ->where('project_id', $project->id)
                ->sum('total');

            $avgSurveyRate = $totalSurveyPoints > 0 ? round($totalSurveyBilling / $totalSurveyPoints, 2) : 0;

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

            $extraBilling = $project->extra_billing ?? 0;

            $totalExpenses = $transport + $otherBilling + $diesel + $extraBilling;

            // ---------- Expense Breakdown ----------
            $expenseBreakdown = Expense::leftJoin('expense_types', 'expenses.expense_id', '=', 'expense_types.id')
                ->where('expenses.company_id', $companyId)
                ->where('expenses.project_id', $project->id)
                ->select(
                    DB::raw('COALESCE(expense_types.name, "Uncategorized") as expense_type'),
                    DB::raw('SUM(expenses.total_price) as total')
                )
                ->groupBy('expense_types.name')
                ->get()
                ->map(fn($item) => [
                    'type' => $item->expense_type,
                    'amount' => (float) $item->total
                ]);

            // ---------- Orders Aggregates ----------
            $ordersData = Order::where('company_id', $companyId)
                ->where('project_id', $project->id)
                ->selectRaw('
                    SUM(totalAmount) as total_amount_without_gst,
                    SUM(finalAmount) as final_amount_with_gst,
                    SUM(paidAmount) as paid_amount,
                    SUM(finalAmount - paidAmount) as pending_amount,
                    SUM(discount) as total_discount
                ')
                ->first();

            $totalAmountWithoutGST = (float) ($ordersData->total_amount_without_gst ?? 0);
            $finalAmountWithGST    = (float) ($ordersData->final_amount_with_gst ?? 0);
            $paidAmount            = (float) ($ordersData->paid_amount ?? 0);
            $pendingAmount         = (float) ($ordersData->pending_amount ?? 0);
            $totalDiscount         = (float) ($ordersData->total_discount ?? 0);

            // ---------- REAL GST from OrderDetail table (this is the key fix) ----------
          $totalGSTFromDetails = OrderDetail::whereIn('order_id', function ($query) use ($companyId, $project) {
    $query->select('id')
          ->from('orders')
          ->where('company_id', $companyId)
          ->where('project_id', $project->id);
}) // ← Closing parenthesis is here
->sum(DB::raw('COALESCE(cgst_amount, 0) + COALESCE(sgst_amount, 0)'));
            $totalGST = (float) $totalGSTFromDetails;

            // Individual order details with correct GST per order
            $orderDetails = Order::where('company_id', $companyId)
                ->where('project_id', $project->id)
                ->select([
                    'id', 'customer_id', 'project_id', 'company_id', 'long', 'lat', 'profit',
                    'finalAmount', 'totalAmount', 'paidAmount', 'discount',
                    'paymentType', 'invoiceType', 'orderStatus',
                    'deliveryDate', 'deliveryTime', 'invoiceDate', 'show', 'payLater', 'isSettled',
                    'invoice_number', 'cgst', 'sgst', 'gst', 'igst'
                ])
                ->get()
                ->map(function ($order) {
                    // Get GST from OrderDetail for this specific order
                    $gstFromDetails = OrderDetail::where('order_id', $order->id)
                        ->sum(DB::raw('COALESCE(cgst_amount, 0) + COALESCE(sgst_amount, 0)'));

                    $cgst = (float) ($order->cgst ?? 0);
                    $sgst = (float) ($order->sgst ?? 0);
                    $igst = (float) ($order->igst ?? 0);

                    // Prefer detail-level GST if available, fallback to order-level
                    $gst_amount = $gstFromDetails > 0 ? $gstFromDetails : ($cgst + $sgst + $igst);

                    return [
                        'id' => $order->id,
                        'customer_id' => $order->customer_id,
                        'project_id' => $order->project_id,
                        'company_id' => $order->company_id,
                        'long' => $order->long,
                        'lat' => $order->lat,
                        'profit' => (float) $order->profit,
                        'final_amount' => (float) $order->finalAmount,
                        'total_amount' => (float) $order->totalAmount,
                        'paid_amount' => (float) $order->paidAmount,
                        'pending_amount' => (float) ($order->finalAmount - $order->paidAmount),
                        'discount' => (float) $order->discount,
                        'payment_type' => $order->paymentType,
                        'invoice_type' => $order->invoiceType,
                        'order_status' => $order->orderStatus,
                        'delivery_time' => $order->deliveryTime,
                        'delivery_date' => $order->deliveryDate,
                        'invoice_date' => $order->invoiceDate,
                        'show' => $order->show,
                        'pay_later' => $order->payLater,
                        'is_settled' => $order->isSettled,
                        'invoice_number' => $order->invoice_number,
                        'cgst' => $cgst,
                        'sgst' => $sgst,
                        'igst' => $igst,
                        'gst_amount' => $gst_amount,
                        'gst' => (float) ($order->gst ?? $gst_amount),
                    ];
                });

            // ---------- Income (Bank-wise) ----------
            $receiverBanks = Income::select('receivers_bank', DB::raw('SUM(received_amount) as amount'))
                ->where('company_id', $companyId)
                ->where('project_id', $project->id)
                ->groupBy('receivers_bank')
                ->get()
                ->map(fn($r) => [
                    'bank_name' => $r->receivers_bank,
                    'amount' => (float) $r->amount
                ]);

            // Net Balance = Final Amount (with GST) - Total Expenses
            $netBalance = $finalAmountWithGST - $totalExpenses;
            $isPositiveBalance = $netBalance >= 0;

            // ---------- Final Response (structure unchanged) ----------
            $response[] = [
                'sr_no' => $project->id,
                'site_name' => $project->project_name,
                'company_name' => $project->customer_name,

                // DTH & Survey (unchanged)
                'total_dth_points' => (float) $totalDthPoints,
                'avg_dth_rate' => (float) $avgDthRate,
                'total_dth_billing_amount' => (float) $totalDthBilling,
                'total_survey_points' => (float) $totalSurveyPoints,
                'avg_survey_rate' => (float) $avgSurveyRate,
                'total_survey_billing_amount' => (float) $totalSurveyBilling,

                // Sales Section – Now with correct GST from OrderDetail
               // Sales Section – Simplified (no more undefined variables)
'sales' => [
    'total_amount' => $totalAmountWithoutGST,
    'gst_amount' => $totalGST,
    'expense_amount' => (float) $totalExpenses,
    // 'net_balance' => (float) $netBalance,
    'net_balance' => (float) ($totalAmountWithoutGST - $totalGST - $totalExpenses),
    'is_positive_balance' => $isPositiveBalance,
    'gst_breakdown' => [
        'total_gst' => $totalGST,  // Only keep total — safe and accurate
    ],
],

                // Order Summary – Correct GST
                // 'order_summary' => [
                //     'total_amount_without_gst' => $totalAmountWithoutGST,
                //     'gst_amount' => $totalGST, // ← Now correct
                //     'final_amount_with_gst' => $finalAmountWithGST,
                //     'paid_amount' => $paidAmount,
                //     'pending_amount' => $pendingAmount,
                //     'total_discount' => $totalDiscount,
                //     'note' => 'Final Amount includes GST (Total Amount + GST Amount)',
                // ],

                'order_summary' => [
    'total_amount_without_gst' => (float) ($finalAmountWithGST - $totalGST), // ← Forced correct: final - gst
    'gst_amount'               => $totalGST,
    'final_amount_with_gst'    => $finalAmountWithGST,
    'paid_amount'              => $paidAmount,
    'pending_amount'           => $pendingAmount,
    'total_discount'           => $totalDiscount,
    'note'                     => 'Final Amount includes GST (Total Amount + GST Amount)',
],

                'order_details' => $orderDetails,

                'expenses' => [
                    'transport' => (float) $transport,
                    'other_billing' => (float) $otherBilling,
                    'diesel' => (float) $diesel,
                    'extra_billing' => (float) $extraBilling,
                    'total_expenses' => (float) $totalExpenses,
                ],

                'receiver_banks' => $receiverBanks,

                'expense_breakdown' => $expenseBreakdown,

                'calculation_details' => [
                    'total_amount_without_gst' => $totalAmountWithoutGST,
                    'gst_amount' => $totalGST, // ← Now correct
                    'final_amount_with_gst' => $finalAmountWithGST,
                    'total_expenses' => $totalExpenses,
                    'net_balance' => $netBalance,
                    'formula' => 'Net Balance = Final Amount (with GST) - Total Expenses',
                ],
            ];
        }

        return response()->json(['data' => $response], 200);
    }

}