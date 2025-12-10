<?php


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PurchesVendorModel;
use App\Models\Operator;
use App\Models\Project;
use App\Models\PurchesVendorPayment;
use App\Models\PurchesVendorPaymentLog;
use App\Helpers\ImageCompressor;

class PurchesVendorController extends Controller
{

/*-----------------------------------------
| 1️⃣ STORE PURCHASE VENDOR + PAYMENT MASTER
------------------------------------------*/
public function store(Request $request)
{
    $user = auth()->user();

    // Validate input
    $validated = $request->validate([
        'project_id'      => 'required|numeric',
        'vendor_id'       => 'required|numeric',
        'material_name'   => 'required|string|max:255',
        'about'           => 'nullable|string|max:255',
        'price_per_unit'  => 'required|numeric',
        'qty'             => 'required|numeric',
        'total'           => 'required|numeric',
        'date'            => 'required|date',

                // NEW GST FIELDS
        'gst_included'    => 'required|boolean',
        'gst_percent'     => 'nullable|numeric|min:0',
        'cgst_percent'    => 'nullable|numeric|min:0',
        'sgst_percent'    => 'nullable|numeric|min:0',

    ]);

    $validated['company_id'] = $user->company_id ?? null;
    $validated['created_by'] = $user->id ?? null;

    // 1️⃣ Create purchase vendor entry
    $purchaseVendor = PurchesVendorModel::create($validated);

    // 2️⃣ Create payment master entry
    $payment = PurchesVendorPayment::create([
        'purches_vendor_id' => $purchaseVendor->id,
        'amount'            => $validated['total'],  // total = amount
        'paid_amount'       => 0,                    // no payment at creation
        'balance_amount'    => $validated['total'],  // full amount pending
    ]);

    return response()->json([
        'message'          => 'Purchase vendor and payment stored successfully.',
        'purchase_vendor'  => $purchaseVendor,
        'payment'          => $payment
    ], 201);
}


/*-----------------------------------------
| 2️⃣ ADD PAYMENT LOG + UPDATE MASTER TABLE
------------------------------------------*/
// public function addVendorPayment(Request $request)
// {
//     // Validate request
//     $validated = $request->validate([
//         'purches_vendor_id' => 'required|numeric',
//         'paid_by'           => 'required|string',
//         'payment_type'      => 'required|string',
//         'amount'            => 'required|numeric',
//         'payment_date'      => 'required|date',
//         'description'       => 'nullable|string',
//     ]);

//     // 1️⃣ Get payment master entry
//     $payment = PurchesVendorPayment::where('purches_vendor_id', $validated['purches_vendor_id'])->first();

//     if (!$payment) {
//         return response()->json([
//             'message' => 'Payment record not found for this vendor.'
//         ], 404);
//     }

//     // 2️⃣ Check if already fully paid
//     if ($payment->balance_amount <= 0) {
//         return response()->json([
//             'message' => 'Payment already completed. No more payments allowed.',
//         ], 400);
//     }

//     // 3️⃣ Do not allow payment more than remaining balance
//     if ($validated['amount'] > $payment->balance_amount) {
//         return response()->json([
//             'message' => 'Payment amount is greater than remaining balance.',
//             'remaining_balance' => $payment->balance_amount
//         ], 400);
//     }

//     // 4️⃣ Insert payment log
//     $paymentLog = PurchesVendorPaymentLog::create([
//         'purches_vendor_id'         => $validated['purches_vendor_id'],
//         'purches_vendor_payment_id' => $payment->id,
//         'paid_by'                   => $validated['paid_by'],
//         'payment_type'              => $validated['payment_type'],
//         'amount'                    => $validated['amount'],
//         'payment_date'              => $validated['payment_date'],
//         'description'               => $validated['description'],
//     ]);

//     // 5️⃣ Update payment master
//     $payment->paid_amount += $validated['amount'];
//     $payment->balance_amount = $payment->amount - $payment->paid_amount;
//     $payment->save();

//     return response()->json([
//         'message'      => 'Payment added successfully.',
//         'payment'      => $payment,
//         'payment_log'  => $paymentLog
//     ], 201);
// }


public function addVendorPayment(Request $request)
{
    // 1️⃣ Validate request
    $validated = $request->validate([
        'purches_vendor_id' => 'required|numeric',
        'paid_by'           => 'required|string',
        'payment_type'      => 'required|string',
        'amount'            => 'required|numeric|min:0.01',
        'payment_date'      => 'required|date',
        'description'       => 'nullable|string',
        'remark'            => 'nullable|string',
        'payment_file'      => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',


        'bank_name'        => 'nullable|string|max:255',
        'acc_number'       => 'nullable|string|max:255',
        'ifsc'             => 'nullable|string|max:50',
        'transaction_id'   => 'nullable|string|max:255',


    ]);

    // 2️⃣ Get master payment entry
    $payment = PurchesVendorPayment::where('purches_vendor_id', $validated['purches_vendor_id'])->first();

    if (!$payment) {
        return response()->json([
            'message' => 'Payment record not found for this vendor.'
        ], 404);
    }

    // 3️⃣ Check if already fully paid
    if ($payment->balance_amount <= 0) {
        return response()->json([
            'message' => 'Payment already completed. No more payments allowed.'
        ], 400);
    }

    // 4️⃣ Check overpayment
    if ($validated['amount'] > $payment->balance_amount) {
        return response()->json([
            'message' => 'Payment amount is greater than remaining balance.',
            'remaining_balance' => $payment->balance_amount
        ], 400);
    }



    // 5️⃣ File upload using ImageCompressor
    $uploadedFilePath = null;

    if ($request->hasFile('payment_file')) {
        $uploadedFilePath = ImageCompressor::compressAndSave(
            $request->file('payment_file'),
            'vendor-payments', // folder inside /img/
            1024               // max size KB
        );
    }





   


    // 6️⃣ Create payment log entry
    $paymentLog = PurchesVendorPaymentLog::create([
        'purches_vendor_id'         => $validated['purches_vendor_id'],
        'purches_vendor_payment_id' => $payment->id,
        'paid_by'                   => $validated['paid_by'],
        'payment_type'              => $validated['payment_type'],
        'amount'                    => $validated['amount'],
        'payment_date'              => $validated['payment_date'],
        'description'               => $validated['description'] ?? null,
        'remark'                    => $validated['remark'] ?? null,
        'payment_file'              => $uploadedFilePath,


        'bank_name'                 => $validated['bank_name'],
        'acc_number'                => $validated['acc_number'],
        'ifsc'                      => $validated['ifsc'],
        'transaction_id'            => $validated['transaction_id'],
    ]);

    // 7️⃣ Update master payment table
    $payment->paid_amount += $validated['amount'];
    $payment->balance_amount = $payment->amount - $payment->paid_amount;
    $payment->save();

    // 8️⃣ Response
    return response()->json([
        'message'      => 'Payment added successfully.',
        'payment'      => $payment->fresh(),
        'payment_log'  => $paymentLog
    ], 201);
}





/*-----------------------------------------
| FETCH ALL 
------------------------------------------*/
public function index(Request $request)
{
    $operatorVendorIds = Operator::pluck('id');
    $projectDetailsIds = Project::pluck('id');

    $data = PurchesVendorModel::with(['vendor', 'project'])
        ->whereIn('vendor_id', $operatorVendorIds)
        ->whereIn('project_id', $projectDetailsIds)
        ->get();

    return response()->json([
        'message' => 'Purchase vendor data fetched successfully.',
        'data'    => $data
    ], 200);
}


/*-----------------------------------------
| SHOW SINGLE RECORD                        
------------------------------------------*/
public function show($id)
{
    $data = PurchesVendorModel::with(['vendor', 'project'])->find($id);

    if (!$data) {
        return response()->json([
            'message' => 'Purchase vendor not found.',
        ], 404);
    }

    return response()->json([
        'message' => 'Record fetched successfully',
        'data'    => $data
    ], 200);
}








public function updateVendorPayment(Request $request, $log_id)
{
    // Validate input
    $validated = $request->validate([
        'paid_by'      => 'required|string',
        'payment_type' => 'required|string',
        'amount'       => 'required|numeric',
        'payment_date' => 'required|date',
        'description'  => 'nullable|string',
    ]);

    // 1️⃣ Find log entry
    $log = PurchesVendorPaymentLog::find($log_id);

    if (!$log) {
        return response()->json([
            'message' => 'Payment log not found'
        ], 404);
    }

    // 2️⃣ Find master payment
    $payment = PurchesVendorPayment::find($log->purches_vendor_payment_id);

    if (!$payment) {
        return response()->json([
            'message' => 'Payment master record not found'
        ], 404);
    }

    // 3️⃣ Calculate difference
    $oldAmount = $log->amount;               // previous amount
    $newAmount = $validated['amount'];       // updated amount
    $difference = $newAmount - $oldAmount;   // positive OR negative

    // 4️⃣ Check if new amount exceeds balance
    if ($difference > 0 && $difference > $payment->balance_amount) {
        return response()->json([
            'message' => 'Updated amount exceeds remaining balance.',
            'remaining_balance' => $payment->balance_amount
        ], 400);
    }

    // 5️⃣ Update LOG table
    $log->update([
        'paid_by'      => $validated['paid_by'],
        'payment_type' => $validated['payment_type'],
        'amount'       => $validated['amount'],
        'payment_date' => $validated['payment_date'],
        'description'  => $validated['description'],
    ]);

    // 6️⃣ Update PAYMENT master
    $payment->paid_amount += $difference;                      // increase or decrease
    $payment->balance_amount = $payment->amount - $payment->paid_amount;
    $payment->save();

    return response()->json([
        'message' => 'Payment updated successfully.',
        'payment' => $payment,
        'payment_log' => $log
    ], 200);
}






// public function getVendorPaymentDetails($purches_vendor_id)
// {

    

//     // 1️⃣ Find Payment Master
//     $payment = PurchesVendorPayment::where('purches_vendor_id', $purches_vendor_id)->first();

//     if (!$payment) {
//         return response()->json([
//             'message' => 'No payment record found for this vendor.'
//         ], 404);
//     }

//     // 2️⃣ Get all logs
//     $logs = PurchesVendorPaymentLog::where('purches_vendor_id', $purches_vendor_id)
//         ->orderBy('payment_date', 'DESC')
//         ->get();

//     // 3️⃣ Prepare Response
//     return response()->json([
//         'message' => 'Vendor payment details fetched successfully.',
//         'payment_master' => [
//             'id' => $payment->id,
//             'purches_vendor_id' => $payment->purches_vendor_id,
//             'total_amount' => $payment->amount,
//             'paid_amount' => $payment->paid_amount,
//             'balance_amount' => $payment->balance_amount,
//         ],
//         'payment_logs' => $logs
//     ], 200);
// }

public function getVendorPaymentDetails($purches_vendor_id)
{
    // Load purchase + vendor + project
    $payment = PurchesVendorPayment::with(['purchase.vendor', 'purchase.project'])
        ->where('purches_vendor_id', $purches_vendor_id)
        ->first();

    if (!$payment) {
        return response()->json([
            'message' => 'No payment record found for this vendor.'
        ], 404);
    }

    // Load logs
    $logs = PurchesVendorPaymentLog::where('purches_vendor_id', $purches_vendor_id)
        ->orderBy('payment_date', 'DESC')
        ->get();

    $vendor = $payment->purchase->vendor ?? null; 
    $project = $payment->purchase->project ?? null;
     $purchase = $payment->purchase ?? null;

    return response()->json([
        'message' => 'Vendor payment details fetched successfully.',

        'vendor_details' => [
            'vendor_id'      => $vendor->id ?? null,
            'vendor_name'    => $vendor->name ?? null,
            'vendor_phone'   => $vendor->mobile ?? null,
            'vendor_address' => $vendor->address ?? null,

            // ⭐ PROJECT DETAILS
            'project' => $project ? [
                'project_id' => $project->id,
                'project_name' => $project->project_name ?? null,
                'location' => $project->location ?? null,
                'start_date' => $project->start_date ?? null,
            ] : null,

              'material_name' => $purchase->material_name ?? null,
        ],

        'payment_master' => [
            'id' => $payment->id,
            'purches_vendor_id' => $payment->purches_vendor_id,
            'total_amount' => $payment->amount,
            'paid_amount' => $payment->paid_amount,
            'balance_amount' => $payment->balance_amount,
        ],

        'payment_logs' => $logs
    ], 200);
}





// public function getPurchesVedorPayment(Request $request)
// {



//     $project_id = $request->project_id;

//     // Validate project_id
//     if (!$project_id) {
//         return response()->json([
//             'success' => false,
//             'message' => 'project_id is required'
//         ], 400);
//     }

//     // Fetch all payments with logs + filter by project_id
//     $payments = PurchesVendorPayment::with(['logs', 'purchase'])
//         ->whereHas('purchase', function ($query) use ($project_id) {
//             $query->where('project_id', $project_id);
//         })
//         ->get();

//     return response()->json([
//         'success' => true,
//         'data' => $payments,
//     ]);
// }

public function getPurchesVedorPayment(Request $request)
{
    $project_id = $request->project_id;

    if (!$project_id) {
        return response()->json([
            'success' => false,
            'message' => 'project_id is required'
        ], 400);
    }

    $payments = PurchesVendorPayment::with(['logs', 'purchase.vendor'])
        ->whereHas('purchase', function ($query) use ($project_id) {
            $query->where('project_id', $project_id);
        })
        ->get();

    return response()->json([
        'success' => true,
        'data' => $payments,
    ]);
}







public function updatePurchesVendorPayment(Request $request)
{
    // 1️⃣ Validate request
    $validated = $request->validate([
        'payment_id'       => 'required|numeric',
        'price_per_unit'   => 'required|numeric',
        'qty'              => 'required|numeric',
        'material_name'    => 'required|string|max:255',
        'about'            => 'nullable|string|max:255',
        'date'             => 'required|date',
        'vendor_id'        => 'required|numeric',
        'project_id'       => 'required|numeric',

         // GST Fields Added
        'gst_included'     => 'required|boolean',
        'gst_percent'      => 'nullable|numeric|min:0',
        'cgst_percent'     => 'nullable|numeric|min:0',
        'sgst_percent'     => 'nullable|numeric|min:0',
    ]);

    // 2️⃣ Fetch payment record
    $payment = PurchesVendorPayment::find($request->payment_id);

    if (!$payment) {
        return response()->json([
            'success' => false,
            'message' => 'Payment record not found'
        ], 404);
    }

    // 3️⃣ Fetch linked purchase record
    $purchase = PurchesVendorModel::find($payment->purches_vendor_id);

    if (!$purchase) {
        return response()->json([
            'success' => false,
            'message' => 'Purchase data not found'
        ], 404);
    }

    // 4️⃣ Recalculate total
    // $newTotal = $request->price_per_unit * $request->qty;


        // 4. Calculate Base Amount & GST
    $pricePerUnit = (float) $request->price_per_unit;
    $qty          = (float) $request->qty;
    $baseAmount   = $pricePerUnit * $qty;

    $gstIncluded  = (bool) $request->gst_included;
    $gstPercent   = $gstIncluded ? (float) ($request->gst_percent ?? 0) : 0;

    // Calculate GST Amount and Final Total
    $gstAmount = $gstIncluded && $gstPercent > 0 
        ? round($baseAmount * ($gstPercent / 100), 2) 
        : 0;

    $newTotal = round($baseAmount + $gstAmount, 2);

    // Auto-calculate CGST & SGST (50-50 split)
    $cgstPercent = $gstIncluded && $gstPercent > 0 ? round($gstPercent / 2, 2) : 0;
    $sgstPercent = $cgstPercent; // Always equal




    // 5️⃣ Update purchase table (purches_vendor)
    // $purchase->update([
    //     'vendor_id'      => $request->vendor_id,
    //     'project_id'     => $request->project_id,
    //     'material_name'  => $request->material_name,
    //     'about'          => $request->about,
    //     'price_per_unit' => $request->price_per_unit,
    //     'qty'            => $request->qty,
    //     'total'          => $newTotal,
    //     'date'           => $request->date,
    //      'gst_included'   => $request->gst_included,
    //     'gst_percent'    => $request->gst_percent,
    //     'cgst_percent'   => $request->cgst_percent,
    //     'sgst_percent'   => $request->sgst_percent,
    // ]);

     $purchase->update([
        'vendor_id'       => $request->vendor_id,
        'project_id'      => $request->project_id,
        'material_name'   => $request->material_name,
        'about'           => $request->about ?? null,
        'price_per_unit'  => $pricePerUnit,
        'qty'             => $qty,
        'total'           => $newTotal,
        'date'            => $request->date,

        // GST Fields
        'gst_included'    => $gstIncluded ? 1 : 0,
        'gst_percent'     => $gstIncluded ? $gstPercent : 0,
        'cgst_percent'    => $gstIncluded ? $cgstPercent : 0,
        'sgst_percent'    => $gstIncluded ? $sgstPercent : 0,
    ]);

    // 6️⃣ Update payment table (purches_vendor_payment)
    // $newBalance = $newTotal - $payment->paid_amount;

        // 6. Update payment record (amount & balance)
    $paidAmount = (float) $payment->paid_amount; // Already paid should not change
    $newBalance = $newTotal - $paidAmount;

    // Prevent negative balance (optional safety)
    $newBalance = $newBalance < 0 ? 0 : $newBalance;

    $payment->update([
        'amount'         => $newTotal,
        'balance_amount' => $newBalance
    ]);

    // 7️⃣ Return response
    return response()->json([
        'success' => true,
        'message' => 'Purchase & Payment updated successfully.',
        'purchase' => $purchase,
        'payment'  => $payment
    ]);
}


// public function updatePurchesVendorPayment(Request $request)
// {
//     // 1. Validate request
//     $validated = $request->validate([
//         'payment_id'       => 'required|numeric',
//         'price_per_unit'   => 'required|numeric|min:0.01',
//         'qty'              => 'required|numeric|min:0.01',
//         'material_name'    => 'required|string|max:255',
//         'about'            => 'nullable|string|max:1000',
//         'date'             => 'required|date',
//         'vendor_id'        => 'required|exists:vendors,id',
//         'project_id'       => 'required|exists:projects,id',

//         // GST Fields
//         'gst_included'     => 'required|boolean',
//         'gst_percent'      => 'nullable|numeric|min:0|max:100',
//         'cgst_percent'     => 'nullable|numeric|min:0',
//         'sgst_percent'     => 'nullable|numeric|min:0',
//     ]);

//     // 2. Fetch payment record
//     $payment = PurchesVendorPayment::find($request->payment_id);

//     if (!$payment) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Payment record not found'
//         ], 404);
//     }

//     // 3. Fetch linked purchase record
//     $purchase = PurchesVendorModel::find($payment->purches_vendor_id);

//     if (!$purchase) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Purchase record not found'
//         ], 404);
//     }

//     // 4. Calculate Base Amount & GST
//     $pricePerUnit = (float) $request->price_per_unit;
//     $qty          = (float) $request->qty;
//     $baseAmount   = $pricePerUnit * $qty;

//     $gstIncluded  = (bool) $request->gst_included;
//     $gstPercent   = $gstIncluded ? (float) ($request->gst_percent ?? 0) : 0;

//     // Calculate GST Amount and Final Total
//     $gstAmount = $gstIncluded && $gstPercent > 0 
//         ? round($baseAmount * ($gstPercent / 100), 2) 
//         : 0;

//     $newTotal = round($baseAmount + $gstAmount, 2);

//     // Auto-calculate CGST & SGST (50-50 split)
//     $cgstPercent = $gstIncluded && $gstPercent > 0 ? round($gstPercent / 2, 2) : 0;
//     $sgstPercent = $cgstPercent; // Always equal

//     // 5. Update the main purchase record (purches_vendor)
//     $purchase->update([
//         'vendor_id'       => $request->vendor_id,
//         'project_id'      => $request->project_id,
//         'material_name'   => $request->material_name,
//         'about'           => $request->about ?? null,
//         'price_per_unit'  => $pricePerUnit,
//         'qty'             => $qty,
//         'total'           => $newTotal,
//         'date'            => $request->date,

//         // GST Fields
//         'gst_included'    => $gstIncluded ? 1 : 0,
//         'gst_percent'     => $gstIncluded ? $gstPercent : 0,
//         'cgst_percent'    => $gstIncluded ? $cgstPercent : 0,
//         'sgst_percent'    => $gstIncluded ? $sgstPercent : 0,
//     ]);

//     // 6. Update payment record (amount & balance)
//     $paidAmount = (float) $payment->paid_amount; // Already paid should not change
//     $newBalance = $newTotal - $paidAmount;

//     // Prevent negative balance (optional safety)
//     $newBalance = $newBalance < 0 ? 0 : $newBalance;

//     $payment->update([
//         'amount'         => $newTotal,
//         'balance_amount' => $newBalance,
//     ]);

//     // 7. Return success response
//     return response()->json([
//         'success' => true,
//         'message' => 'Purchase and payment updated successfully!',
//         'data' => [
//             'purchase' => $purchase->fresh(), // Reload fresh data
//             'payment'  => $payment->fresh(),
//             'calculation' => [
//                 'base_amount'   => $baseAmount,
//                 'gst_percent'   => $gstPercent,
//                 'gst_amount'    => $gstAmount,
//                 'total'         => $newTotal,
//                 'paid_amount'   => $paidAmount,
//                 'balance_amount'=> $newBalance,
//             ]
//         ]
//     ]);
// }




}


































// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use App\Models\PurchesVendorModel;
// use App\Models\Operator;
// use App\Models\Project;
// use App\Models\PurchesVendorPayment;
// use App\Models\PurchesVendorPaymentLog;


// class PurchesVendorController extends Controller
// {
    

// //     public function store(Request $request)
// // {
// //     $user = auth()->user();


// //     $data = $request->validate([
// //         // 'comapany_id'      => 'required|numeric',
// //         'project_id'      => 'required|numeric',
// //         'vendor_id'       => 'required|numeric',
// //         'material_name'   => 'required|string|max:255',
// //         'about'           => 'nullable|string|max:255',
// //         'price_per_unit'  => 'required|numeric',
// //         'qty'             => 'required|numeric',
// //         'total'           => 'required|numeric',
// //         'date'            => 'required|date',
// //          'amount'   => 'required|numeric',
// //         'paid_amount'  => 'required|numeric',
// //         'balance_amount'  => 'required|numeric',
// //     ]);

// //     $data['company_id'] = $user->company_id ?? null;
    
// //     $data['created_by'] = $user->id ?? null;  

// //     $purchesVendor = PurchesVendorModel::create($data);

// //     return response()->json([
// //         'message' => 'Purchase vendor data stored successfully.',
// //         'data'    => $purchesVendor
// //     ], 201);
// // }

// public function store(Request $request)
// {
//     $user = auth()->user();

//     // Validate input
//     $validated = $request->validate([
//         'project_id'      => 'required|numeric',
//         'vendor_id'       => 'required|numeric',
//         'material_name'   => 'required|string|max:255',
//         'about'           => 'nullable|string|max:255',
//         'price_per_unit'  => 'required|numeric',
//         'qty'             => 'required|numeric',
//         'total'           => 'required|numeric',
//         'date'            => 'required|date',

//         // Only paid_amount will be sent
//         'paid_amount'     => 'nullable|numeric'
//     ]);

//     // Add company & creator
//     $validated['company_id'] = $user->company_id ?? null;
//     $validated['created_by'] = $user->id ?? null;

//     // 1️⃣ Store purchase vendor
//     $purchaseVendor = PurchesVendorModel::create($validated);

//     // 2️⃣ Payment logic
//     $totalAmount      = $validated['total'];    // amount = total
//     $paidAmount       = $validated['paid_amount'];
//     $balanceAmount    = $totalAmount - $paidAmount;

//     // Store payment
//     $payment = PurchesVendorPayment::create([
//         'purches_vendor_id' => $purchaseVendor->id,
//         'amount'            => $totalAmount,       // amount = total
//         'paid_amount'       => $paidAmount,
//         'balance_amount'    => $balanceAmount
//     ]);

//     return response()->json([
//         'message'          => 'Purchase vendor & payment stored successfully.',
//         'purchase_vendor'  => $purchaseVendor,
//         'payment'          => $payment
//     ], 201);
// }







// public function index(Request $request){

// $user = auth()->user();    

// $operatorVendorIds = Operator::pluck('id');
// $projectDetailsIds = Project::pluck('id');

// $data = PurchesVendorModel::with(['vendor', 'project'])
//     ->whereIn('vendor_id', $operatorVendorIds)
//     ->whereIn('project_id', $projectDetailsIds)
//     ->get();


// return response()->json([
//  'message' => 'Purchase vendor data fatched successfully.',
//         'data'    => $data
//     ], 201
// );

// }





// public function show($id){

//     $user = auth()->user();   
    
    

//     // $data = PurchesVendorModel::find($id);
//     $data = PurchesVendorModel::with(['vendor', 'project'])->find($id);

//      if (!$data) {
//         return response()->json([
//             'message' => 'Purchase vendor not found.',
//             'data'    => null
//         ], 404);
//     }

//     return response()->json([
//            'message' => 'Purchase vendor data fatched by id successfully.',
//         'data'    => $data
//     ], 201
// );

// }



// public function update(Request $request,$id){

//     $user = auth()->user(); 
    
//     $data = $request->validate([

//         'company_id'      => 'required|numeric',
//         'project_id'      => 'required|numeric',
//         'vendor_id'       => 'required|numeric',
//         'material_name'   => 'required|string|max:255',
//         'about'           => 'nullable|string|max:255',
//         'price_per_unit'  => 'required|numeric',
//         'qty'             => 'required|numeric',
//         'total'           => 'required|numeric',
//         'date'            => 'required|date'

//     ]);


//     $purches = PurchesVendorModel::find($id);

//     if(!$purches){
//          return response()->json([
//             'message' => 'Purchase vendor not found.',
//             'data' => null
//         ], 404);
//     }

//    $purches->update($data);


//     return resposne()->json([
//             'message' => 'Purches vendor data update successfully',
//             'data'  => $data 
//     ], 201);

// }


// public function destroy(Request $request,$id){

//  $user = auth()->user(); 

//  $data = PurchesVendorModel::find($id); 

//  if(!$data){
//       return response()->json([
//             'message' => 'Purchase vendor not found for delete.',
//             'data' => null
//         ], 404);
//  }

//  $data->delete();


// return resposne()->json([
//             'message' => 'Purches vendor delete successfully.',
//             'data'  => $data 
//     ], 201);

// }



// public function addVendorPayment(Request $request)
// {
//     // Validate request data
//     $validated = $request->validate([
//         'purches_vendor_id' => 'required|numeric',
//         'paid_by'           => 'required|string',
//         'payment_type'      => 'required|string',
//         'amount'            => 'required|numeric',
//         'payment_date'      => 'required|date',
//         'description'       => 'nullable|string',
//     ]);

//     // 1️⃣ Fetch or create payment master row
//     $payment = PurchesVendorPayment::firstOrCreate(
//         ['purches_vendor_id' => $validated['purches_vendor_id']],
//         ['amount' => 0, 'paid_amount' => 0, 'balance_amount' => 0]
//     );

//     // 2️⃣ Insert log entry
//     $paymentLog = PurchesVendorPaymentLog::create([
//         'purches_vendor_id'         => $validated['purches_vendor_id'],
//         'purches_vendor_payment_id' => $payment->id,
//         'paid_by'                   => $validated['paid_by'],
//         'payment_type'              => $validated['payment_type'],
//         'amount'                    => $validated['amount'],
//         'payment_date'              => $validated['payment_date'],
//         'description'               => $validated['description'],
//     ]);

//     // 3️⃣ Update master payment totals
//     $payment->paid_amount += $validated['amount'];       // Add new payment
//     $payment->balance_amount = $payment->amount - $payment->paid_amount; 
//     $payment->save();

//     return response()->json([
//         'message' => 'Payment log added & totals updated successfully',
//         'payment' => $payment,
//         'payment_log' => $paymentLog
//     ], 201);
// }



// }
