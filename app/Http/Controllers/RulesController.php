<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rules;
use Illuminate\Support\Facades\Auth;


class RulesController extends Controller
{
    //
    // public function index()
    // {
    //     return Rules::all();
    // }

    // public function store(Request $request)
    // {
    //     $data = $request->validate([
    //         'company_id' => 'nullable|integer',
    //         'type'       => 'required|in:payment,term',
    //         'description'=> 'required|string',
    //         'is_active'  => 'boolean'
    //     ]);

    //     return Rules::create($data);
    // }
   

    public function index()
    {
        // Optionally, limit to the authenticated user's company
        return Rules::where('company_id', auth()->user()->company_id)->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type'        => 'required|in:payment,term',
            'description' => 'required|string',
            'is_active'   => 'boolean'
        ]);

        // Automatically set company_id from logged-in user
        $data['company_id'] = auth()->user()->company_id;

        return Rules::create($data);
    }
}
