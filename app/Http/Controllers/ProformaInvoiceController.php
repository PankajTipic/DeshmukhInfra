<?php

namespace App\Http\Controllers;

use App\Models\ProformaInvoice;
use App\Models\ProformaInvoiceDetail;
use App\Models\ProformaInvoiceRule;
use App\Models\Order;
use App\Models\Project;
use App\Models\CompanyInfo;
use App\Models\Income;
use App\Models\IncomeSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ProformaInvoiceController extends Controller
{
    /**
     * Get all proforma invoices with filtering
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        
        $workOrderId = $request->query('work_order_id');
        $projectId = $request->query('project_id');
        $paymentStatus = $request->query('payment_status');
        $perPage = $request->query('per_page', 25);

        try {
            $query = ProformaInvoice::with([
                'workOrder:id,invoice_number,project_id',
                'project',
                'details',
                'invoiceRules.rule',
                'incomes'
            ])
            ->where('company_id', $companyId)
            ->orderBy('created_at', 'desc');

            if ($workOrderId) {
                $query->where('work_order_id', $workOrderId);
            }

            if ($projectId) {
                $query->where('project_id', $projectId);
            }

            if ($paymentStatus) {
                $query->where('payment_status', $paymentStatus);
            }

            $proformaInvoices = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $proformaInvoices
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch proforma invoices',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show single proforma invoice
     */
    public function show($id)
    {
        try {
            $proformaInvoice = ProformaInvoice::with([
                'workOrder',
                'project',
                'details',
                'invoiceRules.rule',
                'incomes'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $proformaInvoice
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Proforma invoice not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    // /**
    //  * Create proforma invoice from work order
    //  */
    // public function store(Request $request)
    // {
    //     $user = Auth::user();

    //     $validated = $request->validate([
    //         'work_order_id' => 'required|exists:orders,id',
    //         'project_id' => 'required|exists:projects,id',
    //         'tally_invoice_number' => 'nullable|string|max:255',
    //         'invoice_date' => 'required|date',
    //         'delivery_date' => 'nullable|date',
    //         'items' => 'required|array|min:1',
    //         'items.*.work_type' => 'required|string',
    //         'items.*.qty' => 'required|numeric|min:0',
    //         'items.*.price' => 'required|numeric|min:0',
    //         'items.*.total_price' => 'required|numeric|min:0',
    //         'items.*.remark' => 'nullable|string',
    //         'discount' => 'nullable|numeric|min:0',
    //         'gst_percentage' => 'required|numeric|min:0|max:100',
    //         'cgst_percentage' => 'required|numeric|min:0|max:50',
    //         'sgst_percentage' => 'required|numeric|min:0|max:50',
    //         'igst_percentage' => 'required|numeric|min:0|max:100',
    //         'rule_ids' => 'nullable|array',
    //         'rule_ids.*' => 'exists:rules,id',
    //         'notes' => 'nullable|string',
    //     ]);

    //     DB::beginTransaction();

    //     try {
    //         // Verify project exists and belongs to work order
    //         $project = Project::findOrFail($validated['project_id']);
    //         $workOrder = Order::findOrFail($validated['work_order_id']);
            
    //         if ($workOrder->project_id !== $project->id) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Project does not belong to the specified work order'
    //             ], 400);
    //         }

    //         // Generate proforma invoice number WITHOUT counter
    //         $company = CompanyInfo::findOrFail($user->company_id);
    //         $lastProforma = ProformaInvoice::where('company_id', $user->company_id)
    //             ->orderBy('id', 'desc')
    //             ->first();

    //         $nextNumber = $lastProforma ? ($lastProforma->id + 1) : 1;
    //         $proformaNumber = $company->initials . '-PI-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

    //         // Calculate amounts
    //         $subtotal = collect($validated['items'])->sum('total_price');
    //         $discount = $validated['discount'] ?? 0;
    //         $taxableAmount = $subtotal - $discount;
            
    //         $cgstAmount = $taxableAmount * ($validated['cgst_percentage'] / 100);
    //         $sgstAmount = $taxableAmount * ($validated['sgst_percentage'] / 100);
    //         $igstAmount = $taxableAmount * ($validated['igst_percentage'] / 100);
    //         $gstAmount = $cgstAmount + $sgstAmount + $igstAmount;
            
    //         $finalAmount = $taxableAmount + $gstAmount;

    //         // Create proforma invoice (without customer_id)
    //         $proformaInvoice = ProformaInvoice::create([
    //             'work_order_id' => $validated['work_order_id'],
    //             'project_id' => $validated['project_id'],
    //             'company_id' => $user->company_id,
    //             'proforma_invoice_number' => $proformaNumber,
    //             'tally_invoice_number' => $validated['tally_invoice_number'] ?? null,
    //             'invoice_date' => $validated['invoice_date'],
    //             'delivery_date' => $validated['delivery_date'] ?? null,
    //             'subtotal' => $subtotal,
    //             'discount' => $discount,
    //             'taxable_amount' => $taxableAmount,
    //             'gst_percentage' => $validated['gst_percentage'],
    //             'cgst_percentage' => $validated['cgst_percentage'],
    //             'sgst_percentage' => $validated['sgst_percentage'],
    //             'igst_percentage' => $validated['igst_percentage'],
    //             'gst_amount' => $gstAmount,
    //             'cgst_amount' => $cgstAmount,
    //             'sgst_amount' => $sgstAmount,
    //             'igst_amount' => $igstAmount,
    //             'final_amount' => $finalAmount,
    //             'paid_amount' => 0,
    //             'pending_amount' => $finalAmount,
    //             'payment_status' => 'pending',
    //             'status' => 'draft',
    //             'notes' => $validated['notes'] ?? null,
    //             'created_by' => $user->id,
    //             'updated_by' => $user->id,
    //         ]);

    //         // Create details
    //         foreach ($validated['items'] as $item) {
    //             ProformaInvoiceDetail::create([
    //                 'proforma_invoice_id' => $proformaInvoice->id,
    //                 'work_type' => $item['work_type'],
    //                 'qty' => $item['qty'],
    //                 'price' => $item['price'],
    //                 'total_price' => $item['total_price'],
    //                 'remark' => $item['remark'] ?? null,
    //             ]);
    //         }

    //         // Attach rules
    //         if (!empty($validated['rule_ids'])) {
    //             foreach ($validated['rule_ids'] as $ruleId) {
    //                 ProformaInvoiceRule::create([
    //                     'proforma_invoice_id' => $proformaInvoice->id,
    //                     'rules_id' => $ruleId,
    //                 ]);
    //             }
    //         }

    //         DB::commit();

    //         // Load relationships for response
    //         $proformaInvoice->load(['workOrder', 'project', 'details', 'invoiceRules.rule']);

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Proforma invoice created successfully',
    //             'data' => $proformaInvoice
    //         ], 201);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to create proforma invoice',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }
/**
 * Create proforma invoice from work order
 */
public function store(Request $request)
{
    $user = Auth::user();

    $validated = $request->validate([
        'work_order_id' => 'required|exists:orders,id',
        'project_id' => 'required|exists:projects,id',
        'tally_invoice_number' => 'nullable|string|max:255',
        'invoice_date' => 'required|date',
        'delivery_date' => 'nullable|date',
        'items' => 'required|array|min:1',
        'items.*.work_type' => 'required|string',
        'items.*.qty' => 'required|numeric|min:0',
        'items.*.uom' => 'nullable|string',
        'items.*.price' => 'required|numeric|min:0',
        'items.*.total_price' => 'required|numeric|min:0',
        'items.*.remark' => 'nullable|string',


         'items.*.gst_percent' => 'nullable:numeric|min:0',
'items.*.cgst_amount' => 'nullable:numeric|min:0',
'items.*.sgst_amount' => 'nullable:numeric|min:0',
   


        'discount' => 'nullable|numeric|min:0',
        'gst_percentage' => 'required|numeric|min:0|max:100',
        'cgst_percentage' => 'required|numeric|min:0|max:50',
        'sgst_percentage' => 'required|numeric|min:0|max:50',
        'igst_percentage' => 'required|numeric|min:0|max:100',
        'rule_ids' => 'nullable|array',
        'rule_ids.*' => 'exists:rules,id',
        'notes' => 'nullable|string', 
        'payment_terms' => 'nullable|string', 
        'terms_conditions' => 'nullable|string', 

    ]);

    DB::beginTransaction();

    try {
        // Verify project exists and belongs to work order
        $project = Project::findOrFail($validated['project_id']);
        $workOrder = Order::findOrFail($validated['work_order_id']);
        
        if ($workOrder->project_id !== $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'Project does not belong to the specified work order'
            ], 400);
        }

        // Calculate amounts for new proforma invoice
        $subtotal = collect($validated['items'])->sum('total_price');
        $discount = $validated['discount'] ?? 0;
        $taxableAmount = $subtotal - $discount;
        
        $cgstAmount = $taxableAmount * ($validated['cgst_percentage'] / 100);
        $sgstAmount = $taxableAmount * ($validated['sgst_percentage'] / 100);
        $igstAmount = $taxableAmount * ($validated['igst_percentage'] / 100);
        $gstAmount = $cgstAmount + $sgstAmount + $igstAmount;
        
        $finalAmount = $taxableAmount + $gstAmount;

        // ✅ VALIDATION: Check total proforma invoices amount doesn't exceed work order amount
        $workOrderFinalAmount = $workOrder->finalAmount ?? (
            ($workOrder->totalAmount ?? 0) + 
            ($workOrder->gst ?? 0) + 
            ($workOrder->cgst ?? 0) + 
            ($workOrder->sgst ?? 0) + 
            ($workOrder->igst ?? 0)
        );

        // Get sum of all existing proforma invoices for this work order
        $existingProformaTotal = ProformaInvoice::where('work_order_id', $workOrder->id)
            ->sum('final_amount');

        // Check if new proforma invoice would exceed work order total
        if (($existingProformaTotal + $finalAmount) > $workOrderFinalAmount) {
            $remainingAmount = $workOrderFinalAmount - $existingProformaTotal;
            return response()->json([
                'success' => false,
                'message' => "Proforma invoice amount (₹" . number_format($finalAmount, 2) . ") would exceed work order limit. Work Order Total: ₹" . number_format($workOrderFinalAmount, 2) . ", Already Allocated: ₹" . number_format($existingProformaTotal, 2) . ", Remaining: ₹" . number_format($remainingAmount, 2),
                'data' => [
                    'work_order_total' => $workOrderFinalAmount,
                    'already_allocated' => $existingProformaTotal,
                    'remaining_amount' => $remainingAmount,
                    'requested_amount' => $finalAmount
                ]
            ], 400);
        }

        // Generate proforma invoice number WITHOUT counter
        $company = CompanyInfo::findOrFail($user->company_id);
        $lastProforma = ProformaInvoice::where('company_id', $user->company_id)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastProforma ? ($lastProforma->id + 1) : 1;
        $proformaNumber = $company->initials . '-PI-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        // Create proforma invoice
        $proformaInvoice = ProformaInvoice::create([
            'work_order_id' => $validated['work_order_id'],
            'project_id' => $validated['project_id'],
            'company_id' => $user->company_id,
            'proforma_invoice_number' => $proformaNumber,
            'tally_invoice_number' => $validated['tally_invoice_number'] ?? null,
            'invoice_date' => $validated['invoice_date'],
            'delivery_date' => $validated['delivery_date'] ?? null,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'taxable_amount' => $taxableAmount,
            'gst_percentage' => $validated['gst_percentage'],
            'cgst_percentage' => $validated['cgst_percentage'],
            'sgst_percentage' => $validated['sgst_percentage'],
            'igst_percentage' => $validated['igst_percentage'],
            'gst_amount' => $gstAmount,
            'cgst_amount' => $cgstAmount,
            'sgst_amount' => $sgstAmount,
            'igst_amount' => $igstAmount,
            'final_amount' => $finalAmount,
            'paid_amount' => 0,
            'pending_amount' => $finalAmount,
            'payment_status' => 'pending',
            'status' => 'draft',
            'notes' => $validated['notes'] ?? null,
            'created_by' => $user->id,
            'updated_by' => $user->id,
             'payment_terms' => $validated['payment_terms'] ?? null, 
        'terms_conditions' => $validated['terms_conditions'] ?? null,  
        ]);

        // Create details
        foreach ($validated['items'] as $item) {
            ProformaInvoiceDetail::create([
                'proforma_invoice_id' => $proformaInvoice->id,
                'work_type' => $item['work_type'],
                'uom'   => $item['uom'],
                'qty' => $item['qty'],
                'price' => $item['price'],
                'total_price' => $item['total_price'],
                'remark' => $item['remark'] ?? null,

    'gst_percent' => $item['gst_percent'] ?? null,
'cgst_amount' => $item['cgst_amount'] ?? null,
'sgst_amount' => $item['sgst_amount'] ?? null,
            ]);
        }

        // Attach rules
        if (!empty($validated['rule_ids'])) {
            foreach ($validated['rule_ids'] as $ruleId) {
                ProformaInvoiceRule::create([
                    'proforma_invoice_id' => $proformaInvoice->id,
                    'rules_id' => $ruleId,
                ]);
            }
        }

        DB::commit();

        // Load relationships for response
        $proformaInvoice->load(['workOrder', 'project', 'details', 'invoiceRules.rule']);

        return response()->json([
            'success' => true,
            'message' => 'Proforma invoice created successfully',
            'data' => $proformaInvoice
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Failed to create proforma invoice',
            'error' => $e->getMessage()
        ], 500);
    }
}
    /**
     * Update proforma invoice
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'tally_invoice_number' => 'nullable|string|max:255',
            'invoice_date' => 'sometimes|date',
            'delivery_date' => 'nullable|date',
            'items' =>          'nullable|array',                          // 'sometimes|array|min:1',
            'items.*.work_type' => 'nullable:items|string',
            'items.*.uom' => 'nullable|string',
            'items.*.qty' => 'nullable:items|numeric|min:0',
            'items.*.price' => 'nullable:items|numeric|min:0',
            'items.*.total_price' => 'nullable:items|numeric|min:0',
            'items.*.remark' => 'nullable|string',


             'items.*.gst_percent' => 'nullable:numeric|min:0',
'items.*.cgst_amount' => 'nullable:numeric|min:0',
'items.*.sgst_amount' => 'nullable:numeric|min:0',

            'discount' => 'nullable|numeric|min:0',
            'gst_percentage' => 'sometimes|numeric|min:0|max:100',
            'cgst_percentage' => 'sometimes|numeric|min:0|max:50',
            'sgst_percentage' => 'sometimes|numeric|min:0|max:50',
            'igst_percentage' => 'sometimes|numeric|min:0|max:100',
            'rule_ids' => 'nullable|array',
            'rule_ids.*' => 'exists:rules,id',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:draft,sent,approved,cancelled',
          'payment_terms' => 'nullable|string', 
        'terms_conditions' => 'nullable|string', 
        ]);

        DB::beginTransaction();

        try {
            $proformaInvoice = ProformaInvoice::findOrFail($id);

            // Security check
            if ($proformaInvoice->company_id !== $user->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Recalculate if items changed
            if (isset($validated['items'])) {
                $subtotal = collect($validated['items'])->sum('total_price');
                $discount = $validated['discount'] ?? $proformaInvoice->discount;
                $taxableAmount = $subtotal - $discount;
                
                $cgstPercentage = $validated['cgst_percentage'] ?? $proformaInvoice->cgst_percentage;
                $sgstPercentage = $validated['sgst_percentage'] ?? $proformaInvoice->sgst_percentage;
                $igstPercentage = $validated['igst_percentage'] ?? $proformaInvoice->igst_percentage;
                
                $cgstAmount = $taxableAmount * ($cgstPercentage / 100);
                $sgstAmount = $taxableAmount * ($sgstPercentage / 100);
                $igstAmount = $taxableAmount * ($igstPercentage / 100);
                $gstAmount = $cgstAmount + $sgstAmount + $igstAmount;
                
                $finalAmount = $taxableAmount + $gstAmount;
                $pendingAmount = $finalAmount - $proformaInvoice->paid_amount;



                $validated = array_merge($validated, [
                    'subtotal' => $subtotal,
                    'taxable_amount' => $taxableAmount,
                    'gst_amount' => $gstAmount,
                    'cgst_amount' => $cgstAmount,
                    'sgst_amount' => $sgstAmount,
                    'igst_amount' => $igstAmount,
                    'final_amount' => $finalAmount,
                    'pending_amount' => $pendingAmount,
                ]);

                // Update payment status
                if ($pendingAmount <= 0) {
                    $validated['payment_status'] = 'paid';
                } elseif ($proformaInvoice->paid_amount > 0) {
                    $validated['payment_status'] = 'partial';
                } else {
                    $validated['payment_status'] = 'pending';
                }

                // Delete old details
                ProformaInvoiceDetail::where('proforma_invoice_id', $id)->delete();
                
                // Create new details
                foreach ($validated['items'] as $item) {
                    ProformaInvoiceDetail::create([
                        'proforma_invoice_id' => $id,
                        'work_type' => $item['work_type'],
                          'uom'   => $item['uom'],
                        'qty' => $item['qty'],
                        'price' => $item['price'],
                        'total_price' => $item['total_price'],
                        'remark' => $item['remark'] ?? null,
    'gst_percent' => $item['gst_percent'] ?? null,
'cgst_amount' => $item['cgst_amount'] ?? null,
'sgst_amount' => $item['sgst_amount'] ?? null,
                    ]);
                }
            }

            // Update rules if provided
            if (isset($validated['rule_ids'])) {
                ProformaInvoiceRule::where('proforma_invoice_id', $id)->delete();
                
                foreach ($validated['rule_ids'] as $ruleId) {
                    ProformaInvoiceRule::create([
                        'proforma_invoice_id' => $id,
                        'rules_id' => $ruleId,
                    ]);
                }
            }

            // Update main record
            unset($validated['items'], $validated['rule_ids']);
            $validated['updated_by'] = $user->id;
            $proformaInvoice->update($validated);

            DB::commit();

            $proformaInvoice->load(['workOrder', 'project', 'details', 'invoiceRules.rule']);

            return response()->json([
                'success' => true,
                'message' => 'Proforma invoice updated successfully',
                'data' => $proformaInvoice
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update proforma invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Record payment for proforma invoice
     */
    // public function recordPayment(Request $request, $id)
    // {
    //     $user = Auth::user();

    //     $validated = $request->validate([
    //         'received_amount' => 'required|numeric|min:0.01',
    //         'received_by' => 'required|string|max:255',
    //         'payment_type' => 'required|in:imps,rtgs,upi,cash,cheque',
    //         'senders_bank' => 'required|string|max:255',
    //         'receivers_bank' => 'required|string|max:255',
    //         'remark' => 'nullable|string|max:500',
    //     ]);

    //     DB::beginTransaction();

    //     try {
    //         $proformaInvoice = ProformaInvoice::with('project')->findOrFail($id);

    //         // Security check
    //         if ($proformaInvoice->company_id !== $user->company_id) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Unauthorized access'
    //             ], 403);
    //         }

    //         $newPayment = $validated['received_amount'];
    //         $remainingAmount = $proformaInvoice->pending_amount;

    //         // Validate payment amount
    //         if ($newPayment > $remainingAmount) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => "Payment amount cannot exceed pending amount of ₹{$remainingAmount}"
    //             ], 400);
    //         }

    //         // Create income record linked to proforma invoice
    //         $basicAmount = $newPayment / 1.18;
    //         $gstAmount = $newPayment - $basicAmount;

    //         $income = Income::create([
    //             'project_id' => $proformaInvoice->project_id,
    //             'order_id' => $proformaInvoice->work_order_id,
    //             'proforma_invoice_id' => $proformaInvoice->id,
    //             'company_id' => $user->company_id,
    //             //'po_no' => "PO-{$proformaInvoice->proforma_invoice_number}",
    //              'po_no' => $proformaInvoice->po_no,
    //             'po_date' => $proformaInvoice->invoice_date,
    //             'invoice_no' => $proformaInvoice->proforma_invoice_number,
    //             'invoice_date' => $proformaInvoice->invoice_date,
    //             'basic_amount' => round($basicAmount, 2),
    //             'gst_amount' => round($gstAmount, 2),
    //             'billing_amount' => round($newPayment, 2),
    //             'received_amount' => $newPayment,
    //             'pending_amount' => 0.00,
    //             'received_by' => $validated['received_by'],
    //             'payment_type' => $validated['payment_type'],
    //             'senders_bank' => $validated['senders_bank'],
    //             'receivers_bank' => $validated['receivers_bank'],
    //             'remark' => $validated['remark'] ?? "Payment for Proforma Invoice #{$proformaInvoice->proforma_invoice_number}",
    //         ]);

    //         // Update proforma invoice payment status
    //         $newPaidAmount = $proformaInvoice->paid_amount + $newPayment;
    //         $newPendingAmount = $proformaInvoice->final_amount - $newPaidAmount;
            
    //         $paymentStatus = 'pending';
    //         if ($newPendingAmount <= 0) {
    //             $paymentStatus = 'paid';
    //         } elseif ($newPaidAmount > 0) {
    //             $paymentStatus = 'partial';
    //         }

    //         $proformaInvoice->update([
    //             'paid_amount' => $newPaidAmount,
    //             'pending_amount' => $newPendingAmount,
    //             'payment_status' => $paymentStatus,
    //             'updated_by' => $user->id,
    //         ]);

    //         // Update work order's paid amount
    //         $workOrder = Order::find($proformaInvoice->work_order_id);
    //         if ($workOrder) {
    //             $workOrder->update([
    //                 'paidAmount' => DB::raw("paidAmount + {$newPayment}"),
    //                 'updated_by' => $user->id,
    //             ]);
    //         }

    //         // Update income summary
    //         $today = Carbon::today()->toDateString();
    //         $incomeSummary = IncomeSummary::firstOrNew([
    //             'company_id' => $user->company_id,
    //             'project_id' => $proformaInvoice->project_id,
    //             'date' => $today
    //         ]);

    //         if ($incomeSummary->exists) {
    //             $incomeSummary->increment('invoice_count');
    //             $incomeSummary->total_amount += $newPayment;
    //         } else {
    //             $incomeSummary->invoice_count = 1;
    //             $incomeSummary->total_amount = $newPayment;
    //             $incomeSummary->pending_amount = 0;
    //         }
    //         $incomeSummary->save();

    //         DB::commit();

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Payment recorded successfully',
    //             'data' => [
    //                 'proforma_invoice_id' => $proformaInvoice->id,
    //                 'income_id' => $income->id,
    //                 'payment_amount' => $newPayment,
    //                 'new_paid_amount' => $newPaidAmount,
    //                 'remaining_amount' => $newPendingAmount,
    //                 'payment_status' => $paymentStatus,
    //             ]
    //         ], 200);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to record payment',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function recordPayment(Request $request, $id)
{
    $user = Auth::user();

    $validated = $request->validate([
        'received_amount' => 'required|numeric|min:0.01',
        'received_by' => 'required|string|max:255',
        'payment_type' => 'required|in:imps,rtgs,upi,cash,cheque',
        'senders_bank' => 'required|string|max:255',
        'receivers_bank' => 'required|string|max:255',
        'remark' => 'nullable|string|max:500',
    ]);

    DB::beginTransaction();

    try {
        $proformaInvoice = ProformaInvoice::with('project')->findOrFail($id);

        // Security check
        if ($proformaInvoice->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $newPayment = $validated['received_amount'];
        $remainingAmount = $proformaInvoice->pending_amount;

        // Validate payment amount
        if ($newPayment > $remainingAmount) {
            return response()->json([
                'success' => false,
                'message' => "Payment amount cannot exceed pending amount of ₹{$remainingAmount}"
            ], 400);
        }

        // 🔹 Fetch related order data to get PO number
        $order = Order::find($proformaInvoice->work_order_id);

        // If order found, get PO number; otherwise keep null
        $poNumber = $order ? $order->po_number : null;
        $poDate = $order ? $order->po_date : $proformaInvoice->invoice_date;

        // Calculate GST / Basic amount split
        $basicAmount = $newPayment / 1.18;
        $gstAmount = $newPayment - $basicAmount;

        // 🔹 Create income record linked to proforma invoice and order PO
        $income = Income::create([
            'project_id' => $proformaInvoice->project_id,
            'order_id' => $proformaInvoice->work_order_id,
            'proforma_invoice_id' => $proformaInvoice->id,
            'company_id' => $user->company_id,
            'po_no' => $poNumber ?? "N/A", // fallback
            'po_date' => $proformaInvoice->invoice_date,
            'invoice_no' => $proformaInvoice->proforma_invoice_number,
            'invoice_date' => $proformaInvoice->invoice_date,
            'basic_amount' => round($basicAmount, 2),
            'gst_amount' => round($gstAmount, 2),
            'billing_amount' => round($newPayment, 2),
            'received_amount' => $newPayment,
            'pending_amount' => 0.00,
            'received_by' => $validated['received_by'],
            'payment_type' => $validated['payment_type'],
            'senders_bank' => $validated['senders_bank'],
            'receivers_bank' => $validated['receivers_bank'],
            'remark' => $validated['remark'] ?? "Payment for Proforma Invoice #{$proformaInvoice->proforma_invoice_number}",
            //   'payment_date' => Carbon::now()->toDateString(),
            'payment_date' => Carbon::today()->toDateString(),

        ]);

        // 🔹 Update proforma invoice payment status
        $newPaidAmount = $proformaInvoice->paid_amount + $newPayment;
        $newPendingAmount = $proformaInvoice->final_amount - $newPaidAmount;

        $paymentStatus = 'pending';
        if ($newPendingAmount <= 0) {
            $paymentStatus = 'paid';
        } elseif ($newPaidAmount > 0) {
            $paymentStatus = 'partial';
        }

        $proformaInvoice->update([
            'paid_amount' => $newPaidAmount,
            'pending_amount' => $newPendingAmount,
            'payment_status' => $paymentStatus,
            'updated_by' => $user->id,
        ]);

        // 🔹 Update work order paid amount
        if ($order) {
            $order->update([
                'paidAmount' => DB::raw("paidAmount + {$newPayment}"),
                'updated_by' => $user->id,
            ]);
        }

        // 🔹 Update income summary
        $today = Carbon::today()->toDateString();
        $incomeSummary = IncomeSummary::firstOrNew([
            'company_id' => $user->company_id,
            'project_id' => $proformaInvoice->project_id,
            'date' => $today
        ]);

        if ($incomeSummary->exists) {
            $incomeSummary->increment('invoice_count');
            $incomeSummary->total_amount += $newPayment;
        } else {
            $incomeSummary->invoice_count = 1;
            $incomeSummary->total_amount = $newPayment;
            $incomeSummary->pending_amount = 0;
        }
        $incomeSummary->save();

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'data' => [
                'proforma_invoice_id' => $proformaInvoice->id,
                'income_id' => $income->id,
                'payment_amount' => $newPayment,
                'new_paid_amount' => $newPaidAmount,
                'remaining_amount' => $newPendingAmount,
                'payment_status' => $paymentStatus,
                'po_no' => $poNumber,
            ]
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Failed to record payment',
            'error' => $e->getMessage()
        ], 500);
    }
}


    /**
     * Delete proforma invoice
     */
    public function destroy($id)
    {
        $user = Auth::user();

        try {
            $proformaInvoice = ProformaInvoice::findOrFail($id);

            // Security check
            if ($proformaInvoice->company_id !== $user->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Check if payments exist
            if ($proformaInvoice->paid_amount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete proforma invoice with recorded payments'
                ], 400);
            }

            $proformaInvoice->delete();

            return response()->json([
                'success' => true,
                'message' => 'Proforma invoice deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete proforma invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}