<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use Illuminate\Support\Facades\Auth;

class RoleController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $roles = Role::where('is_default', true)
            ->orWhere(function ($query) use ($user) {
                $query->where('is_default', false);
                if ($user->company_id) {
                    $query->where('company_id', $user->company_id);
                } else {
                    $query->whereNull('company_id');
                }
            })
            ->get();

        return response()->json($roles);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'permissions' => 'required|array',
        ]);

        $maxType = Role::max('base_type') ?? 5;
        $newType = max((int)$maxType, 5) + 1;

        $role = Role::create([
            'name' => $request->name,
            'base_type' => $newType,
            'permissions' => $request->permissions,
            'company_id' => $user->company_id,
            'is_default' => false,
        ]);

        return response()->json(['message' => 'Role created successfully', 'role' => $role], 201);
    }
}
