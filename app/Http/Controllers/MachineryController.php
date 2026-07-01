<?php

// namespace App\Http\Controllers;

// use App\Models\Machinery;
// use Illuminate\Http\Request;

// class MachineryController extends Controller
// {
//     /**
//      * Store a newly created machinery in storage.
//      */
//     public function store(Request $request)
//     {
//         $companyId = auth()->user()->company_id; // ✅ logged in user's company

//         $validated = $request->validate([
//             'machine_name' => 'required|string|max:255',
//             'reg_number'   => 'required|string|max:255',
//             'ownership_type' => 'required|string|max:255',
            
//         ]);

//         $validated['company_id'] = $companyId; // ✅ force company_id

//         $machinery = Machinery::create($validated);

//         return response()->json([
//             'message' => 'Machinery created successfully!',
//             'data'    => $machinery,
//         ], 201);
//     }

//     /**
//      * Display a listing of the machineries for the user's company.
//      */
//     public function index()
//     {
//         $companyId = auth()->user()->company_id;

//         $machineries = Machinery::where('company_id', $companyId)->get();

//         return response()->json([
//             'message' => 'Machineries fetched successfully!',
//             'data'    => $machineries,
//         ], 200);
//     }

//     /**
//      * Display the specified machinery for the user's company.
//      */
//     public function show($id)
//     {
//         $companyId = auth()->user()->company_id;

//         $machinery = Machinery::where('company_id', $companyId)->findOrFail($id);

//         return response()->json([
//             'message' => 'Machinery fetched successfully!',
//             'data'    => $machinery,
//         ], 200);
//     }

//     /**
//      * Update the specified machinery in storage.
//      */
//     public function update(Request $request, $id)
//     {
//         $companyId = auth()->user()->company_id;

//         $machinery = Machinery::where('company_id', $companyId)->findOrFail($id);

//         $validated = $request->validate([
//             'machine_name' => 'sometimes|required|string|max:255',
//             'reg_number'   => 'sometimes|required|string|max:255|unique:machineries,reg_number,' . $machinery->id,
//             'ownership_type' =>  'sometimes|required|string|max:255'
//         ]);

//         $machinery->update($validated);

//         return response()->json([
//             'message' => 'Machinery updated successfully!',
//             'data'    => $machinery,
//         ], 200);
//     }

//     /**
//      * Remove the specified machinery from storage.
//      */
//     public function destroy($id)
//     {
//         $companyId = auth()->user()->company_id;

//         $machinery = Machinery::where('company_id', $companyId)->findOrFail($id);

//         $machinery->delete();

//         return response()->json([
//             'message' => 'Machinery deleted successfully!',
//         ], 200);
//     }
// }












namespace App\Http\Controllers;

use App\Models\Machinery;
use App\Models\MachineryDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Validation\Rule;

class MachineryController extends Controller
{
    /**
     * Store a newly created machinery in storage.
     */
    public function store(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $validated = $request->validate([

            // Machinery Details
            'machine_name'      => 'required|string|max:255',
            // 'reg_number'        => 'required|string|max:255',

            'reg_number'     => [
            'required',
            'string',
            'max:255',
            Rule::unique('machineries', 'reg_number')
                ->where('company_id', $companyId),
        ],

            'ownership_type'    => 'required|string|max:255',

            // Documents
            'documents'                         => 'nullable|array',

            'documents.*.document_type'        => 'required|string|in:PUC,INSURANCE,FITNESS,PERMIT,ROAD_TAX,OTHER',

            'documents.*.document_number'      => 'nullable|string|max:255',

            'documents.*.issue_date'           => 'nullable|date',

            'documents.*.expiry_date'          => 'nullable|date',

            'documents.*.document_file'        => 'nullable|string|max:255',

            'documents.*.remark'               => 'nullable|string',

        ]);

        DB::beginTransaction();

        try {

            // Create Machinery
            $machinery = Machinery::create([
                'company_id'      => $companyId,
                'machine_name'    => $validated['machine_name'],
                'reg_number'      => $validated['reg_number'],
                'ownership_type'  => $validated['ownership_type'],
            ]);

            // Store Documents
            if (!empty($validated['documents'])) {

                foreach ($validated['documents'] as $document) {

                    $machinery->documents()->create([
                        'document_type'   => $document['document_type'],
                        'document_number' => $document['document_number'] ?? null,
                        'issue_date'      => $document['issue_date'] ?? null,
                        'expiry_date'     => $document['expiry_date'] ?? null,
                        'document_file'   => $document['document_file'] ?? null,
                        'remark'          => $document['remark'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Machinery created successfully!',
                'data'    => $machinery->load('documents'),
            ], 201);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Something went wrong!',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display all machineries.
     */
    public function index()
    {
        $companyId = auth()->user()->company_id;

        $machineries = Machinery::with('documents')
            ->where('company_id', $companyId)
            ->get();

        return response()->json([
            'message' => 'Machineries fetched successfully!',
            'data'    => $machineries,
        ], 200);
    }

    /**
     * Display single machinery.
     */
    public function show($id)
    {
        $companyId = auth()->user()->company_id;

        $machinery = Machinery::with('documents')
            ->where('company_id', $companyId)
            ->findOrFail($id);

        return response()->json([
            'message' => 'Machinery fetched successfully!',
            'data'    => $machinery,
        ], 200);
    }

    /**
     * Update machinery.
     */
    public function update(Request $request, $id)
    {
        $companyId = auth()->user()->company_id;

        $machinery = Machinery::where('company_id', $companyId)
            ->findOrFail($id);

        $validated = $request->validate([

            'machine_name'      => 'sometimes|required|string|max:255',

            'reg_number'        => 'sometimes|required|string|max:255|unique:machineries,reg_number,' . $machinery->id,

            'ownership_type'    => 'sometimes|required|string|max:255',

            // Documents
            'documents'                         => 'nullable|array',

            'documents.*.id'                    => 'nullable|exists:machinery_documents,id',

            'documents.*.document_type'         => 'required|string|in:PUC,INSURANCE,FITNESS,PERMIT,ROAD_TAX,OTHER',

            'documents.*.document_number'       => 'nullable|string|max:255',

            'documents.*.issue_date'            => 'nullable|date',

            'documents.*.expiry_date'           => 'nullable|date',

            'documents.*.document_file'         => 'nullable|string|max:255',

            'documents.*.remark'                => 'nullable|string',

        ]);

        DB::beginTransaction();

        try {

            // Update Machinery
            $machinery->update([
                'machine_name'    => $validated['machine_name'] ?? $machinery->machine_name,
                'reg_number'      => $validated['reg_number'] ?? $machinery->reg_number,
                'ownership_type'  => $validated['ownership_type'] ?? $machinery->ownership_type,
                'diesel_balance'  => $request->diesel_balance ?? $machinery->diesel_balance,
            ]);

            // Update/Create Documents
            if (!empty($validated['documents'])) {

                foreach ($validated['documents'] as $document) {

                    if (!empty($document['id'])) {

                        // Update Existing
                        $existingDocument = MachineryDocument::where('machinery_id', $machinery->id)
                            ->findOrFail($document['id']);

                        $existingDocument->update([
                            'document_type'   => $document['document_type'],
                            'document_number' => $document['document_number'] ?? null,
                            'issue_date'      => $document['issue_date'] ?? null,
                            'expiry_date'     => $document['expiry_date'] ?? null,
                            'document_file'   => $document['document_file'] ?? null,
                            'remark'          => $document['remark'] ?? null,
                        ]);

                    } else {

                        // Create New
                        $machinery->documents()->create([
                            'document_type'   => $document['document_type'],
                            'document_number' => $document['document_number'] ?? null,
                            'issue_date'      => $document['issue_date'] ?? null,
                            'expiry_date'     => $document['expiry_date'] ?? null,
                            'document_file'   => $document['document_file'] ?? null,
                            'remark'          => $document['remark'] ?? null,
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Machinery updated successfully!',
                'data'    => $machinery->load('documents'),
            ], 200);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Something went wrong!',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete machinery.
     */
    public function destroy($id)
    {
        $companyId = auth()->user()->company_id;

        $machinery = Machinery::where('company_id', $companyId)
            ->findOrFail($id);

        $machinery->delete();

        return response()->json([
            'message' => 'Machinery deleted successfully!',
        ], 200);
    }



    public function expiryAlerts()
{
    $companyId = auth()->user()->company_id;

    $documents = MachineryDocument::with('machinery')
        ->whereHas('machinery', function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })
        ->whereNotNull('expiry_date')
        ->get();

    $alerts = [];

    foreach ($documents as $document) {

        $today = Carbon::today();

        $expiryDate = Carbon::parse($document->expiry_date);

        $daysRemaining = $today->diffInDays($expiryDate, false);

        $message = null;

        // Already Expired
        if ($daysRemaining < 0) {

            $message = "{$document->document_type} expired " . abs($daysRemaining) . " days ago";

        }
        // Expiring Today
        elseif ($daysRemaining == 0) {

            $message = "{$document->document_type} expires today";

        }
        // Within 7 Days
        elseif ($daysRemaining <= 7) {

            $message = "{$document->document_type} expires in {$daysRemaining} days";

        }
        // Within 30 Days
        elseif ($daysRemaining <= 30) {

            $message = "{$document->document_type} will expire in {$daysRemaining} days";

        }

        if ($message) {

            $alerts[] = [
                'machinery_id'     => $document->machinery->id,
                'machine_name'     => $document->machinery->machine_name,
                'document_type'    => $document->document_type,
                'document_number'  => $document->document_number,
                'expiry_date'      => $document->expiry_date,
                'days_remaining'   => $daysRemaining,
                'message'          => $message,
            ];
        }
    }

    return response()->json([
        'message' => 'Expiry alerts fetched successfully!',
        'data'    => $alerts,
    ]);
}



}