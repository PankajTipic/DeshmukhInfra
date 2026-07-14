<?php

namespace App\Http\Controllers;

use App\Models\Uom;
use Illuminate\Http\Request;

class UomController extends Controller
{
    public function index()
    {
        $companyId = auth()->user()->company_id;
        return Uom::where('company_id', $companyId)->get();
    }

    public function store(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        if (Uom::where('company_id', $companyId)->where('name', $request->name)->exists()) {
            return response()->json(['message' => 'UOM already exists for this company'], 400);
        }

        $uom = Uom::create([
            'company_id' => $companyId,
            'name' => $request->name,
        ]);

        return response()->json($uom, 201);
    }

    public function show($id)
    {
        $companyId = auth()->user()->company_id;
        $uom = Uom::where('company_id', $companyId)->findOrFail($id);
        return response()->json($uom, 200);
    }

    public function update(Request $request, $id)
    {
        $companyId = auth()->user()->company_id;
        $uom = Uom::where('company_id', $companyId)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        if (Uom::where('company_id', $companyId)->where('name', $request->name)->where('id', '!=', $id)->exists()) {
            return response()->json(['message' => 'UOM already exists for this company'], 400);
        }

        $uom->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'UOM updated successfully',
            'data' => $uom,
        ], 200);
    }

    public function destroy($id)
    {
        $companyId = auth()->user()->company_id;
        $uom = Uom::where('company_id', $companyId)->findOrFail($id);
        $uom->delete();

        return response()->json(['message' => 'UOM deleted successfully'], 200);
    }
}
