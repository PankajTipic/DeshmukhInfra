<?php

namespace App\Http\Controllers;

use App\Models\ProjectType;
use Illuminate\Http\Request;

class ProjectTypeController extends Controller
{
    public function index()
    {
        return ProjectType::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:project_types,name',
        ]);

        $projectType = ProjectType::create([
            'name' => $request->name,
        ]);

        return response()->json($projectType, 201);
    }

    public function destroy($id)
    {
        $projectType = ProjectType::findOrFail($id);
        $projectType->delete();

        return response()->json(['message' => 'Project Type deleted successfully'], 200);
    }


     // 🔹 Show project type by ID
    public function show($id)
    {
        $projectType = ProjectType::findOrFail($id);

        return response()->json($projectType, 200);
    }

    // 🔹 Update project type
    public function update(Request $request, $id)
    {
        $projectType = ProjectType::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:project_types,name,' . $projectType->id,
        ]);

        $projectType->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Project Type updated successfully',
            'data' => $projectType,
        ], 200);
    }

}
