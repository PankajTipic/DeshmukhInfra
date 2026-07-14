<?php

namespace App\Http\Controllers;

use App\Models\WorkType;
use Illuminate\Http\Request;

class WorkTypeController extends Controller
{
    public function index()
    {
        $companyId = auth()->user()->company_id;
        return WorkType::where('company_id', $companyId)->get();
    }

    public function store(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Check uniqueness for this company
        if (WorkType::where('company_id', $companyId)->where('name', $request->name)->exists()) {
            return response()->json(['message' => 'Work Type already exists for this company'], 400);
        }

        $workType = WorkType::create([
            'company_id' => $companyId,
            'name' => $request->name,
        ]);

        return response()->json($workType, 201);
    }

    public function show($id)
    {
        $companyId = auth()->user()->company_id;
        $workType = WorkType::where('company_id', $companyId)->findOrFail($id);
        return response()->json($workType, 200);
    }

    public function update(Request $request, $id)
    {
        $companyId = auth()->user()->company_id;
        $workType = WorkType::where('company_id', $companyId)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        if (WorkType::where('company_id', $companyId)->where('name', $request->name)->where('id', '!=', $id)->exists()) {
            return response()->json(['message' => 'Work Type already exists for this company'], 400);
        }

        $workType->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Work Type updated successfully',
            'data' => $workType,
        ], 200);
    }

    public function destroy($id)
    {
        $companyId = auth()->user()->company_id;
        $workType = WorkType::where('company_id', $companyId)->findOrFail($id);
        $workType->delete();

        return response()->json(['message' => 'Work Type deleted successfully'], 200);
    }
}
