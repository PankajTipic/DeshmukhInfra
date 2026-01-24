<?php

namespace App\Http\Controllers;

use App\Models\Machinery;
use Illuminate\Http\Request;

class MachineryController extends Controller
{
    /**
     * Store a newly created machinery in storage.
     */
    public function store(Request $request)
    {
        $companyId = auth()->user()->company_id; // ✅ logged in user's company

        $validated = $request->validate([
            'machine_name' => 'required|string|max:255',
            'reg_number'   => 'required|string|max:255',
            'ownership_type' => 'required|string|max:255',
        ]);

        $validated['company_id'] = $companyId; // ✅ force company_id

        $machinery = Machinery::create($validated);

        return response()->json([
            'message' => 'Machinery created successfully!',
            'data'    => $machinery,
        ], 201);
    }

    /**
     * Display a listing of the machineries for the user's company.
     */
    public function index()
    {
        $companyId = auth()->user()->company_id;

        $machineries = Machinery::where('company_id', $companyId)->get();

        return response()->json([
            'message' => 'Machineries fetched successfully!',
            'data'    => $machineries,
        ], 200);
    }

    /**
     * Display the specified machinery for the user's company.
     */
    public function show($id)
    {
        $companyId = auth()->user()->company_id;

        $machinery = Machinery::where('company_id', $companyId)->findOrFail($id);

        return response()->json([
            'message' => 'Machinery fetched successfully!',
            'data'    => $machinery,
        ], 200);
    }

    /**
     * Update the specified machinery in storage.
     */
    public function update(Request $request, $id)
    {
        $companyId = auth()->user()->company_id;

        $machinery = Machinery::where('company_id', $companyId)->findOrFail($id);

        $validated = $request->validate([
            'machine_name' => 'sometimes|required|string|max:255',
            'reg_number'   => 'sometimes|required|string|max:255|unique:machineries,reg_number,' . $machinery->id,
            'ownership_type' =>  'sometimes|required|string|max:255'
        ]);

        $machinery->update($validated);

        return response()->json([
            'message' => 'Machinery updated successfully!',
            'data'    => $machinery,
        ], 200);
    }

    /**
     * Remove the specified machinery from storage.
     */
    public function destroy($id)
    {
        $companyId = auth()->user()->company_id;

        $machinery = Machinery::where('company_id', $companyId)->findOrFail($id);

        $machinery->delete();

        return response()->json([
            'message' => 'Machinery deleted successfully!',
        ], 200);
    }
}
