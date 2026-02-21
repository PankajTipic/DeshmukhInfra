<?php

namespace App\Http\Controllers;

use App\Models\Income;
use App\Models\IncomeSummary;
use App\Models\ExpenseSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Models\ProformaInvoice; 
use App\Models\Order;
use App\Models\ProformaInvoiceDetail;
use App\Models\AdvancedPayment;

class IncomeController extends Controller
{
    /**
     * GET all incomes with enhanced filtering and invoice_no search
     */
    public function index(Request $request)
    {
        $perPage   = $request->get('per_page', 10);
        $projectId = $request->get('project_id');
        $projectTypeId = $request->get('project_type_id');
        $invoiceNo = $request->get('invoice_no'); // Add invoice number filtering

        $query = Income::with(['project.projectType'])
            ->orderBy('created_at', 'desc');

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        if ($projectTypeId) {
        $query->whereHas('project', function($q) use ($projectTypeId) {
            $q->where('project_type_id', $projectTypeId);
        });
    }

        // Add invoice number filtering for payment log functionality
        if ($invoiceNo) {
            $query->where('invoice_no', $invoiceNo);
        }

        $incomes = $query->paginate($perPage);

        // Add project_name to each record without changing structure
        $incomes->getCollection()->transform(function ($income) {
            $income->project_name = $income->project?->project_name ?? null;
            $income->project_type = $income->project?->projectType?->name ?? null;
            unset($income->project);
            return $income;
        });

        // Summary totals (not paginated)
        $summaryQuery = \App\Models\IncomeSummary::query();

        if ($projectId) {
            $summaryQuery->where('project_id', $projectId);
        }

        $totalAmount = $summaryQuery->sum('total_amount');
        $pendingAmount = $summaryQuery->sum('pending_amount');

        return response()->json([
            'incomes' => $incomes,
            'summary' => [
                'total_amount' => $totalAmount,
                'pending_amount' => $pendingAmount,
            ]
        ]);
    }



    /**
     * CREATE - Enhanced to support order_id linking and payment_date
     */
    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $validated = $request->validate([
                'project_id'      => 'required|integer',
                'order_id'        => 'nullable|integer',
                'po_no'           => 'required|string',
                'po_date'         => 'required|date',
                'invoice_no'      => 'required|string',
                'invoice_date'    => 'required|date',
                'basic_amount'    => 'required|numeric',
                'gst_amount'      => 'required|numeric',
                'billing_amount'  => 'required|numeric',
                'received_amount' => 'required|numeric',
                'received_by'     => 'required|string',
                'senders_bank'    => 'required|string',
                'payment_type'    => 'required|in:imps,rtgs,upi,cash,cheque',
                'receivers_bank'  => 'required|string',
                'pending_amount'  => 'required|numeric',
                'remark'          => 'nullable|string',
                'payment_date'    => 'nullable|date',
            ]);

            $validated['company_id'] = auth()->user()->company_id;

            $income = Income::create($validated);
           

            // Update income summary based on payment_date or created_at
            $summaryDate = $validated['payment_date'] ?? Carbon::today()->toDateString();

            $summary = IncomeSummary::where('company_id', $validated['company_id'])
              
                ->where('project_id', $validated['project_id'])
                ->whereDate('date', $summaryDate)
                ->first();

            if ($summary) {
                $summary->increment('invoice_count');
                $summary->total_amount += $validated['billing_amount'];
                $summary->pending_amount += $validated['pending_amount'];
               

                $summary->save();
            } else {
                IncomeSummary::create([
                    'company_id'     => $validated['company_id'],
                    'project_id'     => $validated['project_id'],
                 
                    'date'           => $summaryDate,
                    'total_amount'   => $validated['billing_amount'],
                    'pending_amount' => $validated['pending_amount'],
                    'invoice_count'  => 1
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Income stored successfully',
                'data'    => $income,
              
                'id'      => $income->id
            ], 201);
        });
    }

   






public function update(Request $request, $id)
{
    return DB::transaction(function () use ($request, $id) {

        $income = Income::findOrFail($id);

        $isLinkedToProforma = (bool) $income->proforma_invoice_id;
        $isLinkedToOrder    = (bool) $income->order_id;

        // Removed: no longer block decreasing received_amount
        // You can still add other protections if needed (e.g. only admin can decrease, or log changes)

        // ── Validation ────────────────────────────────────────────────────────────────
        $validated = $request->validate([
            'project_id'          => 'sometimes|integer|exists:projects,id',
            'order_id'            => 'sometimes|nullable|integer|exists:orders,id',
            'proforma_invoice_id' => 'sometimes|nullable|integer|exists:proforma_invoices,id',
            'po_no'               => 'sometimes|string|max:100',
            'po_date'             => 'sometimes|nullable|date',
            'invoice_no'          => 'sometimes|string|max:100',
            'invoice_date'        => 'sometimes|nullable|date',
            'received_amount'     => 'sometimes|numeric|min:0',
            'received_by'         => 'sometimes|string|max:255',
            'senders_bank'        => 'sometimes|string|max:255',
            'receivers_bank'      => 'sometimes|string|max:255',
            'payment_type'        => 'sometimes|in:imps,rtgs,upi,cash,cheque',
            'remark'              => 'nullable|string|max:1000',
            'payment_date'        => 'sometimes|nullable|date',
        ]);

        $validated['company_id'] = $income->company_id; // immutable



        // ────────────────────────────────────────────────
// ✅ PAYMENT EDIT LIMIT VALIDATION (VERY IMPORTANT)
// ────────────────────────────────────────────────
if ($income->proforma_invoice_id && isset($validated['received_amount'])) {

    $proforma = ProformaInvoice::find($income->proforma_invoice_id);

    if (!$proforma) {
        throw new \Exception("Proforma invoice not found");
    }

    $proformaTotal = (float) $proforma->final_amount;

    // Sum of all OTHER payments (excluding this one being edited)
    $otherPaymentsTotal = Income::where('proforma_invoice_id', $income->proforma_invoice_id)
        ->where('id', '!=', $income->id)
        ->sum('received_amount');

    // Maximum allowed amount for this edit
    $maxAllowed = $proformaTotal - $otherPaymentsTotal;

    $newAmount = (float) $validated['received_amount'];

    if ($newAmount > $maxAllowed) {
        throw new \Exception(
            "Maximum allowed amount is {$maxAllowed}. Other payments already received: {$otherPaymentsTotal}"
        );
    }

    if ($newAmount < 0) {
        throw new \Exception("Received amount cannot be negative");
    }
}




        // ── Remember old values for summary rebuild ───────────────────────────────────
        $oldPaymentDate = $income->payment_date
            ? Carbon::parse($income->payment_date)->startOfDay()->toDateString()
            : Carbon::parse($income->created_at)->startOfDay()->toDateString();

        $old = [
            'company_id' => $income->company_id,
            'project_id' => $income->project_id,
            'date'       => $oldPaymentDate,
            'received'   => $income->received_amount,
            'gst'        => $income->gst_amount ?? 0,
        ];

        // ── If linked to proforma → always recalculate GST split proportionally ───────
        $proformaId = $validated['proforma_invoice_id'] ?? $income->proforma_invoice_id;

        if ($isLinkedToProforma && $proformaId) {
            $proforma = ProformaInvoice::find($proformaId);
            if (!$proforma) {
                throw new \Exception("Proforma invoice not found");
            }

            $details = ProformaInvoiceDetail::where('proforma_invoice_id', $proforma->id)->get();
            if ($details->isEmpty()) {
                throw new \Exception("Proforma details not found");
            }

            $totalCgst    = round($details->sum('cgst_amount'), 2);
            $totalSgst    = round($details->sum('sgst_amount'), 2);
            $totalGst     = round($totalCgst + $totalSgst, 2);
            $invoiceTotal = round($proforma->final_amount, 2);

            if ($invoiceTotal <= 0) {
                throw new \Exception("Invalid proforma total");
            }

            // Use new received amount if provided, otherwise keep old
            $received = isset($validated['received_amount'])
                ? round($validated['received_amount'], 2)
                : $income->received_amount;

            // If received_amount becomes 0 or very small → ratio becomes small → GST becomes small
            $ratio = $invoiceTotal > 0 ? $received / $invoiceTotal : 0;

            $validated['basic_amount']    = round($received - ($totalGst * $ratio), 2);
            $validated['gst_amount']      = round($totalGst * $ratio, 2);
            $validated['cgst_amount']     = round($totalCgst * $ratio, 2);
            $validated['sgst_amount']     = round($totalSgst * $ratio, 2);
            $validated['igst_amount']     = 0;
            $validated['billing_amount']  = $received;
            $validated['received_amount'] = $received;
            $validated['pending_amount']  = 0;
        }

        // ── Perform update ────────────────────────────────────────────────────────────
        $income->update($validated);

        // ── New values for summary rebuild ────────────────────────────────────────────
        $newPaymentDate = $income->payment_date
            ? Carbon::parse($income->payment_date)->startOfDay()->toDateString()
            : Carbon::today()->startOfDay()->toDateString();

        $new = [
            'company_id' => $income->company_id,
            'project_id' => $income->project_id,
            'date'       => $newPaymentDate,
            'received'   => $income->received_amount,
            'gst'        => $income->gst_amount ?? 0,
        ];

        // ── Rebuild IncomeSummary for affected dates ──────────────────────────────────
        $datesToRebuild = array_unique([
            [$old['company_id'], $old['project_id'], $old['date']],
            [$new['company_id'], $new['project_id'], $new['date']],
        ], SORT_REGULAR);

        foreach ($datesToRebuild as [$companyId, $projectId, $date]) {
            IncomeSummary::where('company_id', $companyId)
                ->where('project_id', $projectId)
                ->whereDate('date', $date)
                ->delete();

            $totals = Income::where('company_id', $companyId)
                ->where('project_id', $projectId)
                ->whereDate('payment_date', $date)
                ->selectRaw('
                    SUM(received_amount) AS total_received,
                    SUM(pending_amount)  AS total_pending,
                    SUM(gst_amount)      AS total_gst,
                    COUNT(*)             AS invoice_count
                ')
                ->first();

            if ($totals && $totals->invoice_count > 0) {
                IncomeSummary::create([
                    'company_id'     => $companyId,
                    'project_id'     => $projectId,
                    'date'           => $date,
                    'total_amount'   => round($totals->total_received ?? 0, 2),
                    'pending_amount' => round($totals->total_pending ?? 0, 2),
                    'tax_amount'     => round($totals->total_gst ?? 0, 2),
                    'invoice_count'  => (int) $totals->invoice_count,
                ]);
            }
        }

        // ── Refresh linked Proforma totals ────────────────────────────────────────────
        if ($income->proforma_invoice_id) {
            $proforma = ProformaInvoice::find($income->proforma_invoice_id);
            if ($proforma) {
                $totalReceived = Income::where('proforma_invoice_id', $income->proforma_invoice_id)
                    ->sum('received_amount');

                $proforma->paid_amount    = round($totalReceived, 2);
                $proforma->pending_amount = round(max(0, $proforma->final_amount - $totalReceived), 2);

                $proforma->payment_status = match (true) {
                    $proforma->pending_amount <= 0 => 'paid',
                    $proforma->paid_amount > 0     => 'partial',
                    default                        => 'pending',
                };

                $proforma->save();
            }
        }

        // ── Refresh linked Order totals ───────────────────────────────────────────────
        if ($income->order_id) {
            $order = Order::find($income->order_id);
            if ($order) {
                $totalPaid = Income::where('order_id', $income->order_id)
                    ->sum('received_amount');

                $order->paidAmount = round($totalPaid, 2);

                $order->orderStatus = match (true) {
                    $totalPaid >= ($order->finalAmount ?? 0) => 1, // fully paid
                    $totalPaid > 0                           => 2, // partial
                    default                                  => 3, // pending
                };

                $order->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Income record updated successfully',
            'data'    => $income->fresh()->load(['order', 'proformaInvoice'])
        ]);
    });
}











































    /**
     * DELETE - Enhanced with better cleanup
     */
    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $income = Income::findOrFail($id);

            $summaryDate = $income->payment_date ?? Carbon::parse($income->created_at)->toDateString();

            // Update income summary
            $summary = IncomeSummary::where('company_id', $income->company_id)
                ->where('project_id', $income->project_id)
                ->whereDate('date', $summaryDate)
                ->first();

            if ($summary) {
                $summary->total_amount -= $income->billing_amount;
                $summary->pending_amount -= $income->pending_amount;
                $summary->decrement('invoice_count');
                
                // Delete the summary if it's empty after deletion
                if ($summary->invoice_count <= 0 && $summary->total_amount <= 0) {
                    $summary->delete();
                } else {
                    $summary->save();
                }
            }

            // If linked to an order, update the order's paid amount
            if ($income->order_id) {
                try {
                    $orderController = new \App\Http\Controllers\OrderController();
                    $orderUpdateRequest = new Request([
                        'paidAmount' => 0, // Remove this payment
                        'incomeId' => $income->id,
                        'oldAmount' => $income->received_amount
                    ]);
                    
                    $orderController->updatePaymentDetails($orderUpdateRequest, $income->order_id);
                } catch (\Exception $e) {
                    \Log::warning("Failed to sync order payment after income deletion", [
                        'income_id' => $income->id,
                        'order_id' => $income->order_id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $income->delete();

            return response()->json([
                'success' => true,
                'message' => 'Income deleted successfully'
            ], 200);
        });
    }

    // public function incomeSummaryReport(Request $request)
    // {
    //     $startDate = $request->query('startDate');
    //     $endDate = $request->query('endDate');
    //     $perPage = $request->query('perPage', 30);
    //     $cursor = $request->query('cursor');
    //     $projectId = $request->query('projectId');
    //     $projectTypeId = $request->query('project_type_id');

    //     if (!$startDate || !$endDate) {
    //         return response()->json(['error' => 'Start and End date are required.'], 400);
    //     }

    //     $user = Auth::user();
    //     $companyId = $user->company_id;

    //     try {
    //         // Overall summary from income_summary
    //         $summaryQuery = DB::table('income_summary')
    //             ->where('income_summary.company_id', $companyId)
    //             ->whereBetween('income_summary.date', [$startDate, $endDate]);

    //         if ($projectId) {
    //             $summaryQuery->where('income_summary.project_id', $projectId);
    //         }

    //         if ($projectTypeId) {
    //             $summaryQuery->leftJoin('projects', 'income_summary.project_id', '=', 'projects.id')
    //                 ->where('projects.project_type_id', $projectTypeId);
    //         }

    //         $summary = $summaryQuery->selectRaw('
    //             SUM(income_summary.total_amount) as totalIncomeAmount,
    //             SUM(income_summary.invoice_count) as totalInvoices
    //         ')->first();

    //         // Cursor-based paginated daily summary
    //         $query = DB::table('income_summary')
    //             ->leftJoin('projects', 'income_summary.project_id', '=', 'projects.id')
    //             ->leftJoin('project_types', 'projects.project_type_id', '=', 'project_types.id')
    //             ->where('income_summary.company_id', $companyId)
    //             ->whereBetween('income_summary.date', [$startDate, $endDate]);

    //         if ($projectId) {
    //             $query->where('income_summary.project_id', $projectId);
    //         }

    //         if ($projectTypeId) {
    //             $query->where('projects.project_type_id', $projectTypeId);
    //         }

    //         $query->select(
    //             'income_summary.date',
    //             'income_summary.total_amount as totalIncomeAmount',
    //             'income_summary.invoice_count as invoiceCount',
    //             'projects.project_name as project_name',
    //             'project_types.name as project_type'
    //         )->orderBy('income_summary.date', 'desc');

    //         $incomes = $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor);

    //         return response()->json([
    //             'incomes' => $incomes->items(),
    //             'next_cursor' => $incomes->nextCursor()?->encode(),
    //             'has_more_pages' => $incomes->hasMorePages(),
    //             'summary' => [
    //                 'totalIncomeAmount' => $summary->totalIncomeAmount ?? 0,
    //                 'totalInvoices' => $summary->totalInvoices ?? 0,
    //             ]
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Income report generation failed: ' . $e->getMessage()], 500);
    //     }
    // }

    
// public function incomeSummaryReport(Request $request)
// {
//     $startDate     = $request->query('startDate');
//     $endDate       = $request->query('endDate');
//     $perPage       = $request->query('perPage', 30);
//     $cursor        = $request->query('cursor');
//     $projectId     = $request->query('projectId');
//     $projectTypeId = $request->query('project_type_id');

//     if (!$startDate || !$endDate) {
//         return response()->json(['error' => 'Start and End date are required.'], 400);
//     }

//     $user      = Auth::user();
//     $companyId = $user->company_id;

//     try {
//         // ────────────────────────────────────────────────
//         // Overall summary (with tax)
//         // ────────────────────────────────────────────────
//         $summaryQuery = DB::table('income_summary')
//             ->where('income_summary.company_id', $companyId)
//             ->whereBetween('income_summary.date', [$startDate, $endDate]);

//         if ($projectId) {
//             $summaryQuery->where('income_summary.project_id', $projectId);
//         }

//         if ($projectTypeId) {
//             $summaryQuery->leftJoin('projects', 'income_summary.project_id', '=', 'projects.id')
//                          ->where('projects.project_type_id', $projectTypeId);
//         }

//         $summary = $summaryQuery->selectRaw('
//             SUM(total_amount)   as totalIncomeAmount,
//             SUM(tax_amount)     as totalTaxAmount,
//             SUM(invoice_count)  as totalInvoices
//         ')->first();

//         // ────────────────────────────────────────────────
//         // Daily / per-date summary (paginated with cursor)
//         // ────────────────────────────────────────────────
//         $query = DB::table('income_summary')
//             ->leftJoin('projects', 'income_summary.project_id', '=', 'projects.id')
//             ->leftJoin('project_types', 'projects.project_type_id', '=', 'project_types.id')
//             ->where('income_summary.company_id', $companyId)
//             ->whereBetween('income_summary.date', [$startDate, $endDate]);

//         if ($projectId) {
//             $query->where('income_summary.project_id', $projectId);
//         }

//         if ($projectTypeId) {
//             $query->where('projects.project_type_id', $projectTypeId);
//         }

//         $query->select(
//             'income_summary.date',
//             'income_summary.total_amount as totalIncomeAmount',
//             'income_summary.tax_amount   as taxAmount',           // ← added
//             'income_summary.invoice_count as invoiceCount',
//             'projects.project_name as project_name',
//             'project_types.name as project_type'
//         )
//         ->orderBy('income_summary.date', 'desc');

//         $incomes = $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor);

//         // Format response
//         return response()->json([
//             'incomes' => $incomes->items(),
//             'next_cursor' => $incomes->nextCursor()?->encode(),
//             'has_more_pages' => $incomes->hasMorePages(),
//             'summary' => [
//                 'totalIncomeAmount' => $summary->totalIncomeAmount ?? 0,
//                 'totalTaxAmount'    => $summary->totalTaxAmount ?? 0,     // ← added
//                 'totalInvoices'     => $summary->totalInvoices ?? 0,
//             ]
//         ]);
//     } catch (\Exception $e) {
//         return response()->json([
//             'error' => 'Income report generation failed: ' . $e->getMessage()
//         ], 500);
//     }
// }


public function incomeSummaryReport(Request $request)
{
    $startDate     = $request->query('startDate');
    $endDate       = $request->query('endDate');
    $perPage       = $request->query('perPage', 30);
    $cursor        = $request->query('cursor');
    $projectId     = $request->query('projectId');
    $projectTypeId = $request->query('project_type_id');

    if (!$startDate || !$endDate) {
        return response()->json(['error' => 'Start and End date are required.'], 400);
    }

    $user      = Auth::user();
    $companyId = $user->company_id;

    try {
        // ────────────────────────────────────────────────
        // 1. Overall summary (with tax)
        // ────────────────────────────────────────────────
        $summaryQuery = DB::table('income_summary', 'inc')
            ->where('inc.company_id', $companyId)
            ->whereBetween('inc.date', [$startDate, $endDate]);

        if ($projectId) {
            $summaryQuery->where('inc.project_id', $projectId);
        }

        if ($projectTypeId) {
            $summaryQuery->leftJoin('projects as p', 'inc.project_id', '=', 'p.id')
                         ->where('p.project_type_id', $projectTypeId);
        }

        $summary = $summaryQuery->selectRaw('
            SUM(inc.total_amount)   as totalIncomeAmount,
            SUM(inc.tax_amount)     as totalTaxAmount,
            SUM(inc.invoice_count)  as totalInvoices
        ')->first();

        // ────────────────────────────────────────────────
        // 2. Detailed daily records (paginated with cursor)
        // ────────────────────────────────────────────────
        $query = DB::table('income_summary', 'inc')
            ->leftJoin('projects as p', 'inc.project_id', '=', 'p.id')
            ->leftJoin('project_types as pt', 'p.project_type_id', '=', 'pt.id')
            ->where('inc.company_id', $companyId)
            ->whereBetween('inc.date', [$startDate, $endDate]);

        if ($projectId) {
            $query->where('inc.project_id', $projectId);
        }

        if ($projectTypeId) {
            $query->where('p.project_type_id', $projectTypeId);
        }

        $query->select(
            'inc.date',
            'inc.total_amount       as totalIncomeAmount',
            'inc.tax_amount         as taxAmount',             // ← now included
            'inc.invoice_count      as invoiceCount',
            'p.project_name',
            'pt.name                as project_type_name'
        )
        ->orderBy('inc.date', 'desc');

        $incomes = $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor);

        // ────────────────────────────────────────────────
        // 3. Format response (consistent naming with your chart function)
        // ────────────────────────────────────────────────
        return response()->json([
            'success'         => true,
            'range'           => [$startDate, $endDate],
            'projectId'       => $projectId ? (int)$projectId : null,
            'project_type_id' => $projectTypeId ? (int)$projectTypeId : null,

            'incomes'         => $incomes->items(),
            'next_cursor'     => $incomes->nextCursor()?->encode(),
            'has_more_pages'  => $incomes->hasMorePages(),

            'summary'         => [
                'totalIncomeAmount' => round($summary->totalIncomeAmount ?? 0, 2),
                'totalTaxAmount'    => round($summary->totalTaxAmount    ?? 0, 2),
                'totalInvoices'     => (int) ($summary->totalInvoices    ?? 0),
            ],

            // Optional: grand totals in the same style as your chart endpoint
            'totals' => [
                'totalSales'    => round($summary->totalIncomeAmount ?? 0, 2),
                'totalTax'      => round($summary->totalTaxAmount    ?? 0, 2),
                'totalPL'       => null, // not available here (no expense data)
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error'   => 'Income report generation failed: ' . $e->getMessage()
        ], 500);
    }
}










// public function getMonthlyIncomeSummaries(Request $request)
// {
//     $user = Auth::user();
//     $companyId = $user->company_id;

//     $filter     = $request->query('filter', 'yearly');
//     $year       = $request->query('year', date('Y'));
//     $quarter    = $request->query('quarter');
//     $startDate  = $request->query('startDate');
//     $endDate    = $request->query('endDate');

//     /* ===============================
//        DATE RANGE LOGIC
//     ================================*/
//   switch ($filter) {

//     case 'weekly':
//         // expect: year, week (1–53)
//         $week = $request->query('week', now()->week);
//         $startDate = Carbon::now()->setISODate($year, $week)->startOfWeek();
//         $endDate   = Carbon::now()->setISODate($year, $week)->endOfWeek();
//         break;

//     case 'monthly':
//         // expect: year, month (1–12)
//         $month = $request->query('month', now()->month);
//         $startDate = Carbon::create($year, $month, 1)->startOfMonth();
//         $endDate   = Carbon::create($year, $month, 1)->endOfMonth();
//         break;

//     case 'quarterly':
//         // expect: year, quarter (1–4)
//         $quarter = $request->query('quarter', ceil(now()->month / 3));
//         $startMonth = (($quarter - 1) * 3) + 1;
//         $startDate  = Carbon::create($year, $startMonth, 1)->startOfMonth();
//         $endDate    = Carbon::create($year, $startMonth, 1)->addMonths(2)->endOfMonth();
//         break;

//     case 'custom':
//         if (!$startDate || !$endDate) {
//             return response()->json([
//                 'success' => false,
//                 'error' => 'startDate and endDate are required'
//             ], 400);
//         }
//         $startDate = Carbon::parse($startDate)->startOfDay();
//         $endDate   = Carbon::parse($endDate)->endOfDay();
//         break;

//     default: // yearly
//         $startDate = Carbon::create($year, 1, 1)->startOfYear();
//         $endDate   = Carbon::create($year, 12, 31)->endOfYear();
//         break;
// }
//     try {

//         /* ===============================
//            BASE QUERIES
//         ================================*/
//         $incomeQuery = DB::table('income_summary')
//             ->where('company_id', $companyId)
//             ->whereBetween('date', [$startDate, $endDate]);

//         $expenseQuery = DB::table('expense_summaries')
//             ->where('company_id', $companyId)
//             ->whereBetween('expense_date', [$startDate, $endDate]);

//         /* ===============================
//            YEARLY → MONTH WISE
//         ================================*/
//         if ($filter === 'yearly') {

//             $monthlyIncome = $incomeQuery
//                 ->selectRaw('MONTH(date) as label, SUM(total_amount) as sales, SUM(tax_amount) as tax')
//                 ->groupBy('label')
//                 ->get()
//                 ->keyBy('label');

//             $monthlyExpenses = $expenseQuery
//                 ->selectRaw('MONTH(expense_date) as label, SUM(total_expense) as expense')
//                 ->groupBy('label')
//                 ->get()
//                 ->keyBy('label');

//             $labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

//             $incomeData = $taxData = $expenseData = $PLdata = array_fill(0, 12, 0);

//             for ($i = 1; $i <= 12; $i++) {
//                 $sales   = $monthlyIncome[$i]->sales ?? 0;
//                 $tax     = $monthlyIncome[$i]->tax ?? 0;
//                 $expense = $monthlyExpenses[$i]->expense ?? 0;

//                 $incomeData[$i-1]  = (float) $sales;
//                 $taxData[$i-1]     = (float) $tax;
//                 $expenseData[$i-1] = (float) $expense;
//                 $PLdata[$i-1]      = round($sales - $expense - $tax, 2);
//             }

//         } else {

//             /* ===============================
//                WEEKLY / MONTHLY / QUARTERLY / CUSTOM
//                → DATE WISE
//             ================================*/
//             $incomeRows = $incomeQuery
//                 ->selectRaw('DATE(date) as label, SUM(total_amount) as sales, SUM(tax_amount) as tax')
//                 ->groupBy('label')
//                 ->orderBy('label')
//                 ->get();

//             $expenseRows = $expenseQuery
//                 ->selectRaw('DATE(expense_date) as label, SUM(total_expense) as expense')
//                 ->groupBy('label')
//                 ->get()
//                 ->keyBy('label');

//             $labels = $incomeData = $taxData = $expenseData = $PLdata = [];

//             foreach ($incomeRows as $row) {
//                 $expense = $expenseRows[$row->label]->expense ?? 0;

//                 $labels[]       = $row->label;
//                 $incomeData[]   = (float) $row->sales;
//                 $taxData[]      = (float) $row->tax;
//                 $expenseData[]  = (float) $expense;
//                 $PLdata[]       = round($row->sales - $expense - $row->tax, 2);
//             }
//         }

//         /* ===============================
//            RESPONSE
//         ================================*/
//         return response()->json([
//             'success' => true,
//             'filter'  => $filter,
//             'range'   => [$startDate, $endDate],
//             'labels'  => $labels,

//             'monthlySales'   => $incomeData,
//             'monthlyTax'     => $taxData,
//             'monthlyExpense' => $expenseData,
//             'monthlyPandL'   => $PLdata,

//             'totals' => [
//                 'totalSales'    => round(array_sum($incomeData), 2),
//                 'totalTax'      => round(array_sum($taxData), 2),
//                 'totalExpenses' => round(array_sum($expenseData), 2),
//                 'totalPL'       => round(array_sum($PLdata), 2),
//             ]
//         ]);

//     } catch (\Exception $e) {
//         return response()->json([
//             'success' => false,
//             'error' => $e->getMessage()
//         ], 500);
//     }
// }





public function getMonthlyIncomeSummaries(Request $request)
{
    $user = Auth::user();
    $companyId = $user->company_id;

    // Required parameters
    $startDate = $request->query('startDate');
    $endDate   = $request->query('endDate');

    // Optional filters
    $projectId     = $request->query('projectId');
    $projectTypeId = $request->query('project_type_id');

    // Validate required dates
    if (!$startDate || !$endDate) {
        return response()->json([
            'success' => false,
            'error'   => 'startDate and endDate are required.'
        ], 400);
    }

    try {
        // Parse dates safely
        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->endOfDay();

        // ── INCOME QUERY ──
        $incomeQuery = DB::table('income_summary', 'inc')
            ->where('inc.company_id', $companyId)
            ->whereBetween('inc.date', [$start, $end]);

        if ($projectId) {
            $incomeQuery->where('inc.project_id', $projectId);
        }

        if ($projectTypeId) {
            $incomeQuery->leftJoin('projects as proj_inc', 'inc.project_id', '=', 'proj_inc.id')
                        ->where('proj_inc.project_type_id', $projectTypeId);
        }

        // ── EXPENSE QUERY ──
        $expenseQuery = DB::table('expense_summaries', 'exp')
            ->where('exp.company_id', $companyId)
            ->whereBetween('exp.expense_date', [$start, $end]);

        if ($projectId) {
            $expenseQuery->where('exp.project_id', $projectId); // remove if table doesn't have project_id
        }

        if ($projectTypeId) {
            $expenseQuery->leftJoin('projects as proj_exp', 'exp.project_id', '=', 'proj_exp.id')
                         ->where('proj_exp.project_type_id', $projectTypeId);
        }

        // ── Decide grouping: monthly if range ≤ 1 year, daily otherwise ──
        $daysInRange = $start->diffInDays($end) + 1;
        $useMonthlyGrouping = ($daysInRange <= 366); // roughly 1 year or less

        if ($useMonthlyGrouping) {
            // Group by month (Jan–Dec style)
            $monthlyIncome = $incomeQuery
                ->selectRaw('MONTH(inc.date) as month_num, SUM(inc.total_amount) as sales, SUM(inc.tax_amount) as tax')
                ->groupBy('month_num')
                ->get()
                ->keyBy('month_num');

            $monthlyExpenses = $expenseQuery
                ->selectRaw('MONTH(exp.expense_date) as month_num, SUM(exp.total_expense) as expense')
                ->groupBy('month_num')
                ->get()
                ->keyBy('month_num');

            $labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            $incomeData = $taxData = $expenseData = $PLdata = array_fill(0, 12, 0.0);

            for ($i = 1; $i <= 12; $i++) {
                $sales   = $monthlyIncome[$i]->sales   ?? 0;
                $tax     = $monthlyIncome[$i]->tax     ?? 0;
                $expense = $monthlyExpenses[$i]->expense ?? 0;

                $incomeData[$i-1]  = (float) $sales;
                $taxData[$i-1]     = (float) $tax;
                $expenseData[$i-1] = (float) $expense;
                $PLdata[$i-1]      = round($sales - $expense - $tax, 2);
            }
        } else {
            // Group by day (date-wise)
            $incomeRows = $incomeQuery
                ->selectRaw('DATE(inc.date) as label, SUM(inc.total_amount) as sales, SUM(inc.tax_amount) as tax')
                ->groupBy('label')
                ->orderBy('label')
                ->get();

            $expenseRows = $expenseQuery
                ->selectRaw('DATE(exp.expense_date) as label, SUM(exp.total_expense) as expense')
                ->groupBy('label')
                ->get()
                ->keyBy('label');

            $labels = $incomeData = $taxData = $expenseData = $PLdata = [];

            foreach ($incomeRows as $row) {
                $expense = $expenseRows[$row->label]->expense ?? 0;

                $labels[]       = $row->label;
                $incomeData[]   = (float) $row->sales;
                $taxData[]      = (float) $row->tax;
                $expenseData[]  = (float) $expense;
                $PLdata[]       = round($row->sales - $expense - $row->tax, 2);
            }
        }

        // ── RESPONSE ──
        return response()->json([
            'success'         => true,
            'range'           => [$start->toDateString(), $end->toDateString()],
            'projectId'       => $projectId ? (int)$projectId : null,
            'project_type_id' => $projectTypeId ? (int)$projectTypeId : null,

            'labels'          => $labels,
            'monthlySales'    => $incomeData,
            'monthlyTax'      => $taxData,
            'monthlyExpense'  => $expenseData,
            'monthlyPandL'    => $PLdata,

            'totals' => [
                'totalSales'    => round(array_sum($incomeData), 2),
                'totalTax'      => round(array_sum($taxData), 2),
                'totalExpenses' => round(array_sum($expenseData), 2),
                'totalPL'       => round(array_sum($PLdata), 2),
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error'   => 'Report generation failed: ' . $e->getMessage()
        ], 500);
    }
}






}