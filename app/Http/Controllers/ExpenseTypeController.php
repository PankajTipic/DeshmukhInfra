<?php

namespace App\Http\Controllers;

use App\Models\ExpenseType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ExpenseTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        return ExpenseType::where('company_id', $user->company_id)->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required',
            'localName' => 'required',
            'expense_category' =>'required',
            'desc' => 'required',
            'show' => 'required'
        ]);

        $data = $request->all();
        $data['company_id'] = $user->company_id;

        return ExpenseType::create($data);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = Auth::user();

        try {
            return ExpenseType::where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Expense type not found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required',
            'localName' => 'required',
            'expense_category' =>'required',
            'desc' => 'required',
            'show' => 'required'
        ]);

        try {
            $expenseType = ExpenseType::where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();

            $expenseType->update($request->all());

            return $expenseType;
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Expense type not found'], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = Auth::user();

        try {
            $expenseType = ExpenseType::where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();

            $expenseType->delete();

            return response()->json(['message' => 'Expense type deleted successfully']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Expense type not found'], 404);
        }
    }
}
