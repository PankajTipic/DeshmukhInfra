<?php


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PurchesVendorModel;
use App\Models\Operator;
use App\Models\Project;
use App\Models\PurchesVendorPayment;
use App\Models\PurchesVendorPaymentLog; 
use App\Models\PurchaseVendorImage;
use App\Helpers\ImageCompressor;

class PurchesVendorController extends Controller
{

/*-----------------------------------------
| 1️⃣ STORE PURCHASE VENDOR + PAYMENT MASTER
------------------------------------------*/
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

//                 // NEW GST FIELDS
//         'gst_included'    => 'nullable|boolean',
//         'gst_percent'     => 'nullable|numeric|min:0',
//         'cgst_percent'    => 'nullable|numeric|min:0',
//         'sgst_percent'    => 'nullable|numeric|min:0',

//     ]);

//     $validated['company_id'] = $user->company_id ?? null;
//     $validated['created_by'] = $user->id ?? null;

//     // 1️⃣ Create purchase vendor entry
//     $purchaseVendor = PurchesVendorModel::create($validated);

//     // 2️⃣ Create payment master entry
//     $payment = PurchesVendorPayment::create([
//         'purches_vendor_id' => $purchaseVendor->id,
//         'amount'            => $validated['total'],  // total = amount
//         'paid_amount'       => 0,                    // no payment at creation
//         'balance_amount'    => $validated['total'],  // full amount pending
//     ]);

//     return response()->json([
//         'message'          => 'Purchase vendor and payment stored successfully.',
//         'purchase_vendor'  => $purchaseVendor,
//         'payment'          => $payment
//     ], 201);
// }

public function store(Request $request)
{
    $user = auth()->user();

    $validated = $request->validate([
        'project_id'      => 'required|numeric',
        'vendor_id'       => 'required|numeric',
        'material_name'   => 'required|string|max:255',
        'about'           => 'nullable|string|max:500',
        'price_per_unit'  => 'required|numeric|min:0',
        'qty'             => 'required|numeric|min:0',
        'total'           => 'required|numeric|min:0',
        'date'            => 'required|date',

        'gst_included'    => 'nullable|boolean',
        'gst_percent'     => 'nullable|numeric|min:0',
        'cgst_percent'    => 'nullable|numeric|min:0',
        'sgst_percent'    => 'nullable|numeric|min:0',

        'photoAvailable'  => 'nullable|boolean',
        'photos.*'        => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        'photo_remarks.*' => 'nullable|string|max:255',
    ]);

    $validated['company_id'] = $user->company_id ?? null;
    $validated['created_by'] = $user->id ?? null;

    // Create Purchase
    $purchaseVendor = PurchesVendorModel::create($validated);

    // Create Payment Master
    $payment = PurchesVendorPayment::create([
        'purches_vendor_id' => $purchaseVendor->id,
        'amount'            => $validated['total'],
        'paid_amount'       => 0,
        'balance_amount'    => $validated['total'],
    ]);

    // Handle Multiple Images
    if ($request->boolean('photoAvailable') && $request->hasFile('photos')) {
        foreach ($request->file('photos') as $index => $file) {
            $uploadedPath = ImageCompressor::compressAndSave(
                $file,
                'purchase-vendors',
                1024
            );

            $remark = $request->input("photo_remarks.{$index}");

            PurchaseVendorImage::create([
                'purches_vendor_id' => $purchaseVendor->id,
                'image_path'        => $uploadedPath,
                'original_name'     => $file->getClientOriginalName(),
                'remark'            => $remark,
                'type'              => str_contains($file->getMimeType(), 'pdf') ? 'pdf' : 'image',
            ]);
        }
    }

    // Reload with images
    $purchaseVendor->load('images');

    return response()->json([
        'message'          => 'Purchase vendor and payment stored successfully.',
        'purchase_vendor'  => $purchaseVendor,
        'payment'          => $payment,
        'images'           => $purchaseVendor->images
    ], 201);
}



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
     

    $data = PurchesVendorModel::with(['vendor', 'project', 'images'])
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

            // ✅ PROJECT DETAILS
            'project' => $project ? [
                'project_id' => $project->id,
                'project_name' => $project->project_name ?? null,
                'location' => $project->location ?? null,
                'start_date' => $project->start_date ?? null,
            ] : null,

            // ✅ PURCHASE DETAILS - ADD THESE MISSING FIELDS
            'material_name' => $purchase->material_name ?? null,
            'qty' => $purchase->qty ?? 0,
            'price_per_unit' => $purchase->price_per_unit ?? 0,
            'about' => $purchase->about ?? null,
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







// public function updatePurchesVendorPayment(Request $request)
// {
//     // 1️⃣ Validate request
//     $validated = $request->validate([
//         'payment_id'       => 'required|numeric',
//         'price_per_unit'   => 'required|numeric',
//         'qty'              => 'required|numeric',
//         'material_name'    => 'required|string|max:255',
//         'about'            => 'nullable|string|max:255',
//         'date'             => 'required|date',
//         'vendor_id'        => 'required|numeric',
//         'project_id'       => 'required|numeric',

//          // GST Fields Added
//         'gst_included'     => 'nullable|boolean',
//         'gst_percent'      => 'nullable|numeric|min:0',
//         'cgst_percent'     => 'nullable|numeric|min:0',
//         'sgst_percent'     => 'nullable|numeric|min:0',
//     ]);

//     // 2️⃣ Fetch payment record
//     $payment = PurchesVendorPayment::find($request->payment_id);

//     if (!$payment) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Payment record not found'
//         ], 404);
//     }

//     // 3️⃣ Fetch linked purchase record
//     $purchase = PurchesVendorModel::find($payment->purches_vendor_id);

//     if (!$purchase) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Purchase data not found'
//         ], 404);
//     }

//     // 4️⃣ Recalculate total
//     // $newTotal = $request->price_per_unit * $request->qty;


//         // 4. Calculate Base Amount & GST
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




  
//      $purchase->update([
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

//     // 6️⃣ Update payment table (purches_vendor_payment)
//     // $newBalance = $newTotal - $payment->paid_amount;

//         // 6. Update payment record (amount & balance)
//     $paidAmount = (float) $payment->paid_amount; // Already paid should not change
//     $newBalance = $newTotal - $paidAmount;

//     // Prevent negative balance (optional safety)
//     $newBalance = $newBalance < 0 ? 0 : $newBalance;

//     $payment->update([
//         'amount'         => $newTotal,
//         'balance_amount' => $newBalance
//     ]);

//     // 7️⃣ Return response
//     return response()->json([
//         'success' => true,
//         'message' => 'Purchase & Payment updated successfully.',
//         'purchase' => $purchase,
//         'payment'  => $payment
//     ]);
// }

public function updatePurchesVendorPayment(Request $request)
{
    $user = auth()->user();

    // 1️⃣ Validation
    $validated = $request->validate([
        'payment_id'       => 'required|numeric',
        'price_per_unit'   => 'required|numeric|min:0',
        'qty'              => 'required|numeric|min:0',
        'material_name'    => 'required|string|max:255',
        'about'            => 'nullable|string|max:500',
        'date'             => 'required|date',
        'vendor_id'        => 'required|numeric',
        'project_id'       => 'required|numeric',

        // GST Fields
        'gst_included'     => 'nullable|boolean',
        'gst_percent'      => 'nullable|numeric|min:0',
        'cgst_percent'     => 'nullable|numeric|min:0',
        'sgst_percent'     => 'nullable|numeric|min:0',

        // Image Fields
        'photoAvailable'   => 'nullable|boolean',
        'photos.*'         => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        'photo_remarks.*'  => 'nullable|string|max:255',
    ]);

    // 2️⃣ Fetch Payment Record
    $payment = PurchesVendorPayment::find($request->payment_id);
    if (!$payment) {
        return response()->json([
            'success' => false,
            'message' => 'Payment record not found'
        ], 404);
    }

    // 3️⃣ Fetch Purchase Record
    $purchase = PurchesVendorModel::find($payment->purches_vendor_id);
    if (!$purchase) {
        return response()->json([
            'success' => false,
            'message' => 'Purchase data not found'
        ], 404);
    }

    // 4️⃣ Calculate New Total with GST
    $pricePerUnit = (float) $request->price_per_unit;
    $qty          = (float) $request->qty;
    $baseAmount   = $pricePerUnit * $qty;

    $gstIncluded = (bool) $request->gst_included;
    $gstPercent  = $gstIncluded ? (float) ($request->gst_percent ?? 0) : 0;

    $gstAmount = $gstIncluded && $gstPercent > 0 
        ? round($baseAmount * ($gstPercent / 100), 2) 
        : 0;

    $newTotal = round($baseAmount + $gstAmount, 2);

    $cgstPercent = $gstIncluded && $gstPercent > 0 ? round($gstPercent / 2, 2) : 0;
    $sgstPercent = $cgstPercent;

    // 5️⃣ Update Purchase Record
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



       // 6b. Delete images that the user removed in the Edit modal
    $deletedImageIds = json_decode($request->input('deleted_image_ids', '[]'), true);
 
    if (!empty($deletedImageIds) && is_array($deletedImageIds)) {
        $imagesToDelete = PurchaseVendorImage::whereIn('id', $deletedImageIds)
            ->where('purches_vendor_id', $purchase->id) // ← security: only delete images belonging to THIS purchase
            ->get();
 
        foreach ($imagesToDelete as $image) {
            // Delete the physical file from storage
            $filePath = public_path($image->image_path); // adjust to storage_path() if using storage/app
            if (file_exists($filePath)) {
                unlink($filePath);
            }
 
            // Delete the DB record
            $image->delete();
        }
    }



    // 6️⃣ Update Payment Record
    $paidAmount = (float) $payment->paid_amount;
    $newBalance = $newTotal - $paidAmount;
    $newBalance = max(0, $newBalance); // Prevent negative balance

    $payment->update([
        'amount'         => $newTotal,
        'balance_amount' => $newBalance
    ]);

    // 7️⃣ Handle New Images (Add only - existing images remain)
    if ($request->boolean('photoAvailable') && $request->hasFile('photos')) {
        foreach ($request->file('photos') as $index => $file) {
            $uploadedPath = ImageCompressor::compressAndSave(
                $file,
                'purchase-vendors',
                1024
            );

            $remark = $request->input("photo_remarks.{$index}");

            PurchaseVendorImage::create([
                'purches_vendor_id' => $purchase->id,
                'image_path'        => $uploadedPath,
                'original_name'     => $file->getClientOriginalName(),
                'remark'            => $remark,
                'type'              => str_contains($file->getMimeType(), 'pdf') ? 'pdf' : 'image',
            ]);
        }
    }

    // Reload purchase with latest images
    $purchase->load('images');

    return response()->json([
        'success'  => true,
        'message'  => 'Purchase & Payment updated successfully.',
        'purchase' => $purchase,
        'payment'  => $payment,
        'images'   => $purchase->images
    ]);
}


/*-----------------------------------------
| 5️⃣ DELETE PURCHASE VENDOR (CASCADING)
------------------------------------------*/
public function destroy($id)
{
    // 1. Find the purchase record
    $purchase = PurchesVendorModel::find($id);

    if (!$purchase) {
        return response()->json([
            'success' => false,
            'message' => 'Purchase vendor not found for deletion.'
        ], 404);
    }

    // 2. Delete all related logs
    PurchesVendorPaymentLog::where('purches_vendor_id', $id)->delete();

    // 3. Delete the payment master record
    PurchesVendorPayment::where('purches_vendor_id', $id)->delete();

    // 4. Delete the purchase record itself
    $purchase->delete();

    return response()->json([
        'success' => true,
        'message' => 'Purchase and all related payments/logs deleted successfully.',
    ], 200);
}


/*-----------------------------------------
| 6️⃣ DELETE PAYMENT LOG (DELETES ENTIRE WORK)
------------------------------------------*/
public function deleteLog($id)
{
    // 1. Find the log entry
    $log = PurchesVendorPaymentLog::find($id);

    if (!$log) {
        return response()->json([
            'success' => false,
            'message' => 'Payment log not found.'
        ], 404);
    }

    // 2. Get the purchase ID before deletion
    $purches_vendor_id = $log->purches_vendor_id;

    // 3. Call the same cascading deletion logic as destroy
    return $this->destroy($purches_vendor_id);
}



/*-----------------------------------------
| VENDOR WISE → PROJECT → PAYMENT + LOGS
------------------------------------------*/



public function getVendorWisePayments(Request $request)
{
    $vendorId  = $request->vendor_id;
    $projectId = $request->project_id;
    $fromDate  = $request->from_date;
    $toDate    = $request->to_date;
    $materialName  = $request->material_name;

    // ❌ Vendor ID must be provided
    if (!$vendorId) {
        return response()->json([
            'success' => false,
            'message' => 'Vendor ID is required'
        ], 422);
    }

    $query = PurchesVendorModel::with([
        'vendor',
        'project',
        'payment.logs' => function ($q) use ($fromDate, $toDate) {
            if ($fromDate && $toDate) {
                $q->whereBetween('payment_date', [$fromDate, $toDate]);
            }
        }
    ])->where('vendor_id', $vendorId); // ✅ FORCE SINGLE VENDOR

    if ($projectId) {
        $query->where('project_id', $projectId);
    }

    if ($fromDate && $toDate) {
        $query->whereBetween('date', [$fromDate, $toDate]);
    }


    // ── NEW MATERIAL FILTER ────────────────────────────────
    if ($materialName) {
        $query->where('material_name', $materialName);
        // or if you want partial match (LIKE %search%):
        // $query->where('material_name', 'like', '%' . $materialName . '%');
    }
    // ───────────────────────────────────────────────────────


    $purchases = $query->orderBy('date', 'DESC')->get();

    if ($purchases->isEmpty()) {
        return response()->json([
            'success' => true,
            'data' => null
        ], 200);
    }

    $vendor = $purchases->first()->vendor;

    // 🔢 Vendor totals
    $vendorTotalAmount = 0;
    $vendorPaidAmount  = 0;
    $vendorBalance     = 0;

    foreach ($purchases as $purchase) {
        if ($purchase->payment) {
            $vendorTotalAmount += $purchase->payment->amount;
            $vendorPaidAmount  += $purchase->payment->paid_amount;
            $vendorBalance     += $purchase->payment->balance_amount;
        }
    }

    $data = [
        'vendor_details' => [
            'vendor_id'   => $vendor->id,
            'vendor_name' => $vendor->name,
            'mobile'      => $vendor->mobile,
            'address'     => $vendor->address,
        ],

        'vendor_summary' => [
            'total_amount'   => round($vendorTotalAmount, 2),
            'paid_amount'    => round($vendorPaidAmount, 2),
            'balance_amount' => round($vendorBalance, 2),
        ],

        'projects' => $purchases->groupBy('project_id')->map(function ($projectPurchases) {

            $project = $projectPurchases->first()->project;

            return [
                'project_details' => [
                    'project_id'   => $project->id ?? null,
                    'project_name' => $project->project_name ?? null,
                    'location'     => $project->location ?? null,
                    'start_date'   => $project->start_date ?? null,
                ],

                'purchases' => $projectPurchases->map(function ($purchase) {

                    $payment = $purchase->payment;

                    return [
                        'purchase_details' => [
                            'purchase_id'    => $purchase->id,
                            'material_name'  => $purchase->material_name,
                            'qty'            => $purchase->qty,
                            'price_per_unit' => $purchase->price_per_unit,
                            'total'          => $purchase->total,
                            'date'           => $purchase->date,
                            'gst_included'   => $purchase->gst_included,
                            'gst_percent'    => $purchase->gst_percent,
                        ],

                        'payment_master' => $payment ? [
                            'payment_id'     => $payment->id,
                            'total_amount'   => $payment->amount,
                            'paid_amount'    => $payment->paid_amount,
                            'balance_amount' => $payment->balance_amount,
                        ] : null,

                        'payment_logs' => $payment ? $payment->logs->values() : []
                    ];
                })->values()
            ];
        })->values()
    ];

    return response()->json([
        'success' => true,
        'message' => 'Vendor wise payment details fetched successfully.',
        'data' => $data
    ], 200);
}





public function getVendorLedgerReport(Request $request)
{
    $vendorId     = $request->vendor_id;
    $projectId    = $request->project_id;

    // Accept both formats (consistent with your other function)
    $fromDate     = $request->start_date ?? $request->from_date;
    $toDate       = $request->end_date   ?? $request->to_date;

    $materialName = $request->material_name;

    // =========================
    // VALIDATION
    // =========================
    if (!$vendorId) {
        return response()->json([
            'success' => false,
            'message' => 'Vendor ID is required'
        ], 422);
    }

    // =========================
    // FETCH PURCHASES
    // =========================
    $purchaseQuery = PurchesVendorModel::with([
        'project',

        // Payment logs filtered by payment date (same as in vendor-wise-payments)
        'payment.logs' => function ($q) use ($fromDate, $toDate) {
            if ($fromDate && $toDate) {
                $q->whereBetween('payment_date', [$fromDate, $toDate]);
            }
        }
    ])->where('vendor_id', $vendorId);

    // Project Filter
    if ($projectId) {
        $purchaseQuery->where('project_id', $projectId);
    }

    // Purchase Date Filter
    if ($fromDate && $toDate) {
        $purchaseQuery->whereBetween('date', [$fromDate, $toDate]);
    }

    // Material Name Filter — exactly same logic as in getVendorWisePayments
    if ($materialName) {
        $purchaseQuery->where('material_name', $materialName);
        // If you later decide to use partial match, just uncomment:
        // $purchaseQuery->where('material_name', 'like', '%' . $materialName . '%');
    }

    $purchases = $purchaseQuery->get();  // ← no ordering here (ledger sorts later)

    // =========================
    // VENDOR CHECK
    // =========================
    if ($purchases->isEmpty()) {
        return response()->json([
            'success' => true,
            'message' => 'No records found',
            'data' => [
                'vendor_details' => null,
                'ledger_summary' => [
                    'total_debit'     => 0,
                    'total_credit'    => 0,
                    'closing_balance' => 0,
                ],
                'ledger_entries'  => []
            ]
        ], 200);
    }

    $vendor = $purchases->first()->vendor;

    // =========================
    // LEDGER BUILD
    // =========================
    $ledger = collect();

    foreach ($purchases as $purchase) {

        // PURCHASE (DEBIT)
        $ledger->push([
            'date'        => $purchase->date,
            'type'        => 'Purchase',
            'reference'   => 'PUR-' . $purchase->id,
            'project'     => optional($purchase->project)->project_name ?? null,
            'material'    => $purchase->material_name,
            'qty'         => $purchase->qty,
            'rate'        => $purchase->price_per_unit,
            'gst_percent' => $purchase->gst_percent,
            'description' => 'Material purchase',
            'debit'       => $purchase->total ?? 0,
            'credit'      => 0,
        ]);

        // PAYMENT (CREDIT) — only if payment exists
        if ($purchase->payment) {
            foreach ($purchase->payment->logs as $log) {
                $ledger->push([
                    'date'        => $log->payment_date,
                    'type'        => 'Payment',
                    'reference'   => 'PAY-' . $log->id,
                    'project'     => optional($purchase->project)->project_name ?? null,
                    'material'    => $purchase->material_name,
                    'qty'         => $purchase->qty,
                    'rate'        => $purchase->price_per_unit,
                    'gst_percent' => $purchase->gst_percent,
                    'description' => $log->description ?? 'Payment against material',
                    'debit'       => 0,
                    'credit'      => $log->amount ?? 0,
                ]);
            }
        }
    }

    // =========================
    // SORT + RUNNING BALANCE
    // =========================
    $runningBalance = 0;

    $ledger = $ledger
        ->sortBy('date')
        ->values()
        ->map(function ($row) use (&$runningBalance) {
            $runningBalance += ($row['debit'] - $row['credit']);
            $row['balance'] = round($runningBalance, 2);
            return $row;
        });

    // =========================
    // SUMMARY CALCULATION
    // =========================
    $totalDebit  = $ledger->sum('debit');
    $totalCredit = $ledger->sum('credit');
    $closingBalance = $ledger->isNotEmpty() ? $ledger->last()['balance'] : 0;

    // =========================
    // FINAL RESPONSE
    // =========================
    return response()->json([
        'success' => true,
        'message' => 'Vendor ledger report generated successfully',
        'data' => [
            'vendor_details' => [
                'vendor_id'   => $vendor->id,
                'vendor_name' => $vendor->name,
                'mobile'      => $vendor->mobile,
                'address'     => $vendor->address,
            ],

            'ledger_summary' => [
                'total_debit'     => round($totalDebit, 2),
                'total_credit'    => round($totalCredit, 2),
                'closing_balance' => round($closingBalance, 2),
            ],

            'ledger_entries' => $ledger
        ]
    ], 200);
}




public function materialList()
{
    $materials = PurchesVendorModel::query()
        ->select('material_name')
        ->distinct()           // removes duplicates
        ->orderBy('material_name')   // optional: alphabetical order
        ->pluck('material_name')     // returns simple array of names
        ->all();                     // or ->toArray()

    return $materials;   // returns: ["Cement", "Sand", "Steel Rod", "Bricks", ...]
}





}
































