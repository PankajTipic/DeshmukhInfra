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
                'incomes'
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

            // ✅ STEP 1: Validate items against work order (quantity and amount per item)
            $itemValidationErrors = $this->validateProformaItemsAgainstWorkOrder(
                $validated['work_order_id'],
                $validated['items']
            );
            
            if (!empty($itemValidationErrors)) {
                // Format errors into a single readable message
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
            
            // ✅ Validate discount doesn't make taxable amount negative
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

            // ✅ STEP 2: Validate total amount including global GST
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
                'work_order_id' => $validated['work_order_id'],
                'project_id' => $validated['project_id'],
                'company_id' => $user->company_id,
                'proforma_invoice_number' => $proformaNumber,
                'tally_invoice_number' => $validated['tally_invoice_number'] ?? null,
                'invoice_date' => $validated['invoice_date'],
                'delivery_date' => $validated['delivery_date'] ?? null,
                'subtotal' => round($subtotal, 2),
                'discount' => round($discount, 2),
                'taxable_amount' => round($taxableAmount, 2),
                'gst_percentage' => $validated['gst_percentage'],
                'cgst_percentage' => $validated['cgst_percentage'],
                'sgst_percentage' => $validated['sgst_percentage'],
                'igst_percentage' => $validated['igst_percentage'],
                'gst_amount' => round($gstAmount, 2),
                'cgst_amount' => round($cgstAmount, 2),
                'sgst_amount' => round($sgstAmount, 2),
                'igst_amount' => round($igstAmount, 2),
                'final_amount' => round($finalAmount, 2),
                'paid_amount' => 0,
                'pending_amount' => round($finalAmount, 2),
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
                    'uom' => $item['uom'] ?? null,
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'total_price' => round($item['total_price'], 2),
                    'remark' => $item['remark'] ?? null,
                    'work_sub_description'  => $item['work_sub_description'] ?? null,
                    'gst_percent' => $item['gst_percent'] ?? 0,
                    'cgst_amount' => round($item['cgst_amount'] ?? 0, 2),
                    'sgst_amount' => round($item['sgst_amount'] ?? 0, 2),
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

            $proformaInvoice->load(['workOrder', 'project.projectType', 'details', 'invoiceRules.rule']);

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
     * ✅ UPDATED: Update proforma invoice with complete validation
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'tally_invoice_number' => 'nullable|string|max:255',
            'invoice_date' => 'sometimes|date',
            'delivery_date' => 'nullable|date',
            'items' => 'nullable|array',
            'items.*.work_type' => 'nullable|string',
            'items.*.uom' => 'nullable|string',
            'items.*.qty' => 'nullable|numeric|min:0',
            'items.*.price' => 'nullable|numeric|min:0',
            'items.*.total_price' => 'nullable|numeric|min:0',
            'items.*.remark' => 'nullable|string',
             'items.*.work_sub_description' => 'nullable|string',
            'items.*.gst_percent' => 'nullable|numeric|min:0',
            'items.*.cgst_amount' => 'nullable|numeric|min:0',
            'items.*.sgst_amount' => 'nullable|numeric|min:0',
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

            if ($proformaInvoice->company_id !== $user->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // ✅ STEP 1: Validate items if changed
            if (isset($validated['items'])) {
                $itemValidationErrors = $this->validateProformaItemsAgainstWorkOrder(
                    $proformaInvoice->work_order_id,
                    $validated['items'],
                    $id
                );
                
                if (!empty($itemValidationErrors)) {
                    // Format errors into a single readable message
                    $errorMessage = "❌ Item-wise Validation Failed:\n\n" . implode("\n\n", $itemValidationErrors);
                    
                    return response()->json([
                        'success' => false,
                        'message' => $errorMessage,
                        'errors' => $itemValidationErrors
                    ], 400);
                }
            }

            // Recalculate if items changed
            if (isset($validated['items'])) {
                $subtotal = collect($validated['items'])->sum('total_price');
                $discount = $validated['discount'] ?? $proformaInvoice->discount;
                $taxableAmount = $subtotal - $discount;
                
                // ✅ Validate discount
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
                
                $cgstPercentage = $validated['cgst_percentage'] ?? $proformaInvoice->cgst_percentage;
                $sgstPercentage = $validated['sgst_percentage'] ?? $proformaInvoice->sgst_percentage;
                $igstPercentage = $validated['igst_percentage'] ?? $proformaInvoice->igst_percentage;
                
                $cgstAmount = $taxableAmount * ($cgstPercentage / 100);
                $sgstAmount = $taxableAmount * ($sgstPercentage / 100);
                $igstAmount = $taxableAmount * ($igstPercentage / 100);
                $gstAmount = $cgstAmount + $sgstAmount + $igstAmount;
                
                $finalAmount = $taxableAmount + $gstAmount;
                $pendingAmount = $finalAmount - $proformaInvoice->paid_amount;

                // ✅ STEP 2: Validate total amount
                $workOrder = Order::findOrFail($proformaInvoice->work_order_id);
                $totalValidation = $this->validateTotalProformaAmount($workOrder, $finalAmount, $id);
                
                if (!$totalValidation['valid']) {
                    return response()->json([
                        'success' => false,
                        'message' => $totalValidation['message'],
                        'data' => $totalValidation['data']
                    ], 400);
                }

                $validated = array_merge($validated, [
                    'subtotal' => round($subtotal, 2),
                    'taxable_amount' => round($taxableAmount, 2),
                    'gst_amount' => round($gstAmount, 2),
                    'cgst_amount' => round($cgstAmount, 2),
                    'sgst_amount' => round($sgstAmount, 2),
                    'igst_amount' => round($igstAmount, 2),
                    'final_amount' => round($finalAmount, 2),
                    'pending_amount' => round($pendingAmount, 2),
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
                        'uom' => $item['uom'] ?? null,
                        'qty' => $item['qty'],
                        'price' => $item['price'],
                        'total_price' => round($item['total_price'], 2),
                        'remark' => $item['remark'] ?? null,
                        'work_sub_description' => $item['work_sub_description'] ?? null,
                        'gst_percent' => $item['gst_percent'] ?? 0,
                        'cgst_amount' => round($item['cgst_amount'] ?? 0, 2),
                        'sgst_amount' => round($item['sgst_amount'] ?? 0, 2),
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

  

// public function recordPayment(Request $request, $id)
// {
//     $user = Auth::user();

//     $validated = $request->validate([
//         'received_amount' => 'required|numeric|min:0.01',
//         'received_by'     => 'required|string|max:255',
//         'payment_type'    => 'required|in:imps,rtgs,upi,cash,cheque',
//         'senders_bank'    => 'required|string|max:255',
//         'receivers_bank'  => 'required|string|max:255',
//         'remark'          => 'nullable|string|max:500',
//     ]);

//     DB::beginTransaction();

//     try {
//         $proformaInvoice = ProformaInvoice::with('project')->findOrFail($id);

//         if ($proformaInvoice->company_id !== $user->company_id) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Unauthorized access'
//             ], 403);
//         }

//         $newPayment = round($validated['received_amount'], 2);
//         $remainingAmount = round($proformaInvoice->pending_amount, 2);

//         if ($newPayment > $remainingAmount) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Payment amount exceeds pending amount'
//             ], 400);
//         }

//         $order = Order::find($proformaInvoice->work_order_id);
//         $poNumber = $order ? $order->po_number : null;

//         /* ===========================
//            GST CALCULATION (UNCHANGED)
//         ============================*/
//         $basicAmount = round($newPayment / 1.18, 2);
//         $gstAmount   = round($newPayment - $basicAmount, 2);

//         /* ===========================
//            INCOME TABLE (NO CHANGE)
//         ============================*/
//         $income = Income::create([
//             'project_id'          => $proformaInvoice->project_id,
//             'order_id'            => $proformaInvoice->work_order_id,
//             'proforma_invoice_id' => $proformaInvoice->id,
//             'company_id'          => $user->company_id,
//             'po_no'               => $poNumber ?? 'N/A',
//             'po_date'             => $proformaInvoice->invoice_date,
//             'invoice_no'          => $proformaInvoice->proforma_invoice_number,
//             'invoice_date'        => $proformaInvoice->invoice_date,
//             'basic_amount'        => $basicAmount,
//             'gst_amount'          => $gstAmount,
//             'billing_amount'      => $newPayment,
//             'received_amount'     => $newPayment,
//             'pending_amount'      => 0.00,
//             'received_by'         => $validated['received_by'],
//             'payment_type'        => $validated['payment_type'],
//             'senders_bank'        => $validated['senders_bank'],
//             'receivers_bank'      => $validated['receivers_bank'],
//             'remark'              => $validated['remark'] ?? "Payment for PI #{$proformaInvoice->proforma_invoice_number}",
//             'payment_date'        => Carbon::today()->toDateString(),
//         ]);

//         /* ===========================
//            PROFORMA UPDATE
//         ============================*/
//         $newPaidAmount = round($proformaInvoice->paid_amount + $newPayment, 2);
//         $newPendingAmount = round($proformaInvoice->final_amount - $newPaidAmount, 2);

//         $paymentStatus = 'partial';
//         if ($newPendingAmount <= 0) {
//             $paymentStatus = 'paid';
//         }

//         $proformaInvoice->update([
//             'paid_amount'    => $newPaidAmount,
//             'pending_amount' => $newPendingAmount,
//             'payment_status' => $paymentStatus,
//             'updated_by'     => $user->id,
//         ]);

//         if ($order) {
//             $order->update([
//                 'paidAmount' => DB::raw("paidAmount + {$newPayment}"),
//                 'updated_by' => $user->id,
//             ]);
//         }

//         /* ===========================
//            INCOME SUMMARY
//            ✅ ONLY TAX_AMOUNT FIX
//         ============================*/
//         $today = Carbon::today()->toDateString();

//         $incomeSummary = IncomeSummary::firstOrNew([
//             'company_id' => $user->company_id,
//             'project_id' => $proformaInvoice->project_id,
//             'date'       => $today,
//         ]);

//         if ($incomeSummary->exists) {
//             $incomeSummary->invoice_count += 1;
//             $incomeSummary->total_amount  += $newPayment;
//             $incomeSummary->tax_amount    += $gstAmount;   // ✅ FIXED
//         } else {
//             $incomeSummary->invoice_count = 1;
//             $incomeSummary->total_amount  = $newPayment;
//             $incomeSummary->pending_amount = 0;
//             $incomeSummary->tax_amount    = $gstAmount;    // ✅ FIXED
//         }

//         $incomeSummary->save();

//         DB::commit();

//         return response()->json([
//             'success' => true,
//             'message' => 'Payment recorded successfully',
//             'data' => [
//                 'income_id'          => $income->id,
//                 'payment_amount'     => $newPayment,
//                 'gst_amount'         => $gstAmount,
//                 'paid_amount'        => $newPaidAmount,
//                 'pending_amount'     => $newPendingAmount,
//                 'payment_status'     => $paymentStatus,
//             ]
//         ]);

//     } catch (\Exception $e) {
//         DB::rollBack();
//         return response()->json([
//             'success' => false,
//             'message' => 'Failed to record payment',
//             'error'   => $e->getMessage()
//         ], 500);
//     }
// }


// public function recordPayment(Request $request, $id)
// {
//     $user = Auth::user();

//     $validated = $request->validate([
//         'received_amount' => 'required|numeric|min:0.01',
//         'received_by'     => 'required|string|max:255',
//         'payment_type'    => 'required|in:imps,rtgs,upi,cash,cheque',
//         'senders_bank'    => 'required|string|max:255',
//         'receivers_bank'  => 'required|string|max:255',
//         'remark'          => 'nullable|string|max:500',
//     ]);

//     DB::beginTransaction();

//     try {

//         /* ===========================
//            FETCH PROFORMA
//         ============================*/
//         $proforma = ProformaInvoice::with('project')->findOrFail($id);

//         if ($proforma->company_id !== $user->company_id) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Unauthorized access'
//             ], 403);
//         }

//         $newPayment = round($validated['received_amount'], 2);
//         $pending    = round($proforma->pending_amount, 2);

//         if ($newPayment > $pending) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Payment exceeds pending amount'
//             ], 400);
//         }


//         /* ===========================
//            GET ORDER / PO
//         ============================*/
//         $order = Order::find($proforma->work_order_id);
//         $poNumber = $order?->po_number ?? 'N/A';


//         /* ===========================
//            ✅ GST FROM DETAILS TABLE
//         ============================*/

//         $details = ProformaInvoiceDetail::where('proforma_invoice_id', $proforma->id)->get();

//         if ($details->isEmpty()) {
//             throw new \Exception("Invoice details not found");
//         }

//         // Sum GST from items
//         $totalCGST = round($details->sum('cgst_amount'), 2);
//         $totalSGST = round($details->sum('sgst_amount'), 2);

//         $invoiceGST = round($totalCGST + $totalSGST, 2);

//         // Basic & Total
//         $invoiceBasic = $proforma->taxable_amount;
//         $invoiceTotal = $proforma->final_amount;

//         if ($invoiceTotal <= 0) {
//             throw new \Exception("Invalid invoice total");
//         }


//         /* ===========================
//            PROPORTIONAL CALCULATION
//         ============================*/

//         $ratio = $newPayment / $invoiceTotal;

//         $basicAmount = round($invoiceBasic * $ratio, 2);
//         $gstAmount   = round($invoiceGST * $ratio, 2);

//         $cgstAmount  = round($totalCGST * $ratio, 2);
//         $sgstAmount  = round($totalSGST * $ratio, 2);

//         // Future ready (IGST)
//         $igstAmount = 0;


//         /* ===========================
//            SAVE INCOME
//         ============================*/

//         $income = Income::create([

//             'project_id'          => $proforma->project_id,
//             'order_id'            => $proforma->work_order_id,
//             'proforma_invoice_id' => $proforma->id,

//             'company_id'          => $user->company_id,

//             'po_no'               => $poNumber,
//             'po_date'             => $proforma->invoice_date,

//             'invoice_no'          => $proforma->proforma_invoice_number,
//             'invoice_date'        => $proforma->invoice_date,

//             'basic_amount'        => $basicAmount,
//             'gst_amount'          => $gstAmount,

//             'cgst_amount'         => $cgstAmount,
//             'sgst_amount'         => $sgstAmount,
//             'igst_amount'         => $igstAmount,

//             'billing_amount'      => $newPayment,
//             'received_amount'     => $newPayment,
//             'pending_amount'      => 0,

//             'received_by'         => $validated['received_by'],
//             'payment_type'        => $validated['payment_type'],

//             'senders_bank'        => $validated['senders_bank'],
//             'receivers_bank'      => $validated['receivers_bank'],

//             'remark'              => $validated['remark']
//                 ?? "Payment for PI #{$proforma->proforma_invoice_number}",

//             'payment_date'        => Carbon::today()->toDateString(),
//         ]);


//         /* ===========================
//            UPDATE PROFORMA
//         ============================*/

//         $newPaid    = round($proforma->paid_amount + $newPayment, 2);
//         $newPending = round($proforma->final_amount - $newPaid, 2);

//         $status = 'partial';

//         if ($newPending <= 0) {
//             $status = 'paid';
//             $newPending = 0;
//         }

//         $proforma->update([

//             'paid_amount'    => $newPaid,
//             'pending_amount' => $newPending,
//             'payment_status' => $status,
//             'updated_by'     => $user->id,
//         ]);


//         /* ===========================
//            UPDATE ORDER
//         ============================*/

//         if ($order) {
//             $order->update([
//                 'paidAmount' => DB::raw("paidAmount + {$newPayment}"),
//                 'updated_by' => $user->id,
//             ]);
//         }


//         /* ===========================
//            UPDATE INCOME SUMMARY
//         ============================*/

//         $today = Carbon::today()->toDateString();

//         $summary = IncomeSummary::firstOrNew([

//             'company_id' => $user->company_id,
//             'project_id' => $proforma->project_id,
//             'date'       => $today,
//         ]);

//         if ($summary->exists) {

//             $summary->invoice_count += 1;
//             $summary->total_amount  += $newPayment;
//             $summary->tax_amount    += $gstAmount;

//         } else {

//             $summary->invoice_count  = 1;
//             $summary->total_amount   = $newPayment;
//             $summary->pending_amount = 0;
//             $summary->tax_amount     = $gstAmount;
//         }

//         $summary->save();


//         DB::commit();


//         /* ===========================
//            RESPONSE
//         ============================*/

//         return response()->json([

//             'success' => true,
//             'message' => 'Payment recorded successfully',

//             'data' => [

//                 'income_id'      => $income->id,

//                 'payment_amount' => $newPayment,

//                 'basic_amount'   => $basicAmount,
//                 'gst_amount'     => $gstAmount,

//                 'cgst_amount'    => $cgstAmount,
//                 'sgst_amount'    => $sgstAmount,
//                 'igst_amount'    => $igstAmount,

//                 'paid_amount'    => $newPaid,
//                 'pending_amount' => $newPending,

//                 'status'         => $status,
//             ]
//         ]);


//     } catch (\Exception $e) {

//         DB::rollBack();

//         return response()->json([

//             'success' => false,
//             'message' => 'Failed to record payment',

//             'error'   => $e->getMessage()

//         ], 500);
//     }
// }    


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
                'paidAmount' => DB::raw("paidAmount + {$newPayment}"),
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