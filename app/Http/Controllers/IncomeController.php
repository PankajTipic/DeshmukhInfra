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

class IncomeController extends Controller
{
    /**
     * GET all incomes with enhanced filtering and invoice_no search
     */
    public function index(Request $request)
    {
        $perPage   = $request->get('per_page', 10);
        $projectId = $request->get('project_id');
        $invoiceNo = $request->get('invoice_no'); // Add invoice number filtering

        $query = Income::with('project:id,project_name')
            ->orderBy('created_at', 'desc');

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        // Add invoice number filtering for payment log functionality
        if ($invoiceNo) {
            $query->where('invoice_no', $invoiceNo);
        }

        $incomes = $query->paginate($perPage);

        // Add project_name to each record without changing structure
        $incomes->getCollection()->transform(function ($income) {
            $income->project_name = $income->project?->project_name ?? null;
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

    /**
     * UPDATE - Enhanced with better order synchronization and payment_date handling
     */
    // public function update(Request $request, $id)
    // {
    //     return DB::transaction(function () use ($request, $id) {
    //         $income = Income::findOrFail($id);

    //         $validated = $request->validate([
    //             'project_id'      => 'sometimes|integer',
    //             'order_id'        => 'sometimes|nullable|integer',
    //             'po_no'           => 'sometimes|string',
    //             'po_date'         => 'sometimes|date',
    //             'invoice_no'      => 'sometimes|string',
    //             'invoice_date'    => 'sometimes|date',
    //             'basic_amount'    => 'sometimes|numeric',
    //             'gst_amount'      => 'sometimes|numeric',
    //             'billing_amount'  => 'sometimes|numeric',
    //             'received_amount' => 'sometimes|numeric',
    //             'received_by'     => 'sometimes|string',
    //             'senders_bank'    => 'sometimes|string',
    //             'payment_type'    => 'sometimes|in:imps,rtgs,upi,cash,cheque',
    //             'receivers_bank'  => 'sometimes|string',
    //             'pending_amount'  => 'sometimes|numeric',
    //             'remark'          => 'nullable|string',
    //             'payment_date'    => 'sometimes|nullable|date',
    //         ]);

    //         // Store old values for summary update
    //         $oldBillingAmount = $income->billing_amount;
    //         $oldPendingAmount = $income->pending_amount;
    //         $oldReceivedAmount = $income->received_amount;
    //         $oldPaymentDate = $income->payment_date ?? Carbon::parse($income->created_at)->toDateString();
    //         $newPaymentDate = $validated['payment_date'] ?? $oldPaymentDate;

    //         // If payment_date changed, we need to update summaries on both dates
    //         $paymentDateChanged = ($oldPaymentDate !== $newPaymentDate);

    //         // Remove from old date summary
    //         $oldSummary = IncomeSummary::where('company_id', $income->company_id)
    //             ->where('project_id', $income->project_id)
    //             ->whereDate('date', $oldPaymentDate)
    //             ->first();

    //         if ($oldSummary) {
    //             $oldSummary->total_amount -= $oldBillingAmount;
    //             $oldSummary->pending_amount -= $oldPendingAmount;
    //             if ($paymentDateChanged) {
    //                 $oldSummary->decrement('invoice_count');
    //             }
                
    //             // Delete the summary if it's empty after update
    //             if ($oldSummary->invoice_count <= 0 && $oldSummary->total_amount <= 0) {
    //                 $oldSummary->delete();
    //             } else {
    //                 $oldSummary->save();
    //             }
    //         }

    //         // Update the income record
    //         $income->update($validated);

    //         // Add to new date summary (or same date if not changed)
    //         if ($paymentDateChanged) {
    //             // Only update new summary if date actually changed
    //             $newSummary = IncomeSummary::where('company_id', $income->company_id)
    //                 ->where('project_id', $income->project_id)
    //                 ->whereDate('date', $newPaymentDate)
    //                 ->first();

    //             if ($newSummary) {
    //                 $newSummary->total_amount += $income->billing_amount;
    //                 $newSummary->pending_amount += $income->pending_amount;
    //                 $newSummary->increment('invoice_count');
    //                 $newSummary->save();
    //             } else {
    //                 // Create new summary for the new date
    //                 IncomeSummary::create([
    //                     'company_id'     => $income->company_id,
    //                     'project_id'     => $income->project_id,
    //                     'date'           => $newPaymentDate,
    //                     'total_amount'   => $income->billing_amount,
    //                     'pending_amount' => $income->pending_amount,
    //                     'invoice_count'  => 1
    //                 ]);
    //             }
    //         } else {
    //             // Date didn't change, just update amounts on the same date
    //             if ($oldSummary) {
    //                 $oldSummary->total_amount += $income->billing_amount;
    //                 $oldSummary->pending_amount += $income->pending_amount;
    //                 $oldSummary->save();
    //             }
    //         }

    //         // If this income is linked to an order and received_amount changed, sync with order
    //         if ($income->order_id && isset($validated['received_amount'])) {
    //             $newReceivedAmount = $validated['received_amount'];
    //             $receivedAmountDifference = $newReceivedAmount - $oldReceivedAmount;
                
    //             if ($receivedAmountDifference != 0) {
    //                 // Call the order controller to update the order's paid amount
    //                 try {
    //                     $orderController = new \App\Http\Controllers\OrderController();
    //                     $orderUpdateRequest = new Request([
    //                         'paidAmount' => $newReceivedAmount,
    //                         'incomeId' => $income->id,
    //                         'oldAmount' => $oldReceivedAmount
    //                     ]);
                        
    //                     $orderController->updatePaymentDetails($orderUpdateRequest, $income->order_id);
    //                 } catch (\Exception $e) {
    //                     // Log error but don't fail the income update
    //                     \Log::warning("Failed to sync order payment after income update", [
    //                         'income_id' => $income->id,
    //                         'order_id' => $income->order_id,
    //                         'error' => $e->getMessage()
    //                     ]);
    //                 }
    //             }
    //         }

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Income updated successfully',
    //             'data'    => $income
    //         ], 200);
    //     });
    // }







// public function update(Request $request, $id)
// {
//     return DB::transaction(function () use ($request, $id) {

//         $income = Income::findOrFail($id);

//         $validated = $request->validate([
//             'project_id'      => 'sometimes|integer',
//             'order_id'        => 'sometimes|nullable|integer',
//             'po_no'           => 'sometimes|string',
//             'po_date'         => 'sometimes|date',
//             'invoice_no'      => 'sometimes|string',
//             'invoice_date'    => 'sometimes|date',
//             'basic_amount'    => 'sometimes|numeric',
//             'gst_amount'      => 'sometimes|numeric',
//             'billing_amount'  => 'sometimes|numeric',
//             'received_amount' => 'sometimes|numeric',
//             'received_by'     => 'sometimes|string',
//             'senders_bank'    => 'sometimes|string',
//             'payment_type'    => 'sometimes|in:imps,rtgs,upi,cash,cheque',
//             'receivers_bank'  => 'sometimes|string',
//             'pending_amount'  => 'sometimes|numeric',
//             'remark'          => 'nullable|string',
//             'payment_date'    => 'sometimes|nullable|date',
//         ]);

//         // ------------------------------------
//         // OLD DATE (before update)
//         // ------------------------------------
//         $oldDate = $income->payment_date
//             ? Carbon::parse($income->payment_date)->toDateString()
//             : Carbon::parse($income->created_at)->toDateString();

//         // ------------------------------------
//         // UPDATE MAIN INCOME ROW
//         // ------------------------------------
//         $income->update($validated);

//         // ------------------------------------
//         // NEW DATE (after update)
//         // ------------------------------------
//         $newDate = $income->payment_date
//             ? Carbon::parse($income->payment_date)->toDateString()
//             : Carbon::today()->toDateString();

//         // ------------------------------------
//         // REBUILD SUMMARY (OLD + NEW DATE)
//         // Single unified logic
//         // ------------------------------------
//         foreach ([$oldDate, $newDate] as $date) {

//             // Delete old summary
//             IncomeSummary::where('company_id', $income->company_id)
//                 ->where('project_id', $income->project_id)
//                 ->whereDate('date', $date)
//                 ->delete();

//             // Recalculate totals
//             $data = Income::where('company_id', $income->company_id)
//                 ->where('project_id', $income->project_id)
//                 ->whereDate('payment_date', $date)
//                 ->selectRaw('
//                     SUM(received_amount) as total_received,
//                     SUM(pending_amount) as total_pending,
//                     COUNT(*) as total_invoices
//                 ')
//                 ->first();

//             if ($data && $data->total_invoices > 0) {
//                 IncomeSummary::create([
//                     'company_id'     => $income->company_id,
//                     'project_id'     => $income->project_id,
//                     'date'           => $date,
//                     'total_amount'   => $data->total_received,
//                     'pending_amount' => $data->total_pending,
//                     'invoice_count'  => $data->total_invoices
//                 ]);
//             }
//         }

//         // ------------------------------------
//         // PROFORMA INVOICE UPDATE
//         // ------------------------------------
//         if ($income->proforma_invoice_id) {

//             $proforma = ProformaInvoice::find($income->proforma_invoice_id);

//             if ($proforma) {

//                 $totalReceived = Income::where('proforma_invoice_id', $income->proforma_invoice_id)
//                     ->sum('received_amount');

//                 $proforma->paid_amount     = $totalReceived;
//                 $proforma->pending_amount  = $proforma->final_amount - $totalReceived;

//                 if ($proforma->pending_amount <= 0) {
//                     $proforma->payment_status = "paid";
//                 } elseif ($proforma->paid_amount > 0) {
//                     $proforma->payment_status = "partial";
//                 } else {
//                     $proforma->payment_status = "pending";
//                 }

//                 $proforma->save();
//             }
//         }

//         return response()->json([
//             'success' => true,
//             'message' => 'Income updated successfully',
//             'data'    => $income
//         ], 200);
//     });
// }







// public function update(Request $request, $id)
// {
//     return DB::transaction(function () use ($request, $id) {

//         $income = Income::findOrFail($id);

//         $validated = $request->validate([
//             'project_id'      => 'sometimes|integer',
//             'order_id'        => 'sometimes|nullable|integer',
//             'po_no'           => 'sometimes|string',
//             'po_date'         => 'sometimes|date',
//             'invoice_no'      => 'sometimes|string',
//             'invoice_date'    => 'sometimes|date',
//             'basic_amount'    => 'sometimes|numeric',
//             'gst_amount'      => 'sometimes|numeric',

//             // ❗ YOU TOLD: DO NOT USE billing_amount — so we keep it but never use it
//             'billing_amount'  => 'sometimes|numeric',

//             // ✔ ALWAYS use received_amount
//             'received_amount' => 'sometimes|numeric',

//             'received_by'     => 'sometimes|string',
//             'senders_bank'    => 'sometimes|string',
//             'payment_type'    => 'sometimes|in:imps,rtgs,upi,cash,cheque',
//             'receivers_bank'  => 'sometimes|string',
//             'pending_amount'  => 'sometimes|numeric',
//             'remark'          => 'nullable|string',
//             'payment_date'    => 'sometimes|nullable|date',
//         ]);

//         // ------------------------------
//         // OLD DATE
//         // ------------------------------
//         $oldDate = $income->payment_date
//             ? Carbon::parse($income->payment_date)->toDateString()
//             : Carbon::parse($income->created_at)->toDateString();

//         // ------------------------------
//         // UPDATE INCOME TABLE
//         // ------------------------------
//         $income->update($validated);

//         // ------------------------------
//         // NEW DATE
//         // ------------------------------
//         $newDate = $income->payment_date
//             ? Carbon::parse($income->payment_date)->toDateString()
//             : Carbon::today()->toDateString();

//         // ------------------------------
//         // REBUILD SUMMARY FOR OLD + NEW DATE
//         // ------------------------------
//         foreach ([$oldDate, $newDate] as $date) {

//             IncomeSummary::where('company_id', $income->company_id)
//                 ->where('project_id', $income->project_id)
//                 ->whereDate('date', $date)
//                 ->delete();

//             $data = Income::where('company_id', $income->company_id)
//                 ->where('project_id', $income->project_id)
//                 ->whereDate('payment_date', $date)
//                 ->selectRaw('
//                     SUM(received_amount) as total_received,
//                     SUM(pending_amount) as total_pending,
//                     COUNT(*) as total_invoices
//                 ')
//                 ->first();

//             if ($data && $data->total_invoices > 0) {
//                 IncomeSummary::create([
//                     'company_id'     => $income->company_id,
//                     'project_id'     => $income->project_id,
//                     'date'           => $date,
//                     'total_amount'   => $data->total_received, // ✔ RECEIVED ONLY
//                     'pending_amount' => $data->total_pending,
//                     'invoice_count'  => $data->total_invoices
//                 ]);
//             }
//         }

//         // ------------------------------
//         // UPDATE ORDER TABLE
//         // ------------------------------
//         if ($income->order_id) {

//             $order = Order::find($income->order_id);

//             if ($order) {

//                 // ✔ Calculate total paid using ONLY received_amount
//                 $totalPaid = Income::where('order_id', $income->order_id)
//                     ->sum('received_amount');

//                 $order->paidAmount = $totalPaid;

//                 // ✔ Apply correct orderStatus logic (payment-based)
//                 if ($totalPaid >= $order->finalAmount) {
//                     $order->orderStatus = 1; // fully paid
//                 } elseif ($totalPaid > 0) {
//                     $order->orderStatus = 2; // partial paid
//                 } else {
//                     $order->orderStatus = 3; // pending
//                 }

//                 $order->save();
//             }
//         }

//         // ------------------------------
//         // UPDATE PROFORMA INVOICE
//         // ------------------------------
//         if ($income->proforma_invoice_id) {

//             $proforma = ProformaInvoice::find($income->proforma_invoice_id);

//             if ($proforma) {

//                 $totalReceived = Income::where('proforma_invoice_id', $income->proforma_invoice_id)
//                     ->sum('received_amount');

//                 $proforma->paid_amount     = $totalReceived;
//                 $proforma->pending_amount  = $proforma->final_amount - $totalReceived;

//                 if ($proforma->pending_amount <= 0) {
//                     $proforma->payment_status = "paid";
//                 } elseif ($proforma->paid_amount > 0) {
//                     $proforma->payment_status = "partial";
//                 } else {
//                     $proforma->payment_status = "pending";
//                 }

//                 $proforma->save();
//             }
//         }

//         return response()->json([
//             'success' => true,
//             'message' => 'Income updated successfully',
//             'data'    => $income
//         ], 200);
//     });
// }




// public function update(Request $request, $id)
// {
//     return DB::transaction(function () use ($request, $id) {

//         $income = Income::findOrFail($id);

//         // Validate
//         $validated = $request->validate([
//             'project_id'      => 'sometimes|integer',
//             'order_id'        => 'sometimes|nullable|integer',
//             'po_no'           => 'sometimes|string',
//             'po_date'         => 'sometimes|date',
//             'invoice_no'      => 'sometimes|string',
//             'invoice_date'    => 'sometimes|date',
//             'basic_amount'    => 'sometimes|numeric',
//             'gst_amount'      => 'sometimes|numeric',
//             'billing_amount'  => 'sometimes|numeric',
//             'received_amount' => 'sometimes|numeric',
//             'received_by'     => 'sometimes|string',
//             'senders_bank'    => 'sometimes|string',
//             'payment_type'    => 'sometimes|in:imps,rtgs,upi,cash,cheque',
//             'receivers_bank'  => 'sometimes|string',
//             'pending_amount'  => 'sometimes|numeric',
//             'remark'          => 'nullable|string',
//             'payment_date'    => 'sometimes|nullable|date',
//         ]);

//         $validated['company_id'] = $income->company_id;

//         // OLD values before update
//         $old_project_id = $income->project_id;
//         $old_company_id = $income->company_id;

//         $old_date = $income->payment_date
//             ? Carbon::parse($income->payment_date)->toDateString()
//             : Carbon::parse($income->created_at)->toDateString();

//         // Update income
//         $income->update($validated);

//         // NEW values after update
//         $new_project_id = $income->project_id;
//         $new_company_id = $income->company_id;

//         $new_date = $income->payment_date
//             ? Carbon::parse($income->payment_date)->toDateString()
//             : Carbon::today()->toDateString();

//         /*
//         |--------------------------------------------------------------------------
//         | UPDATE OLD SUMMARY
//         |--------------------------------------------------------------------------
//         */
//         $old_total = Income::where('company_id', $old_company_id)
//             ->where('project_id', $old_project_id)
//             ->whereDate('payment_date', $old_date)
//             ->sum('received_amount');

//         if ($old_total > 0) {
//             IncomeSummary::updateOrCreate(
//                 [
//                     'company_id' => $old_company_id,
//                     'project_id' => $old_project_id,
//                     'date'       => $old_date
//                 ],
//                 [
//                     'total_amount' => $old_total
//                 ]
//             );
//         } else {
//             IncomeSummary::where('company_id', $old_company_id)
//                 ->where('project_id', $old_project_id)
//                 ->whereDate('date', $old_date)
//                 ->delete();
//         }

//         /*
//         |--------------------------------------------------------------------------
//         | UPDATE NEW SUMMARY
//         |--------------------------------------------------------------------------
//         */
//         $new_total = Income::where('company_id', $new_company_id)
//             ->where('project_id', $new_project_id)
//             ->whereDate('payment_date', $new_date)
//             ->sum('received_amount');

//         IncomeSummary::updateOrCreate(
//             [
//                 'company_id' => $new_company_id,
//                 'project_id' => $new_project_id,
//                 'date'       => $new_date
//             ],
//             [
//                 'total_amount' => $new_total
//             ]
//         );

//         return response()->json([
//             'success' => true,
//             'message' => 'Income updated successfully',
//             'data' => $income
//         ]);
//     });
// }
public function update(Request $request, $id)
{
    return DB::transaction(function () use ($request, $id) {

        $income = Income::findOrFail($id);

        // Validate fields
        $validated = $request->validate([
            'project_id'      => 'sometimes|integer',
            'order_id'        => 'sometimes|nullable|integer',
            'po_no'           => 'sometimes|string',
            'po_date'         => 'sometimes|date',
            'invoice_no'      => 'sometimes|string',
            'invoice_date'    => 'sometimes|date',
            'basic_amount'    => 'sometimes|numeric',
            'gst_amount'      => 'sometimes|numeric',
            'billing_amount'  => 'sometimes|numeric',
            'received_amount' => 'sometimes|numeric',
            'received_by'     => 'sometimes|string',
            'senders_bank'    => 'sometimes|string',
            'payment_type'    => 'sometimes|in:imps,rtgs,upi,cash,cheque',
            'receivers_bank'  => 'sometimes|string',
            'pending_amount'  => 'sometimes|numeric',
            'remark'          => 'nullable|string',
            'payment_date'    => 'sometimes|nullable|date',
        ]);

        $validated['company_id'] = $income->company_id;

        // ---------------- OLD VALUES ----------------
        $old_company = $income->company_id;
        $old_project = $income->project_id;

        $old_date = $income->payment_date
            ? Carbon::parse($income->payment_date)->toDateString()
            : Carbon::parse($income->created_at)->toDateString();

        // Update income
        $income->update($validated);

        // ---------------- NEW VALUES ----------------
        $new_company = $income->company_id;
        $new_project = $income->project_id;

        $new_date = $income->payment_date
            ? Carbon::parse($income->payment_date)->toDateString()
            : Carbon::today()->toDateString();

        /*
        |--------------------------------------------------------------------------
        | PERFECT FIX: ALWAYS REBUILD SUMMARY FOR OLD + NEW DATE
        |--------------------------------------------------------------------------
        */

        $rebuildTargets = [
            [$old_company, $old_project, $old_date],
            [$new_company, $new_project, $new_date],
        ];

        foreach ($rebuildTargets as [$companyId, $projectId, $date]) {

            // Remove old summary for this date/project/company
            IncomeSummary::where('company_id', $companyId)
                ->where('project_id', $projectId)
                ->whereDate('date', $date)
                ->delete();

            // Get fresh totals
            $totals = Income::where('company_id', $companyId)
                ->where('project_id', $projectId)
                ->whereDate('payment_date', $date)
                ->selectRaw('
                    SUM(received_amount) as total_received,
                    SUM(pending_amount) as total_pending,
                    COUNT(*) as total_invoices
                ')
                ->first();

            // Only insert if data exists
            if ($totals && $totals->total_invoices > 0) {
                IncomeSummary::create([
                    'company_id'     => $companyId,
                    'project_id'     => $projectId,
                    'date'           => $date,
                    'total_amount'   => $totals->total_received,  // RECEIVED ONLY
                    'pending_amount' => $totals->total_pending,
                    'invoice_count'  => $totals->total_invoices,
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | UPDATE ORDER TABLE
        |--------------------------------------------------------------------------
        */
        if ($income->order_id) {

            $order = Order::find($income->order_id);

            if ($order) {

                $totalPaid = Income::where('order_id', $income->order_id)
                    ->sum('received_amount');

                $order->paidAmount = $totalPaid;

                if ($totalPaid >= $order->finalAmount) {
                    $order->orderStatus = 1;  // Fully Paid
                } elseif ($totalPaid > 0) {
                    $order->orderStatus = 2;  // Partial Paid
                } else {
                    $order->orderStatus = 3;  // Pending
                }

                $order->save();
            }
        }

        /*
        |--------------------------------------------------------------------------
        | UPDATE PROFORMA INVOICE
        |--------------------------------------------------------------------------
        */
        if ($income->proforma_invoice_id) {

            $proforma = ProformaInvoice::find($income->proforma_invoice_id);

            if ($proforma) {

                $totalReceived = Income::where('proforma_invoice_id', $income->proforma_invoice_id)
                    ->sum('received_amount');

                $proforma->paid_amount    = $totalReceived;
                $proforma->pending_amount = $proforma->final_amount - $totalReceived;

                if ($proforma->pending_amount <= 0) {
                    $proforma->payment_status = "paid";
                } elseif ($proforma->paid_amount > 0) {
                    $proforma->payment_status = "partial";
                } else {
                    $proforma->payment_status = "pending";
                }

                $proforma->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Income updated successfully',
            'data' => $income
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

    public function incomeSummaryReport(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $perPage = $request->query('perPage', 30);
        $cursor = $request->query('cursor');
        $projectId = $request->query('projectId');

        if (!$startDate || !$endDate) {
            return response()->json(['error' => 'Start and End date are required.'], 400);
        }

        $user = Auth::user();
        $companyId = $user->company_id;

        try {
            // Overall summary from income_summary
            $summaryQuery = DB::table('income_summary')
                ->where('company_id', $companyId)
                ->whereBetween('date', [$startDate, $endDate]);

            if ($projectId) {
                $summaryQuery->where('project_id', $projectId);
            }

            $summary = $summaryQuery->selectRaw('
                SUM(total_amount) as totalIncomeAmount,
                SUM(invoice_count) as totalInvoices
            ')->first();

            // Cursor-based paginated daily summary
            $query = DB::table('income_summary')
                ->leftJoin('projects', 'income_summary.project_id', '=', 'projects.id')
                ->where('income_summary.company_id', $companyId)
                ->whereBetween('income_summary.date', [$startDate, $endDate]);

            if ($projectId) {
                $query->where('income_summary.project_id', $projectId);
            }

            $query->select(
                'income_summary.date',
                'income_summary.total_amount as totalIncomeAmount',
                'income_summary.invoice_count as invoiceCount',
                'projects.project_name as project_name'
            )->orderBy('income_summary.date', 'desc');

            $incomes = $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor);

            return response()->json([
                'incomes' => $incomes->items(),
                'next_cursor' => $incomes->nextCursor()?->encode(),
                'has_more_pages' => $incomes->hasMorePages(),
                'summary' => [
                    'totalIncomeAmount' => $summary->totalIncomeAmount ?? 0,
                    'totalInvoices' => $summary->totalInvoices ?? 0,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Income report generation failed: ' . $e->getMessage()], 500);
        }
    }

    public function getMonthlyIncomeSummaries(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $year = $request->query('year', date('Y'));

        try {
            // Get monthly income summary data
            $monthlyIncome = DB::table('income_summary')
                ->where('company_id', $companyId)
                ->whereYear('date', $year)
                ->selectRaw('MONTH(`date`) as month, SUM(total_amount) as total')
                ->groupBy(DB::raw('MONTH(`date`)'))
                ->get()
                ->keyBy('month');

            // Get monthly expense data
            $monthlyExpenses = DB::table('expense_summaries')
                ->where('company_id', $companyId)
                ->whereYear('expense_date', $year)
                ->selectRaw('MONTH(expense_date) as month, SUM(total_expense) as total')
                ->groupBy(DB::raw('MONTH(expense_date)'))
                ->get()
                ->keyBy('month');

            // Initialize arrays for 12 months
            $incomeData = array_fill(0, 12, 0);
            $expenseData = array_fill(0, 12, 0);
            $PLdata = array_fill(0, 12, 0);

            // Fill income data
            foreach ($monthlyIncome as $month => $data) {
                $incomeData[$month - 1] = floatval($data->total);
            }

            // Fill expense data
            foreach ($monthlyExpenses as $month => $data) {
                $expenseData[$month - 1] = floatval($data->total);
            }

            // Calculate P&L
            for ($i = 0; $i < 12; $i++) {
                $PLdata[$i] = $incomeData[$i] - $expenseData[$i];
            }

            $result = [
                'success' => true,
                'year' => $year,
                'monthlySales' => $incomeData,
                'monthlyExpense' => $expenseData,
                'monthlyPandL' => $PLdata,
                'totals' => [
                    'totalSales' => array_sum($incomeData),
                    'totalExpenses' => array_sum($expenseData),
                    'totalPL' => array_sum($PLdata),
                ]
            ];

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Monthly income summary report failed: ' . $e->getMessage()], 500);
        }
    }
}