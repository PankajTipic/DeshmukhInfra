<?php

// namespace App\Http\Controllers;

// use App\Models\SubcontractVendor;
// use App\Models\SubcontractVendorPaymentLog;
// use App\Models\Operator;                    // ← Added
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\DB;

// class SubcontractVendorController extends Controller
// {
//     public function index(Request $request)
//     {
//         $query = SubcontractVendor::with(['project', 'operator', 'order']);   // Changed 'vendor' to 'operator'

//         if ($request->has('order_id')) {
//             $query->where('order_id', $request->order_id);
//         }

//         $data = $query->get();

//         return response()->json([
//             'success' => true,
//             'data' => $data
//         ]);
//     }

//     public function show($id)
//     {
//         $subcontract = SubcontractVendor::with(['project', 'operator', 'order'])   // Changed 'vendor' to 'operator'
//                         ->findOrFail($id);

//         return response()->json([
//             'success' => true,
//             'data' => $subcontract
//         ]);
//     }

//     public function payments($id)
//     {
//         $payments = SubcontractVendorPaymentLog::where('subcontract_vendor_id', $id)
//                     ->orderBy('payment_date', 'desc')
//                     ->orderBy('created_at', 'desc')
//                     ->get();

//         return response()->json([
//             'success' => true,
//             'data' => $payments
//         ]);
//     }

//     public function recordPayment(Request $request, $id)
//     {
//         $user = auth()->user();

//         $validated = $request->validate([
//             'amount'          => 'required|numeric|min:0.01',
//             'payment_type'    => 'required|string|max:50',
//             'paid_by'         => 'required|string|max:255',
//             'payment_date'    => 'required|date',
//             'description'     => 'nullable|string|max:500',
//         ]);

//         DB::beginTransaction();

//         try {
//             $subcontract = SubcontractVendor::findOrFail($id);

//             if ($subcontract->company_id !== $user->company_id) {
//                 return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
//             }

//             $paymentAmount = round($validated['amount'], 2);

//             if ($paymentAmount > $subcontract->pending_amount) {
//                 return response()->json([
//                     'success' => false,
//                     'message' => 'Payment exceeds pending amount'
//                 ], 400);
//             }

//             // Create Payment Log
//             $paymentLog = SubcontractVendorPaymentLog::create([
//                 'subcontract_vendor_id' => $subcontract->id,
//                 'payment_type'          => $validated['payment_type'],
//                 'paid_by'               => $validated['paid_by'],
//                 'amount'                => $paymentAmount,
//                 'payment_date'          => $validated['payment_date'],
//                 'description'           => $validated['description'] ?? 'Payment recorded',
//             ]);

//             // Update Subcontract Vendor
//             $newPaid = round($subcontract->paid_amount + $paymentAmount, 2);
//             $newPending = round($subcontract->total_amount - $newPaid, 2);

//             $subcontract->update([
//                 'paid_amount'    => $newPaid,
//                 'pending_amount' => max(0, $newPending),
//             ]);

//             DB::commit();

//             return response()->json([
//                 'success' => true,
//                 'message' => 'Payment recorded successfully',
//                 'data' => $paymentLog
//             ]);

//         } catch (\Exception $e) {
//             DB::rollBack();
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Failed to record payment',
//                 'error'   => $e->getMessage()
//             ], 500);
//         }
//     }
// }









namespace App\Http\Controllers;

use App\Models\SubcontractVendor;
use App\Models\SubcontractVendorPaymentLog;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;



class SubcontractVendorController extends Controller
{
    public function index(Request $request)
    {
        $query = SubcontractVendor::with(['project', 'operator', 'order']);

        if ($request->has('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        $data = $query->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function show($id)
    {
        $subcontract = SubcontractVendor::with(['project', 'operator', 'order'])
                        ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $subcontract
        ]);
    }

    public function payments($id)
    {
        $payments = SubcontractVendorPaymentLog::where('subcontract_vendor_id', $id)
                    ->orderBy('payment_date', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    // ==================== RECORD NEW PAYMENT ====================
    public function recordPayment(Request $request, $id)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'amount'          => 'required|numeric|min:0.01',
            'payment_type'    => 'required|string|max:50',
            'paid_by'         => 'required|string|max:255',
            'payment_date'    => 'required|date',
            'description'     => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            $subcontract = SubcontractVendor::findOrFail($id);

            if ($subcontract->company_id !== $user->company_id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $paymentAmount = round($validated['amount'], 2);

            if ($paymentAmount > $subcontract->pending_amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment exceeds pending amount'
                ], 400);
            }

            // Create Payment Log
            $paymentLog = SubcontractVendorPaymentLog::create([
                'subcontract_vendor_id' => $subcontract->id,
                'payment_type'          => $validated['payment_type'],
                'paid_by'               => $validated['paid_by'],
                'amount'                => $paymentAmount,
                'payment_date'          => $validated['payment_date'],
                'description'           => $validated['description'] ?? 'Payment recorded',
            ]);

            // Update Subcontract Vendor
            $newPaid = round($subcontract->paid_amount + $paymentAmount, 2);
            $newPending = round($subcontract->total_amount - $newPaid, 2);

            $subcontract->update([
                'paid_amount'    => $newPaid,
                'pending_amount' => max(0, $newPending),
            ]);

            // ✅ Update Order Table (paidAmount)
            if ($subcontract->order_id) {
                $order = Order::find($subcontract->order_id);
                if ($order) {
                    $order->update([
                        'paidAmount' => ($order->paidAmount ?? 0) + $paymentAmount,
                        'updated_by' => $user->id,
                        'updated_at' => now()
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully',
                'data' => $paymentLog
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to record payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== UPDATE EXISTING PAYMENT ====================
    // public function updatePayment(Request $request, $paymentId)
    // {
    //     $user = auth()->user();

    //     $validated = $request->validate([
    //         'amount'          => 'required|numeric|min:0.01',
    //         'payment_type'    => 'required|string|max:50',
    //         'paid_by'         => 'required|string|max:255',
    //         'payment_date'    => 'required|date',
    //         'description'     => 'nullable|string|max:500',
    //     ]);

    //     DB::beginTransaction();

    //     try {
    //         $payment = SubcontractVendorPaymentLog::findOrFail($paymentId);
    //         $subcontract = SubcontractVendor::findOrFail($payment->subcontract_vendor_id);

    //         if ($subcontract->company_id !== $user->company_id) {
    //             return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
    //         }

    //         $oldAmount = $payment->amount;
    //         $newAmount = round($validated['amount'], 2);
    //         $diff = $newAmount - $oldAmount;

    //         // Update Payment Log
    //         $payment->update([
    //             'amount'          => $newAmount,
    //             'payment_type'    => $validated['payment_type'],
    //             'paid_by'         => $validated['paid_by'],
    //             'payment_date'    => $validated['payment_date'],
    //             'description'     => $validated['description'],
    //         ]);

    //         // Update Subcontract Vendor
    //         $newPaid = round($subcontract->paid_amount + $diff, 2);
    //         $newPending = round($subcontract->total_amount - $newPaid, 2);

    //         $subcontract->update([
    //             'paid_amount'    => $newPaid,
    //             'pending_amount' => max(0, $newPending),
    //         ]);

    //         // ✅ Update Order Table (paidAmount)
    //         if ($subcontract->order_id) {
    //             $order = Order::find($subcontract->order_id);
    //             if ($order) {
    //                 $order->update([
    //                     'paidAmount' => round(($order->paidAmount ?? 0) + $diff, 2),
    //                     'updated_by' => $user->id,
    //                     'updated_at' => now()
    //                 ]);
    //             }
    //         }

    //         DB::commit();

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Payment updated successfully',
    //             'data' => $payment
    //         ]);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to update payment',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }


    public function updatePayment(Request $request, $paymentId)
{
    $user = auth()->user();

    $validated = $request->validate([
        'amount'          => 'required|numeric|min:0.01',
        'payment_type'    => 'required|string|max:50',
        'paid_by'         => 'required|string|max:255',
        'payment_date'    => 'required|date',
        'description'     => 'nullable|string|max:500',
    ]);

    DB::beginTransaction();

    try {
        $payment = SubcontractVendorPaymentLog::findOrFail($paymentId);
        $subcontract = SubcontractVendor::findOrFail($payment->subcontract_vendor_id);

        if ($subcontract->company_id !== $user->company_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $oldAmount = round($payment->amount, 2);
        $newAmount = round($validated['amount'], 2);
        $diff = $newAmount - $oldAmount;

        // ✅ NEW VALIDATION: Check if new total paid exceeds total_amount
        $newTotalPaid = round($subcontract->paid_amount + $diff, 2);

        if ($newTotalPaid > $subcontract->total_amount) {
            return response()->json([
                'success' => false,
                'message' => 'Payment update exceeds total subcontract amount'
            ], 400);
        }

        // Update Payment Log
        $payment->update([
            'amount'          => $newAmount,
            'payment_type'    => $validated['payment_type'],
            'paid_by'         => $validated['paid_by'],
            'payment_date'    => $validated['payment_date'],
            'description'     => $validated['description'],
        ]);

        // Update Subcontract Vendor
        $newPaid = round($subcontract->paid_amount + $diff, 2);
        $newPending = round($subcontract->total_amount - $newPaid, 2);

        $subcontract->update([
            'paid_amount'    => $newPaid,
            'pending_amount' => max(0, $newPending),
        ]);

        // ✅ Update Order Table (paidAmount)
        if ($subcontract->order_id) {
            $order = Order::find($subcontract->order_id);
            if ($order) {
                $order->update([
                    'paidAmount' => round(($order->paidAmount ?? 0) + $diff, 2),
                    'updated_by' => $user->id,
                    'updated_at' => now()
                ]);
            }
        }

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Payment updated successfully',
            'data' => $payment->fresh()
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Failed to update payment',
            'error' => $e->getMessage()
        ], 500);
    }
}



    public function subcontractLedgerReport(Request $request)
{
    try {

        $query = SubcontractVendor::with([
            'project',
           
            'order',
            'operator',
            'paymentLogs'
        ]);

        // Optional Filters
        if ($request->project_id) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->vendor_id) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->from_date && $request->to_date) {
            $query->whereHas('paymentLogs', function ($q) use ($request) {
                $q->whereBetween('payment_date', [
                    $request->from_date,
                    $request->to_date
                ]);
            });
        }

        $subcontracts = $query->latest()->get();

        $ledger = [];

        foreach ($subcontracts as $subcontract) {

            // Opening Entry
            $ledger[] = [
                'date'            => optional($subcontract->created_at)->format('d-m-Y'),
                'project_name'    => $subcontract->project->project_name ?? '-',
                'vendor_name'     => $subcontract->operator->name ?? '-',
                'invoice_no'      => $subcontract->order->invoice_number ?? '-',
                'type'            => 'Subcontract Created',
                'debit'           => $subcontract->total_amount,
                'credit'          => 0,
                'balance'         => $subcontract->pending_amount,
                'description'     => 'Initial subcontract amount',
            ];

            // Payment Entries
            foreach ($subcontract->paymentLogs as $payment) {

                $ledger[] = [
                    'date'            => optional($payment->payment_date)->format('d-m-Y'),
                    'project_name'    => $subcontract->project->project_name ?? '-',
                    'vendor_name'     => $subcontract->operator->name ?? '-',
                    'invoice_no'      => $subcontract->order->invoice_number ?? '-',
                    'type'            => 'Payment',
                    'debit'           => 0,
                    'credit'          => $payment->amount,
                    'balance'         => $subcontract->pending_amount,
                    'description'     => $payment->description,
                    'payment_type'    => $payment->payment_type,
                    'paid_by'         => $payment->paid_by,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Subcontract ledger report fetched successfully',
            'data'    => $ledger
        ]);

    } catch (\Exception $e) {

        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}



}