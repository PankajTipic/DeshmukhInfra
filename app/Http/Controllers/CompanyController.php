<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CompanyInfo;

class CompanyController extends Controller
{
    // ✅ List all CompanyInfo records
    public function index()
    {
        return CompanyInfo::all();
    }

    // ✅ Create new record in CompanyInfo
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'phone_no'     => 'nullable|string|max:20',
            'email_id'     => 'nullable|email',
            'land_mark'    => 'nullable|string|max:255',
        ]);

        $company = CompanyInfo::create($validated);

        return response()->json($company, 201);
    }

    // ✅ Update CompanyInfo record
    public function update(Request $request, CompanyInfo $company)
    {
        $validated = $request->validate([
            'company_name' => 'sometimes|string|max:255',
            'phone_no'     => 'sometimes|string|max:20',
            'email_id'     => 'sometimes|email',
            'land_mark'    => 'sometimes|string|max:255',
        ]);

        $company->update($validated);

        return response()->json($company);
    }

    // ✅ Block / Unblock CompanyInfo record
    public function toggleBlock(Request $request, CompanyInfo $company)
    {
        $request->validate([
            'block_status' => 'required|in:0,1',
        ]);

        $company->block_status = $request->block_status;
        $company->save();

        return response()->json([
            'message' => 'Block status updated successfully',
            'company' => $company,
        ]);
    }
}
