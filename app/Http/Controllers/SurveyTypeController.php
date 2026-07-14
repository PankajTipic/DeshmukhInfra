<?php

namespace App\Http\Controllers;

use App\Models\SurveyType;
use Illuminate\Http\Request;

class SurveyTypeController extends Controller
{
    public function index()
    {
        $companyId = auth()->user()->company_id;
        return SurveyType::where('company_id', $companyId)->get();
    }

    public function store(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        if (SurveyType::where('company_id', $companyId)->where('name', $request->name)->exists()) {
            return response()->json(['message' => 'Survey Type already exists for this company'], 400);
        }

        $surveyType = SurveyType::create([
            'company_id' => $companyId,
            'name' => $request->name,
        ]);

        return response()->json($surveyType, 201);
    }

    public function show($id)
    {
        $companyId = auth()->user()->company_id;
        $surveyType = SurveyType::where('company_id', $companyId)->findOrFail($id);
        return response()->json($surveyType, 200);
    }

    public function update(Request $request, $id)
    {
        $companyId = auth()->user()->company_id;
        $surveyType = SurveyType::where('company_id', $companyId)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        if (SurveyType::where('company_id', $companyId)->where('name', $request->name)->where('id', '!=', $id)->exists()) {
            return response()->json(['message' => 'Survey Type already exists for this company'], 400);
        }

        $surveyType->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Survey Type updated successfully',
            'data' => $surveyType,
        ], 200);
    }

    public function destroy($id)
    {
        $companyId = auth()->user()->company_id;
        $surveyType = SurveyType::where('company_id', $companyId)->findOrFail($id);
        $surveyType->delete();

        return response()->json(['message' => 'Survey Type deleted successfully'], 200);
    }
}
