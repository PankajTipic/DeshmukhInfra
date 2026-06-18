<?php 



namespace App\Http\Controllers;
 
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Income;
use App\Models\Expense;
use App\Models\order;
 use App\Models\PurchesVendorModel;
 use App\Models\PurchesVendorPaymentLog;
 use App\Models\Operator;
  use App\Models\VendorPayment;
  use App\Models\VendorPaymentLog;
  use App\Models\VendorOnBehalfPaymentLog;

class LadgerController extends Controller
{


 public function ledgerReport(Request $request)
    {
        // ── 1. Validate ──────────────────────────────────────────────
    $request->validate([
        'company_id'   => 'nullable|integer',
        'project_id'   => 'nullable|integer',
        'search'       => 'nullable|string|max:100',
        'start_date'   => 'nullable|date',
        'end_date'     => 'nullable|date|after_or_equal:start_date',
        'payment_type' => 'nullable|string|max:50',
        'expense_type' => 'nullable|string|max:100',
        'min_balance'  => 'nullable|numeric',
        'max_balance'  => 'nullable|numeric',
        'has_pending'  => 'nullable|boolean',
    ]);

    $companyId   = $request->input('company_id');
    $projectId   = $request->input('project_id');
    $search      = $request->input('search');
    $startDate   = $request->input('start_date');
    $endDate     = $request->input('end_date');
    $paymentType = $request->input('payment_type');
    $expenseType = $request->input('expense_type');
    $minBalance  = $request->input('min_balance');
    $maxBalance  = $request->input('max_balance');
    $hasPending  = $request->input('has_pending');

    // ── 2. Projects ──────────────────────────────────────────────
    $projects = Project::query()
        ->where('is_subcontract', 0)
        ->where('is_visible', true)
        ->when($companyId, fn($q) => $q->where('company_id', $companyId))
        ->when($projectId, fn($q) => $q->where('id', $projectId))
        ->when($search, fn($q) => $q->where(function ($q) use ($search) {
            $q->where('project_name', 'like', "%{$search}%")
              ->orWhere('customer_name', 'like', "%{$search}%")
              ->orWhere('work_place', 'like', "%{$search}%");
        }))
        ->select('id','project_name','customer_name','mobile_number',
                 'project_cost','start_date','end_date','work_place','company_id')
        ->orderBy('start_date', 'desc')
        ->get();

    if ($projects->isEmpty()) {
        return response()->json([
            'success' => true,
            'message' => 'No regular projects found.',
            'data' => [],
            'grand_total' => [],
            'filters_applied' => $request->only([
                'company_id','project_id','search','start_date',
                'end_date','payment_type','expense_type',
                'min_balance','max_balance','has_pending',
            ]),
        ]);
    }

    $projectIds = $projects->pluck('id')->toArray();

    // Fetch filtered data
    $allIncomes = Income::whereIn('project_id', $projectIds)
        ->when($startDate, fn($q) => $q->whereDate('payment_date', '>=', $startDate))
        ->when($endDate, fn($q) => $q->whereDate('payment_date', '<=', $endDate))
        ->when($paymentType, fn($q) => $q->where('payment_type', $paymentType))
        ->get();

    $allExpenses = Expense::whereIn('project_id', $projectIds)
        ->where('show', 1)
        ->when($startDate, fn($q) => $q->whereDate('expense_date', '>=', $startDate))
        ->when($endDate, fn($q) => $q->whereDate('expense_date', '<=', $endDate))
        ->when($expenseType, fn($q) => $q->where('name', 'like', "%{$expenseType}%"))
        ->get();

    $allOrders = Order::whereIn('project_id', $projectIds)
        ->when($startDate, fn($q) => $q->whereDate('invoiceDate', '>=', $startDate))
        ->when($endDate, fn($q) => $q->whereDate('invoiceDate', '<=', $endDate))
        ->get();

    // Opening balances fetch
    $pastIncomes = collect();
    $pastExpenses = collect();
    $pastOrders = collect();

    if ($startDate) {
        $pastIncomes = Income::whereIn('project_id', $projectIds)
            ->whereDate('payment_date', '<', $startDate)
            ->selectRaw('project_id, SUM(received_amount) as total')
            ->groupBy('project_id')
            ->pluck('total', 'project_id');

        $pastExpenses = Expense::whereIn('project_id', $projectIds)
            ->where('show', 1)
            ->whereDate('expense_date', '<', $startDate)
            ->selectRaw('project_id, SUM(total_price) as total')
            ->groupBy('project_id')
            ->pluck('total', 'project_id');
            
        $pastOrders = Order::whereIn('project_id', $projectIds)
            ->whereDate('invoiceDate', '<', $startDate)
            ->selectRaw('project_id, SUM(finalAmount) as total')
            ->groupBy('project_id')
            ->pluck('total', 'project_id');
    }

    $incomesByProject = $allIncomes->groupBy('project_id');
    $expensesByProject = $allExpenses->groupBy('project_id');
    $ordersByProject = $allOrders->groupBy('project_id');

    $grandTotal = [
        'total_project_cost'    => 0,
        'total_billing_amount'  => 0,
        'total_received_amount' => 0,
        'total_income_pending'  => 0,
        'total_expense_amount'  => 0,
        'total_expense_pending' => 0,
        'total_orders_amount'   => 0,
        'total_orders_paid'     => 0,
        'net_balance'           => 0,
    ];

    $ledger = [];

    foreach ($projects as $project) {
        $pid = $project->id;

        $projectIncomes = $incomesByProject->get($pid, collect());
        $projectExpenses = $expensesByProject->get($pid, collect());
        $projectOrders = $ordersByProject->get($pid, collect());

        $totalBilling       = $projectIncomes->sum('billing_amount');
        $totalReceived      = $projectIncomes->sum('received_amount');
        $totalIncomePending = $projectIncomes->sum('pending_amount');

        $totalExpense       = $projectExpenses->sum('total_price');
        $totalExpPending    = $projectExpenses->sum('pending_amount');

        $totalOrders        = $projectOrders->sum('finalAmount');
        $totalPaidOrders    = $projectOrders->sum('paidAmount');

        $netBalance = $totalReceived - $totalExpense;

        // Post-query filters
        if (!is_null($minBalance) && $netBalance < $minBalance) continue;
        if (!is_null($maxBalance) && $netBalance > $maxBalance) continue;
        if ($hasPending && ($totalIncomePending <= 0 && $totalExpPending <= 0)) continue;

        // Accumulate Grand Total
        $grandTotal['total_project_cost']    += $project->project_cost ?? 0;
        $grandTotal['total_billing_amount']  += $totalBilling;
        $grandTotal['total_received_amount'] += $totalReceived;
        $grandTotal['total_income_pending']  += $totalIncomePending;
        $grandTotal['total_expense_amount']  += $totalExpense;
        $grandTotal['total_expense_pending'] += $totalExpPending;
        $grandTotal['total_orders_amount']   += $totalOrders;
        $grandTotal['total_orders_paid']     += $totalPaidOrders;
        $grandTotal['net_balance']           += $netBalance;

        // ── Build Ledger Entries (Tally Style: Date, Particulars, Vch Type, Vch No, Debit, Credit) ─────────────
        $entries = collect();

        // Orders (Sales) -> Debit
        foreach ($projectOrders as $order) {
            $entries->push([
                'date'        => $order->invoiceDate,
                'particulars' => 'Cr (as per details) Sales',
                'vch_type'    => 'Sales',
                'vch_no'      => $order->invoice_number ?? '-',
                'debit'       => (float)($order->finalAmount ?? 0),
                'credit'      => 0,
                'type'        => 'order',
                'ref_id'      => $order->id,
            ]);
        }

        // Incomes (Receipt) -> Credit
        foreach ($projectIncomes as $inc) {
            $bank = $inc->receivers_bank ?: 'Bank Account';
            $entries->push([
                'date'        => $inc->payment_date ?? $inc->invoice_date,
                'particulars' => 'Dr ' . $bank,
                'vch_type'    => 'Receipt',
                'vch_no'      => $inc->invoice_no ?? '-',
                'debit'       => 0,
                'credit'      => (float)($inc->received_amount ?? 0),
                'type'        => 'income',
                'ref_id'      => $inc->id,
            ]);
        }

        // Expenses (Purchase) -> Debit
        foreach ($projectExpenses as $exp) {
            $entries->push([
                'date'        => $exp->expense_date,
                'particulars' => 'Dr ' . $exp->name . ($exp->party_name ? ' - ' . $exp->party_name : ''),
                'vch_type'    => 'Journal',
                'vch_no'      => $exp->id,
                'debit'       => (float)($exp->total_price ?? 0),
                'credit'      => 0,
                'type'        => 'expense',
                'ref_id'      => $exp->id,
            ]);
        }

        // Sort by date
        $entries = $entries->sortBy('date')->values();

        // Calculate Opening Balance (Total Past Debit - Total Past Credit)
        // Debit = Orders + Expenses
        // Credit = Incomes
        $openingDebit = ($pastOrders->get($pid, 0)) + ($pastExpenses->get($pid, 0));
        $openingCredit = $pastIncomes->get($pid, 0);
        $openingBalance = $openingDebit - $openingCredit;

        // Calculate Running Balance
        $runningBalance = $openingBalance;
        $ledgerEntries = $entries->map(function ($entry) use (&$runningBalance) {
            $runningBalance += ($entry['debit'] - $entry['credit']);
            $entry['balance'] = round($runningBalance, 2);
            return $entry;
        });

        $ledger[] = [
            'project' => [
                'id'            => $project->id,
                'project_name'  => $project->project_name,
                'customer_name' => $project->customer_name,
                'mobile_number' => $project->mobile_number,
                'project_cost'  => $project->project_cost,
                'work_place'    => $project->work_place,
                'start_date'    => $project->start_date,
                'end_date'      => $project->end_date,
            ],

            'ledger_entries' => $ledgerEntries,

            'summary' => [
                'opening_balance'       => round($openingBalance, 2),
                'closing_balance'       => round($runningBalance, 2),
                'total_orders_amount'   => round($totalOrders, 2),
                'total_billing_amount'  => round($totalBilling, 2),
                'total_received_amount' => round($totalReceived, 2),
                'total_expense_amount'  => round($totalExpense, 2),
                'net_balance'           => round($netBalance, 2),
                'balance_status'        => $netBalance >= 0 ? 'profit' : 'loss',
                'entry_count'           => $ledgerEntries->count(),
            ],
        ];
    }

    // Final Grand Total
    $grandTotal = array_map(fn($v) => is_numeric($v) ? round($v, 2) : $v, $grandTotal);
    $grandTotal['project_count'] = count($ledger);
    $grandTotal['overall_status'] = $grandTotal['net_balance'] >= 0 ? 'profit' : 'loss';

    return response()->json([
        'success'         => true,
        'data'            => $ledger,
        'grand_total'     => $grandTotal,
        'filters_applied' => $request->only([
            'company_id','project_id','search','start_date',
            'end_date','payment_type','expense_type',
            'min_balance','max_balance','has_pending',
        ]),
    ]);
}


public function purchaseVendorLedgerReport(Request $request)
{
    // ── 1. Validate ──────────────────────────────────────────────
    $request->validate([
        'company_id'   => 'nullable|integer',
        'project_id'   => 'nullable|integer',
        'vendor_id'    => 'nullable|integer',
        'search'       => 'nullable|string|max:100',
        'start_date'   => 'nullable|date',
        'end_date'     => 'nullable|date|after_or_equal:start_date',
    ]);

    $companyId = $request->input('company_id');
    $projectId = $request->input('project_id');
    $vendorId  = $request->input('vendor_id');
    $search    = $request->input('search');
    $startDate = $request->input('start_date');
    $endDate   = $request->input('end_date');

    // ── 2. Get Purchase Vendors (type = 3) ───────────────────────
    $vendors = Operator::query()
        ->where('type', 3)
        // ->where('show', 1)
        ->when($companyId, fn($q) => $q->where('company_id', $companyId))
        ->when($projectId, fn($q) => $q->where('project_id', $projectId))
        ->when($vendorId, fn($q) => $q->where('id', $vendorId))
        ->when($search, fn($q) => $q->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('mobile', 'like', "%{$search}%")
              ->orWhere('address', 'like', "%{$search}%");
        }))
        ->select('id', 'name', 'mobile', 'address', 'project_id', 'company_id')
        ->orderBy('name')
        ->get();

    if ($vendors->isEmpty()) {
        return response()->json([
            'success' => true,
            'message' => 'No purchase vendors found.',
            'data' => [],
            'grand_total' => [
                'vendor_count' => 0,
                'total_purchase' => 0,
                'total_paid' => 0,
                'net_balance' => 0,
            ],
        ]);
    }

    $vendorIds = $vendors->pluck('id')->toArray();

    // ── 3. Fetch Purchases and Payments ──────────────────────────
    // All Purchases for these vendors
    $allPurchases = PurchesVendorModel::with('project')
        ->whereIn('vendor_id', $vendorIds)
        ->get();

    // All Payments for these purchases
    $allPayments = PurchesVendorPaymentLog::whereHas('purchase', function ($q) use ($vendorIds) {
        $q->whereIn('vendor_id', $vendorIds);
    })->with('purchase.project')->get();

    // Link payment back to vendor
    $allPayments = $allPayments->map(function ($payment) {
        $payment->vendor_id = $payment->purchase ? $payment->purchase->vendor_id : null;
        return $payment;
    });

    $purchasesGrouped = $allPurchases->groupBy('vendor_id');
    $paymentsGrouped = $allPayments->groupBy('vendor_id');

    // ── 4. Build Ledger ─────────────────────────────────────────
    $grandTotal = [
        'vendor_count'   => 0,
        'total_purchase' => 0,
        'total_paid'     => 0,
        'net_balance'    => 0,
    ];

    $ledger = [];

    foreach ($vendors as $vendor) {
        $vid = $vendor->id;

        $vendorPurchases = $purchasesGrouped->get($vid, collect());
        $vendorPayments  = $paymentsGrouped->get($vid, collect());

        $openingBalance = 0;
        $entries = collect();

        // Accumulators for Grand Totals (entire lifetime)
        $lifetimePurchase = $vendorPurchases->sum('total');
        $lifetimePaid     = $vendorPayments->sum('amount');
        $lifetimeBalance  = $lifetimePurchase - $lifetimePaid;

        // Purchases (Vendor is Credited)
        foreach ($vendorPurchases as $pur) {
            $pDate = $pur->date ? date('Y-m-d', strtotime($pur->date)) : null;
            if ($startDate && $pDate && $pDate < $startDate) {
                $openingBalance += (float)$pur->total;
            } else if (!$endDate || !$pDate || $pDate <= $endDate) {
                $projectName = $pur->project ? $pur->project->project_name : 'N/A';
                $entries->push([
                    'date'        => $pDate,
                    'particulars' => 'Purchase - ' . $pur->material_name . ($pur->about ? " ({$pur->about})" : '') . " [Project: {$projectName}]",
                    'vch_type'    => 'Purchase',
                    'vch_no'      => 'PI-' . $pur->id,
                    'debit'       => 0,
                    'credit'      => (float)$pur->total,
                    'type'        => 'purchase',
                ]);
            }
        }

        // Payments (Vendor is Debited)
        foreach ($vendorPayments as $pay) {
            $pDate = $pay->payment_date ? date('Y-m-d', strtotime($pay->payment_date)) : null;
            if ($startDate && $pDate && $pDate < $startDate) {
                $openingBalance -= (float)$pay->amount;
            } else if (!$endDate || !$pDate || $pDate <= $endDate) {
                $entries->push([
                    'date'        => $pDate,
                    'particulars' => 'Payment - ' . ($pay->payment_type ?? 'Cash') . ($pay->remark ? " - {$pay->remark}" : ''),
                    'vch_type'    => 'Payment',
                    'vch_no'      => 'PV-' . $pay->id,
                    'debit'       => (float)$pay->amount,
                    'credit'      => 0,
                    'type'        => 'payment',
                ]);
            }
        }

        $entries = $entries->sortBy('date')->values();

        $running = $openingBalance;
        $ledgerEntries = collect();

        // Add Opening Balance Row
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

        // Add Transactions
        foreach ($entries as $entry) {
            $running += ($entry['credit'] - $entry['debit']);
            $entry['balance']      = abs($running);
            $entry['balance_type'] = $running >= 0 ? 'Cr' : 'Dr';
            $ledgerEntries->push($entry);
        }

        // Period Summary
        $periodPurchase = $entries->where('type', 'purchase')->sum('credit');
        $periodPaid     = $entries->where('type', 'payment')->sum('debit');

        $grandTotal['vendor_count']++;
        $grandTotal['total_purchase'] += $lifetimePurchase;
        $grandTotal['total_paid']     += $lifetimePaid;
        $grandTotal['net_balance']    += $lifetimeBalance;

        $ledger[] = [
            'vendor' => [
                'id'         => $vendor->id,
                'name'       => $vendor->name,
                'mobile'     => $vendor->mobile,
                'address'    => $vendor->address,
                'project_id' => $vendor->project_id,
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
        'success'         => true,
        'data'            => $ledger,
        'grand_total'     => $grandTotal,
        'filters_applied' => $request->only([
            'company_id', 'project_id', 'vendor_id', 'search', 'start_date', 'end_date'
        ]),
    ]);
}



public function vendorLedgerReport(Request $request)
{
    // ── 1. Validate ──────────────────────────────────────────────
    $request->validate([
        'company_id'   => 'nullable|integer',
        'project_id'   => 'nullable|integer',
        'vendor_id'    => 'nullable|integer',
        'search'       => 'nullable|string|max:100',
        'start_date'   => 'nullable|date',
        'end_date'     => 'nullable|date|after_or_equal:start_date',
    ]);

    $companyId = $request->input('company_id');
    $projectId = $request->input('project_id');
    $vendorId  = $request->input('vendor_id');
    $search    = $request->input('search');
    $startDate = $request->input('start_date');
    $endDate   = $request->input('end_date');

    // ── 2. Get Vendors (type = 2) ───────────────────────────────
    $vendors = Operator::query()
        ->where('type', 2)                    // ← Changed to type = 2
        ->where('show', 1)
        ->when($companyId, fn($q) => $q->where('company_id', $companyId))
        ->when($projectId, fn($q) => $q->where('project_id', $projectId))
        ->when($vendorId, fn($q) => $q->where('id', $vendorId))
        ->when($search, fn($q) => $q->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('mobile', 'like', "%{$search}%")
              ->orWhere('address', 'like', "%{$search}%");
        }))
        ->select('id', 'name', 'mobile', 'address', 'project_id', 'company_id')
        ->orderBy('name')
        ->get();

    if ($vendors->isEmpty()) {
        return response()->json([
            'success' => true,
            'message' => 'No vendors found.',
            'data' => [],
            'grand_total' => [
                'vendor_count'   => 0,
                'total_debit'    => 0,
                'total_credit'   => 0,
                'net_balance'    => 0,
            ],
        ]);
    }

    $vendorIds = $vendors->pluck('id')->toArray();

    // ── 3. Fetch All Related Data ───────────────────────────────
    $allVendorPayments = VendorPayment::whereIn('vendor_id', $vendorIds)
        ->when($projectId, fn($q) => $q->where('project_id', $projectId))
        ->with(['project', 'vendor'])
        ->get();

    $allDirectLogs = VendorPaymentLog::whereHas('vendorPayment', function ($q) use ($vendorIds) {
            $q->whereIn('vendor_id', $vendorIds);
        })
        ->get()
        ->groupBy('vendor_payment_id');

    $allOnBehalfLogs = VendorOnBehalfPaymentLog::whereHas('vendorPayment', function ($q) use ($vendorIds) {
            $q->whereIn('vendor_id', $vendorIds);
        })
        ->get()
        ->groupBy('vendor_payment_id');

    // ── 4. Build Ledger ─────────────────────────────────────────
    $grandTotal = [
        'vendor_count'   => 0,
        'total_debit'    => 0,   // Total Purchases / Liabilities
        'total_credit'   => 0,   // Total Payments
        'net_balance'    => 0,   // Payable to Vendor
    ];

    $ledger = [];

    foreach ($vendors as $vendor) {
        $vid = $vendor->id;

        // Get all vendor payments for this vendor
        $vendorPayments = $allVendorPayments->where('vendor_id', $vid);

        $openingBalance = 0;
        $entries = collect();

        // Accumulators for Grand Totals (entire lifetime)
        $lifetimeDebit = 0;
        $lifetimeCredit = 0;

        foreach ($vendorPayments as $vp) {
            $projectName = $vp->project?->project_name ?? 'N/A';

            // Vendor Payment Total (Debit - Liability)
            if ($vp->total_amount > 0) {
                $pDate = $vp->created_at ? $vp->created_at->format('Y-m-d') : now()->format('Y-m-d');
                $lifetimeDebit += (float)$vp->total_amount;
                
                if ($startDate && $pDate < $startDate) {
                    $openingBalance += (float)$vp->total_amount;
                } else if (!$endDate || $pDate <= $endDate) {
                    $entries->push([
                        'date'        => $pDate,
                        'particulars' => 'Vendor Bill / Purchase - ' . $vendor->name . ' [Project: ' . $projectName . ']',
                        'vch_type'    => 'Purchase',
                        'vch_no'      => 'VB-' . $vp->id,
                        'debit'       => 0,
                        'credit'      => (float)$vp->total_amount, // Liability = Credit
                        'type'        => 'vendor_bill',
                    ]);
                }
            }

            // Direct Payments (Credit)
            $directLogs = $allDirectLogs->get($vp->id, collect());
            foreach ($directLogs as $log) {
                $pDate = $log->payment_date ? date('Y-m-d', strtotime($log->payment_date)) : null;
                $lifetimeCredit += (float)$log->amount;
                
                if ($startDate && $pDate && $pDate < $startDate) {
                    $openingBalance -= (float)$log->amount;
                } else if (!$endDate || !$pDate || $pDate <= $endDate) {
                    $entries->push([
                        'date'        => $pDate,
                        'particulars' => 'Direct Payment - ' . ($log->payment_type ?? 'Cash') .
                                         ($log->description ? ' - ' . $log->description : ''),
                        'vch_type'    => 'Payment',
                        'vch_no'      => 'DP-' . $log->id,
                        'debit'       => (float)$log->amount, // Payment = Debit
                        'credit'      => 0,
                        'type'        => 'direct_payment',
                    ]);
                }
            }

            // On Behalf Payments (Credit)
            $onBehalfLogs = $allOnBehalfLogs->get($vp->id, collect());
            foreach ($onBehalfLogs as $log) {
                $pDate = $log->payment_date ? date('Y-m-d', strtotime($log->payment_date)) : null;
                $lifetimeCredit += (float)$log->amount;
                
                if ($startDate && $pDate && $pDate < $startDate) {
                    $openingBalance -= (float)$log->amount;
                } else if (!$endDate || !$pDate || $pDate <= $endDate) {
                    $entries->push([
                        'date'        => $pDate,
                        'particulars' => 'On Behalf Payment - ' . ($log->payment_type ?? 'Cash') .
                                         ($log->description ? ' - ' . $log->description : ''),
                        'vch_type'    => 'Payment',
                        'vch_no'      => 'OBP-' . $log->id,
                        'debit'       => (float)$log->amount, // Payment = Debit
                        'credit'      => 0,
                        'type'        => 'on_behalf_payment',
                    ]);
                }
            }
        }

        $lifetimeBalance = $lifetimeDebit - $lifetimeCredit;

        // Sort entries by date
        $entries = $entries->sortBy('date')->values();

        $running = $openingBalance;
        $ledgerEntries = collect();

        // Add Opening Balance Row
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

        // Add Transactions
        foreach ($entries as $entry) {
            $running += ($entry['credit'] - $entry['debit']);
            $entry['balance']      = abs($running);
            $entry['balance_type'] = $running >= 0 ? 'Cr' : 'Dr';
            $ledgerEntries->push($entry);
        }

        // Period Summary
        $periodPurchase = $entries->whereIn('type', ['vendor_bill'])->sum('credit');
        $periodPaid     = $entries->whereIn('type', ['direct_payment', 'on_behalf_payment'])->sum('debit');

        $grandTotal['vendor_count']++;
        $grandTotal['total_debit']  += $lifetimeDebit;
        $grandTotal['total_credit'] += $lifetimeCredit;
        $grandTotal['net_balance']  += $lifetimeBalance;

        $ledger[] = [
            'vendor' => [
                'id'      => $vendor->id,
                'name'    => $vendor->name,
                'mobile'  => $vendor->mobile,
                'address' => $vendor->address,
                'project_id' => $vendor->project_id,
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

    // Final Grand Total
    $grandTotal = array_map(fn($v) => round($v, 2), $grandTotal);
    $grandTotal['overall_status'] = $grandTotal['net_balance'] >= 0 ? 'payable' : 'receivable';

    return response()->json([
        'success'         => true,
        'data'            => $ledger,
        'grand_total'     => $grandTotal,
        'filters_applied' => $request->only([
            'company_id','project_id','search','start_date','end_date',
            'min_balance','max_balance'
        ]),
    ]);
}


}
