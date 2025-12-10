<?php

namespace App\Http\Controllers;
use App\Models\OrderSummary;
use App\Models\ExpenseSummary;
use App\Models\CompanyInfo;
use App\Models\Order;
use App\Models\Expense;
use App\Models\Customer;
use App\Models\OrderDetail; 
use App\Models\InvoiceRule; 
use App\Models\Rules;
use App\Models\PaymentTracker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Models\Operator;
use App\Models\User;
use App\Models\WorkPointDetail;
use App\Models\SurveyDetail;
use App\Models\ProformaInvoice;
use App\Models\ProformaInvoiceDetail;
use App\Models\Income;
use App\Models\IncomeSummary;


class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    // public function index(Request $request)
    // {
    //     $user = Auth::user();
    //     $companyId = $user->company_id;
    //     $invoiceType = $request->query('invoiceType');
    //     $orderStatus = $request->query('orderStatus');
    //     $perPage = $request->query('perPage', 25);
    //     $cursor = $request->query('cursor');

    //     try {
    //         $query = Order::with(['project:id,project_name', 'customer:id,name,mobile', 'user:id,name,mobile', 'items'])
    //             ->where('company_id', $companyId)
    //             ->orderBy('id', 'desc');

    //         if ($invoiceType !== null && $invoiceType > -1) {
    //             $query->where('invoiceType', $invoiceType);
    //         }

    //         if ($orderStatus !== null && $orderStatus > -1) {
    //             $query->where('orderStatus', $orderStatus);
    //         }

    //         $orders = $query->cursorPaginate(perPage: $perPage, cursorName: 'id', cursor: $cursor);

    //         return response()->json([
    //             'data' => $orders->items(),
    //             'next_cursor' => $orders->nextCursor()?->encode(),
    //             'has_more_pages' => $orders->hasMorePages(),
    //             'filters' => [
    //                 'invoiceType' => $invoiceType,
    //                 'orderStatus' => $orderStatus
    //             ]
    //         ]);

    //     } catch (\Exception $e) {
    //         return response()->json(['error' => $e->getMessage()], 500);
    //     }
    // }

    public function index(Request $request)
{
    $user       = Auth::user();
    $companyId  = $user->company_id;
    $invoiceType = $request->query('invoiceType');
    $orderStatus = $request->query('orderStatus');
    $perPage    = $request->query('perPage', 25);
    $cursor     = $request->query('cursor');

    try {
        // ✅ Load full project details (no column restriction)
        $query = Order::with([
                'project.supervisor:id,name,mobile,email',      // <-- full Project model
                'customer:id,name,mobile',
                'user:id,name,mobile',
                'items'
            ])
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc');

        if (!is_null($invoiceType) && $invoiceType > -1) {
            $query->where('invoiceType', $invoiceType);
        }

        if (!is_null($orderStatus) && $orderStatus > -1) {
            $query->where('orderStatus', $orderStatus);
        }

        $orders = $query->cursorPaginate(
            perPage: $perPage,
            cursorName: 'id',
            cursor: $cursor
        );

        return response()->json([
            'data' => $orders->items(),
            'next_cursor' => $orders->nextCursor()?->encode(),
            'has_more_pages' => $orders->hasMorePages(),
            'filters' => [
                'invoiceType' => $invoiceType,
                'orderStatus' => $orderStatus
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $order = Order::with('project', 'customer', 'items','invoiceRules.rule')->find($id);
        $order->items = $order->items()->get();
        $order->customer = Customer::find($order->customer_id);
        return $order;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
// public function store(Request $request)
// {
//     $user = Auth::user();
//     $invoiceDate = Carbon::parse($request->invoiceDate)->format('Y-m-d');

//     // Get company info for invoice number
//     $company = CompanyInfo::findOrFail($user->company_id);
//     $invoiceNumber = $company->initials . '-' . $company->invoice_counter;

//     // Increment counter for the next invoice
//     $company->invoice_counter += 1;
//     $company->save();

//     // No profit calculation (no products/bPrice), set to 0
//     $profit = 0;

//     // Get paidAmount from request with default value
//     $paidAmount = $request->paidAmount ?? 0;

//     // Map invoiceType to orderStatus
//     $orderStatus = match ($request->invoiceType) {
//         1 => 3,  // Quotation
//         2 => 2,  // Proforma Invoice
//         3 => 1,  // Invoice
//         0 => 0,  // Cancelled
//         default => 1, // Default to Invoice
//     };

//     // Create order
//     $order = Order::create(
//         array_merge(
//             $request->all(),
//             [
//                 'project_id'     => $request->project_id,
//                 'customer_id'    => $request->customer_id,
//                 'profit'         => $profit,
//                 'orderStatus'    => $orderStatus,
//                 'company_id'     => $user->company_id,
//                 'invoice_number' => $invoiceNumber,
//                 'paidAmount'     => $paidAmount,
//                 'created_by'     => $user->id,
//                 'updated_by'     => $user->id,
//                 'totalAmount'    => $request->finalAmount ?? 0,
//                 'invoiceDate'    => $invoiceDate,
//             ]
//         )
//     );

//     // ✅ Always store work detail items
//     if (!empty($request->items)) {
//         foreach ($request->items as $item) {
//             $od = new OrderDetail();
//             $od->order_id    = $order->id; // 🔑 explicitly set order_id
//             $od->work_type   = $item['work_type'] ?? '';
//             $od->qty         = $item['qty'] ?? 0;
//             $od->price       = $item['price'] ?? 0;
//             $od->total_price = $item['total_price'] ?? 0;
//             $od->remark      = $item['remark'] ?? null;
//             $od->save();
//         }
//     }

//     // Payment tracker updates
//     $finalAmount   = $request->finalAmount ?? 0;
//     $balanceAmount = $finalAmount - $paidAmount;

//     $paymentDetails = PaymentTracker::firstOrNew(['customer_id' => $request->customer_id]);
//     $paymentDetails->created_by = $user->id;
//     $paymentDetails->updated_by = $user->id;
//     $paymentDetails->amount -= $balanceAmount;
//     $paymentDetails->save();

//     // ✅ Only update OrderSummary if it's an Invoice
//     if ($order->invoiceType == 3) {
//         $summaryDate = Carbon::parse($request->deliveryDate)->format('Y-m-d');

//         OrderSummary::updateOrCreate(
//             ['invoice_date' => $summaryDate, 'company_id' => $user->company_id],
//             [
//                 'order_count'  => DB::raw('order_count + 1'),
//                 'total_amount' => DB::raw("total_amount + {$finalAmount}"),
//                 'paid_amount'  => DB::raw("paid_amount + {$paidAmount}")
//             ]
//         );
//     }

//     $order->items = $order->items()->get();

//     return response()->json(['success' => true, 'data' => $order, 'id' => $order->id], 201);
// }


// public function store(Request $request)
// {
//     $user = Auth::user();
//     $invoiceDate = Carbon::parse($request->invoiceDate)->format('Y-m-d');

//     // Get company info for invoice number
//     $company = CompanyInfo::findOrFail($user->company_id);
//     $invoiceNumber = $company->initials . '-' . $company->invoice_counter;

//     // Increment counter for the next invoice
//     $company->invoice_counter += 1;
//     $company->save();

//     // No profit calculation (no products/bPrice), set to 0
//     $profit = 0;

//     // Get paidAmount from request with default value
//     $paidAmount = $request->paidAmount ?? 0;

//     // Map invoiceType to orderStatus
//     $orderStatus = match ($request->invoiceType) {
//         1 => 3,  // Quotation
//         2 => 2,  // Proforma Invoice
//         3 => 1,  // Invoice
//         0 => 0,  // Cancelled
//         default => 1, // Default to Invoice
//     };

//     // Create order
//     $order = Order::create(
//         array_merge(
//             $request->all(),
//             [
//                 'project_id'     => $request->project_id,
//                 'customer_id'    => $request->customer_id,
//                 'profit'         => $profit,
//                 'orderStatus'    => $orderStatus,
//                 'company_id'     => $user->company_id,
//                 'invoice_number' => $invoiceNumber,
//                 'paidAmount'     => $paidAmount,
//                 'created_by'     => $user->id,
//                 'updated_by'     => $user->id,
//                 'totalAmount'    => $request->taxableAmount ?? 0,
//                 'gst'            => $request->gstAmount ?? 0,
//                 'cgst'           => $request->cgstAmount ?? 0,
//                 'sgst'           => $request->sgstAmount ?? 0,
//                 'igst'           => $request->igstAmount ?? 0,
//                 'invoiceDate'    => $invoiceDate,
//             ]
//         )
//     );

//     // ✅ Always store work detail items
//     if (!empty($request->items)) {
//         foreach ($request->items as $item) {
//             $od = new OrderDetail();
//             $od->order_id    = $order->id; // 🔑 explicitly set order_id
//             $od->work_type   = $item['work_type'] ?? '';
//             $od->qty         = $item['qty'] ?? 0;
//             $od->price       = $item['price'] ?? 0;
//             $od->total_price = $item['total_price'] ?? 0;
//             $od->remark      = $item['remark'] ?? null;
//             $od->save();
//         }
//     }

//     // Payment tracker updates
//     $finalAmount   = $request->finalAmount ?? 0;
//     $balanceAmount = $finalAmount - $paidAmount;

//     $paymentDetails = PaymentTracker::firstOrNew(['customer_id' => $request->customer_id]);
//     $paymentDetails->created_by = $user->id;
//     $paymentDetails->updated_by = $user->id;
//     $paymentDetails->amount -= $balanceAmount;
//     $paymentDetails->save();

//     // ✅ Only update OrderSummary if it's an Invoice
//     if ($order->invoiceType == 3) {
//         $summaryDate = Carbon::parse($request->deliveryDate)->format('Y-m-d');

//         OrderSummary::updateOrCreate(
//             ['invoice_date' => $summaryDate, 'company_id' => $user->company_id],
//             [
//                 'order_count'  => DB::raw('order_count + 1'),
//                 'total_amount' => DB::raw("total_amount + {$finalAmount}"),
//                 'paid_amount'  => DB::raw("paid_amount + {$paidAmount}")
//             ]
//         );
//     }

//     $order->items = $order->items()->get();

//     return response()->json(['success' => true, 'data' => $order, 'id' => $order->id], 201);
// }


public function store(Request $request)
{
    $user        = Auth::user();
    $invoiceDate = Carbon::parse($request->invoiceDate)->format('Y-m-d');

    // Get company info for invoice number
    $company = CompanyInfo::findOrFail($user->company_id);
    $invoiceNumber = $company->initials . '-' . $company->invoice_counter;

    // Increment counter for the next invoice
    $company->increment('invoice_counter');

    // No profit calculation (no products/bPrice), set to 0
    $profit = 0;

    // Get paidAmount from request with default value
    $paidAmount = $request->paidAmount ?? 0;

    // Map invoiceType to orderStatus
    $orderStatus = match ($request->invoiceType) {
        1 => 3,  // Quotation
        2 => 2,  // Proforma Invoice
        3 => 1,  // Invoice
        0 => 0,  // Cancelled
        default => 1,
    };

    // ✅ Create Order
    $order = Order::create(array_merge(
        $request->all(),
        [
            'project_id'     => $request->project_id,
            'customer_id'    => $request->customer_id,
            'profit'         => $profit,
            'orderStatus'    => $orderStatus,
            'company_id'     => $user->company_id,
            'invoice_number' => $invoiceNumber,
            'paidAmount'     => $paidAmount,
            'created_by'     => $user->id,
            'updated_by'     => $user->id,
            'totalAmount'    => $request->taxableAmount ?? 0,
            'gst'            => $request->gstAmount ?? 0,
            'cgst'           => $request->cgstAmount ?? 0,
            'sgst'           => $request->sgstAmount ?? 0,
            'igst'           => $request->igstAmount ?? 0,
            'invoiceDate'    => $invoiceDate,
            'terms_and_conditions'  => $request->terms_and_conditions,
            'payment_terms'         => $request->payment_terms,
            'note'                  => $request->note,
             'ref_id' => $request->ref_id,
             	'po_number' => $request->po_number,
        ]
    ));
    // ✅ Always store work detail items
    if (!empty($request->items)) {
        foreach ($request->items as $item) {
            OrderDetail::create([
                'order_id'    => $order->id,
                'work_type'   => $item['work_type'] ?? '',
                'uom'         => $item['uom'] ?? '',
                'qty'         => $item['qty'] ?? 0,
                'price'       => $item['price'] ?? 0,
                'total_price' => $item['total_price'] ?? 0,
                'remark'      => $item['remark'] ?? null,


                 'gst_percent' => $item['gst_percent'] ?? 0,
                'cgst_amount' => $item['cgst_amount'] ?? 0,
                'sgst_amount' => $item['sgst_amount'] ?? 0,


            ]);
        }
    }

    // ✅ NEW: attach rules to invoice_rules table
    if (!empty($request->rule_ids) && is_array($request->rule_ids)) {
        foreach ($request->rule_ids as $ruleId) {
            InvoiceRule::create([
                'order_id' => $order->id,
                'rules_id' => $ruleId,
            ]);
        }
    }

    // Payment tracker updates
    $finalAmount   = $request->finalAmount ?? 0;
    $balanceAmount = $finalAmount - $paidAmount;

    $paymentDetails = PaymentTracker::firstOrNew(['customer_id' => $request->customer_id]);
    $paymentDetails->created_by = $user->id;
    $paymentDetails->updated_by = $user->id;
    $paymentDetails->amount -= $balanceAmount;
    $paymentDetails->save();

    // ✅ Only update OrderSummary if it's an Invoice
    if ($order->invoiceType == 3) {
        $summaryDate = Carbon::parse($request->deliveryDate)->format('Y-m-d');

        OrderSummary::updateOrCreate(
            ['invoice_date' => $summaryDate, 'company_id' => $user->company_id],
            [
                'order_count'  => DB::raw('order_count + 1'),
                'total_amount' => DB::raw("total_amount + {$finalAmount}"),
                'paid_amount'  => DB::raw("paid_amount + {$paidAmount}")
            ]
        );
    }

    // Load relations for response
    $order->load(['items', 'invoiceRules.rule']); // if you define relationships

    return response()->json([
        'success' => true,
        'data'    => $order,
        'id'      => $order->id
    ], 201);
}


















    public function summerySalesReport(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $perPage = $request->query('perPage', 30);
        $cursor = $request->query('cursor');

        if (!$startDate || !$endDate) {
            return response()->json(['error' => 'Start and End date are required.'], 400);
        }

        $user = Auth::user();
        $companyId = $user->company_id;

        try {
            // Summary from order_summaries, only for invoiceType=3 (Invoice)
            $summary = DB::table('order_summaries')
                ->join('orders', function ($join) use ($companyId) {
                    $join->on('order_summaries.invoice_date', '=', 'orders.invoiceDate')
                         ->where('orders.company_id', '=', $companyId)
                         ->where('orders.invoiceType', '=', 3); // Only Invoices
                })
                ->where('order_summaries.company_id', $companyId)
                ->whereBetween('order_summaries.invoice_date', [$startDate, $endDate])
                ->selectRaw('
                    SUM(order_summaries.total_amount) as totalAmount,
                    SUM(order_summaries.paid_amount) as totalPaidAmount,
                    SUM(order_summaries.total_amount - order_summaries.paid_amount) as totalRemainingAmount,
                    SUM(order_summaries.order_count) as totalOrders
                ')
                ->first();

            // Get expense summary
            $expenseSummary = DB::table('expense_summaries')
                ->where('company_id', $companyId)
                ->whereBetween('expense_date', [$startDate, $endDate])
                ->selectRaw('SUM(total_expense) as totalExpenses')
                ->first();

            $totalExpenses = $expenseSummary->totalExpenses ?? 0;
            $totalProfitLoss = ($summary->totalAmount ?? 0) - $totalExpenses;

            // Cursor-based paginated daily order summary, only for invoiceType=3
            $query = DB::table('order_summaries')
                ->join('orders', function ($join) use ($companyId) {
                    $join->on('order_summaries.invoice_date', '=', 'orders.invoiceDate')
                         ->where('orders.company_id', '=', $companyId)
                         ->where('orders.invoiceType', '=', 3); // Only Invoices
                })
                ->where('order_summaries.company_id', $companyId)
                ->whereBetween('order_summaries.invoice_date', [$startDate, $endDate])
                ->select('order_summaries.invoice_date', 'order_summaries.invoice_date as invoiceDate', 'order_summaries.total_amount as totalAmount', 'order_summaries.paid_amount as paidAmount', 'order_summaries.order_count as orderCount')
                ->orderBy('order_summaries.invoice_date');

            $orders = $query->cursorPaginate($perPage, ['invoice_date'], 'cursor', $cursor);

            return response()->json([
                'orders' => $orders->items(),
                'next_cursor' => $orders->nextCursor()?->encode(),
                'has_more_pages' => $orders->hasMorePages(),
                'summary' => [
                    'sales' => [
                        'totalAmount' => $summary->totalAmount ?? 0,
                        'totalPaidAmount' => $summary->totalPaidAmount ?? 0,
                        'totalRemainingAmount' => $summary->totalRemainingAmount ?? 0,
                        'totalOrders' => $summary->totalOrders ?? 0,
                    ],
                    'profitLoss' => [
                        'totalSales' => $summary->totalAmount ?? 0,
                        'totalExpenses' => $totalExpenses,
                        'totalProfitLoss' => $totalProfitLoss,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Report generation failed: ' + $e->getMessage()], 500);
        }
    }







    public function getMonthlyReportSummeries(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $year = $request->query('year', date('Y'));

        try {
            // Get monthly sales data from order_summaries, only for invoiceType=3 (Invoice)
            $monthlySales = DB::table('order_summaries')
                ->join('orders', function ($join) use ($companyId) {
                    $join->on('order_summaries.invoice_date', '=', 'orders.invoiceDate')
                         ->where('orders.company_id', '=', $companyId)
                         ->where('orders.invoiceType', '=', 3); // Only Invoices
                })
                ->where('order_summaries.company_id', $companyId)
                ->whereYear('order_summaries.invoice_date', $year)
                ->selectRaw('MONTH(order_summaries.invoice_date) as month, SUM(order_summaries.total_amount) as total')
                ->groupBy(DB::raw('MONTH(order_summaries.invoice_date)'))
                ->get()
                ->keyBy('month');

            // Get monthly expense data
            $monthlyExpenses = ExpenseSummary::where('company_id', $companyId)
                ->whereYear('expense_date', $year)
                ->selectRaw('MONTH(expense_date) as month, SUM(total_expense) as total')
                ->groupBy(DB::raw('MONTH(expense_date)'))
                ->get()
                ->keyBy('month');

            // Initialize arrays for 12 months
            $salesData = array_fill(0, 12, 0);
            $expenseData = array_fill(0, 12, 0);
            $PLdata = array_fill(0, 12, 0);

            // Fill sales data
            foreach ($monthlySales as $month => $data) {
                $salesData[$month - 1] = floatval($data->total);
            }

            // Fill expense data
            foreach ($monthlyExpenses as $month => $data) {
                $expenseData[$month - 1] = floatval($data->total);
            }

            // Calculate P&L
            for ($i = 0; $i < 12; $i++) {
                $PLdata[$i] = $salesData[$i] - $expenseData[$i];
            }

            $result = [
                'success' => true,
                'year' => $year,
                'monthlySales' => $salesData,
                'monthlyExpense' => $expenseData,
                'monthlyPandL' => $PLdata,
                'totals' => [
                    'totalSales' => array_sum($salesData),
                    'totalExpenses' => array_sum($expenseData),
                    'totalPL' => array_sum($PLdata),
                ]
            ];

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Monthly summary report failed: ' + $e->getMessage()], 500);
        }
    }

    public function profitLossReport(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        if (!$startDate || !$endDate) {
            return response()->json(['error' => 'Start and End date are required.'], 400);
        }

        $user = Auth::user();
        $companyId = $user->company_id;

        try {
            // Total WorkPoint Income
            $workIncome = WorkPointDetail::where('company_id', $companyId)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('total');

            // Total Survey Income
            $surveyIncome = SurveyDetail::where('company_id', $companyId)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('total');

            // Total Expenses
            $totalExpenses = Expense::where('company_id', $companyId)
                ->whereBetween('expense_date', [$startDate, $endDate])
                ->sum('total_price');

            // Total Sales (income)
            $totalSales = $workIncome + $surveyIncome;

            // Profit/Loss
            $profitLoss = $totalSales - $totalExpenses;

            return response()->json([
                'summary' => [
                    'sales' => [
                        'totalSales' => $totalSales,
                        'workIncome' => $workIncome,
                        'surveyIncome' => $surveyIncome,
                    ],
                    'expenses' => [
                        'totalExpenses' => $totalExpenses,
                    ],
                    'profitLoss' => [
                        'profitLossAmount' => $profitLoss,
                        'status' => $profitLoss >= 0 ? 'Profit' : 'Loss'
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Report generation failed: ' + $e->getMessage()], 500);
        }
    }








// create by pankaj


// public function update(Request $request, $id)
// {
//     $user  = Auth::user();
//     $order = Order::with('items')->findOrFail($id);

//     DB::beginTransaction();

//     try {
//         // ✅ Map invoiceType → orderStatus (same as store)
//         $orderStatus = match ($request->invoiceType) {
//             1 => 3,  // Quotation
//             2 => 2,  // Proforma Invoice
//             3 => 1,  // Invoice
//             0 => 0,  // Cancelled
//             default => 1,
//         };

//         $invoiceDate   = Carbon::parse($request->invoiceDate)->format('Y-m-d');
//         $finalAmount   = $request->finalAmount ?? 0;   // WITH GST (grand total)
//         $paidAmount    = $request->paidAmount ?? 0;
//         $balanceAmount = $finalAmount - $paidAmount;

//         // ✅ Update main order fields (same structure as store)
//         $order->update(array_merge(
//             $request->except(['items']), // exclude items; handled separately
//             [
//                 'project_id'   => $request->project_id,
//                 'customer_id'  => $request->customer_id,
//                 'profit'       => $order->profit ?? 0,
//                 'orderStatus'  => $orderStatus,
//                 'company_id'   => $user->company_id,
//                 'paidAmount'   => $paidAmount,
//                 'updated_by'   => $user->id,
//                 'totalAmount'  => $request->taxableAmount ?? 0, // WITHOUT GST
//                 'gst'          => $request->gstAmount ?? 0,
//                 'cgst'         => $request->cgstAmount ?? 0,
//                 'sgst'         => $request->sgstAmount ?? 0,
//                 'igst'         => $request->igstAmount ?? 0,
//                 'invoiceDate'  => $invoiceDate,
//             ]
//         ));

//         // ✅ Replace all order items
//         OrderDetail::where('order_id', $order->id)->delete();

//         if (!empty($request->items)) {
//             foreach ($request->items as $item) {
//                 OrderDetail::create([
//                     'order_id'    => $order->id,
//                     'work_type'   => $item['work_type'] ?? '',
//                     'qty'         => $item['qty'] ?? 0,
//                     'price'       => $item['price'] ?? 0,
//                     'total_price' => $item['total_price'] ?? 0,
//                     'remark'      => $item['remark'] ?? null,
//                 ]);
//             }
//         }

//         // ✅ Update PaymentTracker (re-calculate balance)
//         $paymentDetails = PaymentTracker::firstOrNew(['customer_id' => $request->customer_id]);
//         $paymentDetails->created_by = $paymentDetails->exists ? $paymentDetails->created_by : $user->id;
//         $paymentDetails->updated_by = $user->id;
//         $paymentDetails->amount = ($paymentDetails->amount ?? 0) - $balanceAmount;
//         $paymentDetails->save();

//         // ✅ Update OrderSummary if this is an Invoice
//         if ($order->invoiceType == 3) {
//             $summaryDate = $request->deliveryDate
//                 ? Carbon::parse($request->deliveryDate)->format('Y-m-d')
//                 : $invoiceDate;

//             $summary = OrderSummary::firstOrNew([
//                 'invoice_date' => $summaryDate,
//                 'company_id'   => $user->company_id,
//             ]);

//             if ($summary->exists) {
//                 $summary->order_count  += 1;
//                 $summary->total_amount += $finalAmount;
//                 $summary->paid_amount  += $paidAmount;
//             } else {
//                 $summary->order_count  = 1;
//                 $summary->total_amount = $finalAmount;
//                 $summary->paid_amount  = $paidAmount;
//             }
//             $summary->save();
//         }

//         DB::commit();

//         $order->load('items'); // refresh relations

//         return response()->json([
//             'success' => true,
//             'data'    => $order,
//             'id'      => $order->id,
//         ], 200);

//     } catch (\Exception $e) {
//         DB::rollBack();
//         return response()->json([
//             'success' => false,
//             'message' => 'Failed to update order',
//             'error'   => $e->getMessage(),
//         ], 500);
//     }
// }


public function update(Request $request, $id)
{
    $user  = Auth::user();
    $order = Order::with('items')->findOrFail($id);

    DB::beginTransaction();

    try {
        // ✅ Map invoiceType → orderStatus
        $orderStatus = match ($request->invoiceType) {
            1 => 3,  // Quotation
            2 => 2,  // Proforma Invoice
            3 => 1,  // Invoice
            0 => 0,  // Cancelled
            default => 1,
        };

        $invoiceDate   = Carbon::parse($request->invoiceDate)->format('Y-m-d');
        $finalAmount   = $request->finalAmount ?? 0;   // WITH GST (grand total)
        $paidAmount    = $request->paidAmount ?? 0;
        $balanceAmount = $finalAmount - $paidAmount;

        // ✅ Update main order fields
        $order->update(array_merge(
            $request->except(['items', 'rule_ids']), // exclude handled separately
            [
                'project_id'   => $request->project_id,
                'customer_id'  => $request->customer_id,
                'profit'       => $order->profit ?? 0,
                'orderStatus'  => $orderStatus,
                'company_id'   => $user->company_id,
                'paidAmount'   => $paidAmount,
                'updated_by'   => $user->id,
                'totalAmount'  => $request->taxableAmount ?? 0, // WITHOUT GST
                'gst'          => $request->gstAmount ?? 0,
                'cgst'         => $request->cgstAmount ?? 0,
                'sgst'         => $request->sgstAmount ?? 0,
                'igst'         => $request->igstAmount ?? 0,
                'invoiceDate'  => $invoiceDate,
                 'terms_and_conditions'  => $request->terms_and_conditions,
            'payment_terms'         => $request->payment_terms,
            'note'                  => $request->note,
            'ref_id'   => $request->ref_id,
                'po_number'   => $request->po_number,
            ]
        ));

        // ✅ Replace all order items
        OrderDetail::where('order_id', $order->id)->delete();

        if (!empty($request->items)) {
            foreach ($request->items as $item) {
                OrderDetail::create([
                    'order_id'    => $order->id,
                    'work_type'   => $item['work_type'] ?? '',
                    'uom'         => $item['uom'] ?? '',
                    'qty'         => $item['qty'] ?? 0,
                    'price'       => $item['price'] ?? 0,
                    'total_price' => $item['total_price'] ?? 0,
                    'remark'      => $item['remark'] ?? null,
                    'gst_percent' => $item['gst_percent'] ?? 0,
                    'cgst_amount' => $item['cgst_amount'] ?? 0,
                    'sgst_amount' => $item['sgst_amount'] ?? 0,
                ]);
            }
        }

        // ✅ Replace all invoice rules
        InvoiceRule::where('order_id', $order->id)->delete();

        if (!empty($request->rule_ids) && is_array($request->rule_ids)) {
            foreach ($request->rule_ids as $ruleId) {
                InvoiceRule::create([
                    'order_id' => $order->id,
                    'rules_id' => $ruleId,
                ]);
            }
        }

        // ✅ Update PaymentTracker
        $paymentDetails = PaymentTracker::firstOrNew(['customer_id' => $request->customer_id]);
        $paymentDetails->created_by = $paymentDetails->exists ? $paymentDetails->created_by : $user->id;
        $paymentDetails->updated_by = $user->id;
        $paymentDetails->amount = ($paymentDetails->amount ?? 0) - $balanceAmount;
        $paymentDetails->save();

        // ✅ Update OrderSummary if this is an Invoice
        if ($order->invoiceType == 3) {
            $summaryDate = $request->deliveryDate
                ? Carbon::parse($request->deliveryDate)->format('Y-m-d')
                : $invoiceDate;

            $summary = OrderSummary::firstOrNew([
                'invoice_date' => $summaryDate,
                'company_id'   => $user->company_id,
            ]);

            if ($summary->exists) {
                $summary->order_count  += 1;
                $summary->total_amount += $finalAmount;
                $summary->paid_amount  += $paidAmount;
            } else {
                $summary->order_count  = 1;
                $summary->total_amount = $finalAmount;
                $summary->paid_amount  = $paidAmount;
            }
            $summary->save();
        }

        DB::commit();

        // Reload relations for response
        $order->load(['items', 'invoiceRules.rule']);

        return response()->json([
            'success' => true,
            'data'    => $order,
            'id'      => $order->id,
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Failed to update order',
            'error'   => $e->getMessage(),
        ], 500);
    }
}


 public function getAllData()
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        try {
            $orders = Order::with([
                'project' => function($query) {
                    $query->select('id', 'project_name', 'customer_name', 'work_place', 'mobile_number', 'customer_id');
                },
                'customer:id,name,mobile',
                'items'
            ])
            ->where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($order) {
                // Ensure we have proper customer data
                if (!$order->customer && $order->project && $order->project->customer_id) {
                    $order->load(['project.customer:id,name,mobile']);
                }
                
                // Calculate final amount properly
                $finalAmount = $order->finalAmount ?? (($order->totalAmount ?? 0) + ($order->gst ?? 0) + ($order->cgst ?? 0) + ($order->sgst ?? 0) + ($order->igst ?? 0));
                $order->finalAmount = $finalAmount;
                
                return $order;
            });

            return response()->json([
                'success' => true,
                'data' => $orders
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }











    /**
     * Update invoice status (for status progression) - FIXED VERSION
     */

//     public function updateInvoiceStatus(Request $request, $id)
// {
//     $user = Auth::user();
    
//     try {
//         $order = Order::with(['items', 'project', 'customer'])->findOrFail($id);

//         if ($order->company_id !== $user->company_id) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Unauthorized access'
//             ], 403);
//         }

//         $newInvoiceType = $request->invoiceType;
        
//         // ✅ New valid progression: only Quotation -> Work Order
//         $validProgressions = [
//             1 => 2, // Quotation -> Work Order
//         ];

//         if (!isset($validProgressions[$order->invoiceType]) || 
//             $validProgressions[$order->invoiceType] !== $newInvoiceType) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Invalid status progression'
//             ], 400);
//         }

//         DB::beginTransaction();

//         try {
//             // ✅ Map invoice type to order status
//             $orderStatus = match ($newInvoiceType) {
//                 1 => 3,  // Quotation
//                 2 => 1,  // Work Order (was Invoice earlier, now treated same)
//                 0 => 0,  // Cancelled
//                 default => 1,
//             };

//             // ✅ Ensure customer_id is not null
//             $customerId = $order->customer_id;
//             if (!$customerId && $order->project && $order->project->customer_id) {
//                 $customerId = $order->project->customer_id;
//             }

//             if (!$customerId) {
//                 throw new \Exception('Customer ID cannot be determined for this order');
//             }

//             // ✅ Update order
//             $order->update([
//                 'invoiceType' => $newInvoiceType,
//                 'orderStatus' => $orderStatus,
//                 'customer_id' => $customerId,
//                 'updated_by' => $user->id,
//                 'updated_at' => now()
//             ]);

//             // ✅ Run OrderSummary logic when Work Order (2)
//             if ($newInvoiceType == 2) {
//                 $summaryDate = $order->invoiceDate;
//                 $finalAmount = $order->finalAmount ?? (
//                     ($order->totalAmount ?? 0) +
//                     ($order->gst ?? 0) +
//                     ($order->cgst ?? 0) +
//                     ($order->sgst ?? 0) +
//                     ($order->igst ?? 0)
//                 );
//                 $paidAmount = $order->paidAmount ?? 0;

//                 $summary = OrderSummary::firstOrNew([
//                     'invoice_date' => $summaryDate,
//                     'company_id' => $user->company_id
//                 ]);

//                 if ($summary->exists) {
//                     $summary->order_count += 1;
//                     $summary->total_amount += $finalAmount;
//                     $summary->paid_amount += $paidAmount;
//                 } else {
//                     $summary->order_count = 1;
//                     $summary->total_amount = $finalAmount;
//                     $summary->paid_amount = $paidAmount;
//                 }
//                 $summary->save();
//             }

//             DB::commit();

//             return response()->json([
//                 'success' => true,
//                 'message' => 'Status updated successfully',
//                 'data' => $order->fresh(['project', 'customer', 'items'])
//             ], 200);

//         } catch (\Exception $e) {
//             DB::rollBack();
//             throw $e;
//         }

//     } catch (\Exception $e) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Failed to update status',
//             'error' => $e->getMessage()
//         ], 500);
//     }
// }

// public function updateInvoiceStatus(Request $request, $id)
// {
//     $user = Auth::user();

//     try {
//         $order = Order::with(['items', 'project', 'customer'])->findOrFail($id);

//         // ✅ Security check
//         if ($order->company_id !== $user->company_id) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Unauthorized access'
//             ], 403);
//         }

//         $newInvoiceType = $request->invoiceType;

//         // ✅ Only Quotation → Work Order allowed
//         $validProgressions = [
//             1 => 2,
//         ];

//         if (!isset($validProgressions[$order->invoiceType]) ||
//             $validProgressions[$order->invoiceType] !== $newInvoiceType) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Invalid status progression'
//             ], 400);
//         }

//         DB::beginTransaction();

//         try {
//             // ✅ Step 1: Update Project details if provided
//             if ($order->project) {
//                 $validated = $request->validate([
//                     'customer_name' => 'sometimes|required|string|max:255',
//                     'mobile_number' => 'sometimes|required|string|max:255',
//                     'project_name'  => 'sometimes|required|string|max:255',
//                     'project_cost'  => 'nullable|string|max:255',
//                     'work_place'    => 'nullable|string|max:255',
//                     'start_date'    => 'nullable|date',
//                     'end_date'      => 'nullable|date',
//                     'is_confirm'    => 'nullable|boolean',
//                     'is_visible'    => 'boolean',
//                     'remark'        => 'nullable|string',
//                     'supervisor_id' => 'nullable|numeric',
//                     'commission'    => 'nullable|numeric',
//                     'gst_number'    => 'nullable|string|max:255',
//                 ]);

//                 $order->project->update($validated);

//                 // ✅ Mandatory project fields check
//                 if (empty($order->project->supervisor_id) || empty($order->project->project_cost)) {
//                     DB::rollBack();
//                     return response()->json([
//                         'success' => false,
//                         'message' => 'Please update supervisor and project cost before changing status',
//                         'project' => $order->project
//                     ], 400);
//                 }
//             }

//             // ✅ Step 2: Map invoiceType → orderStatus
//             $orderStatus = match ($newInvoiceType) {
//                 1 => 3,  // Quotation
//                 2 => 2,  // Work Order
//                 0 => 0,  // Cancelled
//                 default => 1,
//             };

//             // ✅ Ensure customer_id exists
//             $customerId = $order->customer_id;
//             if (!$customerId && $order->project && $order->project->customer_id) {
//                 $customerId = $order->project->customer_id;
//             }

//             if (!$customerId) {
//                 throw new \Exception('Customer ID cannot be determined for this order');
//             }

//             // ✅ Step 3: Update Order
//             $order->update([
//                 'invoiceType' => $newInvoiceType,
//                 'orderStatus' => $orderStatus,
//                 'customer_id' => $customerId,
//                 'updated_by'  => $user->id,
//                 'updated_at'  => now()
//             ]);

//             // ✅ Step 4: Handle OrderSummary for Work Order
//             if ($newInvoiceType == 2) {
//                 $summaryDate = $order->invoiceDate ?? now();
//                 $finalAmount = $order->finalAmount ?? (
//                     ($order->totalAmount ?? 0) +
//                     ($order->gst ?? 0) +
//                     ($order->cgst ?? 0) +
//                     ($order->sgst ?? 0) +
//                     ($order->igst ?? 0)
//                 );
//                 $paidAmount = $order->paidAmount ?? 0;

//                 $summary = OrderSummary::firstOrNew([
//                     'invoice_date' => $summaryDate,
//                     'company_id'   => $user->company_id
//                 ]);

//                 if ($summary->exists) {
//                     $summary->order_count += 1;
//                     $summary->total_amount += $finalAmount;
//                     $summary->paid_amount += $paidAmount;
//                 } else {
//                     $summary->order_count = 1;
//                     $summary->total_amount = $finalAmount;
//                     $summary->paid_amount = $paidAmount;
//                 }
//                 $summary->save();
//             }

//             DB::commit();

//             return response()->json([
//                 'success' => true,
//                 'message' => 'Status & project updated successfully',
//                 'data'    => $order->fresh(['project', 'customer', 'items'])
//             ], 200);

//         } catch (\Exception $e) {
//             DB::rollBack();
//             throw $e;
//         }

//     } catch (\Exception $e) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Failed to update status',
//             'error'   => $e->getMessage()
//         ], 500);
//     }
// }


public function updateInvoiceStatus(Request $request, $id)
{
    $user = Auth::user();

    try {
        $order = Order::with(['items', 'project', 'customer'])->findOrFail($id);

        // ✅ Security check
        if ($order->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $newInvoiceType = $request->invoiceType;

        // ✅ Only Quotation → Work Order allowed
        $validProgressions = [
            1 => 2,
        ];

        if (!isset($validProgressions[$order->invoiceType]) ||
            $validProgressions[$order->invoiceType] !== $newInvoiceType) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status progression'
            ], 400);
        }

        DB::beginTransaction();

        try {
            // ✅ Step 1: Update Project details if provided
            if ($order->project) {
                $validated = $request->validate([
                    'customer_name' => 'sometimes|required|string|max:255',
                    'mobile_number' => 'sometimes|required|string|max:255',
                    'project_name'  => 'sometimes|required|string|max:255',
                    'project_cost'  => 'nullable|string|max:255',
                    'work_place'    => 'nullable|string|max:255',
                    'start_date'    => 'nullable|date',
                    'end_date'      => 'nullable|date',
                    'is_confirm'    => 'nullable|boolean',
                    'is_visible'    => 'boolean',
                    'remark'        => 'nullable|string',
                    'supervisor_id' => 'nullable|numeric',
                    'commission'    => 'nullable|numeric',
                    'gst_number'    => 'nullable|string|max:255',
                ]);

                $order->project->update($validated);

                // ✅ Mandatory project fields check
                if (empty($order->project->supervisor_id) || empty($order->project->project_cost)) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Please update supervisor and project cost before changing status',
                        'project' => $order->project
                    ], 400);
                }
            }

            // ✅ Step 2: Map invoiceType → orderStatus
            $orderStatus = match ($newInvoiceType) {
                1 => 3,  // Quotation
                2 => 2,  // Work Order
                0 => 0,  // Cancelled
                default => 1,
            };

            // ✅ Ensure customer_id exists
            $customerId = $order->customer_id;
            if (!$customerId && $order->project && $order->project->customer_id) {
                $customerId = $order->project->customer_id;
            }

            if (!$customerId) {
                throw new \Exception('Customer ID cannot be determined for this order');
            }

            // ✅ Step 3: Update Order
            $order->update([
                'invoiceType' => $newInvoiceType,
                'orderStatus' => $orderStatus,
                'customer_id' => $customerId,
                'updated_by'  => $user->id,
                'updated_at'  => now()
            ]);

            // ✅ Step 4: Handle OrderSummary for Work Order
            if ($newInvoiceType == 2) {
                $summaryDate = $order->invoiceDate ?? now();
                $finalAmount = $order->finalAmount ?? (
                    ($order->totalAmount ?? 0) +
                    ($order->gst ?? 0) +
                    ($order->cgst ?? 0) +
                    ($order->sgst ?? 0) +
                    ($order->igst ?? 0)
                );
                $paidAmount = $order->paidAmount ?? 0;

                $summary = OrderSummary::firstOrNew([
                    'invoice_date' => $summaryDate,
                    'company_id'   => $user->company_id
                ]);

                if ($summary->exists) {
                    $summary->order_count += 1;
                    $summary->total_amount += $finalAmount;
                    $summary->paid_amount += $paidAmount;
                } else {
                    $summary->order_count = 1;
                    $summary->total_amount = $finalAmount;
                    $summary->paid_amount = $paidAmount;
                }
                $summary->save();
            }

            DB::commit();

            // ✅ Step 5: Fetch Supervisor details from USERS table
            $supervisor = null;
            if ($order->project && $order->project->supervisor_id) {
                $supervisor = \App\Models\User::where('company_id', $user->company_id)
                    ->where('id', $order->project->supervisor_id)
                    ->first();
            }

            return response()->json([
                'success'    => true,
                'message'    => 'Status & project updated successfully',
                'data'       => $order->fresh(['project', 'customer', 'items']),
                'supervisor' => $supervisor  // 👈 Supervisor info only if exists
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to update status',
            'error'   => $e->getMessage()
        ], 500);
    }
}






   /**
 * Record payment and update order
 * Enhanced version with proper income-order linking
 */
public function recordPayment(Request $request, $id)
{
    $user = Auth::user();
    $order = Order::findOrFail($id);

    // Security check
    if ($order->company_id !== $user->company_id) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized access'
        ], 403);
    }

    // Business rule check
    if ($order->invoiceType !== 2) {
        return response()->json([
            'success' => false,
            'message' => 'Payment can only be recorded for invoices'
        ], 400);
    }

    // Validate input
    $validated = $request->validate([
        'received_amount' => 'required|numeric|min:0.01',
        'received_by' => 'required|string|max:255',
        'payment_type' => 'required|in:imps,rtgs,upi,cash,cheque',
        'senders_bank' => 'required|string|max:255',
        'receivers_bank' => 'required|string|max:255',
        'remark' => 'nullable|string|max:500',
        'incomeId' => 'nullable|integer' // For linking existing income records
    ]);

    $newPayment = floatval($validated['received_amount']);
    $totalAmount = $order->finalAmount ?? (($order->totalAmount ?? 0) + ($order->gst ?? 0) + ($order->cgst ?? 0) + ($order->sgst ?? 0) + ($order->igst ?? 0));
    $currentPaid = $order->paidAmount ?? 0;
    $remainingAmount = $totalAmount - $currentPaid;

    // Amount validation
    if ($newPayment <= 0) {
        return response()->json([
            'success' => false,
            'message' => 'Payment amount must be greater than zero'
        ], 400);
    }

    if ($newPayment > $remainingAmount) {
        return response()->json([
            'success' => false,
            'message' => "Payment amount cannot exceed remaining amount of ₹{$remainingAmount}"
        ], 400);
    }

    DB::beginTransaction();

    try {
        // Calculate amounts for income record
        $basicAmount = $newPayment / 1.18; // Assuming 18% GST
        $gstAmount = $newPayment - $basicAmount;
        
        // 1. Create Income Record with proper order linking
        $incomeData = [
            'project_id' => $order->project_id,
            'order_id' => $order->id, // Link income back to order
            'company_id' => $user->company_id,
            'po_no' => $order->po_no ?? "PO-{$order->id}",
            'po_date' => $order->invoiceDate,
            'invoice_no' => $order->invoice_number ?? "INV-{$order->id}",
            'invoice_date' => $order->invoiceDate,
            'basic_amount' => round($basicAmount, 2),
            'gst_amount' => round($gstAmount, 2),
            'billing_amount' => round($newPayment, 2),
            'received_amount' => $newPayment,
            'pending_amount' => 0.00, // This payment is fully received
            'received_by' => $validated['received_by'],
            'payment_type' => $validated['payment_type'],
            'senders_bank' => $validated['senders_bank'],
            'receivers_bank' => $validated['receivers_bank'],
            'remark' => $validated['remark'] ?? "Payment for Order #{$order->id}",
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ];

        $income = \App\Models\Income::create($incomeData);

        if (!$income) {
            throw new \Exception('Failed to create income record');
        }

        // 2. Update Order Payment Amount
        $newPaidAmount = $currentPaid + $newPayment;
        $order->update([
            'paidAmount' => $newPaidAmount,
            'updated_by' => $user->id,
            'updated_at' => now()
        ]);

        // 3. Update Payment Tracker
        $customerId = $order->customer_id;
        if (!$customerId && $order->project && $order->project->customer_id) {
            $customerId = $order->project->customer_id;
        }

        if ($customerId) {
            $paymentTracker = \App\Models\PaymentTracker::firstOrNew(['customer_id' => $customerId]);
            $paymentTracker->created_by = $paymentTracker->exists ? $paymentTracker->created_by : $user->id;
            $paymentTracker->updated_by = $user->id;
            $paymentTracker->amount = ($paymentTracker->amount ?? 0) + $newPayment;
            $paymentTracker->save();
        }

        // 4. Update Order Summary
        $summary = \App\Models\OrderSummary::firstOrNew([
            'invoice_date' => $order->invoiceDate,
            'company_id' => $user->company_id
        ]);

        if ($summary->exists) {
            $summary->paid_amount += $newPayment;
        } else {
            // If summary doesn't exist, create it with current order data
            $summary->order_count = 1;
            $summary->total_amount = $totalAmount;
            $summary->paid_amount = $newPayment;
        }
        $summary->save();

        // 5. Update Income Summary
        $today = Carbon::today()->toDateString();
        $incomeSummary = \App\Models\IncomeSummary::firstOrNew([
            'company_id' => $user->company_id,
            'project_id' => $order->project_id,
            'date' => $today
        ]);

        if ($incomeSummary->exists) {
            $incomeSummary->increment('invoice_count');
            $incomeSummary->total_amount += $newPayment;
            $incomeSummary->pending_amount += 0; // This payment is fully received
        } else {
            $incomeSummary->invoice_count = 1;
            $incomeSummary->total_amount = $newPayment;
            $incomeSummary->pending_amount = 0;
        }
        $incomeSummary->save();

        DB::commit();

        $newRemainingAmount = $totalAmount - $newPaidAmount;

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'data' => [
                'order_id' => $order->id,
                'income_id' => $income->id,
                'payment_amount' => $newPayment,
                'new_paid_amount' => $newPaidAmount,
                'remaining_amount' => $newRemainingAmount,
                'is_fully_paid' => $newRemainingAmount <= 0
            ]
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();
        
        \Log::error('Payment recording failed', [
            'order_id' => $id,
            'user_id' => $user->id,
            'payment_amount' => $newPayment,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Failed to record payment',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Update order paid amount when income entry is updated
 */
public function updatePaymentDetails(Request $request, $id)
{
    $user = Auth::user();
    $order = Order::findOrFail($id);

    if ($order->company_id !== $user->company_id) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized access'
        ], 403);
    }

    DB::beginTransaction();

    try {
        // Validate the paid amount
        $validated = $request->validate([
            'paidAmount' => 'required|numeric|min:0',
            'incomeId' => 'nullable|integer', // Optional: if updating specific income entry
            'oldAmount' => 'nullable|numeric' // Optional: previous amount for difference calculation
        ]);

        $newPaidAmount = $validated['paidAmount'];
        $finalAmount = $order->finalAmount ?? (($order->totalAmount ?? 0) + ($order->gst ?? 0) + ($order->cgst ?? 0) + ($order->sgst ?? 0) + ($order->igst ?? 0));

        // Validate paid amount doesn't exceed total
        if ($newPaidAmount > $finalAmount) {
            return response()->json([
                'success' => false,
                'message' => 'Paid amount cannot exceed total amount'
            ], 400);
        }

        // Calculate the difference for payment tracker update
        $oldPaidAmount = $order->paidAmount ?? 0;
        $paymentDifference = $newPaidAmount - $oldPaidAmount;

        // If this update is coming from an income entry update, handle it differently
        if ($request->has('incomeId') && $request->has('oldAmount')) {
            $oldIncomeAmount = $request->input('oldAmount');
            $newIncomeAmount = $newPaidAmount; // Assuming the new paid amount is the new income amount
            $incomeDifference = $newIncomeAmount - $oldIncomeAmount;
            
            // Update order's paid amount by the income difference
            $newOrderPaidAmount = $oldPaidAmount + $incomeDifference;
            
            // Validate the new order paid amount
            if ($newOrderPaidAmount > $finalAmount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Updated amount would exceed total order amount'
                ], 400);
            }
            
            if ($newOrderPaidAmount < 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Updated amount cannot be negative'
                ], 400);
            }

            // Update order with the calculated amount
            $order->update([
                'paidAmount' => $newOrderPaidAmount,
                'updated_by' => $user->id,
                'updated_at' => now()
            ]);

            $paymentDifference = $incomeDifference;
        } else {
            // Direct order paid amount update
            $order->update([
                'paidAmount' => $newPaidAmount,
                'updated_by' => $user->id,
                'updated_at' => now()
            ]);
        }

        // Update payment tracker if there's a payment difference
        if ($paymentDifference != 0) {
            $customerId = $order->customer_id;
            if (!$customerId && $order->project && $order->project->customer_id) {
                $customerId = $order->project->customer_id;
            }

            if ($customerId) {
                $paymentTracker = PaymentTracker::firstOrNew(['customer_id' => $customerId]);
                $paymentTracker->created_by = $paymentTracker->exists ? $paymentTracker->created_by : $user->id;
                $paymentTracker->updated_by = $user->id;
                $paymentTracker->amount = ($paymentTracker->amount ?? 0) + $paymentDifference;
                $paymentTracker->save();
            }

            // Update OrderSummary if this is an invoice
            if ($order->invoiceType == 3) {
                $summary = OrderSummary::firstOrNew([
                    'invoice_date' => $order->invoiceDate,
                    'company_id' => $user->company_id
                ]);

                if ($summary->exists) {
                    $summary->paid_amount += $paymentDifference;
                    $summary->save();
                }
            }
        }

        DB::commit();

        $updatedPaidAmount = $order->fresh()->paidAmount;
        $remainingAmount = $finalAmount - $updatedPaidAmount;

        return response()->json([
            'success' => true,
            'message' => 'Payment amount updated successfully',
            'data' => [
                'order' => $order->fresh(),
                'new_paid_amount' => $updatedPaidAmount,
                'remaining_amount' => $remainingAmount,
                'payment_difference' => $paymentDifference
            ]
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Failed to update payment amount',
            'error' => $e->getMessage()
        ], 500);
    }
}










public function ClearAllOrderDetailsById($orderId)
{
    try {

        \DB::beginTransaction();

        // =====================================================
        // 1. FETCH ORDER
        // =====================================================
        $order = Order::find($orderId);
        if (!$order) {
            return response()->json(['status' => false, 'msg' => 'Order not found']);
        }

        $companyId   = $order->company_id;
        $projectId   = $order->project_id;
        $invoiceDate = $order->invoiceDate;
        $invoiceType = $order->invoiceType;   // IMPORTANT

        // =====================================================
        // 2. DELETE ORDER DETAILS
        // =====================================================
        OrderDetail::where('order_id', $orderId)->delete();

        // =====================================================
        // 3. DELETE PROFORMA INVOICES + DETAILS
        // =====================================================
        $proformas = ProformaInvoice::where('work_order_id', $orderId)->get();
        foreach ($proformas as $p) {
            ProformaInvoiceDetail::where('proforma_invoice_id', $p->id)->delete();
            Income::where('proforma_invoice_id', $p->id)->delete();
            $p->delete();
        }

        // =====================================================
        // 4. DELETE INCOME + ADJUST INCOME SUMMARY
        // =====================================================
        $incomes = Income::where('order_id', $orderId)->get();
        foreach ($incomes as $inc) {

            $incomeDate    = $inc->invoice_date;
            $billingAmount = floatval($inc->billing_amount);
            $pendingAmount = floatval($inc->pending_amount);

            if ($incomeDate) {
                $incomeSummary = IncomeSummary::where('company_id', $companyId)
                    ->where('project_id', $projectId)
                    ->where('date', $incomeDate)
                    ->first();

                if ($incomeSummary) {

                    $incomeSummary->invoice_count   -= 1;
                    $incomeSummary->total_amount    -= $billingAmount;
                    $incomeSummary->pending_amount  -= $pendingAmount;

                    if ($incomeSummary->invoice_count <= 0) {
                        $incomeSummary->delete();
                    } else {
                        $incomeSummary->save();
                    }
                }
            }

            $inc->delete();
        }

        // =====================================================
        // 5. DELETE THE ORDER
        // =====================================================
        $order->delete();

        // =====================================================
        // 6. RECALCULATE ORDER SUMMARY FOR THAT DATE (WORK ORDER ONLY)
        // =====================================================
        if ($invoiceType == 2 && $invoiceDate) {   // FIXED: from 3 → 2

            // REBUILD summary FOR THIS SPECIFIC DATE
            $newSummary = Order::where('company_id', $companyId)
                ->where('invoiceType', 2)          // FIXED
                ->where('invoiceDate', $invoiceDate)
                ->selectRaw('COUNT(*) AS order_count, 
                             SUM(finalAmount) AS total_amount, 
                             SUM(paidAmount) AS paid_amount')
                ->first();

            // existing summary row
            $summaryRow = OrderSummary::where('company_id', $companyId)
                ->where('invoice_date', $invoiceDate)
                ->first();

            if ($newSummary && $newSummary->order_count > 0) {

                if ($summaryRow) {
                    $summaryRow->order_count  = $newSummary->order_count;
                    $summaryRow->total_amount = $newSummary->total_amount;
                    $summaryRow->paid_amount  = $newSummary->paid_amount;
                    $summaryRow->save();
                } else {
                    OrderSummary::create([
                        'company_id'   => $companyId,
                        'invoice_date' => $invoiceDate,
                        'order_count'  => $newSummary->order_count,
                        'total_amount' => $newSummary->total_amount,
                        'paid_amount'  => $newSummary->paid_amount
                    ]);
                }

            } else {
                // NO ORDERS LEFT → DELETE SUMMARY FOR THIS DATE ONLY
                if ($summaryRow) {
                    $summaryRow->delete();
                }
            }
        }

        // =====================================================
        // 7. REBUILD INCOME SUMMARY (UNCHANGED)
        // =====================================================
        IncomeSummary::where('company_id', $companyId)
            ->where('project_id', $projectId)
            ->delete();

        $incomeSummaryData = Income::where('company_id', $companyId)
            ->where('project_id', $projectId)
            ->select(
                'invoice_date AS date',
                \DB::raw('COUNT(*) AS invoice_count'),
                \DB::raw('SUM(billing_amount) AS total_amount'),
                \DB::raw('SUM(pending_amount) AS pending_amount')
            )
            ->groupBy('invoice_date')
            ->get();

        foreach ($incomeSummaryData as $i) {
            IncomeSummary::create([
                'company_id'    => $companyId,
                'project_id'    => $projectId,
                'date'          => $i->date,
                'invoice_count' => $i->invoice_count,
                'total_amount'  => $i->total_amount,
                'pending_amount'=> $i->pending_amount
            ]);
        }

        \DB::commit();

        return response()->json([
            'status' => true,
            'msg'    => 'Order deleted & summary updated for that date only.'
        ]);

    } catch (\Exception $e) {

        \DB::rollBack();
        return response()->json([
            'status' => false,
            'msg'    => 'Error: ' . $e->getMessage()
        ]);
    }
}







}