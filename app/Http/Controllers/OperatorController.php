<?php

namespace App\Http\Controllers;

use App\Models\Operator;
use Illuminate\Http\Request;

class OperatorController extends Controller
{
    /**
     * Display a listing of operators.
     */
    public function index()
    {
        $operators = Operator::all();
        return response()->json($operators);
    }

    /**
     * Store a newly created operator.
     */
public function store(Request $request)
{
    $validated = $request->validate([
        'name'    => 'required|string|max:255',
        'mobile'  => 'nullable|string|max:20',
        'address' => 'nullable|string',
        'payment' => 'nullable|numeric',
        'show'    => 'boolean',
        'type'    => 'required | string' ,
        'project_id' =>   'required |string',
         'bank_name'=> 'nullable | string',
        'account_number'=> 'nullable|string',
        'ifsc_code'  => 'nullable|string',
        'adhar_number'  => 'nullable|string',
        'pan_number' => 'nullable|string',
        'gst_no' => 'nullable|string'
    ]);

    // Automatically set company_id from logged-in user
    $validated['company_id'] = auth()->user()->company_id;

    $operator = Operator::create($validated);

    return response()->json([
        'message' => 'Operator created successfully!',
        'data'    => $operator
    ], 201);
}
// public function store(Request $request)
// {
//     $validated = $request->validate([
//         'name'       => 'required|string|max:255',
//         'mobile'     => 'nullable|string|max:20',
//         'address'    => 'nullable|string',
//         'payment'    => 'nullable|numeric',
//         'show'       => 'boolean',
//         'type'       => 'required|string|in:0,1',   // 0 = Supervisor, 1 = Operator
//         'project'    => 'nullable|integer',        // frontend sends "project" key
//     ]);

//     // Always attach company of logged user
//     $validated['company_id'] = auth()->user()->company_id;

//     // Handle project_id logic based on type
//     if ($validated['type'] === '0') {
//         // Supervisor MUST have a project
//         $request->validate([
//             'project' => 'required|integer|exists:projects,id',
//         ]);
//         $validated['project_id'] = $validated['project'];
//     } else {
//         // Operator → project_id forced to 0 (or null if you prefer)
//         $validated['project_id'] = 0;
//     }

//     unset($validated['project']); // remove temp field

//     $operator = Operator::create($validated);

//     return response()->json([
//         'message' => 'Operator created successfully!',
//         'data'    => $operator
//     ], 201);
// }



    /**
     * Display a specific operator.
     */
    public function show($id)
    {
        $operator = Operator::findOrFail($id);
        return response()->json($operator);
    }

    /**
     * Display a Company ID.
     */

    public function showComapnyIdWise()
{
   $userCompanyId = auth()->user()->company_id;

    // $operators = Operator::where('company_id', $userCompanyId)->get();
    $operators = Operator::with('project:id,project_name')   // eager load project name
        ->where('company_id', $userCompanyId)
        ->get();


    return response()->json($operators);
}



public function showTypeWise()
{
    $userCompanyId = auth()->user()->company_id;

    $operators = Operator::where('company_id', $userCompanyId)
                         ->where('type', 1) // 🔹 only type = 1
                         ->get();

    return response()->json($operators);
}



    /**
     * Update a specific operator.
     */
    // public function update(Request $request, $id)
    // {
    //     $operator = Operator::findOrFail($id);

    //     $validated = $request->validate([
    //         'name'       => 'sometimes|required|string|max:255',
    //         'mobile'     => 'nullable|string|max:20',
    //         'address'    => 'nullable|string',
    //         'payment'    => 'nullable|numeric',
    //         'company_id' => 'integer',
    //         'show'       => 'boolean',
    //         'type'       => 'required | string',
    //         'project_id' => 'required | string',
    //         'bank_name'=> 'nullable | string',
    //           'account_number'=> 'nullable|string',
    //     'ifsc_code'  => 'nullable|string',
    //     'adhar_number'  => 'nullable|string',
    //     'pan_number' => 'nullable|string',
    //     'gst_no' => 'nullable|string'
    //     ]);

    //     $operator->update($validated);

    //     return response()->json([
    //         'message' => 'Operator updated successfully!',
    //         'data'    => $operator
    //     ]);
    // }
        public function update(Request $request, $id)
{
    $operator = Operator::findOrFail($id);

    // Get type from request
    $type = $request->input('type');

    // ✅ Base rules (common for all types)
    $rules = [
        'type'       => 'required|string',
        'company_id' => 'integer',
        'show'       => 'boolean',
       
    ];

    // ✅ Conditional validation rules
    if ($type == '1' || $type == '2' || $type == '3') {
        // For type 1 and type 2 (e.g. users)
        $rules = array_merge($rules, [
            'name'           => 'sometimes|required|string|max:255',
            'mobile'         => 'nullable|string|max:20',
            'address'        => 'nullable|string',
            'payment'        => 'nullable|numeric',
            'bank_name'      => 'nullable|string',
            'account_number' => 'nullable|string',
            'ifsc_code'      => 'nullable|string',
            'adhar_number'   => 'nullable|string',
            'pan_number'     => 'nullable|string',
        ]);
    } elseif ($type == '0') {
        // For type 0 (supervisor)
        $rules = array_merge($rules, [
            'name'           => 'sometimes|required|string|max:255',
            'mobile'         => 'nullable|string|max:20',
            'address'        => 'nullable|string',
            'payment'        => 'nullable|numeric',
            'bank_name'      => 'nullable|string',
            'account_number' => 'nullable|string',
            'ifsc_code'      => 'nullable|string',
            'adhar_number'   => 'nullable|string',
            'pan_number'     => 'nullable|string',
            'gst_no'         => 'nullable|string',
             'project_id' => 'required|string',
        ]);
    }

    // ✅ Validate according to rules
    $validated = $request->validate($rules);

    // ✅ Update operator record
    $operator->update($validated);

    return response()->json([
        'message' => 'Operator updated successfully!',
        'data'    => $operator
    ]);
}






    /**
     * Delete a specific operator.
     */
    public function destroy($id)
    {
        $operator = Operator::findOrFail($id);
        $operator->delete();

        return response()->json([
            'message' => 'Operator deleted successfully!'
        ]);
    }

    /**
 * Display vendors (type = 2) for the authenticated user's company.
 */
public function showVendors()
{
    $userCompanyId = auth()->user()->company_id;

    $vendors = Operator::where('company_id', $userCompanyId)
                       ->where('type', '2') // Only fetch vendors (type = 2)
                       ->select('id', 'name', 'gst_no') // Select relevant fields
                       ->get();

    return response()->json($vendors);
}


public function showPurchesVendors()
{
    $userCompanyId = auth()->user()->company_id;

    $vendors = Operator::where('company_id', $userCompanyId)
                       ->where('type', '3') // Only fetch vendors (type = 2)
                       ->select('id', 'name', 'gst_no') // Select relevant fields
                       ->get();

    return response()->json($vendors);
}

    
}
