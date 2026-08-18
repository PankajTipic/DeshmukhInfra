<?php

// namespace App\Http\Controllers;

// use App\Models\Expense;
// use App\Models\ExpensePhoto;
// use App\Models\ExpenseSummary;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\DB;
// use App\Helpers\ImageCompressor;
// use Illuminate\Support\Str;
// use Illuminate\Support\Facades\Storage;

// class ExpenseController extends Controller
// {
//     protected $user;

//     public function __construct()
//     {
//         $this->user = Auth::user();
//     }

//     /**
//      * Display a listing of expenses with filters
//      * GET /expenses
//      */
//     public function index(Request $request)
//     {
//         $user = Auth::user();
//         $companyId = $user->company_id;
//         $userType = $user->type;
//         $startDate = $request->query('startDate');
//         $endDate = $request->query('endDate');
//         $customerId = $request->query('customerId');
//         $expenseTypeId = $request->query('expenseTypeId');
//         $partyName = $request->query('partyName');
//         $perPage = $request->query('perPage', 50);
//         $cursor = $request->query('cursor');

//         try {
//             if (!in_array($userType, [0, 1, 2, 3])) {
//                 return response()->json(['error' => 'Not Allowed'], 403);
//             }

//             $query = Expense::with([
//                 'expenseType:id,name,expense_category',
//                 'project:id,project_name',
//                 'photos' // Load photos relationship
//             ])->where('company_id', $companyId);

//             if ($expenseTypeId) {
//                 $query->where('expense_id', $expenseTypeId);
//             }

//             if ($customerId) {
//                 $query->where('project_id', $customerId);
//             }

//              if ($customerId) {
//                 $query->where('project_id', $customerId);
//             }

//              // party name filter
//         if ($partyName) {
//             $query->where('party_name', 'like', '%' . $partyName . '%');
//         }

//             if ($startDate && $endDate) {
//                 $query->whereBetween('expense_date', [$startDate, $endDate]);
//             }

//             if (!$expenseTypeId && !$customerId && !$partyName && !($startDate && $endDate)) {
//                 return response()->json(['error' => 'Please provide at least one filter'], 422);
//             }

//             $summaryQuery = Expense::where('company_id', $companyId);

//             if ($expenseTypeId) {
//                 $summaryQuery->where('expense_id', $expenseTypeId);
//             }

//             if ($customerId) {
//                 $summaryQuery->where('project_id', $customerId);
//             }

//              if ($partyName) {
//             $summaryQuery->where('party_name', 'like', '%' . $partyName . '%');
//         }

//             if ($startDate && $endDate) {
//                 $summaryQuery->whereBetween('expense_date', [$startDate, $endDate]);
//             }

//             $summary = $summaryQuery->selectRaw('SUM(total_price) as totalExpense')->first();

//             $query->orderBy('id', 'desc');
//             $expenses = $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor);

//             $data = collect($expenses->items())->map(function ($expense) {
//                 return array_merge($expense->toArray(), [
//                     'customer_name' => $expense->customer->name ?? null,
//                     'customer_address' => $expense->customer->address ?? null,
//                 ]);
//             });

//             return response()->json([
//                 'data' => $data,
//                 'next_cursor' => $expenses->nextCursor()?->encode(),
//                 'has_more_pages' => $expenses->hasMorePages(),
//                 'totalExpense' => $summary->totalExpense ?? 0,
//             ]);
//         } catch (\Exception $e) {
//             return response()->json(['error' => $e->getMessage()], 500);
//         }
//     }



//     /**
//      * Save Uploaded File to S3 (Main Function)
//      */
// private function saveUploadedImageToS3($file, string $folder): ?string
// {
//     if (!$file || !$file->isValid()) {
//         \Log::warning("Invalid file received");
//         return null;
//     }

//     $extension = strtolower($file->getClientOriginalExtension());
//     $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
//     if (!in_array($extension, $allowed)) {
//         \Log::error("Invalid extension: {$extension}");
//         return null;
//     }

//     $cleanFolder = trim(preg_replace('#/+#', '/', $folder), '/');
//     $fileName    = date('His') . '-' . Str::random(12) . '.' . $extension;
//     $envPrefix   = env('ENVIRONMENT_PREFIX', 'localhost');
//     $s3Path      = "img/{$envPrefix}/{$cleanFolder}/{$fileName}";

//     // ── Try S3 ──────────────────────────────────────────
//     try {
//         Storage::disk('s3')->put($s3Path, file_get_contents($file->getRealPath()), 'public');
//         $fullUrl = Storage::disk('s3')->url($s3Path);
//         \Log::info("✅ S3 Upload SUCCESS: " . $fullUrl);
//         return $fullUrl;
//     } catch (\Throwable $e) {
//         \Log::error("❌ S3 Upload FAILED: " . $e->getMessage());
//         \Log::error("Bucket: " . env('AWS_BUCKET') . " | Region: " . env('AWS_DEFAULT_REGION'));

//         // ── Local fallback (only for non-production) ──
//         if (app()->environment('local', 'testing')) {
//             return $this->saveToLocal($file, $cleanFolder, $fileName);
//         }

//         // In production, throw so the caller knows it failed
//         throw new \RuntimeException("S3 upload failed: " . $e->getMessage());
//     }
// }

//     /**
//      * Local Fallback
//      */
// private function saveToLocal($file, string $folder, string $fileName): ?string
//     {
//         $basePath = "img/{$folder}";
//         $fullDirectory = public_path($basePath);

//         if (!file_exists($fullDirectory)) {
//             mkdir($fullDirectory, 0755, true);
//         }

//         $file->move($fullDirectory, $fileName);

//         $fullLocalUrl = url($basePath . '/' . $fileName);

//         \Log::warning("⚠️ S3 Failed - Saved Locally: {$fullLocalUrl}");
//         return $fullLocalUrl;
//     }

//     /**
//      * Store a newly created expense with multiple photos
//      * POST /expenses
//      */
//     public function store(Request $request)
//     {
//         $user = Auth::user();

//         $request->validate([
//             'expense_date' => 'required|date',
//             'price' => 'required|numeric|min:0',
//             'qty' => 'required|numeric|min:0',
//             'total_price' => 'required|numeric|min:0',
//             'contact' => 'nullable|numeric',
//             'payment_by' => 'nullable|string',
//             'payment_type' => 'nullable|string',
//             'pending_amount' => 'nullable|numeric',
//             'show' => 'required|boolean',
//             'isGst' => 'nullable|boolean',
//             'photoAvailable' => 'nullable|boolean',
//             'photos.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
//             'photo_remarks.*' => 'nullable|string',
//             'photo_remark' => 'nullable|string',
//             'bank_name' => 'nullable|string',
//             'acc_number' => 'nullable|string',
//             'ifsc' => 'nullable|string',
//             'aadhar' => 'nullable|string',
//             'pan' => 'nullable|string',
//             'transaction_id' => 'nullable|string',
//             'gst' => 'nullable|numeric',
//             'sgst' => 'nullable|numeric',
//             'cgst' => 'nullable|numeric',
//             'igst' => 'nullable|numeric',
//             'party_name'=> 'nullable|string',
//   'party_gst_number'=> 'nullable|string',
//   'party_address'=> 'nullable|string',
//         ]);

//         DB::beginTransaction();
//         try {
//             $expense = Expense::create([
//                 'project_id' => $request->project_id,
//                 'name' => $request->name,
//                 'expense_date' => $request->expense_date,
//                 'price' => $request->price,
//                 'qty' => $request->qty,
//                 'total_price' => $request->total_price,
//                 'expense_id' => $request->expense_id,
//                 'contact' => $request->contact,
//                 'payment_by' => $request->payment_by,
//                 'payment_type' => $request->payment_type,
//                 'pending_amount' => $request->pending_amount,
//                 'isGst' => $request->isGst,
//                 'photoAvailable' => $request->photoAvailable,
//                 'photo_url' => null, // Keep for backward compatibility
//                 'photo_remark' => $request->photo_remark,
//                 'bank_name' => $request->bank_name,
//                 'acc_number' => $request->acc_number,
//                 'ifsc' => $request->ifsc,
//                 'aadhar' => $request->aadhar,
//                 'pan' => $request->pan,
//                 'transaction_id' => $request->transaction_id,
//                 'show' => $request->show,
//                 'company_id' => $user->company_id,
//                 'created_by' => $user->id,
//                 'updated_by' => $user->id,
//                 'gst' => $request->gst,
//                 'sgst' => $request->sgst,
//                 'cgst' => $request->cgst,
//                 'igst' => $request->igst,
//                 'party_name'=> $request->party_name,
//                 'party_gst_number'=> $request->party_gst_number,
//                 'party_address'=> $request->party_address,

//             ]);

//             // // Handle multiple photos
//             // if ($request->hasFile('photos')) {
//             //     $photos = $request->file('photos');
//             //     $remarks = $request->input('photo_remarks', []);
                
//             //     foreach ($photos as $index => $photo) {
//             //         // Validate the file is valid and uploaded successfully
//             //         if ($photo->isValid()) {
//             //             try {
//             //                 // Get file info BEFORE compression
//             //                 $originalSize = round($photo->getSize() / 1024); // Original size in KB
//             //                 $extension = strtolower($photo->getClientOriginalExtension());
//             //                 $photoType = in_array($extension, ['pdf']) ? 'pdf' : 'image';
                            
//             //                 // Compress and save the photo (returns relative path)
//             //                 $photoPath = ImageCompressor::compressAndSave($photo, 'bill', 1024);
                            
//             //                 // Get compressed file size
//             //                 $fullPath = $_SERVER['DOCUMENT_ROOT'] . '/' . $photoPath;
//             //                 $compressedSize = file_exists($fullPath) ? round(filesize($fullPath) / 1024) : $originalSize;
                            
//             //                 // Create photo record
//             //                 ExpensePhoto::create([
//             //                     'expense_id' => $expense->id,
//             //                     'photo_url' => $photoPath,
//             //                     'photo_type' => $photoType,
//             //                     'file_size' => $compressedSize,
//             //                     'remark' => $remarks[$index] ?? null,
//             //                 ]);
//             //             } catch (\Exception $e) {
//             //                 // Log error but continue with other photos
//             //                 \Log::error('Photo upload error: ' . $e->getMessage());
//             //             }
//             //         }
//             //     }
//             // }


//             // === Handle Multiple Photos with S3 ===
// // Handle Photos - S3 Preferred
//             if ($request->hasFile('photos')) {
//                 $photos = $request->file('photos');
//                 $remarks = $request->input('photo_remarks', []);

//                 foreach ($photos as $index => $photo) {
//                     if ($photo->isValid()) {
//                         $extension = strtolower($photo->getClientOriginalExtension());
//                         $photoType = in_array($extension, ['pdf']) ? 'pdf' : 'image';

//                         $fileSizeInKB = round($photo->getSize() / 1024);

//                         $photoUrl = $this->saveUploadedImageToS3($photo, 'expenses/bills');

//                         if ($photoUrl) {
//                             ExpensePhoto::create([
//                                 'expense_id' => $expense->id,
//                                 'photo_url'  => $photoUrl,        // Full S3 URL
//                                 'photo_type' => $photoType,
//                                 'file_size'  => $fileSizeInKB,
//                                 'remark'     => $remarks[$index] ?? null,
//                             ]);
//                         }
//                     }
//                 }
//             }

//             ExpenseSummary::updateOrCreate(
//                 [
//                     'expense_date' => $request->expense_date,
//                     'company_id' => $user->company_id,
//                     'project_id' => $request->project_id,
//                 ],
//                 [
//                     'total_expense' => DB::raw('total_expense + ' . $request->total_price),
//                     'expense_count' => DB::raw('expense_count + 1'),
//                 ]
//             );

//             DB::commit();

//             return response()->json([
//                 'success' => true,
//                 'message' => 'Expense created successfully.',
//                 'expense' => $expense->load('photos'),
//             ]);
//         } catch (\Exception $e) {
//             // DB::rollBack();
//             // return response()->json(['error' => $e->getMessage()], 500);
//             DB::rollBack();
//             \Log::error("Expense Store Error: " . $e->getMessage());
//             return response()->json(['error' => $e->getMessage()], 500);
//         }
//     }







//     /**
//      * Display the specified expense
//      * GET /expenses/{id}
//      */
//     public function show($id)
//     {
//         $user = Auth::user();
//         $companyId = $user->company_id;
//         $userType = $user->type;

//         try {
//             if (in_array($userType, [0, 1, 2, 3])) {
//                 $expense = Expense::with('photos')
//                     ->where('id', $id)
//                     ->where('company_id', $companyId)
//                     ->first();
                    
//                 if ($expense) {
//                     return response()->json([
//                         'success' => true,
//                         'expense' => $expense,
//                     ]);
//                 }
//                 return response()->json(['message' => 'Expense not found'], 404);
//             }
//             return response()->json(['error' => 'Not Allowed'], 403);
//         } catch (\Exception $e) {
//             return response()->json(['error' => $e->getMessage()], 500);
//         }
//     }

//     /**
//      * Update the specified expense
//      * PUT/PATCH /expenses/{id}
//      */
//     public function update(Request $request, $id)
//     {
//         $user = Auth::user();
//         $companyId = $user->company_id;

//         $request->validate([
//             'expense_id' => 'required|exists:expense_types,id',
//             'expense_date' => 'required|date',
//             'price' => 'required|numeric|min:0',
//             'qty' => 'required|numeric|min:0',
//             'total_price' => 'required|numeric|min:0',
//             'show' => 'required|boolean',
//             'payment_by' => 'nullable|string',
//             'payment_type' => 'nullable|string',
//             'bank_name' => 'nullable|string',
//             'acc_number' => 'nullable|string',
//             'ifsc' => 'nullable|string',
//             'transaction_id' => 'nullable|string',
//             'gst' => 'nullable|numeric',
//             'sgst' => 'nullable|numeric',
//             'cgst' => 'nullable|numeric',
//             'igst' => 'nullable|numeric',
//             'new_photos.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
//             'new_photo_remarks.*' => 'nullable|string',
//             'delete_photo_ids' => 'nullable|array',
//             'delete_photo_ids.*' => 'integer|exists:expense_photos,id',

//             'party_name'=> 'nullable|string',
//   'party_gst_number'=> 'nullable|string',
//   'party_address'=> 'nullable|string',
//         ]);

//         $expense = Expense::where('id', $id)->where('company_id', $companyId)->first();

//         if (!$expense) {
//             return response()->json(['message' => 'Expense not found'], 404);
//         }

//         DB::beginTransaction();
//         try {
//             $oldTotal = $expense->total_price;
//             $oldDate = $expense->expense_date;
//             $oldProjectId = $expense->project_id;

//             $expense->update([
//                 'expense_id' => $request->expense_id,
//                 'name' => $request->name,
//                 'expense_date' => $request->expense_date,
//                 'price' => $request->price,
//                 'qty' => $request->qty,
//                 'total_price' => $request->total_price,
//                 'show' => $request->show,
//                 'updated_by' => $user->id,
//                 'payment_by' => $request->payment_by,
//                 'payment_type' => $request->payment_type,
//                 'bank_name' => $request->bank_name,
//                 'acc_number' => $request->acc_number,
//                 'ifsc' => $request->ifsc,
//                 'transaction_id' => $request->transaction_id,
//                 'gst' => $request->gst,
//                 'sgst' => $request->sgst,
//                 'cgst' => $request->cgst,
//                 'igst' => $request->igst,

//                   'party_name'=> $request->party_name,
//                 'party_gst_number'=> $request->party_gst_number,
//                 'party_address'=> $request->party_address,

//             ]);

//             // Delete photos if requested
//             if ($request->has('delete_photo_ids')) {
//                 ExpensePhoto::whereIn('id', $request->delete_photo_ids)
//                     ->where('expense_id', $expense->id)
//                     ->delete();
//             }

//             // Add new photos
//             if ($request->hasFile('new_photos')) {
//                 $photos = $request->file('new_photos');
//                 $remarks = $request->input('new_photo_remarks', []);
                
//                 foreach ($photos as $index => $photo) {
//                     // Validate the file is valid and uploaded successfully
//                     if ($photo->isValid()) {
//                         try {
//                             // Get file info BEFORE compression
//                             $originalSize = round($photo->getSize() / 1024);
//                             $extension = strtolower($photo->getClientOriginalExtension());
//                             $photoType = in_array($extension, ['pdf']) ? 'pdf' : 'image';
                            
//                             // Compress and save
//                             $photoPath = ImageCompressor::compressAndSave($photo, 'bill', 1024);
                            
//                             // Get compressed file size
//                             $fullPath = $_SERVER['DOCUMENT_ROOT'] . '/' . $photoPath;
//                             $compressedSize = file_exists($fullPath) ? round(filesize($fullPath) / 1024) : $originalSize;
                            
//                             ExpensePhoto::create([
//                                 'expense_id' => $expense->id,
//                                 'photo_url' => $photoPath,
//                                 'photo_type' => $photoType,
//                                 'file_size' => $compressedSize,
//                                 'remark' => $remarks[$index] ?? null,
//                             ]);
//                         } catch (\Exception $e) {
//                             \Log::error('Photo upload error in update: ' . $e->getMessage());
//                         }
//                     }
//                 }
//             }

//             ExpenseSummary::where('expense_date', $oldDate)
//                 ->where('company_id', $companyId)
//                 ->where('project_id', $oldProjectId)
//                 ->update([
//                     'total_expense' => DB::raw('total_expense - ' . $oldTotal),
//                 ]);

//             ExpenseSummary::updateOrCreate(
//                 [
//                     'expense_date' => $request->expense_date,
//                     'company_id' => $companyId,
//                     'project_id' => $request->project_id,
//                 ],
//                 [
//                     'total_expense' => DB::raw('total_expense + ' . $request->total_price),
//                 ]
//             );

//             DB::commit();

//             return response()->json([
//                 'success' => true,
//                 'message' => 'Expense updated successfully.',
//                 'expense' => $expense->load('photos'),
//             ]);
//         } catch (\Exception $e) {
//             DB::rollBack();
//             return response()->json(['error' => $e->getMessage()], 500);
//         }
//     }

//     /**
//      * Remove the specified expense
//      * DELETE /expenses/{id}
//      */
//     public function destroy($id)
//     {
//         $user = Auth::user();
//         $companyId = $user->company_id;

//         $expense = Expense::where('id', $id)->where('company_id', $companyId)->first();

//         if (!$expense) {
//             return response()->json(['message' => 'Expense not found'], 404);
//         }

//         $total = $expense->total_price;
//         $date = $expense->expense_date;
//         $projectId = $expense->project_id;

//         // Photos will be deleted automatically due to cascade
//         $expense->delete();

//         ExpenseSummary::where('expense_date', $date)
//             ->where('company_id', $companyId)
//             ->where('project_id', $projectId)
//             ->update([
//                 'total_expense' => DB::raw("total_expense - $total"),
//                 'expense_count' => DB::raw('expense_count - 1'),
//             ]);

//         return response()->json([
//             'success' => true,
//             'message' => 'Expense deleted successfully.',
//         ]);
//     }

//     /**
//      * Get expense report with date range filter
//      * GET /expenses/report
//      */
//     public function expenseReport(Request $request)
//     {
//         $user = Auth::user();
//         $companyId = $user->company_id;
//         $userType = $user->type;
//         $startDate = $request->query('startDate');
//         $endDate = $request->query('endDate');
//         $projectId = $request->query('projectId');
//         $projectTypeId = $request->query('project_type_id');
//         $perPage = $request->query('perPage', 30);
//         $cursor = $request->query('cursor');

//         try {
//             if (!in_array($userType, [0, 1, 2, 3])) {
//                 return response()->json(['error' => 'Not Allowed'], 403);
//             }

//             if (!$startDate || !$endDate) {
//                 return response()->json(['error' => 'Dates are required'], 422);
//             }

//             $query = ExpenseSummary::leftJoin('projects', 'expense_summaries.project_id', '=', 'projects.id')
//                 ->leftJoin('project_types', 'projects.project_type_id', '=', 'project_types.id')
//                 ->where('expense_summaries.company_id', $companyId)
//                 ->whereBetween('expense_summaries.expense_date', [$startDate, $endDate]);

//             if ($projectId) {
//                 $query->where('expense_summaries.project_id', $projectId);
//             }

//             if ($projectTypeId) {
//                 $query->where('projects.project_type_id', $projectTypeId);
//             }

//             $query->select(
//                 'expense_summaries.id',
//                 'expense_summaries.expense_date',
//                 'expense_summaries.total_expense',
//                 'projects.project_name',
//                 'project_types.name as project_type'
//             )->orderBy('expense_summaries.expense_date', 'desc');

//             $summary = DB::table('expense_summaries')
//                 ->where('expense_summaries.company_id', $companyId)
//                 ->whereBetween('expense_summaries.expense_date', [$startDate, $endDate]);

//             if ($projectId) {
//                 $summary->where('expense_summaries.project_id', $projectId);
//             }

//             if ($projectTypeId) {
//                 $summary->leftJoin('projects', 'expense_summaries.project_id', '=', 'projects.id')
//                     ->where('projects.project_type_id', $projectTypeId);
//             }

//             $summary = $summary->selectRaw('SUM(expense_summaries.total_expense) as totalExpense')->first();

//             $expenseRecords = $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
            
//             return response()->json([
//                 'data' => $expenseRecords->items(),
//                 'next_cursor' => $expenseRecords->nextCursor()?->encode(),
//                 'has_more_pages' => $expenseRecords->hasMorePages(),
//                 'total_expense' => $summary->totalExpense,
//             ]);
//         } catch (\Exception $e) {
//             return response()->json(['error' => $e->getMessage()], 500);
//         }
//     }





//    /**
//  * Get unique party names for dropdown filter
//  */
// public function getUniquePartyNames()
// {
//     $user = Auth::user();

//     if (!$user) {
//         return response()->json(['error' => 'Unauthorized'], 401);
//     }

//     $companyId = $user->company_id;

//     $partyNames = Expense::where('company_id', $companyId)
//         ->whereNotNull('party_name')
//         ->where('party_name', '!=', '')
//         ->select('party_name')
//         ->distinct()
//         ->orderBy('party_name', 'asc')
//         ->pluck('party_name');

//     return response()->json($partyNames);
// }





// }






// namespace App\Http\Controllers;

// use App\Models\Expense;
// use App\Models\ExpensePhoto;
// use App\Models\ExpenseSummary;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Str;
// use Illuminate\Support\Facades\Storage;

// class ExpenseController extends Controller
// {
//     protected $user;

//     public function __construct()
//     {
//         $this->user = Auth::user();
//     }

//     /**
//      * Display a listing of expenses with filters
//      * GET /expenses
//      */
//     public function index(Request $request)
//     {
//         $user = Auth::user();
//         $companyId = $user->company_id;
//         $userType = $user->type;
//         $startDate = $request->query('startDate');
//         $endDate = $request->query('endDate');
//         $customerId = $request->query('customerId');
//         $expenseTypeId = $request->query('expenseTypeId');
//         $partyName = $request->query('partyName');
//         $perPage = $request->query('perPage', 50);
//         $cursor = $request->query('cursor');

//         try {
//             if (!in_array($userType, [0, 1, 2, 3])) {
//                 return response()->json(['error' => 'Not Allowed'], 403);
//             }

//             $query = Expense::with([
//                 'expenseType:id,name,expense_category',
//                 'project:id,project_name',
//                 'photos' // Load photos relationship
//             ])->where('company_id', $companyId);

//             if ($expenseTypeId) {
//                 $query->where('expense_id', $expenseTypeId);
//             }

//             if ($customerId) {
//                 $query->where('project_id', $customerId);
//             }

//              if ($customerId) {
//                 $query->where('project_id', $customerId);
//             }

//              // party name filter
//         if ($partyName) {
//             $query->where('party_name', 'like', '%' . $partyName . '%');
//         }

//             if ($startDate && $endDate) {
//                 $query->whereBetween('expense_date', [$startDate, $endDate]);
//             }

//             if (!$expenseTypeId && !$customerId && !$partyName && !($startDate && $endDate)) {
//                 return response()->json(['error' => 'Please provide at least one filter'], 422);
//             }

//             $summaryQuery = Expense::where('company_id', $companyId);

//             if ($expenseTypeId) {
//                 $summaryQuery->where('expense_id', $expenseTypeId);
//             }

//             if ($customerId) {
//                 $summaryQuery->where('project_id', $customerId);
//             }

//              if ($partyName) {
//             $summaryQuery->where('party_name', 'like', '%' . $partyName . '%');
//         }

//             if ($startDate && $endDate) {
//                 $summaryQuery->whereBetween('expense_date', [$startDate, $endDate]);
//             }

//             $summary = $summaryQuery->selectRaw('SUM(total_price) as totalExpense')->first();

//             $query->orderBy('id', 'desc');
//             $expenses = $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor);

//             $data = collect($expenses->items())->map(function ($expense) {
//                 return array_merge($expense->toArray(), [
//                     'customer_name' => $expense->customer->name ?? null,
//                     'customer_address' => $expense->customer->address ?? null,
//                 ]);
//             });

//             return response()->json([
//                 'data' => $data,
//                 'next_cursor' => $expenses->nextCursor()?->encode(),
//                 'has_more_pages' => $expenses->hasMorePages(),
//                 'totalExpense' => $summary->totalExpense ?? 0,
//             ]);
//         } catch (\Exception $e) {
//             return response()->json(['error' => $e->getMessage()], 500);
//         }
//     }



//     /**
//      * Build the correct public URL for DigitalOcean Spaces.
//      * DO Spaces public URL format: https://{bucket}.{region}.digitaloceanspaces.com/{path}
//      */
//     private function buildSpacesUrl(string $s3Path): string
//     {
//         $bucket = env('AWS_BUCKET');
//         $region = env('AWS_DEFAULT_REGION');
//         return "https://{$bucket}.{$region}.digitaloceanspaces.com/{$s3Path}";
//     }

//     /**
//      * Save Uploaded File to DigitalOcean Spaces (S3-compatible)
//      */
//     private function saveUploadedImageToS3($file, string $folder): ?string
//     {
//         if (!$file || !$file->isValid()) {
//             \Log::warning("saveUploadedImageToS3: Invalid file received");
//             return null;
//         }

//         $extension = strtolower($file->getClientOriginalExtension());
//         $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
//         if (!in_array($extension, $allowed)) {
//             \Log::error("saveUploadedImageToS3: Invalid extension: {$extension}");
//             return null;
//         }

//         $cleanFolder = trim(preg_replace('#/+#', '/', $folder), '/');
//         $fileName    = date('His') . '-' . Str::random(12) . '.' . $extension;
//         $envPrefix   = env('ENVIRONMENT_PREFIX', 'localhost');
//         $s3Path      = "img/{$envPrefix}/{$cleanFolder}/{$fileName}";

//         \Log::info("Attempting Spaces upload → path: {$s3Path}");
//         \Log::info("Spaces config → bucket: " . env('AWS_BUCKET') . " | region: " . env('AWS_DEFAULT_REGION') . " | endpoint: " . env('AWS_ENDPOINT'));

//         try {
//             $fileContent = file_get_contents($file->getRealPath());

//             Storage::disk('s3')->put($s3Path, $fileContent, [
//                 'visibility' => 'public',
//                 'ContentType' => $file->getMimeType(),
//             ]);

//             // Build correct DO Spaces URL manually (avoids wrong URL from filesystems.php)
//             $fullUrl = $this->buildSpacesUrl($s3Path);

//             \Log::info("✅ Spaces Upload SUCCESS: {$fullUrl}");
//             return $fullUrl;

//         } catch (\Throwable $e) {
//             \Log::error("❌ Spaces Upload FAILED: " . $e->getMessage());
//             \Log::error("Trace: " . $e->getTraceAsString());
//             // Do NOT silently fall back to local — surface the real error
//             throw new \RuntimeException("Spaces upload failed: " . $e->getMessage());
//         }
//     }

//     /**
//      * Store a newly created expense with multiple photos
//      * POST /expenses
//      */
//     public function store(Request $request)
//     {
//         $user = Auth::user();

//         $request->validate([
//             'expense_date' => 'required|date',
//             'price' => 'required|numeric|min:0',
//             'qty' => 'required|numeric|min:0',
//             'total_price' => 'required|numeric|min:0',
//             'contact' => 'nullable|numeric',
//             'payment_by' => 'nullable|string',
//             'payment_type' => 'nullable|string',
//             'pending_amount' => 'nullable|numeric',
//             'show' => 'required|boolean',
//             'isGst' => 'nullable|boolean',
//             'photoAvailable' => 'nullable|boolean',
//             'photos.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
//             'photo_remarks.*' => 'nullable|string',
//             'photo_remark' => 'nullable|string',
//             'bank_name' => 'nullable|string',
//             'acc_number' => 'nullable|string',
//             'ifsc' => 'nullable|string',
//             'aadhar' => 'nullable|string',
//             'pan' => 'nullable|string',
//             'transaction_id' => 'nullable|string',
//             'gst' => 'nullable|numeric',
//             'sgst' => 'nullable|numeric',
//             'cgst' => 'nullable|numeric',
//             'igst' => 'nullable|numeric',
//             'party_name'=> 'nullable|string',
//   'party_gst_number'=> 'nullable|string',
//   'party_address'=> 'nullable|string',
//         ]);

//         DB::beginTransaction();
//         try {
//             $expense = Expense::create([
//                 'project_id' => $request->project_id,
//                 'name' => $request->name,
//                 'expense_date' => $request->expense_date,
//                 'price' => $request->price,
//                 'qty' => $request->qty,
//                 'total_price' => $request->total_price,
//                 'expense_id' => $request->expense_id,
//                 'contact' => $request->contact,
//                 'payment_by' => $request->payment_by,
//                 'payment_type' => $request->payment_type,
//                 'pending_amount' => $request->pending_amount,
//                 'isGst' => $request->isGst,
//                 'photoAvailable' => $request->photoAvailable,
//                 'photo_url' => null, // Keep for backward compatibility
//                 'photo_remark' => $request->photo_remark,
//                 'bank_name' => $request->bank_name,
//                 'acc_number' => $request->acc_number,
//                 'ifsc' => $request->ifsc,
//                 'aadhar' => $request->aadhar,
//                 'pan' => $request->pan,
//                 'transaction_id' => $request->transaction_id,
//                 'show' => $request->show,
//                 'company_id' => $user->company_id,
//                 'created_by' => $user->id,
//                 'updated_by' => $user->id,
//                 'gst' => $request->gst,
//                 'sgst' => $request->sgst,
//                 'cgst' => $request->cgst,
//                 'igst' => $request->igst,
//                 'party_name'=> $request->party_name,
//                 'party_gst_number'=> $request->party_gst_number,
//                 'party_address'=> $request->party_address,

//             ]);

//             // // Handle multiple photos
//             // if ($request->hasFile('photos')) {
//             //     $photos = $request->file('photos');
//             //     $remarks = $request->input('photo_remarks', []);
                
//             //     foreach ($photos as $index => $photo) {
//             //         // Validate the file is valid and uploaded successfully
//             //         if ($photo->isValid()) {
//             //             try {
//             //                 // Get file info BEFORE compression
//             //                 $originalSize = round($photo->getSize() / 1024); // Original size in KB
//             //                 $extension = strtolower($photo->getClientOriginalExtension());
//             //                 $photoType = in_array($extension, ['pdf']) ? 'pdf' : 'image';
                            
//             //                 // Compress and save the photo (returns relative path)
//             //                 $photoPath = ImageCompressor::compressAndSave($photo, 'bill', 1024);
                            
//             //                 // Get compressed file size
//             //                 $fullPath = $_SERVER['DOCUMENT_ROOT'] . '/' . $photoPath;
//             //                 $compressedSize = file_exists($fullPath) ? round(filesize($fullPath) / 1024) : $originalSize;
                            
//             //                 // Create photo record
//             //                 ExpensePhoto::create([
//             //                     'expense_id' => $expense->id,
//             //                     'photo_url' => $photoPath,
//             //                     'photo_type' => $photoType,
//             //                     'file_size' => $compressedSize,
//             //                     'remark' => $remarks[$index] ?? null,
//             //                 ]);
//             //             } catch (\Exception $e) {
//             //                 // Log error but continue with other photos
//             //                 \Log::error('Photo upload error: ' . $e->getMessage());
//             //             }
//             //         }
//             //     }
//             // }


//             // === Handle Multiple Photos with S3 ===
// // Handle Photos - S3 Preferred
//             if ($request->hasFile('photos')) {
//                 $photos = $request->file('photos');
//                 $remarks = $request->input('photo_remarks', []);

//                 foreach ($photos as $index => $photo) {
//                     if ($photo->isValid()) {
//                         $extension = strtolower($photo->getClientOriginalExtension());
//                         $photoType = in_array($extension, ['pdf']) ? 'pdf' : 'image';

//                         $fileSizeInKB = round($photo->getSize() / 1024);

//                         $photoUrl = $this->saveUploadedImageToS3($photo, 'expenses/bills');

//                         if ($photoUrl) {
//                             ExpensePhoto::create([
//                                 'expense_id' => $expense->id,
//                                 'photo_url'  => $photoUrl,        // Full S3 URL
//                                 'photo_type' => $photoType,
//                                 'file_size'  => $fileSizeInKB,
//                                 'remark'     => $remarks[$index] ?? null,
//                             ]);
//                         }
//                     }
//                 }
//             }

//             ExpenseSummary::updateOrCreate(
//                 [
//                     'expense_date' => $request->expense_date,
//                     'company_id' => $user->company_id,
//                     'project_id' => $request->project_id,
//                 ],
//                 [
//                     'total_expense' => DB::raw('total_expense + ' . $request->total_price),
//                     'expense_count' => DB::raw('expense_count + 1'),
//                 ]
//             );

//             DB::commit();

//             return response()->json([
//                 'success' => true,
//                 'message' => 'Expense created successfully.',
//                 'expense' => $expense->load('photos'),
//             ]);
//         } catch (\Exception $e) {
//             // DB::rollBack();
//             // return response()->json(['error' => $e->getMessage()], 500);
//             DB::rollBack();
//             \Log::error("Expense Store Error: " . $e->getMessage());
//             return response()->json(['error' => $e->getMessage()], 500);
//         }
//     }







//     /**
//      * Display the specified expense
//      * GET /expenses/{id}
//      */
//     public function show($id)
//     {
//         $user = Auth::user();
//         $companyId = $user->company_id;
//         $userType = $user->type;

//         try {
//             if (in_array($userType, [0, 1, 2, 3])) {
//                 $expense = Expense::with('photos')
//                     ->where('id', $id)
//                     ->where('company_id', $companyId)
//                     ->first();
                    
//                 if ($expense) {
//                     return response()->json([
//                         'success' => true,
//                         'expense' => $expense,
//                     ]);
//                 }
//                 return response()->json(['message' => 'Expense not found'], 404);
//             }
//             return response()->json(['error' => 'Not Allowed'], 403);
//         } catch (\Exception $e) {
//             return response()->json(['error' => $e->getMessage()], 500);
//         }
//     }

//     /**
//      * Update the specified expense
//      * PUT/PATCH /expenses/{id}
//      */
//     public function update(Request $request, $id)
//     {
//         $user = Auth::user();
//         $companyId = $user->company_id;

//         $request->validate([
//             'expense_id' => 'required|exists:expense_types,id',
//             'expense_date' => 'required|date',
//             'price' => 'required|numeric|min:0',
//             'qty' => 'required|numeric|min:0',
//             'total_price' => 'required|numeric|min:0',
//             'show' => 'required|boolean',
//             'payment_by' => 'nullable|string',
//             'payment_type' => 'nullable|string',
//             'bank_name' => 'nullable|string',
//             'acc_number' => 'nullable|string',
//             'ifsc' => 'nullable|string',
//             'transaction_id' => 'nullable|string',
//             'gst' => 'nullable|numeric',
//             'sgst' => 'nullable|numeric',
//             'cgst' => 'nullable|numeric',
//             'igst' => 'nullable|numeric',
//             'new_photos.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
//             'new_photo_remarks.*' => 'nullable|string',
//             'delete_photo_ids' => 'nullable|array',
//             'delete_photo_ids.*' => 'integer|exists:expense_photos,id',

//             'party_name'=> 'nullable|string',
//   'party_gst_number'=> 'nullable|string',
//   'party_address'=> 'nullable|string',
//         ]);

//         $expense = Expense::where('id', $id)->where('company_id', $companyId)->first();

//         if (!$expense) {
//             return response()->json(['message' => 'Expense not found'], 404);
//         }

//         DB::beginTransaction();
//         try {
//             $oldTotal = $expense->total_price;
//             $oldDate = $expense->expense_date;
//             $oldProjectId = $expense->project_id;

//             $expense->update([
//                 'expense_id' => $request->expense_id,
//                 'name' => $request->name,
//                 'expense_date' => $request->expense_date,
//                 'price' => $request->price,
//                 'qty' => $request->qty,
//                 'total_price' => $request->total_price,
//                 'show' => $request->show,
//                 'updated_by' => $user->id,
//                 'payment_by' => $request->payment_by,
//                 'payment_type' => $request->payment_type,
//                 'bank_name' => $request->bank_name,
//                 'acc_number' => $request->acc_number,
//                 'ifsc' => $request->ifsc,
//                 'transaction_id' => $request->transaction_id,
//                 'gst' => $request->gst,
//                 'sgst' => $request->sgst,
//                 'cgst' => $request->cgst,
//                 'igst' => $request->igst,

//                   'party_name'=> $request->party_name,
//                 'party_gst_number'=> $request->party_gst_number,
//                 'party_address'=> $request->party_address,

//             ]);

//             // Delete photos if requested
//             if ($request->has('delete_photo_ids')) {
//                 ExpensePhoto::whereIn('id', $request->delete_photo_ids)
//                     ->where('expense_id', $expense->id)
//                     ->delete();
//             }

//             // Add new photos (DigitalOcean Spaces)
//             if ($request->hasFile('new_photos')) {
//                 $photos = $request->file('new_photos');
//                 $remarks = $request->input('new_photo_remarks', []);

//                 foreach ($photos as $index => $photo) {
//                     if ($photo->isValid()) {
//                         try {
//                             $extension = strtolower($photo->getClientOriginalExtension());
//                             $photoType = $extension === 'pdf' ? 'pdf' : 'image';
//                             $fileSizeInKB = round($photo->getSize() / 1024);

//                             $photoUrl = $this->saveUploadedImageToS3($photo, 'expenses/bills');

//                             if ($photoUrl) {
//                                 ExpensePhoto::create([
//                                     'expense_id' => $expense->id,
//                                     'photo_url'  => $photoUrl,
//                                     'photo_type' => $photoType,
//                                     'file_size'  => $fileSizeInKB,
//                                     'remark'     => $remarks[$index] ?? null,
//                                 ]);
//                             }
//                         } catch (\Exception $e) {
//                             \Log::error('Photo upload error in update: ' . $e->getMessage());
//                         }
//                     }
//                 }
//             }

//             ExpenseSummary::where('expense_date', $oldDate)
//                 ->where('company_id', $companyId)
//                 ->where('project_id', $oldProjectId)
//                 ->update([
//                     'total_expense' => DB::raw('total_expense - ' . $oldTotal),
//                 ]);

//             ExpenseSummary::updateOrCreate(
//                 [
//                     'expense_date' => $request->expense_date,
//                     'company_id' => $companyId,
//                     'project_id' => $request->project_id,
//                 ],
//                 [
//                     'total_expense' => DB::raw('total_expense + ' . $request->total_price),
//                 ]
//             );

//             DB::commit();

//             return response()->json([
//                 'success' => true,
//                 'message' => 'Expense updated successfully.',
//                 'expense' => $expense->load('photos'),
//             ]);
//         } catch (\Exception $e) {
//             DB::rollBack();
//             return response()->json(['error' => $e->getMessage()], 500);
//         }
//     }

//     /**
//      * Remove the specified expense
//      * DELETE /expenses/{id}
//      */
//     public function destroy($id)
//     {
//         $user = Auth::user();
//         $companyId = $user->company_id;

//         $expense = Expense::where('id', $id)->where('company_id', $companyId)->first();

//         if (!$expense) {
//             return response()->json(['message' => 'Expense not found'], 404);
//         }

//         $total = $expense->total_price;
//         $date = $expense->expense_date;
//         $projectId = $expense->project_id;

//         // Photos will be deleted automatically due to cascade
//         $expense->delete();

//         ExpenseSummary::where('expense_date', $date)
//             ->where('company_id', $companyId)
//             ->where('project_id', $projectId)
//             ->update([
//                 'total_expense' => DB::raw("total_expense - $total"),
//                 'expense_count' => DB::raw('expense_count - 1'),
//             ]);

//         return response()->json([
//             'success' => true,
//             'message' => 'Expense deleted successfully.',
//         ]);
//     }

//     /**
//      * Get expense report with date range filter
//      * GET /expenses/report
//      */
//     public function expenseReport(Request $request)
//     {
//         $user = Auth::user();
//         $companyId = $user->company_id;
//         $userType = $user->type;
//         $startDate = $request->query('startDate');
//         $endDate = $request->query('endDate');
//         $projectId = $request->query('projectId');
//         $projectTypeId = $request->query('project_type_id');
//         $perPage = $request->query('perPage', 30);
//         $cursor = $request->query('cursor');

//         try {
//             if (!in_array($userType, [0, 1, 2, 3])) {
//                 return response()->json(['error' => 'Not Allowed'], 403);
//             }

//             if (!$startDate || !$endDate) {
//                 return response()->json(['error' => 'Dates are required'], 422);
//             }

//             $query = ExpenseSummary::leftJoin('projects', 'expense_summaries.project_id', '=', 'projects.id')
//                 ->leftJoin('project_types', 'projects.project_type_id', '=', 'project_types.id')
//                 ->where('expense_summaries.company_id', $companyId)
//                 ->whereBetween('expense_summaries.expense_date', [$startDate, $endDate]);

//             if ($projectId) {
//                 $query->where('expense_summaries.project_id', $projectId);
//             }

//             if ($projectTypeId) {
//                 $query->where('projects.project_type_id', $projectTypeId);
//             }

//             $query->select(
//                 'expense_summaries.id',
//                 'expense_summaries.expense_date',
//                 'expense_summaries.total_expense',
//                 'projects.project_name',
//                 'project_types.name as project_type'
//             )->orderBy('expense_summaries.expense_date', 'desc');

//             $summary = DB::table('expense_summaries')
//                 ->where('expense_summaries.company_id', $companyId)
//                 ->whereBetween('expense_summaries.expense_date', [$startDate, $endDate]);

//             if ($projectId) {
//                 $summary->where('expense_summaries.project_id', $projectId);
//             }

//             if ($projectTypeId) {
//                 $summary->leftJoin('projects', 'expense_summaries.project_id', '=', 'projects.id')
//                     ->where('projects.project_type_id', $projectTypeId);
//             }

//             $summary = $summary->selectRaw('SUM(expense_summaries.total_expense) as totalExpense')->first();

//             $expenseRecords = $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
            
//             return response()->json([
//                 'data' => $expenseRecords->items(),
//                 'next_cursor' => $expenseRecords->nextCursor()?->encode(),
//                 'has_more_pages' => $expenseRecords->hasMorePages(),
//                 'total_expense' => $summary->totalExpense,
//             ]);
//         } catch (\Exception $e) {
//             return response()->json(['error' => $e->getMessage()], 500);
//         }
//     }





//    /**
//  * Get unique party names for dropdown filter
//  */
// public function getUniquePartyNames()
// {
//     $user = Auth::user();

//     if (!$user) {
//         return response()->json(['error' => 'Unauthorized'], 401);
//     }

//     $companyId = $user->company_id;

//     $partyNames = Expense::where('company_id', $companyId)
//         ->whereNotNull('party_name')
//         ->where('party_name', '!=', '')
//         ->select('party_name')
//         ->distinct()
//         ->orderBy('party_name', 'asc')
//         ->pluck('party_name');

//     return response()->json($partyNames);
// }





// }


















namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpensePhoto;
use App\Models\ExpenseSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ExpenseController extends Controller
{
    protected $user;

    public function __construct()
    {
        $this->user = Auth::user();
    }

    // =========================================================
    // HELPERS
    // =========================================================

    /**
     * Build the correct public URL for DigitalOcean Spaces.
     * Format: https://{bucket}.{region}.digitaloceanspaces.com/{path}
     */
    private function buildSpacesUrl(string $s3Path): string
    {
        $bucket = env('AWS_BUCKET');
        $region = env('AWS_DEFAULT_REGION');
        return "https://{$bucket}.{$region}.digitaloceanspaces.com/{$s3Path}";
    }
 
    /**
     * Resolve any stored photo_url to a publicly accessible URL.
     *
     * Handles three formats that may exist in the DB:
     *   1. Already a full https:// URL  → return as-is
     *   2. Old local relative path      → prepend APP_URL
     *   3. S3 key / path               → build Spaces URL
     */
    public static function resolvePhotoUrl(?string $storedUrl): ?string
    {
        if (!$storedUrl) return null;

        // Already a full URL (S3 or anything else)
        if (str_starts_with($storedUrl, 'http://') || str_starts_with($storedUrl, 'https://')) {
            return $storedUrl;
        }

        // Old local path stored as relative e.g. "img/expenses/bills/file.png"
        // → serve via APP_URL
        return rtrim(env('APP_URL', ''), '/') . '/' . ltrim($storedUrl, '/');
    }

    /**
     * Upload a file to DigitalOcean Spaces and return its full public URL.
     */
    private function saveUploadedImageToS3($file, string $folder): ?string
    {
        if (!$file || !$file->isValid()) { 
            \Log::warning("saveUploadedImageToS3: Invalid file received");
            return null;
        }

        $extension = strtolower($file->getClientOriginalExtension());
        $allowed   = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
        if (!in_array($extension, $allowed)) {
            \Log::error("saveUploadedImageToS3: Invalid extension: {$extension}");
            return null;
        }

        $cleanFolder = trim(preg_replace('#/+#', '/', $folder), '/');
        $fileName    = date('His') . '-' . Str::random(12) . '.' . $extension;
        $envPrefix   = env('ENVIRONMENT_PREFIX', 'localhost');
        $s3Path      = "img/{$envPrefix}/{$cleanFolder}/{$fileName}";

        \Log::info("Spaces upload → bucket: " . env('AWS_BUCKET') . " | path: {$s3Path}");

        try {
            Storage::disk('s3')->put($s3Path, file_get_contents($file->getRealPath()), [
                'visibility'  => 'public',
                'ContentType' => $file->getMimeType(),
            ]);

            $fullUrl = $this->buildSpacesUrl($s3Path);
            \Log::info("✅ Spaces Upload SUCCESS: {$fullUrl}");
            return $fullUrl;

        } catch (\Throwable $e) {
            \Log::error("❌ Spaces Upload FAILED: " . $e->getMessage());
            throw new \RuntimeException("Spaces upload failed: " . $e->getMessage());
        }
    }

    // =========================================================
    // INDEX
    // =========================================================

    public function index(Request $request)
    {
        $user        = Auth::user();
        $companyId   = $user->company_id;
        $userType    = $user->type;
        $startDate   = $request->query('startDate');
        $endDate     = $request->query('endDate');
        $customerId  = $request->query('customerId');
        $expenseTypeId = $request->query('expenseTypeId');
        $partyName   = $request->query('partyName');
        $perPage     = $request->query('perPage', 50);
        $cursor      = $request->query('cursor');

        try {
            $hasCustomAccess = (!empty($user->permissions) && is_array($user->permissions) && count($user->permissions) > 0) || $userType >= 6;
            if (!in_array($userType, [0, 1, 2, 3]) && !$hasCustomAccess) {
                return response()->json(['error' => 'Not Allowed'], 403);
            }

            $query = Expense::with([
                'expenseType:id,name,expense_category',
                'project:id,project_name',
                'photos',
            ])->where('company_id', $companyId);

            if ($expenseTypeId) $query->where('expense_id', $expenseTypeId);
            if ($customerId)    $query->where('project_id', $customerId);
            if ($partyName)     $query->where('party_name', 'like', '%' . $partyName . '%');

            if ($startDate && $endDate) {
                $query->whereBetween('expense_date', [$startDate, $endDate]);
            }

            if (!$expenseTypeId && !$customerId && !$partyName && !($startDate && $endDate)) {
                return response()->json(['error' => 'Please provide at least one filter'], 422);
            }

            $summaryQuery = Expense::where('company_id', $companyId);
            if ($expenseTypeId) $summaryQuery->where('expense_id', $expenseTypeId);
            if ($customerId)    $summaryQuery->where('project_id', $customerId);
            if ($partyName)     $summaryQuery->where('party_name', 'like', '%' . $partyName . '%');
            if ($startDate && $endDate) {
                $summaryQuery->whereBetween('expense_date', [$startDate, $endDate]);
            }

            $summary  = $summaryQuery->selectRaw('SUM(total_price) as totalExpense')->first();
            $query->orderBy('id', 'desc');
            $expenses = $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor);

            // Resolve photo URLs before sending to frontend
            $data = collect($expenses->items())->map(function ($expense) {
                $arr = $expense->toArray();

                // Resolve each photo's URL
                if (!empty($arr['photos'])) {
                    $arr['photos'] = array_map(function ($photo) {
                        $photo['photo_url'] = self::resolvePhotoUrl($photo['photo_url']);
                        return $photo;
                    }, $arr['photos']);
                }

                // Resolve legacy single photo_url
                if (!empty($arr['photo_url'])) {
                    $arr['photo_url'] = self::resolvePhotoUrl($arr['photo_url']);
                }

                return array_merge($arr, [
                    'customer_name'    => $expense->customer->name    ?? null,
                    'customer_address' => $expense->customer->address ?? null,
                ]);
            });

            return response()->json([
                'data'           => $data,
                'next_cursor'    => $expenses->nextCursor()?->encode(),
                'has_more_pages' => $expenses->hasMorePages(),
                'totalExpense'   => $summary->totalExpense ?? 0,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // =========================================================
    // STORE
    // =========================================================

    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'expense_date'      => 'required|date',
            'price'             => 'required|numeric|min:0',
            'qty'               => 'required|numeric|min:0',
            'total_price'       => 'required|numeric|min:0',
            'contact'           => 'nullable|numeric',
            'payment_by'        => 'nullable|string',
            'payment_type'      => 'nullable|string',
            'pending_amount'    => 'nullable|numeric',
            'show'              => 'required|boolean',
            'isGst'             => 'nullable|boolean',
            'photoAvailable'    => 'nullable|boolean',
            'photos.*'          => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'photo_remarks.*'   => 'nullable|string',
            'photo_remark'      => 'nullable|string',
            'bank_name'         => 'nullable|string',
            'acc_number'        => 'nullable|string',
            'ifsc'              => 'nullable|string',
            'aadhar'            => 'nullable|string',
            'pan'               => 'nullable|string',
            'transaction_id'    => 'nullable|string',
            'gst'               => 'nullable|numeric',
            'sgst'              => 'nullable|numeric',
            'cgst'              => 'nullable|numeric',
            'igst'              => 'nullable|numeric',
            'party_name'        => 'nullable|string',
            'party_gst_number'  => 'nullable|string',
            'party_address'     => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $expense = Expense::create([
                'project_id'        => $request->project_id,
                'name'              => $request->name,
                'expense_date'      => $request->expense_date,
                'price'             => $request->price,
                'qty'               => $request->qty,
                'total_price'       => $request->total_price,
                'expense_id'        => $request->expense_id,
                'contact'           => $request->contact,
                'payment_by'        => $request->payment_by,
                'payment_type'      => $request->payment_type,
                'pending_amount'    => $request->pending_amount,
                'isGst'             => $request->isGst,
                'photoAvailable'    => $request->photoAvailable,
                'photo_url'         => null,
                'photo_remark'      => $request->photo_remark,
                'bank_name'         => $request->bank_name,
                'acc_number'        => $request->acc_number,
                'ifsc'              => $request->ifsc,
                'aadhar'            => $request->aadhar,
                'pan'               => $request->pan,
                'transaction_id'    => $request->transaction_id,
                'show'              => $request->show,
                'company_id'        => $user->company_id,
                'created_by'        => $user->id,
                'updated_by'        => $user->id,
                'gst'               => $request->gst,
                'sgst'              => $request->sgst,
                'cgst'              => $request->cgst,
                'igst'              => $request->igst,
                'party_name'        => $request->party_name,
                'party_gst_number'  => $request->party_gst_number,
                'party_address'     => $request->party_address,
            ]);

            if ($request->hasFile('photos')) {
                $remarks = $request->input('photo_remarks', []);

                foreach ($request->file('photos') as $index => $photo) {
                    if (!$photo->isValid()) continue;

                    $extension = strtolower($photo->getClientOriginalExtension());
                    $photoType = $extension === 'pdf' ? 'pdf' : 'image';

                    $photoUrl = $this->saveUploadedImageToS3($photo, 'expenses/bills');

                    if ($photoUrl) {
                        ExpensePhoto::create([
                            'expense_id' => $expense->id,
                            'photo_url'  => $photoUrl,           // Full S3 URL stored in DB
                            'photo_type' => $photoType,
                            'file_size'  => round($photo->getSize() / 1024),
                            'remark'     => $remarks[$index] ?? null,
                        ]);
                    }
                }
            }

            ExpenseSummary::updateOrCreate(
                [
                    'expense_date' => $request->expense_date,
                    'company_id'   => $user->company_id,
                    'project_id'   => $request->project_id,
                ],
                [
                    'total_expense' => DB::raw('total_expense + ' . $request->total_price),
                    'expense_count' => DB::raw('expense_count + 1'),
                ]
            );

            DB::commit();

            // Resolve URLs in response
            $expenseData             = $expense->load('photos')->toArray();
            $expenseData['photos']   = array_map(function ($p) {
                $p['photo_url'] = self::resolvePhotoUrl($p['photo_url']);
                return $p;
            }, $expenseData['photos']);

            return response()->json([
                'success' => true,
                'message' => 'Expense created successfully.',
                'expense' => $expenseData,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error("Expense Store Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // =========================================================
    // SHOW
    // =========================================================

    public function show($id)
    {
        $user      = Auth::user();
        $companyId = $user->company_id;
        $userType  = $user->type;

        try {
            $hasCustomAccess = (!empty($user->permissions) && is_array($user->permissions) && count($user->permissions) > 0) || $userType >= 6;
            if (!in_array($userType, [0, 1, 2, 3]) && !$hasCustomAccess) {
                return response()->json(['error' => 'Not Allowed'], 403);
            }

            $expense = Expense::with('photos')
                ->where('id', $id)
                ->where('company_id', $companyId)
                ->first();

            if (!$expense) {
                return response()->json(['message' => 'Expense not found'], 404);
            }

            $expenseData           = $expense->toArray();
            $expenseData['photos'] = array_map(function ($p) {
                $p['photo_url'] = self::resolvePhotoUrl($p['photo_url']);
                return $p;
            }, $expenseData['photos']);

            if (!empty($expenseData['photo_url'])) {
                $expenseData['photo_url'] = self::resolvePhotoUrl($expenseData['photo_url']);
            }

            return response()->json(['success' => true, 'expense' => $expenseData]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // =========================================================
    // UPDATE
    // =========================================================

    public function update(Request $request, $id)
    {
        $user      = Auth::user();
        $companyId = $user->company_id;

        $request->validate([
            'expense_id'            => 'required|exists:expense_types,id',
            'expense_date'          => 'required|date',
            'price'                 => 'required|numeric|min:0',
            'qty'                   => 'required|numeric|min:0',
            'total_price'           => 'required|numeric|min:0',
            'show'                  => 'required|boolean',
            'payment_by'            => 'nullable|string',
            'payment_type'          => 'nullable|string',
            'bank_name'             => 'nullable|string',
            'acc_number'            => 'nullable|string',
            'ifsc'                  => 'nullable|string',
            'transaction_id'        => 'nullable|string',
            'gst'                   => 'nullable|numeric',
            'sgst'                  => 'nullable|numeric',
            'cgst'                  => 'nullable|numeric',
            'igst'                  => 'nullable|numeric',
            'new_photos.*'          => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
            'new_photo_remarks.*'   => 'nullable|string',
            'delete_photo_ids'      => 'nullable|array',
            'delete_photo_ids.*'    => 'integer|exists:expense_photos,id',
            'party_name'            => 'nullable|string',
            'party_gst_number'      => 'nullable|string',
            'party_address'         => 'nullable|string',
        ]);

        $expense = Expense::where('id', $id)->where('company_id', $companyId)->first();
        if (!$expense) {
            return response()->json(['message' => 'Expense not found'], 404);
        }

        DB::beginTransaction();
        try {
            $oldTotal     = $expense->total_price;
            $oldDate      = $expense->expense_date;
            $oldProjectId = $expense->project_id;

            $expense->update([
                'expense_id'        => $request->expense_id,
                'name'              => $request->name,
                'expense_date'      => $request->expense_date,
                'price'             => $request->price,
                'qty'               => $request->qty,
                'total_price'       => $request->total_price,
                'show'              => $request->show,
                'updated_by'        => $user->id,
                'payment_by'        => $request->payment_by,
                'payment_type'      => $request->payment_type,
                'bank_name'         => $request->bank_name,
                'acc_number'        => $request->acc_number,
                'ifsc'              => $request->ifsc,
                'transaction_id'    => $request->transaction_id,
                'gst'               => $request->gst,
                'sgst'              => $request->sgst,
                'cgst'              => $request->cgst,
                'igst'              => $request->igst,
                'party_name'        => $request->party_name,
                'party_gst_number'  => $request->party_gst_number,
                'party_address'     => $request->party_address,
            ]);

            // Delete requested photos
            if ($request->has('delete_photo_ids')) {
                ExpensePhoto::whereIn('id', $request->delete_photo_ids)
                    ->where('expense_id', $expense->id)
                    ->delete();
            }

            // Upload new photos to Spaces
            if ($request->hasFile('new_photos')) {
                $remarks = $request->input('new_photo_remarks', []);

                foreach ($request->file('new_photos') as $index => $photo) {
                    if (!$photo->isValid()) continue;

                    try {
                        $extension = strtolower($photo->getClientOriginalExtension());
                        $photoType = $extension === 'pdf' ? 'pdf' : 'image';
                        $photoUrl  = $this->saveUploadedImageToS3($photo, 'expenses/bills');

                        if ($photoUrl) {
                            ExpensePhoto::create([
                                'expense_id' => $expense->id,
                                'photo_url'  => $photoUrl,
                                'photo_type' => $photoType,
                                'file_size'  => round($photo->getSize() / 1024),
                                'remark'     => $remarks[$index] ?? null,
                            ]);
                        }
                    } catch (\Exception $e) {
                        \Log::error('Photo upload error in update: ' . $e->getMessage());
                    }
                }
            }

            ExpenseSummary::where('expense_date', $oldDate)
                ->where('company_id', $companyId)
                ->where('project_id', $oldProjectId)
                ->update(['total_expense' => DB::raw('total_expense - ' . $oldTotal)]);

            ExpenseSummary::updateOrCreate(
                [
                    'expense_date' => $request->expense_date,
                    'company_id'   => $companyId,
                    'project_id'   => $request->project_id,
                ],
                ['total_expense' => DB::raw('total_expense + ' . $request->total_price)]
            );

            DB::commit();

            // Resolve URLs in response
            $expenseData           = $expense->load('photos')->toArray();
            $expenseData['photos'] = array_map(function ($p) {
                $p['photo_url'] = self::resolvePhotoUrl($p['photo_url']);
                return $p;
            }, $expenseData['photos']);

            return response()->json([
                'success' => true,
                'message' => 'Expense updated successfully.',
                'expense' => $expenseData,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // =========================================================
    // DESTROY
    // =========================================================

    public function destroy($id)
    {
        $user      = Auth::user();
        $companyId = $user->company_id;

        $expense = Expense::where('id', $id)->where('company_id', $companyId)->first();
        if (!$expense) {
            return response()->json(['message' => 'Expense not found'], 404);
        }

        $total     = $expense->total_price;
        $date      = $expense->expense_date;
        $projectId = $expense->project_id;

        $expense->delete();

        ExpenseSummary::where('expense_date', $date)
            ->where('company_id', $companyId)
            ->where('project_id', $projectId)
            ->update([
                'total_expense' => DB::raw("total_expense - $total"),
                'expense_count' => DB::raw('expense_count - 1'),
            ]);

        return response()->json(['success' => true, 'message' => 'Expense deleted successfully.']);
    }

    // =========================================================
    // EXPENSE REPORT
    // =========================================================

    public function expenseReport(Request $request)
    {
        $user          = Auth::user();
        $companyId     = $user->company_id;
        $userType      = $user->type;
        $startDate     = $request->query('startDate');
        $endDate       = $request->query('endDate');
        $projectId     = $request->query('projectId');
        $projectTypeId = $request->query('project_type_id');
        $perPage       = $request->query('perPage', 30);
        $cursor        = $request->query('cursor');

        try {
            $hasCustomAccess = (!empty($user->permissions) && is_array($user->permissions) && count($user->permissions) > 0) || $userType >= 6;
            if (!in_array($userType, [0, 1, 2, 3]) && !$hasCustomAccess) {
                return response()->json(['error' => 'Not Allowed'], 403);
            }
            if (!$startDate || !$endDate) {
                return response()->json(['error' => 'Dates are required'], 422);
            }

            $query = ExpenseSummary::leftJoin('projects', 'expense_summaries.project_id', '=', 'projects.id')
                ->leftJoin('project_types', 'projects.project_type_id', '=', 'project_types.id')
                ->where('expense_summaries.company_id', $companyId)
                ->whereBetween('expense_summaries.expense_date', [$startDate, $endDate]);

            if ($projectId)     $query->where('expense_summaries.project_id', $projectId);
            if ($projectTypeId) $query->where('projects.project_type_id', $projectTypeId);

            $query->select(
                'expense_summaries.id',
                'expense_summaries.expense_date',
                'expense_summaries.total_expense',
                'projects.project_name',
                'project_types.name as project_type'
            )->orderBy('expense_summaries.expense_date', 'desc');

            $summary = DB::table('expense_summaries')
                ->where('expense_summaries.company_id', $companyId)
                ->whereBetween('expense_summaries.expense_date', [$startDate, $endDate]);

            if ($projectId)     $summary->where('expense_summaries.project_id', $projectId);
            if ($projectTypeId) {
                $summary->leftJoin('projects', 'expense_summaries.project_id', '=', 'projects.id')
                    ->where('projects.project_type_id', $projectTypeId);
            }

            $summary         = $summary->selectRaw('SUM(expense_summaries.total_expense) as totalExpense')->first();
            $expenseRecords  = $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor);

            return response()->json([
                'data'           => $expenseRecords->items(),
                'next_cursor'    => $expenseRecords->nextCursor()?->encode(),
                'has_more_pages' => $expenseRecords->hasMorePages(),
                'total_expense'  => $summary->totalExpense,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // =========================================================
    // PARTY NAMES
    // =========================================================

    public function getUniquePartyNames()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $partyNames = Expense::where('company_id', $user->company_id)
            ->whereNotNull('party_name')
            ->where('party_name', '!=', '')
            ->select('party_name')
            ->distinct()
            ->orderBy('party_name', 'asc')
            ->pluck('party_name');

        return response()->json($partyNames);
    }
}