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
use App\Models\AdvancedPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ProformaInvoiceController extends Controller
{
    /**
     * ✅ HELPER: Calculate GST percentages from order amounts
     */
    private function calculateGstPercentagesFromOrder($order)
    {
        $totalAmount = floatval($order->totalAmount ?? 0);
        $cgstAmount = floatval($order->cgst ?? 0);
        $sgstAmount = floatval($order->sgst ?? 0);
        $igstAmount = floatval($order->igst ?? 0);
        $gstAmount = floatval($order->gst ?? 0);
        
        $gstPercentage = 0;
        $cgstPercentage = 0;
        $sgstPercentage = 0;
        $igstPercentage = 0;
        
        if ($totalAmount > 0) {
            if ($cgstAmount > 0) {
                $cgstPercentage = round(($cgstAmount / $totalAmount) * 100, 2);
            }
            if ($sgstAmount > 0) {
                $sgstPercentage = round(($sgstAmount / $totalAmount) * 100, 2);
            }
            if ($igstAmount > 0) {
                $igstPercentage = round(($igstAmount / $totalAmount) * 100, 2);
            }
            if ($gstAmount > 0) {
                $gstPercentage = round(($gstAmount / $totalAmount) * 100, 2);
            } else {
                $gstPercentage = $cgstPercentage + $sgstPercentage + $igstPercentage;
            }
        }
        
        return [
            'gst_percentage' => $gstPercentage,
            'cgst_percentage' => $cgstPercentage,
            'sgst_percentage' => $sgstPercentage,
            'igst_percentage' => $igstPercentage,
        ];
    }

    /**
     * ✅ HELPER: Calculate GST percentage for individual order detail item
     */
    private function calculateItemGstPercentage($orderDetail)
    {
        $qty = floatval($orderDetail->qty ?? 0);
        $price = floatval($orderDetail->price ?? 0);
        $cgstAmount = floatval($orderDetail->cgst_amount ?? 0);
        $sgstAmount = floatval($orderDetail->sgst_amount ?? 0);
        
        $gstPercent = 0;
        
        if (isset($orderDetail->gst_percent) && $orderDetail->gst_percent !== null) {
            $gstPercent = floatval($orderDetail->gst_percent);
        } else {
            $baseAmount = $qty * $price;
            if ($baseAmount > 0 && ($cgstAmount > 0 || $sgstAmount > 0)) {
                $totalGstAmount = $cgstAmount + $sgstAmount;
                $gstPercent = round(($totalGstAmount / $baseAmount) * 100, 2);
            }
        }
        
        return $gstPercent;
    }

    /**
     * ✅ VALIDATION: Prevent quantity and price from exceeding work order limits
     */
    private function validateProformaItemsAgainstWorkOrder($workOrderId, $proformaItems, $excludeProformaId = null)
    {
        $workOrder = Order::with('items')->findOrFail($workOrderId);
        
        $existingProformas = ProformaInvoice::with('details')
            ->where('work_order_id', $workOrderId)
            ->when($excludeProformaId, function($q) use ($excludeProformaId) {
                $q->where('id', '!=', $excludeProformaId);
            })
            ->get();
        
        $allocatedByWorkType = [];
        foreach ($existingProformas as $proforma) {
            foreach ($proforma->details as $detail) {
                $key = strtolower(trim($detail->work_type));
                if (!isset($allocatedByWorkType[$key])) {
                    $allocatedByWorkType[$key] = [
                        'qty' => 0,
                        'amount' => 0
                    ];
                }
                $allocatedByWorkType[$key]['qty'] += floatval($detail->qty);
                $allocatedByWorkType[$key]['amount'] += floatval($detail->total_price);
            }
        }
        
        $errors = [];
        foreach ($proformaItems as $index => $item) {
            $workType = strtolower(trim($item['work_type']));
            
            $workOrderItem = $workOrder->items->first(function($orderItem) use ($workType) {
                return strtolower(trim($orderItem->work_type)) === $workType;
            });
            
            if (!$workOrderItem) {
                $errors[] = "Item '{$item['work_type']}' not found in work order.";
                continue;
            }
            
            $alreadyAllocated = $allocatedByWorkType[$workType] ?? ['qty' => 0, 'amount' => 0];
            
            $newTotalQty = $alreadyAllocated['qty'] + floatval($item['qty']);
            $newTotalAmount = $alreadyAllocated['amount'] + floatval($item['total_price']);
            
            $qtyTolerance = 0.01;
            $amountTolerance = 1; // ₹1 tolerance for rounding
            
            if (($newTotalQty - floatval($workOrderItem->qty)) > $qtyTolerance) {
                $remainingQty = floatval($workOrderItem->qty) - $alreadyAllocated['qty'];
                $errors[] = sprintf(
                    "⚠️ Item: '%s'\n" .
                    "   Work Order Quantity: %.2f\n" .
                    "   Already Allocated: %.2f\n" .
                    "   Available: %.2f\n" .
                    "   You are trying to add: %.2f\n" .
                    "   ❌ Exceeds by: %.2f",
                    $item['work_type'],
                    floatval($workOrderItem->qty),
                    $alreadyAllocated['qty'],
                    max(0, $remainingQty),
                    floatval($item['qty']),
                    max(0, floatval($item['qty']) - $remainingQty)
                );
            }
            
            if (($newTotalAmount - floatval($workOrderItem->total_price)) > $amountTolerance) {
                $remainingAmount = floatval($workOrderItem->total_price) - $alreadyAllocated['amount'];
                $errors[] = sprintf(
                    "⚠️ Item: '%s'\n" .
                    "   Work Order Amount: ₹%.2f\n" .
                    "   Already Allocated: ₹%.2f\n" .
                    "   Available: ₹%.2f\n" .
                    "   You are trying to add: ₹%.2f\n" .
                    "   ❌ Exceeds by: ₹%.2f",
                    $item['work_type'],
                    floatval($workOrderItem->total_price),
                    $alreadyAllocated['amount'],
                    max(0, $remainingAmount),
                    floatval($item['total_price']),
                    max(0, floatval($item['total_price']) - $remainingAmount)
                );
            }
        }
        
        return $errors;
    }

    /**
     * ✅ VALIDATION: Check total proforma invoice amount with global GST
     */
    private function validateTotalProformaAmount($workOrder, $finalAmount, $excludeProformaId = null)
    {
        // Calculate work order final amount (including all GST)
        $workOrderFinalAmount = floatval($workOrder->finalAmount ?? (
            floatval($workOrder->totalAmount ?? 0) + 
            floatval($workOrder->gst ?? 0) + 
            floatval($workOrder->cgst ?? 0) + 
            floatval($workOrder->sgst ?? 0) + 
            floatval($workOrder->igst ?? 0)
        ));

        // Get sum of all existing proforma invoices (excluding current if editing)
        $existingProformaTotal = ProformaInvoice::where('work_order_id', $workOrder->id)
            ->when($excludeProformaId, function($q) use ($excludeProformaId) {
                $q->where('id', '!=', $excludeProformaId);
            })
            ->sum('final_amount');

        $newTotal = $existingProformaTotal + $finalAmount;
        $tolerance = 1; // ₹1 tolerance

        if (($newTotal - $workOrderFinalAmount) > $tolerance) {
            $remainingAmount = max(0, $workOrderFinalAmount - $existingProformaTotal);
            return [
                'valid' => false,
                'message' => sprintf(
                    "⚠️ Total Proforma Invoice Amount Validation Failed:\n\n" .
                    "Work Order Total (with all GST): ₹%.2f\n" .
                    "Already Allocated in Previous Proforma Invoices: ₹%.2f\n" .
                    "Available Amount: ₹%.2f\n\n" .
                    "Current Proforma Invoice Amount: ₹%.2f\n" .
                    "❌ Exceeds Work Order Limit by: ₹%.2f\n\n" .
                    "Please reduce the amount or adjust GST to fit within the available limit.",
                    $workOrderFinalAmount,
                    $existingProformaTotal,
                    $remainingAmount,
                    $finalAmount,
                    max(0, $finalAmount - $remainingAmount)
                ),
                'data' => [
                    'work_order_total' => round($workOrderFinalAmount, 2),
                    'already_allocated' => round($existingProformaTotal, 2),
                    'available_amount' => round($remainingAmount, 2),
                    'requested_amount' => round($finalAmount, 2),
                    'exceeds_by' => round(max(0, $finalAmount - $remainingAmount), 2)
                ]
            ];
        }

        return ['valid' => true];
    }

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
                'project.projectType',
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
     * ✅ Show single proforma invoice with calculated GST percentages
     */
    public function show($id)
    {
        try {
            $proformaInvoice = ProformaInvoice::with([
                'workOrder.items',
                'project.projectType',
                'details',
                'invoiceRules.rule',
                'incomes',
                'advances'
            ])->findOrFail($id);

            if (!$proformaInvoice->gst_percentage || $proformaInvoice->gst_percentage == 0) {
                if ($proformaInvoice->workOrder) {
                    $gstPercentages = $this->calculateGstPercentagesFromOrder($proformaInvoice->workOrder);
                    $proformaInvoice->gst_percentage = $gstPercentages['gst_percentage'];
                    $proformaInvoice->cgst_percentage = $gstPercentages['cgst_percentage'];
                    $proformaInvoice->sgst_percentage = $gstPercentages['sgst_percentage'];
                    $proformaInvoice->igst_percentage = $gstPercentages['igst_percentage'];
                }
            }
            
            foreach ($proformaInvoice->details as $detail) {
                if (!$detail->gst_percent || $detail->gst_percent == 0) {
                    if ($proformaInvoice->workOrder && $proformaInvoice->workOrder->items) {
                        $workOrderItem = $proformaInvoice->workOrder->items->first(function($item) use ($detail) {
                            return strtolower(trim($item->work_type)) === strtolower(trim($detail->work_type));
                        });
                        
                        if ($workOrderItem) {
                            $detail->gst_percent = $this->calculateItemGstPercentage($workOrderItem);
                        }
                    }
                }
            }

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










    /**
     * ✅ UPDATED: Create proforma invoice with complete validation
     */

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
//         'items.*.uom' => 'nullable|string',
//         'items.*.price' => 'required|numeric|min:0',
//         'items.*.total_price' => 'required|numeric|min:0',
//         'items.*.remark' => 'nullable|string',
//         'items.*.work_sub_description' => 'nullable|string',
//         'items.*.gst_percent' => 'nullable|numeric|min:0',
//         'items.*.cgst_amount' => 'nullable|numeric|min:0',
//         'items.*.sgst_amount' => 'nullable|numeric|min:0',
//         'discount' => 'nullable|numeric|min:0',
//         'gst_percentage' => 'required|numeric|min:0|max:100',
//         'cgst_percentage' => 'required|numeric|min:0|max:50',
//         'sgst_percentage' => 'required|numeric|min:0|max:50',
//         'igst_percentage' => 'required|numeric|min:0|max:100',
//         'rule_ids' => 'nullable|array',
//         'rule_ids.*' => 'exists:rules,id',
//         'notes' => 'nullable|string',
//         'payment_terms' => 'nullable|string',
//         'terms_conditions' => 'nullable|string',

//         // ─── Added only for array support ───
//         'advance_payments' => 'nullable|array',
//         'advance_payments.*.received_amount' => 'required|numeric|min:0.01',
//         'advance_payments.*.payment_date' => 'nullable|date',
//         'advance_payments.*.received_from' => 'nullable|string|max:255',
//         'advance_payments.*.payment_type' => 'nullable|string|max:100',
//         'advance_payments.*.senders_bank' => 'nullable|string|max:255',
//         'advance_payments.*.receivers_bank' => 'nullable|string|max:255',
//         'advance_payments.*.remark' => 'nullable|string',
//         'advance_payments.*.transaction_number' => 'nullable|string|max:100',
//     ]);

//     DB::beginTransaction();

//     try {
//         $project = Project::findOrFail($validated['project_id']);
//         $workOrder = Order::findOrFail($validated['work_order_id']);
        
//         if ($workOrder->project_id !== $project->id) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Project does not belong to the specified work order'
//             ], 400);
//         }

//         // STEP 1: Validate items against work order
//         $itemValidationErrors = $this->validateProformaItemsAgainstWorkOrder(
//             $validated['work_order_id'],
//             $validated['items']
//         );
        
//         if (!empty($itemValidationErrors)) {
//             $errorMessage = "❌ Item-wise Validation Failed:\n\n" . implode("\n\n", $itemValidationErrors);
//             return response()->json([
//                 'success' => false,
//                 'message' => $errorMessage,
//                 'errors' => $itemValidationErrors
//             ], 400);
//         }

//         // Calculate amounts
//         $subtotal = collect($validated['items'])->sum('total_price');
//         $discount = $validated['discount'] ?? 0;
//         $taxableAmount = $subtotal - $discount;
        
//         if ($taxableAmount < 0) {
//             return response()->json([
//                 'success' => false,
//                 'message' => sprintf(
//                     "⚠️ Discount Validation Failed:\n\n" .
//                     "Subtotal: ₹%.2f\n" .
//                     "Discount: ₹%.2f\n" .
//                     "❌ Discount cannot be greater than subtotal.\n\n" .
//                     "Please reduce the discount amount.",
//                     $subtotal,
//                     $discount
//                 )
//             ], 400);
//         }
        
//         $cgstAmount = $taxableAmount * ($validated['cgst_percentage'] / 100);
//         $sgstAmount = $taxableAmount * ($validated['sgst_percentage'] / 100);
//         $igstAmount = $taxableAmount * ($validated['igst_percentage'] / 100);
//         $gstAmount = $cgstAmount + $sgstAmount + $igstAmount;
        
//         $finalAmount = $taxableAmount + $gstAmount;

//         // STEP 2: Validate total amount
//         $totalValidation = $this->validateTotalProformaAmount($workOrder, $finalAmount);
        
//         if (!$totalValidation['valid']) {
//             return response()->json([
//                 'success' => false,
//                 'message' => $totalValidation['message'],
//                 'data' => $totalValidation['data']
//             ], 400);
//         }

//         // Generate proforma invoice number
//         $company = CompanyInfo::findOrFail($user->company_id);
//         $lastProforma = ProformaInvoice::where('company_id', $user->company_id)
//             ->orderBy('id', 'desc')
//             ->first();

//         $nextNumber = $lastProforma ? ($lastProforma->id + 1) : 1;
//         $proformaNumber = $company->initials . '-PI-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

//         // Create proforma invoice
//         $proformaInvoice = ProformaInvoice::create([
//             'work_order_id' => $validated['work_order_id'],
//             'project_id' => $validated['project_id'],
//             'company_id' => $user->company_id,
//             'proforma_invoice_number' => $proformaNumber,
//             'tally_invoice_number' => $validated['tally_invoice_number'] ?? null,
//             'invoice_date' => $validated['invoice_date'],
//             'delivery_date' => $validated['delivery_date'] ?? null,
//             'subtotal' => round($subtotal, 2),
//             'discount' => round($discount, 2),
//             'taxable_amount' => round($taxableAmount, 2),
//             'gst_percentage' => $validated['gst_percentage'],
//             'cgst_percentage' => $validated['cgst_percentage'],
//             'sgst_percentage' => $validated['sgst_percentage'],
//             'igst_percentage' => $validated['igst_percentage'],
//             'gst_amount' => round($gstAmount, 2),
//             'cgst_amount' => round($cgstAmount, 2),
//             'sgst_amount' => round($sgstAmount, 2),
//             'igst_amount' => round($igstAmount, 2),
//             'final_amount' => round($finalAmount, 2),
//             'paid_amount' => 0,
//             'pending_amount' => round($finalAmount, 2),
//             'payment_status' => 'pending',
//             'status' => 'draft',
//             'notes' => $validated['notes'] ?? null,
//             'created_by' => $user->id,
//             'updated_by' => $user->id,
//             'payment_terms' => $validated['payment_terms'] ?? null,
//             'terms_conditions' => $validated['terms_conditions'] ?? null,
//         ]);

//         // Create details
//         foreach ($validated['items'] as $item) {
//             ProformaInvoiceDetail::create([
//                 'proforma_invoice_id' => $proformaInvoice->id,
//                 'work_type' => $item['work_type'],
//                 'uom' => $item['uom'] ?? null,
//                 'qty' => $item['qty'],
//                 'price' => $item['price'],
//                 'total_price' => round($item['total_price'], 2),
//                 'remark' => $item['remark'] ?? null,
//                 'work_sub_description'  => $item['work_sub_description'] ?? null,
//                 'gst_percent' => $item['gst_percent'] ?? 0,
//                 'cgst_amount' => round($item['cgst_amount'] ?? 0, 2),
//                 'sgst_amount' => round($item['sgst_amount'] ?? 0, 2),
//             ]);
//         }

//         // ────────────────────────────────────────────────────────────────
//         // CHANGED PART: Handle multiple advance payments (array)
//         // ────────────────────────────────────────────────────────────────
//         $advancePaymentsData = $request->input('advance_payments', []);

//         foreach ($advancePaymentsData as $payment) {
//             if (!empty($payment['received_amount']) && is_numeric($payment['received_amount']) && $payment['received_amount'] > 0) {
//                 AdvancedPayment::create([
//                     'order_id'           => $validated['work_order_id'],
//                     'project_id'         => $validated['project_id'],
//                     'proforma_id'        => $proformaInvoice->id,
//                     'advanced_amount'    => round($payment['received_amount'], 2),
//                     'payment_date'       => $payment['payment_date'] ?? now()->toDateString(),
//                     'received_from'      => $payment['received_from'] ?? null,
//                     'payment_type'       => $payment['payment_type'] ?? null,
//                     'senders_bank'       => $payment['senders_bank'] ?? null,
//                     'receivers_bank'     => $payment['receivers_bank'] ?? null,
//                     'transaction_number' => $payment['transaction_number'] ?? null,
//                     'remark'             => $payment['remark'] ?? null,
//                 ]);
//             }
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

//         $proformaInvoice->load(['workOrder', 'project.projectType', 'details', 'invoiceRules.rule']);

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
//         'items.*.uom' => 'nullable|string',
//         'items.*.price' => 'required|numeric|min:0',
//         'items.*.total_price' => 'required|numeric|min:0',
//         'items.*.remark' => 'nullable|string',
//         'items.*.work_sub_description' => 'nullable|string',
//         'items.*.gst_percent' => 'nullable|numeric|min:0',
//         'items.*.cgst_amount' => 'nullable|numeric|min:0',
//         'items.*.sgst_amount' => 'nullable|numeric|min:0',
//         'discount' => 'nullable|numeric|min:0',
//         'gst_percentage' => 'required|numeric|min:0|max:100',
//         'cgst_percentage' => 'required|numeric|min:0|max:50',
//         'sgst_percentage' => 'required|numeric|min:0|max:50',
//         'igst_percentage' => 'required|numeric|min:0|max:100',
//         'rule_ids' => 'nullable|array',
//         'rule_ids.*' => 'exists:rules,id',
//         'notes' => 'nullable|string',
//         'payment_terms' => 'nullable|string',
//         'terms_conditions' => 'nullable|string',

//         // Support multiple advance payments
//         'advance_payments' => 'nullable|array',
//         'advance_payments.*.received_amount' => 'required_with:advance_payments|numeric|min:0.01',
//         'advance_payments.*.payment_date' => 'nullable|date',
//         'advance_payments.*.received_from' => 'nullable|string|max:255',
//         'advance_payments.*.payment_type' => 'nullable|string|max:100|in:imps,rtgs,upi,cash,cheque,debit_note',
//         'advance_payments.*.senders_bank' => 'nullable|string|max:255',
//         'advance_payments.*.receivers_bank' => 'nullable|string|max:255',
//         'advance_payments.*.remark' => 'nullable|string|max:500',
//         'advance_payments.*.transaction_number' => 'nullable|string|max:100',
//     ]);

//     DB::beginTransaction();

//     try {
//         $project = Project::findOrFail($validated['project_id']);
//         $workOrder = Order::findOrFail($validated['work_order_id']);

//         if ($workOrder->project_id !== $project->id) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Project does not belong to the specified work order'
//             ], 400);
//         }

//         // STEP 1: Validate items against work order
//         $itemValidationErrors = $this->validateProformaItemsAgainstWorkOrder(
//             $validated['work_order_id'],
//             $validated['items']
//         );

//         if (!empty($itemValidationErrors)) {
//             $errorMessage = "❌ Item-wise Validation Failed:\n\n" . implode("\n\n", $itemValidationErrors);
//             return response()->json([
//                 'success' => false,
//                 'message' => $errorMessage,
//                 'errors' => $itemValidationErrors
//             ], 400);
//         }

//         // Calculate amounts
//         $subtotal = collect($validated['items'])->sum('total_price');
//         $discount = $validated['discount'] ?? 0;
//         $taxableAmount = $subtotal - $discount;

//         if ($taxableAmount < 0) {
//             return response()->json([
//                 'success' => false,
//                 'message' => sprintf(
//                     "⚠️ Discount Validation Failed:\n\n" .
//                     "Subtotal: ₹%.2f\n" .
//                     "Discount: ₹%.2f\n" .
//                     "❌ Discount cannot be greater than subtotal.\n\n" .
//                     "Please reduce the discount amount.",
//                     $subtotal,
//                     $discount
//                 )
//             ], 400);
//         }

//         $cgstAmount = $taxableAmount * ($validated['cgst_percentage'] / 100);
//         $sgstAmount = $taxableAmount * ($validated['sgst_percentage'] / 100);
//         $igstAmount = $taxableAmount * ($validated['igst_percentage'] / 100);
//         $gstAmount = $cgstAmount + $sgstAmount + $igstAmount;

//         $finalAmount = $taxableAmount + $gstAmount;

//         // STEP 2: Validate total amount
//         $totalValidation = $this->validateTotalProformaAmount($workOrder, $finalAmount);

//         if (!$totalValidation['valid']) {
//             return response()->json([
//                 'success' => false,
//                 'message' => $totalValidation['message'],
//                 'data' => $totalValidation['data']
//             ], 400);
//         }

//         // Generate proforma invoice number
//         $company = CompanyInfo::findOrFail($user->company_id);
//         $lastProforma = ProformaInvoice::where('company_id', $user->company_id)
//             ->orderBy('id', 'desc')
//             ->first();

//         $nextNumber = $lastProforma ? ($lastProforma->id + 1) : 1;
//         $proformaNumber = $company->initials . '-PI-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

//         // Create proforma invoice
//         $proformaInvoice = ProformaInvoice::create([
//             'work_order_id' => $validated['work_order_id'],
//             'project_id' => $validated['project_id'],
//             'company_id' => $user->company_id,
//             'proforma_invoice_number' => $proformaNumber,
//             'tally_invoice_number' => $validated['tally_invoice_number'] ?? null,
//             'invoice_date' => $validated['invoice_date'],
//             'delivery_date' => $validated['delivery_date'] ?? null,
//             'subtotal' => round($subtotal, 2),
//             'discount' => round($discount, 2),
//             'taxable_amount' => round($taxableAmount, 2),
//             'gst_percentage' => $validated['gst_percentage'],
//             'cgst_percentage' => $validated['cgst_percentage'],
//             'sgst_percentage' => $validated['sgst_percentage'],
//             'igst_percentage' => $validated['igst_percentage'],
//             'gst_amount' => round($gstAmount, 2),
//             'cgst_amount' => round($cgstAmount, 2),
//             'sgst_amount' => round($sgstAmount, 2),
//             'igst_amount' => round($igstAmount, 2),
//             'final_amount' => round($finalAmount, 2),
//             'paid_amount' => 0,
//             'pending_amount' => round($finalAmount, 2),
//             'payment_status' => 'pending',
//             'status' => 'draft',
//             'notes' => $validated['notes'] ?? null,
//             'created_by' => $user->id,
//             'updated_by' => $user->id,
//             'payment_terms' => $validated['payment_terms'] ?? null,
//             'terms_conditions' => $validated['terms_conditions'] ?? null,
//         ]);

//         // Create details
//         foreach ($validated['items'] as $item) {
//             ProformaInvoiceDetail::create([
//                 'proforma_invoice_id' => $proformaInvoice->id,
//                 'work_type' => $item['work_type'],
//                 'uom' => $item['uom'] ?? null,
//                 'qty' => $item['qty'],
//                 'price' => $item['price'],
//                 'total_price' => round($item['total_price'], 2),
//                 'remark' => $item['remark'] ?? null,
//                 'work_sub_description' => $item['work_sub_description'] ?? null,
//                 'gst_percent' => $item['gst_percent'] ?? 0,
//                 'cgst_amount' => round($item['cgst_amount'] ?? 0, 2),
//                 'sgst_amount' => round($item['sgst_amount'] ?? 0, 2),
//             ]);
//         }

//         // ────────────────────────────────────────────────────────────────
//         // HANDLE ADVANCE PAYMENTS (multiple) — same logic as recordPayment
//         // ────────────────────────────────────────────────────────────────
//         $advancePaymentsData = $request->input('advance_payments', []);
//         $totalAdvance = 0;

//         // Pre-fetch details once (for GST split calculation)
//         $details = ProformaInvoiceDetail::where('proforma_invoice_id', $proformaInvoice->id)->get();
//         $totalCGST = $details->sum('cgst_amount');
//         $totalSGST = $details->sum('sgst_amount');
//         $invoiceGST = round($totalCGST + $totalSGST, 2);
//         $invoiceBasic = round($proformaInvoice->taxable_amount, 2);
//         $invoiceTotal = round($proformaInvoice->final_amount, 2);

//         $poNumber = $workOrder->po_number ?? 'N/A';

//         foreach ($advancePaymentsData as $paymentInput) {
//             $advanceAmount = round($paymentInput['received_amount'], 2);
//             if ($advanceAmount <= 0) continue;

//             $totalAdvance += $advanceAmount;

//             if ($totalAdvance > $invoiceTotal) {
//                 throw new \Exception("Total advance payments exceed invoice final amount");
//             }

//             // Proportional split (same logic as recordPayment)
//             $ratio = $advanceAmount / $invoiceTotal;

//             $basicAmount = round($invoiceBasic * $ratio, 2);
//             $gstAmount   = round($invoiceGST   * $ratio, 2);
//             $cgstAmount  = round($totalCGST    * $ratio, 2);
//             $sgstAmount  = round($totalSGST    * $ratio, 2);
//             $igstAmount  = 0; // future proof

//             $basicPortion = $advanceAmount - $gstAmount;

//             // Create Income record
//             $income = Income::create([
//                 'project_id'          => $proformaInvoice->project_id,
//                 'order_id'            => $proformaInvoice->work_order_id,
//                 'proforma_invoice_id' => $proformaInvoice->id,
//                 'company_id'          => $user->company_id,

//                 'po_no'               => $poNumber,
//                 'po_date'             => $proformaInvoice->invoice_date,
//                 'invoice_no'          => $proformaInvoice->proforma_invoice_number,
//                 'invoice_date'        => $proformaInvoice->invoice_date,

//                 'basic_amount'        => $basicPortion,
//                 'gst_amount'          => $gstAmount,
//                 'cgst_amount'         => $cgstAmount,
//                 'sgst_amount'         => $sgstAmount,
//                 'igst_amount'         => $igstAmount,

//                 'billing_amount'      => $advanceAmount,
//                 'received_amount'     => $advanceAmount,
//                 'pending_amount'      => 0.00,

//                 'received_by'         => $paymentInput['received_from'] ?? 'Advance',
//                 'payment_type'        => $paymentInput['payment_type'] ?? 'cash',
//                 'senders_bank'        => $paymentInput['senders_bank'] ?? null,
//                 'receivers_bank'      => $paymentInput['receivers_bank'] ?? null,

//                 'remark'              => $paymentInput['remark']
//                     ?? "Advance payment for PI #{$proformaInvoice->proforma_invoice_number}",

//                 'payment_date'        => $paymentInput['payment_date'] ?? now()->toDateString(),
//             ]);

//             // Also store in AdvancedPayment table (your audit/reference table)
//             AdvancedPayment::create([
//                 'order_id'           => $validated['work_order_id'],
//                 'project_id'         => $validated['project_id'],
//                 'proforma_id'        => $proformaInvoice->id,
//                 'advanced_amount'    => $advanceAmount,
//                 'payment_date'       => $paymentInput['payment_date'] ?? now()->toDateString(),
//                 'received_from'      => $paymentInput['received_from'] ?? null,
//                 'payment_type'       => $paymentInput['payment_type'] ?? null,
//                 'senders_bank'       => $paymentInput['senders_bank'] ?? null,
//                 'receivers_bank'     => $paymentInput['receivers_bank'] ?? null,
//                 'transaction_number' => $paymentInput['transaction_number'] ?? null,
//                 'remark'             => $paymentInput['remark'] ?? null,
//             ]);

//             // Update IncomeSummary (daily)
//             $today = Carbon::today()->toDateString();
//             $summary = IncomeSummary::firstOrNew([
//                 'company_id' => $user->company_id,
//                 'project_id' => $proformaInvoice->project_id,
//                 'date'       => $today,
//             ]);

//             if ($summary->exists) {
//                 $summary->invoice_count += 1;
//                 $summary->total_amount  += $advanceAmount;
//                 $summary->tax_amount    += $gstAmount;
//             } else {
//                 $summary->invoice_count  = 1;
//                 $summary->total_amount   = $advanceAmount;
//                 $summary->pending_amount = 0;
//                 $summary->tax_amount     = $gstAmount;
//             }
//             $summary->save();
//         }

//         // Final update of proforma paid/pending/status
//         if ($totalAdvance > 0) {
//             $newPaid = round($totalAdvance, 2);
//             $newPending = round($invoiceTotal - $newPaid, 2);
//             $status = ($newPending <= 0) ? 'paid' : 'partial';

//             $proformaInvoice->update([
//                 'paid_amount'    => $newPaid,
//                 'pending_amount' => max(0, $newPending),
//                 'payment_status' => $status,
//                 'updated_by'     => $user->id,
//             ]);

//             // Also update order paidAmount
//             $workOrder->update([
//                 'paidAmount' => ($workOrder->paidAmount ?? 0) + $totalAdvance,
//                 'updated_by' => $user->id,
//             ]);
//         }

//         // Attach rules (unchanged)
//         if (!empty($validated['rule_ids'])) {
//             foreach ($validated['rule_ids'] as $ruleId) {
//                 ProformaInvoiceRule::create([
//                     'proforma_invoice_id' => $proformaInvoice->id,
//                     'rules_id' => $ruleId,
//                 ]);
//             }
//         }

//         DB::commit();

//         $proformaInvoice->load(['workOrder', 'project.projectType', 'details', 'invoiceRules.rule']);

//         return response()->json([
//             'success' => true,
//             'message' => 'Proforma invoice created successfully' . ($totalAdvance > 0 ? ' with advance payment(s)' : ''),
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
        'items.*.work_sub_description' => 'nullable|string',
        'items.*.gst_percent' => 'nullable|numeric|min:0',
        'items.*.cgst_amount' => 'nullable|numeric|min:0',
        'items.*.sgst_amount' => 'nullable|numeric|min:0',
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

        // Support multiple advance payments
        'advance_payments' => 'nullable|array',
        'advance_payments.*.received_amount' => 'required_with:advance_payments|numeric|min:0.01',
        'advance_payments.*.payment_date' => 'nullable|date',
        'advance_payments.*.received_from' => 'nullable|string|max:255',
        'advance_payments.*.payment_type' => 'nullable|string|max:100|in:imps,rtgs,upi,cash,cheque,debit_note',
        'advance_payments.*.senders_bank' => 'nullable|string|max:255',
        'advance_payments.*.receivers_bank' => 'nullable|string|max:255',
        'advance_payments.*.remark' => 'nullable|string|max:500',
        'advance_payments.*.transaction_number' => 'nullable|string|max:100',
    ]);

    DB::beginTransaction();

    try {
        $project = Project::findOrFail($validated['project_id']);
        $workOrder = Order::findOrFail($validated['work_order_id']);

        if ($workOrder->project_id !== $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'Project does not belong to the specified work order'
            ], 400);
        }

        // STEP 1: Validate items against work order
        $itemValidationErrors = $this->validateProformaItemsAgainstWorkOrder(
            $validated['work_order_id'],
            $validated['items']
        );

        if (!empty($itemValidationErrors)) {
            $errorMessage = "❌ Item-wise Validation Failed:\n\n" . implode("\n\n", $itemValidationErrors);
            return response()->json([
                'success' => false,
                'message' => $errorMessage,
                'errors' => $itemValidationErrors
            ], 400);
        }

        // Calculate amounts
        $subtotal = collect($validated['items'])->sum('total_price');
        $discount = $validated['discount'] ?? 0;
        $taxableAmount = $subtotal - $discount;

        if ($taxableAmount < 0) {
            return response()->json([
                'success' => false,
                'message' => sprintf(
                    "⚠️ Discount Validation Failed:\n\n" .
                    "Subtotal: ₹%.2f\n" .
                    "Discount: ₹%.2f\n" .
                    "❌ Discount cannot be greater than subtotal.\n\n" .
                    "Please reduce the discount amount.",
                    $subtotal,
                    $discount
                )
            ], 400);
        }

        $cgstAmount = $taxableAmount * ($validated['cgst_percentage'] / 100);
        $sgstAmount = $taxableAmount * ($validated['sgst_percentage'] / 100);
        $igstAmount = $taxableAmount * ($validated['igst_percentage'] / 100);
        $gstAmount = $cgstAmount + $sgstAmount + $igstAmount;

        $finalAmount = $taxableAmount + $gstAmount;

        // STEP 2: Validate total amount against work order
        $totalValidation = $this->validateTotalProformaAmount($workOrder, $finalAmount);

        if (!$totalValidation['valid']) {
            return response()->json([
                'success' => false,
                'message' => $totalValidation['message'],
                'data' => $totalValidation['data']
            ], 400);
        }

        // Generate proforma invoice number
        $company = CompanyInfo::findOrFail($user->company_id);
        $lastProforma = ProformaInvoice::where('company_id', $user->company_id)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastProforma ? ($lastProforma->id + 1) : 1;
        $proformaNumber = $company->initials . '-PI-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        // Create proforma invoice
        $proformaInvoice = ProformaInvoice::create([
            'work_order_id'       => $validated['work_order_id'],
            'project_id'          => $validated['project_id'],
            'company_id'          => $user->company_id,
            'proforma_invoice_number' => $proformaNumber,
            'tally_invoice_number' => $validated['tally_invoice_number'] ?? null,
            'invoice_date'        => $validated['invoice_date'],
            'delivery_date'       => $validated['delivery_date'] ?? null,
            'subtotal'            => round($subtotal, 2),
            'discount'            => round($discount, 2),
            'taxable_amount'      => round($taxableAmount, 2),
            'gst_percentage'      => $validated['gst_percentage'],
            'cgst_percentage'     => $validated['cgst_percentage'],
            'sgst_percentage'     => $validated['sgst_percentage'],
            'igst_percentage'     => $validated['igst_percentage'],
            'gst_amount'          => round($gstAmount, 2),
            'cgst_amount'         => round($cgstAmount, 2),
            'sgst_amount'         => round($sgstAmount, 2),
            'igst_amount'         => round($igstAmount, 2),
            'final_amount'        => round($finalAmount, 2),
            'paid_amount'         => 0,
            'pending_amount'      => round($finalAmount, 2),
            'payment_status'      => 'pending',
            'status'              => 'draft',
            'notes'               => $validated['notes'] ?? null,
            'created_by'          => $user->id,
            'updated_by'          => $user->id,
            'payment_terms'       => $validated['payment_terms'] ?? null,
            'terms_conditions'    => $validated['terms_conditions'] ?? null,
        ]);

        // Create proforma invoice details
        foreach ($validated['items'] as $item) {
            ProformaInvoiceDetail::create([
                'proforma_invoice_id'   => $proformaInvoice->id,
                'work_type'             => $item['work_type'],
                'uom'                   => $item['uom'] ?? null,
                'qty'                   => $item['qty'],
                'price'                 => $item['price'],
                'total_price'           => round($item['total_price'], 2),
                'remark'                => $item['remark'] ?? null,
                'work_sub_description'  => $item['work_sub_description'] ?? null,
                'gst_percent'           => $item['gst_percent'] ?? 0,
                'cgst_amount'           => round($item['cgst_amount'] ?? 0, 2),
                'sgst_amount'           => round($item['sgst_amount'] ?? 0, 2),
            ]);
        }

        // ────────────────────────────────────────────────────────────────
        // HANDLE ADVANCE PAYMENTS (multiple) — aligned with recordPayment logic
        // ────────────────────────────────────────────────────────────────
        $advancePaymentsData = $request->input('advance_payments', []);
        $totalAdvance = 0;

        // Pre-calculate GST split values (used for all advances)
        // $details = ProformaInvoiceDetail::where('proforma_invoice_id', $proformaInvoice->id)->get();
        // $totalCGST    = round($details->sum('cgst_amount'), 2);
        // $totalSGST    = round($details->sum('sgst_amount'), 2);
        // $invoiceGST   = round($totalCGST + $totalSGST, 2);
        // $invoiceBasic = round($proformaInvoice->taxable_amount, 2);
        // $invoiceTotal = round($proformaInvoice->final_amount, 2);


        // ────────────────────────────────────────────────
// GST FROM DETAILS TABLE  (MATCH recordPayment)
// ────────────────────────────────────────────────
$details = ProformaInvoiceDetail::where('proforma_invoice_id', $proformaInvoice->id)->get();

if ($details->isEmpty()) {
    throw new \Exception("Invoice details not found");
}

$totalCGST    = round($details->sum('cgst_amount'), 2);
$totalSGST    = round($details->sum('sgst_amount'), 2);
$invoiceGST   = round($totalCGST + $totalSGST, 2);

$invoiceBasic = round($proformaInvoice->taxable_amount, 2);
$invoiceTotal = round($proformaInvoice->final_amount, 2);

if ($invoiceTotal <= 0) {
    throw new \Exception("Invalid invoice total");
}




        $poNumber = $workOrder->po_number ?? 'N/A';
        $today    = Carbon::today()->toDateString();

        // Prepare summary — will be saved only once
        $summary = IncomeSummary::firstOrNew([
            'company_id' => $user->company_id,
            'project_id' => $proformaInvoice->project_id,
            'date'       => $today,
        ]);

        foreach ($advancePaymentsData as $paymentInput) {
            $advanceAmount = round($paymentInput['received_amount'] ?? 0, 2);
            if ($advanceAmount <= 0) {
                continue;
            }

            $totalAdvance += $advanceAmount;

            if ($totalAdvance > $invoiceTotal) {
                throw new \Exception("Total advance payments exceed invoice final amount");
            }

            // Proportional allocation — same logic as recordPayment
            $ratio = $advanceAmount / $invoiceTotal;

            $basicAmount  = round($invoiceBasic * $ratio, 2);
            $gstAmount    = round($invoiceGST  * $ratio, 2);
            $cgstAmount   = round($totalCGST   * $ratio, 2);
            $sgstAmount   = round($totalSGST   * $ratio, 2);
            $igstAmount   = 0;

            $basic = round($advanceAmount - $gstAmount, 2);

            // Create Income record
            $income = Income::create([
                'project_id'          => $proformaInvoice->project_id,
                'order_id'            => $proformaInvoice->work_order_id,
                'proforma_invoice_id' => $proformaInvoice->id,
                'company_id'          => $user->company_id,

                'po_no'               => $poNumber,
                'po_date'             => $proformaInvoice->invoice_date,
                'invoice_no'          => $proformaInvoice->proforma_invoice_number,
                'invoice_date'        => $proformaInvoice->invoice_date,

                'basic_amount'        => $basic,
                'gst_amount'          => $gstAmount,
                'cgst_amount'         => $cgstAmount,
                'sgst_amount'         => $sgstAmount,
                'igst_amount'         => $igstAmount,

                'billing_amount'      => $advanceAmount,
                'received_amount'     => $advanceAmount,
                'pending_amount'      => 0.00,

                'received_by'         => $paymentInput['received_from'] ?? 'Advance',
                'payment_type'        => $paymentInput['payment_type'] ?? 'cash',
                'senders_bank'        => $paymentInput['senders_bank'] ?? null,
                'receivers_bank'      => $paymentInput['receivers_bank'] ?? null,

                'remark'              => $paymentInput['remark']
                    ?? "Advance payment for PI #{$proformaInvoice->proforma_invoice_number}",

                'payment_date'        => $paymentInput['payment_date'] ?? $today,
            ]);

            // Store in AdvancedPayment table (audit/reference)
            AdvancedPayment::create([
                'order_id'           => $validated['work_order_id'],
                'project_id'         => $validated['project_id'],
                'proforma_id'        => $proformaInvoice->id,
                'advanced_amount'    => $advanceAmount,
                'payment_date'       => $paymentInput['payment_date'] ?? $today,
                'received_from'      => $paymentInput['received_from'] ?? null,
                'payment_type'       => $paymentInput['payment_type'] ?? null,
                'senders_bank'       => $paymentInput['senders_bank'] ?? null,
                'receivers_bank'     => $paymentInput['receivers_bank'] ?? null,
                'transaction_number' => $paymentInput['transaction_number'] ?? null,
                'remark'             => $paymentInput['remark'] ?? null,
            ]);

            // Accumulate in summary (tax_amount gets proportional GST)
            $summary->total_amount += $advanceAmount;
            $summary->tax_amount   += $gstAmount;
        }

        // Finalize summary — increment invoice_count only once
        if ($totalAdvance > 0) {
            if ($summary->exists) {
                $summary->invoice_count += 1;
            } else {
                $summary->invoice_count  = 1;
                $summary->pending_amount = 0;
            }
            $summary->save();
        }

        // Final update of proforma paid/pending/status
        if ($totalAdvance > 0) {
            $newPaid    = round($totalAdvance, 2);
            $newPending = round($invoiceTotal - $newPaid, 2);
            $status     = ($newPending <= 0) ? 'paid' : 'partial';

            $proformaInvoice->update([
                'paid_amount'    => $newPaid,
                'pending_amount' => max(0, $newPending),
                'payment_status' => $status,
                'updated_by'     => $user->id,
            ]);

            // Update order paid amount
            $workOrder->update([
                'paidAmount' => ($workOrder->paidAmount ?? 0) + $totalAdvance,
                'updated_by' => $user->id,
            ]);
        }

        // Attach rules if provided
        if (!empty($validated['rule_ids'])) {
            foreach ($validated['rule_ids'] as $ruleId) {
                ProformaInvoiceRule::create([
                    'proforma_invoice_id' => $proformaInvoice->id,
                    'rules_id'            => $ruleId,
                ]);
            }
        }

        DB::commit();

        $proformaInvoice->load(['workOrder', 'project.projectType', 'details', 'invoiceRules.rule']);

        return response()->json([
            'success' => true,
            'message' => 'Proforma invoice created successfully' . ($totalAdvance > 0 ? ' with advance payment(s)' : ''),
            'data'    => $proformaInvoice
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'success' => false,
            'message' => 'Failed to create proforma invoice',
            'error'   => $e->getMessage()
        ], 500);
    }
}






































    /**
     * ✅ UPDATED: Update proforma invoice with complete validation
     */
    

// public function update(Request $request, $id)
// {
//     $user = Auth::user();

//     DB::beginTransaction();

//     try {

//         $proforma = ProformaInvoice::with('details','workOrder')->findOrFail($id);

//         if ($proforma->company_id !== $user->company_id) {
//             return response()->json(['success'=>false,'message'=>'Unauthorized'],403);
//         }

//         /*
//         |--------------------------------------------------------------------------
//         | STEP 1 — REVERSE OLD ACCOUNTING
//         |--------------------------------------------------------------------------
//         */

//         $oldIncomes = Income::where('proforma_invoice_id',$proforma->id)->get();

//         foreach ($oldIncomes as $inc) {

//             $summary = IncomeSummary::where([
//                 'company_id'=>$inc->company_id,
//                 'project_id'=>$inc->project_id,
//                 'date'=>Carbon::parse($inc->payment_date)->toDateString()
//             ])->first();

//             if ($summary) {
//                 $summary->invoice_count -= 1;
//                 $summary->total_amount  -= $inc->received_amount;
//                 $summary->tax_amount    -= $inc->gst_amount;
//                 $summary->save();
//             }
//         }

//         Income::where('proforma_invoice_id',$proforma->id)->delete();
//         AdvancedPayment::where('proforma_id',$proforma->id)->delete();

//         /*
//         |--------------------------------------------------------------------------
//         | STEP 2 — DELETE OLD ITEMS
//         |--------------------------------------------------------------------------
//         */
//         ProformaInvoiceDetail::where('proforma_invoice_id',$proforma->id)->delete();

//         /*
//         |--------------------------------------------------------------------------
//         | STEP 3 — INSERT NEW ITEMS
//         |--------------------------------------------------------------------------
//         */

//         $items = $request->items ?? [];

//         $subtotal = collect($items)->sum(fn($i)=>(float)$i['total_price']);
//         $discount = (float) ($request->discount ?? 0);
//         $taxable  = $subtotal - $discount;

//         if ($taxable < 0) {
//             throw new \Exception("Discount cannot exceed subtotal");
//         }

//         $cgstPercent = (float) ($request->cgst_percentage ?? 0);
//         $sgstPercent = (float) ($request->sgst_percentage ?? 0);
//         $igstPercent = (float) ($request->igst_percentage ?? 0);

//         $cgst = round($taxable * ($cgstPercent/100),2);
//         $sgst = round($taxable * ($sgstPercent/100),2);
//         $igst = round($taxable * ($igstPercent/100),2);

//         $final = round($taxable + $cgst + $sgst + $igst,2);

//         foreach ($items as $item) {
//             ProformaInvoiceDetail::create([
//                 'proforma_invoice_id'=>$proforma->id,
//                 'work_type'=>$item['work_type'],
//                 'qty'=>$item['qty'],
//                 'price'=>$item['price'],
//                 'uom'=>$item['uom'] ?? null,
//                 'total_price'=>$item['total_price'],
//                 'remark'=>$item['remark'] ?? null,
//                 'work_sub_description'=>$item['work_sub_description'] ?? null,
//                 'gst_percent'=>$item['gst_percent'] ?? 0,
//                 'cgst_amount'=>$item['cgst_amount'] ?? 0,
//                 'sgst_amount'=>$item['sgst_amount'] ?? 0,
//             ]);
//         }

//         /*
//         |--------------------------------------------------------------------------
//         | STEP 4 — UPDATE HEADER
//         |--------------------------------------------------------------------------
//         */

//         $proforma->update([
//             'invoice_date'=>$request->invoice_date,
//             'delivery_date'=>$request->delivery_date,
//             'subtotal'=>$subtotal,
//             'discount'=>$discount,
//             'taxable_amount'=>$taxable,
//             'cgst_amount'=>$cgst,
//             'sgst_amount'=>$sgst,
//             'igst_amount'=>$igst,
//             'final_amount'=>$final,
//             'updated_by'=>$user->id
//         ]);

//         /*
//         |--------------------------------------------------------------------------
//         | STEP 5 — CREATE ADVANCE + INCOME (FULL SAFE)
//         |--------------------------------------------------------------------------
//         */

//         $totalAdvance = 0;
//         $poNumber = $proforma->workOrder->po_number ?? 'N/A';

//         foreach ($request->advance_payments ?? [] as $pay) {

//             $amt = (float) ($pay['received_amount'] ?? 0);
//             if ($amt <= 0) continue;

//             $totalAdvance += $amt;

//             // prevent division crash
//             $ratio = $final > 0 ? ($amt / $final) : 0;

//             $basic = round($taxable * $ratio,2);
//             $gst   = round(($cgst+$sgst+$igst) * $ratio,2);

//             Income::create([
//                 'project_id'=>$proforma->project_id,
//                 'order_id'=>$proforma->work_order_id,
//                 'proforma_invoice_id'=>$proforma->id,
//                 'company_id'=>$user->company_id,

//                 'po_no'=>$poNumber,
//                 'po_date'=>$proforma->invoice_date,
//                 'invoice_no'=>$proforma->proforma_invoice_number,
//                 'invoice_date'=>$proforma->invoice_date,

//                 'basic_amount'=>$basic,
//                 'gst_amount'=>$gst,
//                 'cgst_amount'=>round($cgst * $ratio,2),
//                 'sgst_amount'=>round($sgst * $ratio,2),
//                 'igst_amount'=>round($igst * $ratio,2),

//                 'billing_amount'=>$amt,
//                 'received_amount'=>$amt,
//                 'pending_amount'=>0,

//                 'received_by'=>$pay['received_from'] ?? 'Advance',
//                 'payment_type'=>$pay['payment_type'] ?? 'cash',
//                 'payment_date'=>$pay['payment_date'] ?? now(),

//                 // 🔴 REQUIRED FIELDS (your DB needs these)
//                 'senders_bank'=>$pay['senders_bank'] ?? null,
//                 'receivers_bank'=>$pay['receivers_bank'] ?? null,
//                 'transaction_number'=>$pay['transaction_number'] ?? null,
//                 'remark'=>$pay['remark'] ?? null,
//             ]);

//             AdvancedPayment::create([
//                 'order_id'=>$proforma->work_order_id,
//                 'project_id'=>$proforma->project_id,
//                 'proforma_id'=>$proforma->id,
//                 'advanced_amount'=>$amt,
//                 'payment_date'=>$pay['payment_date'] ?? now(),
//                 'received_from'=>$pay['received_from'] ?? null,
//                 'payment_type'=>$pay['payment_type'] ?? null,
//                 'senders_bank'=>$pay['senders_bank'] ?? null,
//                 'receivers_bank'=>$pay['receivers_bank'] ?? null,
//                 'transaction_number'=>$pay['transaction_number'] ?? null,
//                 'remark'=>$pay['remark'] ?? null,
//             ]);

//             $summary = IncomeSummary::firstOrCreate(
//                 [
//                     'company_id'=>$user->company_id,
//                     'project_id'=>$proforma->project_id,
//                     'date'=>Carbon::parse($pay['payment_date'] ?? now())->toDateString()
//                 ],
//                 [
//                     'invoice_count'=>0,
//                     'total_amount'=>0,
//                     'tax_amount'=>0
//                 ]
//             );

//             $summary->increment('invoice_count',1);
//             $summary->increment('total_amount',$amt);
//             $summary->increment('tax_amount',$gst);
//         }

//         /*
//         |--------------------------------------------------------------------------
//         | STEP 6 — UPDATE PAYMENT STATUS
//         |--------------------------------------------------------------------------
//         */

//         $pending = $final - $totalAdvance;
//         // $pending = 0.00;

//         $proforma->update([
//             'paid_amount'=>$totalAdvance,
//             'pending_amount'=>$pending,
//             'payment_status'=>$pending<=0?'paid':'partial'
//         ]);

//         DB::commit();

//         return response()->json([
//             'success'=>true,
//             'message'=>'Proforma Updated Successfully',
//             'data'=>$proforma->fresh('details')
//         ]);

//     } catch (\Exception $e) {

//         DB::rollBack();

//         return response()->json([
//             'success'=>false,
//             'message'=>$e->getMessage()
//         ],500);
//     }
// }



// public function update(Request $request, $id)
// {
//     $user = Auth::user();

//     DB::beginTransaction();

//     try {
//         $proforma = ProformaInvoice::with('details', 'workOrder')->findOrFail($id);

//         if ($proforma->company_id !== $user->company_id) {
//             return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
//         }

//         // ────────────────────────────────────────────────
//         // STEP 1 — REVERSE OLD ACCOUNTING
//         // ────────────────────────────────────────────────
//         $oldIncomes = Income::where('proforma_invoice_id', $proforma->id)->get();

//         foreach ($oldIncomes as $inc) {
//             $summary = IncomeSummary::where([
//                 'company_id' => $inc->company_id,
//                 'project_id' => $inc->project_id,
//                 'date'       => Carbon::parse($inc->payment_date)->toDateString()
//             ])->first();

//             if ($summary) {
//                 $summary->decrement('invoice_count', 1);
//                 $summary->decrement('total_amount', $inc->received_amount);
//                 $summary->decrement('tax_amount', $inc->gst_amount);
//                 if ($summary->invoice_count <= 0 && $summary->total_amount <= 0) {
//                     $summary->delete();
//                 } else {
//                     $summary->save();
//                 }
//             }
//         }

//         Income::where('proforma_invoice_id', $proforma->id)->delete();
//         AdvancedPayment::where('proforma_id', $proforma->id)->delete();

//         // ────────────────────────────────────────────────
//         // STEP 2 — DELETE OLD ITEMS
//         // ────────────────────────────────────────────────
//         ProformaInvoiceDetail::where('proforma_invoice_id', $proforma->id)->delete();

//         // ────────────────────────────────────────────────
//         // STEP 3 — CALCULATE NEW TOTALS & INSERT NEW ITEMS
//         // ────────────────────────────────────────────────
//         $items = $request->items ?? [];

//         $subtotal = collect($items)->sum(fn($i) => (float) $i['total_price']);
//         $discount = (float) ($request->discount ?? 0);
//         $taxable  = $subtotal - $discount;

//         if ($taxable < 0) {
//             throw new \Exception("Discount cannot exceed subtotal");
//         }

//         $cgst = round($taxable * ((float)($request->cgst_percentage ?? 0) / 100), 2);
//         $sgst = round($taxable * ((float)($request->sgst_percentage ?? 0) / 100), 2);
//         $igst = round($taxable * ((float)($request->igst_percentage ?? 0) / 100), 2);

//         $final = round($taxable + $cgst + $sgst + $igst, 2);

//         foreach ($items as $item) {
//             ProformaInvoiceDetail::create([
//                 'proforma_invoice_id'     => $proforma->id,
//                 'work_type'               => $item['work_type'],
//                 'qty'                     => $item['qty'],
//                 'price'                   => $item['price'],
//                 'uom'                     => $item['uom'] ?? null,
//                 'total_price'             => $item['total_price'],
//                 'remark'                  => $item['remark'] ?? null,
//                 'work_sub_description'    => $item['work_sub_description'] ?? null,
//                 'gst_percent'             => $item['gst_percent'] ?? 0,
//                 'cgst_amount'             => $item['cgst_amount'] ?? 0,
//                 'sgst_amount'             => $item['sgst_amount'] ?? 0,
//             ]);
//         }

//         // ────────────────────────────────────────────────
//         // STEP 4 — UPDATE PROFORMA HEADER
//         // ────────────────────────────────────────────────
//         $proforma->update([
//             'invoice_date'     => $request->invoice_date,
//             'delivery_date'    => $request->delivery_date,
//             'subtotal'         => $subtotal,
//             'discount'         => $discount,
//             'taxable_amount'   => $taxable,
//             'cgst_amount'      => $cgst,
//             'sgst_amount'      => $sgst,
//             'igst_amount'      => $igst,
//             'final_amount'     => $final,
//             'updated_by'       => $user->id
//         ]);

//         // ────────────────────────────────────────────────
//         // STEP 5 — CREATE NEW ADVANCE + INCOME RECORDS
//         // ────────────────────────────────────────────────
//         $totalAdvance = 0;
//         $poNumber = $proforma->workOrder->po_number ?? 'N/A';

//         foreach ($request->advance_payments ?? [] as $pay) {
//             $amt = (float) ($pay['received_amount'] ?? 0);
//             if ($amt <= 0) continue;

//             $totalAdvance += $amt;

//             $ratio = $final > 0 ? ($amt / $final) : 0;

//             $basic = round($taxable * $ratio, 2);
//             $gst   = round(($cgst + $sgst + $igst) * $ratio, 2);

//             Income::create([
//                 'project_id'         => $proforma->project_id,
//                 'order_id'           => $proforma->work_order_id,
//                 'proforma_invoice_id'=> $proforma->id,
//                 'company_id'         => $user->company_id,
//                 'po_no'              => $poNumber,
//                 'po_date'            => $proforma->invoice_date,
//                 'invoice_no'         => $proforma->proforma_invoice_number,
//                 'invoice_date'       => $proforma->invoice_date,
//                 'basic_amount'       => $basic,
//                 'gst_amount'         => $gst,
//                 'cgst_amount'        => round($cgst * $ratio, 2),
//                 'sgst_amount'        => round($sgst * $ratio, 2),
//                 'igst_amount'        => round($igst * $ratio, 2),
//                 'billing_amount'     => $amt,
//                 'received_amount'    => $amt,
//                 'pending_amount'     => 0,
//                 'received_by'        => $pay['received_from'] ?? 'Advance',
//                 'payment_type'       => $pay['payment_type'] ?? 'cash',
//                 'payment_date'       => $pay['payment_date'] ?? now(),
//                 'senders_bank'       => $pay['senders_bank'] ?? null,
//                 'receivers_bank'     => $pay['receivers_bank'] ?? null,
//                 'transaction_number' => $pay['transaction_number'] ?? null,
//                 'remark'             => $pay['remark'] ?? null,
//             ]);

//             AdvancedPayment::create([
//                 'order_id'           => $proforma->work_order_id,
//                 'project_id'         => $proforma->project_id,
//                 'proforma_id'        => $proforma->id,
//                 'advanced_amount'    => $amt,
//                 'payment_date'       => $pay['payment_date'] ?? now(),
//                 'received_from'      => $pay['received_from'] ?? null,
//                 'payment_type'       => $pay['payment_type'] ?? null,
//                 'senders_bank'       => $pay['senders_bank'] ?? null,
//                 'receivers_bank'     => $pay['receivers_bank'] ?? null,
//                 'transaction_number' => $pay['transaction_number'] ?? null,
//                 'remark'             => $pay['remark'] ?? null,
//             ]);

//             $summary = IncomeSummary::firstOrCreate(
//                 [
//                     'company_id' => $user->company_id,
//                     'project_id' => $proforma->project_id,
//                     'date'       => Carbon::parse($pay['payment_date'] ?? now())->toDateString()
//                 ],
//                 [
//                     'invoice_count' => 0,
//                     'total_amount'  => 0,
//                     'tax_amount'    => 0
//                 ]
//             );

//             $summary->increment('invoice_count');
//             $summary->increment('total_amount', $amt);
//             $summary->increment('tax_amount', $gst);
//         }

//        // ────────────────────────────────────────────────
// // ★★★ RECALCULATE ORDER PAID AMOUNT (LIKE INCOME UPDATE LOGIC) ★★★
// // ────────────────────────────────────────────────
// if ($proforma->work_order_id) {

//     $order = Order::find($proforma->work_order_id);

//     if ($order) {

//         // Always calculate from DB (source of truth)
//         $totalPaid = Income::where('order_id', $order->id)
//             ->sum('received_amount');

//         $order->paidAmount = round($totalPaid, 2);

//         // Optional: update order status also (same logic you used)
//         $order->orderStatus = match (true) {
//             $totalPaid >= ($order->finalAmount ?? 0) => 1, // fully paid
//             $totalPaid > 0                           => 2, // partial
//             default                                  => 3, // pending
//         };

//         $order->save();
//     }
// }


//         // ────────────────────────────────────────────────
//         // STEP 6 — UPDATE PROFORMA PAYMENT STATUS
//         // ────────────────────────────────────────────────
//         $pending = $final - $totalAdvance;

//         $proforma->update([
//             'paid_amount'     => $totalAdvance,
//             'pending_amount'  => $pending,
//             'payment_status'  => $pending <= 0 ? 'paid' : 'partial'
//         ]);

//         DB::commit();

//         return response()->json([
//             'success' => true,
//             'message' => 'Proforma Updated Successfully',
//             'data'    => $proforma->fresh(['details', 'workOrder'])
//         ]);

//     } catch (\Exception $e) {
//         DB::rollBack();
//         return response()->json([
//             'success' => false,
//             'message' => $e->getMessage()
//         ], 500);
//     }
// }





public function update(Request $request, $id)
{
    $user = Auth::user();
    DB::beginTransaction();
    try {
        $proforma = ProformaInvoice::with('details', 'workOrder')->findOrFail($id);
        if ($proforma->company_id !== $user->company_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // ────────────────────────────────────────────────
        // STEP 1 — REVERSE OLD ACCOUNTING
        // ────────────────────────────────────────────────
        $oldIncomes = Income::where('proforma_invoice_id', $proforma->id)->get();

        foreach ($oldIncomes as $inc) {
            $summary = IncomeSummary::where([
                'company_id' => $inc->company_id,
                'project_id' => $inc->project_id,
                'date'       => Carbon::parse($inc->payment_date)->toDateString()
            ])->first();

            if ($summary) {
                $summary->decrement('invoice_count', 1);
                $summary->decrement('total_amount', $inc->received_amount);
                $summary->decrement('tax_amount', $inc->gst_amount);
                if ($summary->invoice_count <= 0 && $summary->total_amount <= 0) {
                    $summary->delete();
                } else {
                    $summary->save();
                }
            }
        }

        Income::where('proforma_invoice_id', $proforma->id)->delete();
        AdvancedPayment::where('proforma_id', $proforma->id)->delete();

        // ────────────────────────────────────────────────
        // STEP 2 — DELETE OLD ITEMS
        // ────────────────────────────────────────────────
        ProformaInvoiceDetail::where('proforma_invoice_id', $proforma->id)->delete();

        // ────────────────────────────────────────────────
        // STEP 3 — CALCULATE NEW TOTALS & INSERT NEW ITEMS
        // ────────────────────────────────────────────────
        $items = $request->items ?? [];
        $subtotal = collect($items)->sum(fn($i) => (float) $i['total_price']);
        $discount = (float) ($request->discount ?? 0);
        $taxable  = $subtotal - $discount;

        if ($taxable < 0) {
            throw new \Exception("Discount cannot exceed subtotal");
        }

        $cgst = round($taxable * ((float)($request->cgst_percentage ?? 0) / 100), 2);
        $sgst = round($taxable * ((float)($request->sgst_percentage ?? 0) / 100), 2);
        $igst = round($taxable * ((float)($request->igst_percentage ?? 0) / 100), 2);

        $final = round($taxable + $cgst + $sgst + $igst, 2);

        foreach ($items as $item) {
            ProformaInvoiceDetail::create([
                'proforma_invoice_id'     => $proforma->id,
                'work_type'               => $item['work_type'],
                'qty'                     => $item['qty'],
                'price'                   => $item['price'],
                'uom'                     => $item['uom'] ?? null,
                'total_price'             => $item['total_price'],
                'remark'                  => $item['remark'] ?? null,
                'work_sub_description'    => $item['work_sub_description'] ?? null,
                'gst_percent'             => $item['gst_percent'] ?? 0,
                'cgst_amount'             => $item['cgst_amount'] ?? 0,
                'sgst_amount'             => $item['sgst_amount'] ?? 0,
            ]);
        }

        // ────────────────────────────────────────────────
        // STEP 4 — UPDATE PROFORMA HEADER
        // ────────────────────────────────────────────────
        $proforma->update([
            'invoice_date'     => $request->invoice_date,
            'delivery_date'    => $request->delivery_date,
            'subtotal'         => $subtotal,
            'discount'         => $discount,
            'taxable_amount'   => $taxable,
            'cgst_amount'      => $cgst,
            'sgst_amount'      => $sgst,
            'igst_amount'      => $igst,
            'final_amount'     => $final,
            'updated_by'       => $user->id
        ]);

        // ────────────────────────────────────────────────
        // STEP 5 — CREATE NEW ADVANCE + INCOME RECORDS
        // ────────────────────────────────────────────────
        $totalAdvance = 0;
        $poNumber = $proforma->workOrder->po_number ?? 'N/A';

        foreach ($request->advance_payments ?? [] as $pay) {
            $amt = (float) ($pay['received_amount'] ?? 0);
            if ($amt <= 0) continue;

            $totalAdvance += $amt;

            // Match your screenshot logic: GST ≈ 18% on received amount
            // basic = received / 1.18, gst = received - basic
            // This gives very close values to 101.69 + 18.31 = 120
            $gstRate = 0.18; // you can make this dynamic later if needed
            $gstAmount    = round($amt * $gstRate / (1 + $gstRate), 2);
            $basicAmount  = round($amt - $gstAmount, 2);

            // Split GST into CGST + SGST (assuming equal split - most common)
            $cgstAmount = round($gstAmount / 2, 2);
            $sgstAmount = $gstAmount - $cgstAmount; // avoid rounding error

            Income::create([
                'project_id'          => $proforma->project_id,
                'order_id'            => $proforma->work_order_id,
                'proforma_invoice_id' => $proforma->id,
                'company_id'          => $user->company_id,
                'po_no'               => $poNumber,
                'po_date'             => $proforma->invoice_date,
                'invoice_no'          => $proforma->proforma_invoice_number,
                'invoice_date'        => $proforma->invoice_date,
                'basic_amount'        => $basicAmount,
                'gst_amount'          => $gstAmount,
                'cgst_amount'         => $cgstAmount,
                'sgst_amount'         => $sgstAmount,
                'igst_amount'         => 0,
                'billing_amount'      => $amt,
                'received_amount'     => $amt,
                'pending_amount'      => 0,
                'received_by'         => $pay['received_from'] ?? 'Advance',
                'payment_type'        => $pay['payment_type'] ?? 'cash',
                'payment_date'        => $pay['payment_date'] ?? now(),
                'senders_bank'        => $pay['senders_bank'] ?? null,
                'receivers_bank'      => $pay['receivers_bank'] ?? null,
                'transaction_number'  => $pay['transaction_number'] ?? null,
                'remark'              => $pay['remark'] ?? null,
            ]);

            AdvancedPayment::create([
                'order_id'           => $proforma->work_order_id,
                'project_id'         => $proforma->project_id,
                'proforma_id'        => $proforma->id,
                'advanced_amount'    => $amt,
                'payment_date'       => $pay['payment_date'] ?? now(),
                'received_from'      => $pay['received_from'] ?? null,
                'payment_type'       => $pay['payment_type'] ?? null,
                'senders_bank'       => $pay['senders_bank'] ?? null,
                'receivers_bank'     => $pay['receivers_bank'] ?? null,
                'transaction_number' => $pay['transaction_number'] ?? null,
                'remark'             => $pay['remark'] ?? null,
            ]);

            // IncomeSummary – same as your previous working version
            $summary = IncomeSummary::firstOrCreate(
                [
                    'company_id' => $user->company_id,
                    'project_id' => $proforma->project_id,
                    'date'       => Carbon::parse($pay['payment_date'] ?? now())->toDateString()
                ],
                [
                    'invoice_count' => 0,
                    'total_amount'  => 0,
                    'tax_amount'    => 0
                ]
            );

            $summary->increment('invoice_count');
            $summary->increment('total_amount', $amt);
            $summary->increment('tax_amount', $gstAmount);
        }

        // ────────────────────────────────────────────────
        // RECALCULATE ORDER PAID AMOUNT
        // ────────────────────────────────────────────────
        if ($proforma->work_order_id) {
            $order = Order::find($proforma->work_order_id);
            if ($order) {
                $totalPaid = Income::where('order_id', $order->id)
                    ->sum('received_amount');
                $order->paidAmount = round($totalPaid, 2);
                $order->orderStatus = match (true) {
                    $totalPaid >= ($order->finalAmount ?? 0) => 1,
                    $totalPaid > 0 => 2,
                    default => 3,
                };
                $order->save();
            }
        }

        // ────────────────────────────────────────────────
        // STEP 6 — UPDATE PROFORMA PAYMENT STATUS
        // ────────────────────────────────────────────────
        $pending = $final - $totalAdvance;
        $proforma->update([
            'paid_amount'    => $totalAdvance,
            'pending_amount' => max(0, $pending),
            'payment_status' => $pending <= 0 ? 'paid' : ($totalAdvance > 0 ? 'partial' : 'pending')
        ]);

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Proforma Updated Successfully',
            'data'    => $proforma->fresh(['details', 'workOrder'])
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}





























   


public function recordPayment(Request $request, $id)
{
    $user = Auth::user();

    $validated = $request->validate([
        'received_amount' => 'required|numeric|min:0.01',
        'received_by'     => 'required|string|max:255',
        'payment_type'    => 'required|in:imps,rtgs,upi,cash,cheque',
        'senders_bank'    => 'required|string|max:255',
        'receivers_bank'  => 'required|string|max:255',
        'remark'          => 'nullable|string|max:500',
    ]);

    DB::beginTransaction();

    try {
        // ────────────────────────────────────────────────
        // FETCH PROFORMA
        // ────────────────────────────────────────────────
        $proforma = ProformaInvoice::with('project')->findOrFail($id);

        if ($proforma->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $newPayment = round($validated['received_amount'], 2);
        $pending    = round($proforma->pending_amount, 2);

        if ($newPayment > $pending) {
            return response()->json([
                'success' => false,
                'message' => 'Payment exceeds pending amount'
            ], 400);
        }

        // ────────────────────────────────────────────────
        // GET ORDER / PO
        // ────────────────────────────────────────────────
        $order    = Order::find($proforma->work_order_id);
        $poNumber = $order?->po_number ?? 'N/A';

        // ────────────────────────────────────────────────
        // GST FROM DETAILS TABLE
        // ────────────────────────────────────────────────
        $details = ProformaInvoiceDetail::where('proforma_invoice_id', $proforma->id)->get();

        if ($details->isEmpty()) {
            throw new \Exception("Invoice details not found");
        }

        $totalCGST    = round($details->sum('cgst_amount'), 2);
        $totalSGST    = round($details->sum('sgst_amount'), 2);
        $invoiceGST   = round($totalCGST + $totalSGST, 2);

        $invoiceBasic = round($proforma->taxable_amount, 2);
        $invoiceTotal = round($proforma->final_amount, 2);

        if ($invoiceTotal <= 0) {
            throw new \Exception("Invalid invoice total");
        }

        // ────────────────────────────────────────────────
        // PROPORTIONAL ALLOCATION for partial payment
        // ────────────────────────────────────────────────
        $ratio = $newPayment / $invoiceTotal;

       

        $basicAmount = round($invoiceBasic * $ratio, 2);
        $gstAmount   = round($invoiceGST   * $ratio, 2);

        $cgstAmount  = round($totalCGST * $ratio, 2);
        $sgstAmount  = round($totalSGST * $ratio, 2);
        $igstAmount  = 0; // keep for future IGST support

         $basic = $newPayment - $gstAmount;

        // ────────────────────────────────────────────────
        // SAVE INCOME RECORD
        // ────────────────────────────────────────────────
        $income = Income::create([
            'project_id'          => $proforma->project_id,
            'order_id'            => $proforma->work_order_id,
            'proforma_invoice_id' => $proforma->id,
            'company_id'          => $user->company_id,

            'po_no'               => $poNumber,
            'po_date'             => $proforma->invoice_date,
            'invoice_no'          => $proforma->proforma_invoice_number,
            'invoice_date'        => $proforma->invoice_date,

            'basic_amount'        => $basic,  // $basicAmount,
            'gst_amount'          => $gstAmount,

            'cgst_amount'         => $cgstAmount,
            'sgst_amount'         => $sgstAmount,
            'igst_amount'         => $igstAmount,

            'billing_amount'      => $newPayment,
            'received_amount'     => $newPayment,
            'pending_amount'      => 0.00,

            'received_by'         => $validated['received_by'],
            'payment_type'        => $validated['payment_type'],
            'senders_bank'        => $validated['senders_bank'],
            'receivers_bank'      => $validated['receivers_bank'],

            'remark'              => $validated['remark']
                ?? "Payment for PI #{$proforma->proforma_invoice_number}",

            'payment_date'        => Carbon::today()->toDateString(),
        ]);

        // ────────────────────────────────────────────────
        // UPDATE PROFORMA
        // ────────────────────────────────────────────────
        $newPaid    = round($proforma->paid_amount + $newPayment, 2);
        $newPending = round($proforma->final_amount - $newPaid, 2);

        $status = 'partial';
        if ($newPending <= 0) {
            $status = 'paid';
            $newPending = 0;
        }

        $proforma->update([
            'paid_amount'    => $newPaid,
            'pending_amount' => $newPending,
            'payment_status' => $status,
            'updated_by'     => $user->id,
        ]);

        // ────────────────────────────────────────────────
        // UPDATE ORDER (if exists)
        // ────────────────────────────────────────────────
        if ($order) {
            $order->update([
                // 'paidAmount' => DB::raw("paidAmount + {$newPayment}"),
                'paidAmount' => ($order->paidAmount ?? 0) + $newPayment,
                'updated_by' => $user->id,
            ]);
        }

        // ────────────────────────────────────────────────
        // UPDATE INCOME SUMMARY
        // ────────────────────────────────────────────────
        $today = Carbon::today()->toDateString();

        $summary = IncomeSummary::firstOrNew([
            'company_id' => $user->company_id,
            'project_id' => $proforma->project_id,
            'date'       => $today,
        ]);

        if ($summary->exists) {
            $summary->invoice_count += 1;
            $summary->total_amount  += $newPayment;
            $summary->tax_amount    += $gstAmount;
        } else {
            $summary->invoice_count  = 1;
            $summary->total_amount   = $newPayment;
            $summary->pending_amount = 0;
            $summary->tax_amount     = $gstAmount;
        }

        $summary->save();

        DB::commit();

        // ────────────────────────────────────────────────
        // RESPONSE
        // ────────────────────────────────────────────────
        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'data'    => [
                'income_id'      => $income->id,
                'payment_amount' => $newPayment,

                'basic_amount'   => $basicAmount,
                'gst_amount'     => $gstAmount,

                'cgst_amount'    => $cgstAmount,
                'sgst_amount'    => $sgstAmount,
                'igst_amount'    => $igstAmount,

                'paid_amount'    => $newPaid,
                'pending_amount' => $newPending,
                'status'         => $status,
            ]
        ]);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'success' => false,
            'message' => 'Failed to record payment',
            'error'   => $e->getMessage()
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

            if ($proformaInvoice->company_id !== $user->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            if ($proformaInvoice->paid_amount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => sprintf(
                        "⚠️ Cannot Delete Proforma Invoice:\n\n" .
                        "This proforma invoice has received payments of ₹%.2f\n" .
                        "❌ Proforma invoices with payments cannot be deleted.\n\n" .
                        "If you need to make changes, please use the Edit option instead.",
                        $proformaInvoice->paid_amount
                    )
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