<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Operator;
use App\Models\Project;
use App\Models\CompanyInfo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of purchase orders with filters and summary.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $vendorId  = $request->query('vendor_id');
        $projectId = $request->query('project_id');
        $status    = $request->query('status');
        $fromDate  = $request->query('from_date');
        $toDate    = $request->query('to_date');
        $search    = $request->query('search');
        $perPage   = (int) $request->query('per_page', 15);

        $query = PurchaseOrder::with([
            'vendor:id,name,mobile,gst_no',
            'project:id,project_name',
            'creator:id,name',
            'items'
        ])
        ->where('company_id', $companyId);

        if (!empty($vendorId)) {
            $query->where('vendor_id', $vendorId);
        }

        if (!empty($projectId)) {
            $query->where('project_id', $projectId);
        }

        if (!empty($status)) {
            $query->where('status', $status);
        }

        if (!empty($fromDate) && !empty($toDate)) {
            $query->whereBetween('po_date', [$fromDate, $toDate]);
        } elseif (!empty($fromDate)) {
            $query->whereDate('po_date', '>=', $fromDate);
        } elseif (!empty($toDate)) {
            $query->whereDate('po_date', '<=', $toDate);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'LIKE', "%{$search}%")
                  ->orWhere('reference_no', 'LIKE', "%{$search}%")
                  ->orWhereHas('vendor', function ($vq) use ($search) {
                      $vq->where('name', 'LIKE', "%{$search}%")
                         ->orWhere('gst_no', 'LIKE', "%{$search}%");
                  })
                  ->orWhereHas('project', function ($pq) use ($search) {
                      $pq->where('project_name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Summary stats across this company (or filtered)
        $summaryQuery = clone $query;
        $totalPOs     = $summaryQuery->count();
        $totalAmount  = (float) $summaryQuery->sum('final_amount');

        $orders = $query->orderBy('po_date', 'desc')
                        ->orderBy('id', 'desc')
                        ->paginate($perPage);

        return response()->json([
            'success'      => true,
            'data'         => $orders->items(),
            'current_page' => $orders->currentPage(),
            'last_page'    => $orders->lastPage(),
            'total'        => $orders->total(),
            'per_page'     => $orders->perPage(),
            'summary'      => [
                'total_pos'    => $totalPOs,
                'total_amount' => $totalAmount,
            ]
        ], 200);
    }

    /**
     * Generate the next sequential PO number.
     */
    public function getNextPoNumber(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $year = date('Y');
        // Count POs created in current year for this company
        $count = PurchaseOrder::where('company_id', $companyId)
                              ->whereYear('po_date', $year)
                              ->count() + 1;

        $poNumber = sprintf('PO-%s-%04d', $year, $count);

        // Make sure it is unique
        while (PurchaseOrder::where('company_id', $companyId)->where('po_number', $poNumber)->exists()) {
            $count++;
            $poNumber = sprintf('PO-%s-%04d', $year, $count);
        }

        return response()->json([
            'success'   => true,
            'po_number' => $poNumber
        ]);
    }

    /**
     * Store a newly created purchase order with its items.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $request->validate([
            'vendor_id'  => 'required|exists:operators,id',
            'po_date'    => 'required|date',
            'items'      => 'required|array|min:1',
            'items.*.item_name' => 'required|string',
            'items.*.qty'       => 'required|numeric|min:0.01',
            'items.*.rate'      => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $poNumber = $request->po_number;
            if (empty($poNumber)) {
                $year = date('Y', strtotime($request->po_date));
                $count = PurchaseOrder::where('company_id', $companyId)->whereYear('po_date', $year)->count() + 1;
                $poNumber = sprintf('PO-%s-%04d', $year, $count);
            }

            $taxType = $request->tax_type ?: 'intra_state'; // intra_state or inter_state

            $subtotal      = 0;
            $cgstTotal     = 0;
            $sgstTotal     = 0;
            $igstTotal     = 0;
            $discount      = (float) ($request->discount ?? 0);

            // Process items first to calculate accurate totals
            $preparedItems = [];
            foreach ($request->items as $index => $itemData) {
                $qty        = (float) ($itemData['qty'] ?? 1);
                $rate       = (float) ($itemData['rate'] ?? 0);
                $taxable    = round($qty * $rate, 2);
                $gstPercent = (float) ($itemData['gst_percent'] ?? 0);

                $cgst = 0;
                $sgst = 0;
                $igst = 0;

                if ($gstPercent > 0) {
                    if ($taxType === 'inter_state') {
                        $igst = round(($taxable * $gstPercent) / 100, 2);
                    } else {
                        $halfRate = $gstPercent / 2;
                        $cgst = round(($taxable * $halfRate) / 100, 2);
                        $sgst = round(($taxable * $halfRate) / 100, 2);
                    }
                }

                $totalItemAmount = $taxable + $cgst + $sgst + $igst;

                $subtotal  += $taxable;
                $cgstTotal += $cgst;
                $sgstTotal += $sgst;
                $igstTotal += $igst;

                $preparedItems[] = [
                    'item_name'      => $itemData['item_name'],
                    'description'    => $itemData['description'] ?? null,
                    'hsn_code'       => $itemData['hsn_code'] ?? null,
                    'uom'            => $itemData['uom'] ?? 'Nos',
                    'qty'            => $qty,
                    'rate'           => $rate,
                    'taxable_amount' => $taxable,
                    'gst_percent'    => $gstPercent,
                    'cgst_amount'    => $cgst,
                    'sgst_amount'    => $sgst,
                    'igst_amount'    => $igst,
                    'total_amount'   => $totalItemAmount,
                    'remark'         => $itemData['remark'] ?? null,
                    'sort_order'     => $index,
                ];
            }

            $taxableAmount = max(0, $subtotal - $discount);
            $totalTax      = $cgstTotal + $sgstTotal + $igstTotal;
            $rawFinal      = $taxableAmount + $totalTax;
            $roundOff      = (float) ($request->round_off ?? (round($rawFinal) - $rawFinal));
            $finalAmount   = round($rawFinal + $roundOff, 2);

            $purchaseOrder = PurchaseOrder::create([
                'company_id'           => $companyId,
                'project_id'           => $request->project_id ?: null,
                'vendor_id'            => $request->vendor_id,
                'po_number'            => $poNumber,
                'po_date'              => $request->po_date,
                'delivery_date'        => $request->delivery_date ?: null,
                'reference_no'         => $request->reference_no ?: null,
                'tax_type'             => $taxType,
                'subtotal'             => $subtotal,
                'discount'             => $discount,
                'taxable_amount'       => $taxableAmount,
                'cgst_amount'          => $cgstTotal,
                'sgst_amount'          => $sgstTotal,
                'igst_amount'          => $igstTotal,
                'total_tax'            => $totalTax,
                'round_off'            => $roundOff,
                'final_amount'         => $finalAmount,
                'status'               => $request->status ?: 'Issued',
                'payment_terms'        => $request->payment_terms ?: null,
                'delivery_terms'       => $request->delivery_terms ?: null,
                'terms_and_conditions' => $request->terms_and_conditions ?: null,
                'notes'                => $request->notes ?: null,
                'created_by'           => $user->id,
                'updated_by'           => $user->id,
            ]);

            foreach ($preparedItems as $item) {
                $item['purchase_order_id'] = $purchaseOrder->id;
                PurchaseOrderItem::create($item);
            }

            DB::commit();

            $loaded = PurchaseOrder::with(['vendor', 'project', 'items', 'creator'])->find($purchaseOrder->id);

            return response()->json([
                'success' => true,
                'message' => 'Purchase Order created successfully',
                'data'    => $loaded
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create Purchase Order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified purchase order with full details and company info.
     */
    public function show($id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $order = PurchaseOrder::with([
            'vendor',
            'project.supervisor:id,name,mobile,email',
            'items',
            'creator:id,name,email,mobile'
        ])
        ->where('company_id', $companyId)
        ->findOrFail($id);

        $company = CompanyInfo::where('company_id', $companyId)->first();

        return response()->json([
            'success' => true,
            'data'    => $order,
            'company' => $company
        ], 200);
    }

    /**
     * Update the specified purchase order.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $order = PurchaseOrder::where('company_id', $companyId)->findOrFail($id);

        $request->validate([
            'vendor_id'  => 'required|exists:operators,id',
            'po_date'    => 'required|date',
            'items'      => 'required|array|min:1',
            'items.*.item_name' => 'required|string',
            'items.*.qty'       => 'required|numeric|min:0.01',
            'items.*.rate'      => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $taxType = $request->tax_type ?: ($order->tax_type ?: 'intra_state');

            $subtotal  = 0;
            $cgstTotal = 0;
            $sgstTotal = 0;
            $igstTotal = 0;
            $discount  = (float) ($request->discount ?? 0);

            $preparedItems = [];
            foreach ($request->items as $index => $itemData) {
                $qty        = (float) ($itemData['qty'] ?? 1);
                $rate       = (float) ($itemData['rate'] ?? 0);
                $taxable    = round($qty * $rate, 2);
                $gstPercent = (float) ($itemData['gst_percent'] ?? 0);

                $cgst = 0;
                $sgst = 0;
                $igst = 0;

                if ($gstPercent > 0) {
                    if ($taxType === 'inter_state') {
                        $igst = round(($taxable * $gstPercent) / 100, 2);
                    } else {
                        $halfRate = $gstPercent / 2;
                        $cgst = round(($taxable * $halfRate) / 100, 2);
                        $sgst = round(($taxable * $halfRate) / 100, 2);
                    }
                }

                $totalItemAmount = $taxable + $cgst + $sgst + $igst;

                $subtotal  += $taxable;
                $cgstTotal += $cgst;
                $sgstTotal += $sgst;
                $igstTotal += $igst;

                $preparedItems[] = [
                    'purchase_order_id' => $order->id,
                    'item_name'         => $itemData['item_name'],
                    'description'       => $itemData['description'] ?? null,
                    'hsn_code'          => $itemData['hsn_code'] ?? null,
                    'uom'               => $itemData['uom'] ?? 'Nos',
                    'qty'               => $qty,
                    'rate'              => $rate,
                    'taxable_amount'    => $taxable,
                    'gst_percent'       => $gstPercent,
                    'cgst_amount'       => $cgst,
                    'sgst_amount'       => $sgst,
                    'igst_amount'       => $igst,
                    'total_amount'      => $totalItemAmount,
                    'remark'            => $itemData['remark'] ?? null,
                    'sort_order'        => $index,
                ];
            }

            $taxableAmount = max(0, $subtotal - $discount);
            $totalTax      = $cgstTotal + $sgstTotal + $igstTotal;
            $rawFinal      = $taxableAmount + $totalTax;
            $roundOff      = (float) ($request->round_off ?? (round($rawFinal) - $rawFinal));
            $finalAmount   = round($rawFinal + $roundOff, 2);

            $order->update([
                'project_id'           => $request->project_id ?: null,
                'vendor_id'            => $request->vendor_id,
                'po_number'            => $request->po_number ?: $order->po_number,
                'po_date'              => $request->po_date,
                'delivery_date'        => $request->delivery_date ?: null,
                'reference_no'         => $request->reference_no ?: null,
                'tax_type'             => $taxType,
                'subtotal'             => $subtotal,
                'discount'             => $discount,
                'taxable_amount'       => $taxableAmount,
                'cgst_amount'          => $cgstTotal,
                'sgst_amount'          => $sgstTotal,
                'igst_amount'          => $igstTotal,
                'total_tax'            => $totalTax,
                'round_off'            => $roundOff,
                'final_amount'         => $finalAmount,
                'status'               => $request->status ?: $order->status,
                'payment_terms'        => $request->payment_terms ?: null,
                'delivery_terms'       => $request->delivery_terms ?: null,
                'terms_and_conditions' => $request->terms_and_conditions ?: null,
                'notes'                => $request->notes ?: null,
                'updated_by'           => $user->id,
            ]);

            // Replace items cleanly
            PurchaseOrderItem::where('purchase_order_id', $order->id)->delete();
            foreach ($preparedItems as $item) {
                PurchaseOrderItem::create($item);
            }

            DB::commit();

            $loaded = PurchaseOrder::with(['vendor', 'project', 'items', 'creator'])->find($order->id);

            return response()->json([
                'success' => true,
                'message' => 'Purchase Order updated successfully',
                'data'    => $loaded
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update Purchase Order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the status of a purchase order and record a note in history.
     */
    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $order = PurchaseOrder::where('company_id', $companyId)->findOrFail($id);

        $request->validate([
            'status' => 'required|string|in:Draft,Issued,Partially Received,Completed,Cancelled',
            'note'   => 'nullable|string|max:2000',
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->status;

        $existingNotes = $order->notes ? trim($order->notes) . "\n\n" : '';
        $timestamp = now()->format('d M Y, h:i A');
        $userName = $user->name ?? 'User';

        $noteText = trim($request->note ?? '');
        $statusLog = "[{$timestamp} - {$userName}] Status changed from '{$oldStatus}' to '{$newStatus}'";
        if ($noteText !== '') {
            $statusLog .= "\nNote: " . $noteText;
        }

        $order->status = $newStatus;
        $order->notes = $existingNotes . $statusLog;
        $order->updated_by = $user->id;
        $order->save();

        $loaded = PurchaseOrder::with([
            'vendor',
            'project.supervisor:id,name,mobile,email',
            'items',
            'creator:id,name,email,mobile'
        ])->find($order->id);

        return response()->json([
            'success' => true,
            'message' => "Status updated to '{$newStatus}' successfully",
            'data'    => $loaded
        ], 200);
    }

    /**
     * Remove the specified purchase order.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $order = PurchaseOrder::where('company_id', $companyId)->findOrFail($id);

        try {
            $order->delete();
            return response()->json([
                'success' => true,
                'message' => 'Purchase Order deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete Purchase Order: ' . $e->getMessage()
            ], 500);
        }
    }
}
