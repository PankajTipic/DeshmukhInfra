<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function allProject()
    {
        return Project::all();
    }


    public function myProjects()
{
    $user = Auth::user();

    if ($user->type == 1 || $user->type == 3) {
        // Admin (type 1) → show all projects within their company
        $projects = Project::with(['supervisor:id,name', 'user:id,name'])
            ->where('company_id', $user->company_id)
            ->get();
    } elseif ($user->type == 2) {
        // Supervisor/User (type 2) → show only their projects within their company
        $projects = Project::with(['supervisor:id,name', 'user:id,name'])
            ->where('company_id', $user->company_id)
            ->where(function ($query) use ($user) {
                $query->where('supervisor_id', $user->id)
                      ->orWhere('user_id', $user->id);
            })
            ->get();
    } else {
        // Other types → return empty
        $projects = collect([]);
    }

    return response()->json($projects);
}







public function index(Request $request)
{
    $user = Auth::user();

    // Base query with customer fields
    $query = Project::select(
            'id',
            'project_name',
            'customer_name',
            'mobile_number',
            'work_place',
            'project_cost',
            'gst_number',
            'remark',
            'start_date',
            'end_date',
            'company_id',
            'user_id',
            'supervisor_id',
            'is_visible',
            'pan_number'
        )
        ->where('company_id', $user->company_id)
        ->where('is_visible', true);
        // ->where('is_confirm', 1);  // ✅ only confirmed projects
      

    // Restrict for supervisor/user type
    if ($user->type == 2) {
        $query->where(function ($q) use ($user) {
            $q->where('supervisor_id', $user->id)
              ->orWhere('user_id', $user->id);
        });
    }

    // Optional search
    if ($request->has('searchQuery') && !empty($request->searchQuery)) {
        $search = $request->searchQuery;
        $query->where(function ($q) use ($search) {
            $q->where('project_name', 'like', "%{$search}%")
              ->orWhere('customer_name', 'like', "%{$search}%")
              ->orWhere('mobile_number', 'like', "%{$search}%")
              ->orWhere('work_place', 'like', "%{$search}%")
              ->orWhere('project_cost', 'like', "%{$search}%");
        });
    }

    $projects = $query->get()->map(function ($p) {
        return [
            'id'            => $p->id,
            'project_name'  => $p->project_name,
            'customer_id'   => $p->id, // or keep a real customer_id if exists
            'customer_name' => $p->customer_name ?? 'N/A',
            'mobile_number' => $p->mobile_number ?? 'N/A',
            'work_place'    => $p->work_place,
            'project_cost'  => $p->project_cost,
            'gst_number'    => $p->gst_number,
            'pan_number'     => $p->pan_number,
            'remark'        => $p->remark,
            'start_date'    => $p->start_date,
            'end_date'      => $p->end_date,
            'customer'      => [
                'name'    => $p->customer_name ?? 'N/A',
                'address' => $p->work_place ?? 'N/A',
                'mobile'  => $p->mobile_number ?? 'N/A',
            ]
        ];
    });

    return response()->json($projects);
}




    public function storeManually(Request $request)
{
    $user = auth()->user(); // Get logged-in user

    $data = $request->validate([
        'customer_name' => 'required|string|max:255',
        'mobile_number' => 'required|string|max:255',
        'project_name'  => 'required|string|max:255', 
        'project_cost'  => 'required|string|max:255',
        'work_place'    => 'nullable|string|max:255',
        'start_date'    => 'nullable|date',
        'end_date'      => 'nullable|date',
        'is_visible'    => 'boolean',
        'remark'        => 'nullable|string',
        'supervisor_id' => 'nullable|numeric',   // numeric field
        'commission'    => 'nullable|numeric',   // numeric field
        'gst_number'    => 'nullable|string|max:255',
        'pan_number'     => 'nullable|string|max:255',
        // 'is_confirm'    => 'nullable|numeric',
    ]);

    // Add user and company automatically
    $data['user_id'] = $user->id;
    $data['company_id'] = $user->company_id;
    // $data['is_confirm'] = 1;

    $project = Project::create($data);

    return response()->json($project, 201);
}



public function store(Request $request)
{
    $user = auth()->user(); // Get logged-in user

    // Only validate the required + initial fields
    $data = $request->validate([
        'customer_name' => 'required|string|max:255',
        'mobile_number' => 'required|string|max:255',
        'project_name'  => 'required|string|max:255',
        'work_place'    => 'nullable|string|max:255',
        // 'is_confirm'    => 'nullable|numeric', // will store 0 (false) or 1 (true)
         'gst_number' => 'nullable|string|max:255',
    'pan_number' => 'nullable|string|max:255',

    ]);

    // Force is_confirm = 0 if user sends nothing
    // $data['is_confirm'] = $request->input('is_confirm', 0);

    // Add user and company automatically
    $data['user_id']    = $user->id;
    $data['company_id'] = $user->company_id;

    // Fill remaining fields with null explicitly
    $data['project_cost']  = null;
    $data['start_date']    = null;
    $data['end_date']      = null;
    $data['remark']        = null;
    $data['supervisor_id'] = null;
    $data['commission']    = null;
    // $data['gst_number']    = null;
    // $data['pan_number']     = null;

    $project = Project::create($data);

    return response()->json($project, 201);
}



    public function show(Project $project)
    {
        return $project;
    }

//     public function update(Request $request, $id)
// {
//     $project = Project::findOrFail($id);

//     if ($request->has('is_visible')) {
//         $request->validate([
//             'is_visible' => 'required|boolean'
//         ]);
//         $project->is_visible = $request->is_visible;
//         $project->save();

//         return response()->json([
//             'success' => true,
//             'message' => 'Visibility updated successfully',
//             'project' => $project
//         ]);
//     }

//     // existing full update logic for other fields
//     $request->validate([
//           'customer_name' => 'required|string|max:255',
//         'mobile_number' => 'required|string|max:255',
//         'project_name'  => 'required|string|max:255', 
//         'project_cost'  => 'required|string|max:255',
//         'work_place'    => 'nullable|string|max:255',
//         'start_date'    => 'nullable|date',
//         'end_date'      => 'nullable|date',
//         'is_visible'    => 'boolean',
//         'remark'        => 'nullable|string',
//         'supervisor_id' => 'nullable|numeric',   // numeric field
//         'commission'    => 'nullable|numeric',   // numeric field
//         'gst_number'    => 'nullable|string|max:255',
//     ]);
//     $project->update($request->all());

//     return response()->json(['success' => true, 'message' => 'Project updated']);
// }

public function update(Request $request, $id)
{
    $project = Project::findOrFail($id);

    // Case 1: Only update visibility
    if ($request->has('is_visible')) {
        $request->validate([
            'is_visible' => 'required|boolean'
        ]);
        $project->is_visible = $request->is_visible;
        $project->save();

        return response()->json([
            'success' => true,
            'message' => 'Visibility updated successfully',
            'project' => $project
        ]);
    }

    // Case 2: Update remaining project details
    $validated = $request->validate([
        'customer_name' => 'sometimes|required|string|max:255',
        'mobile_number' => 'sometimes|required|string|max:255',
        'project_name'  => 'sometimes|required|string|max:255',
        'project_cost'  => 'nullable|string|max:255',
        'work_place'    => 'nullable|string|max:255',
        'start_date'    => 'nullable|date',
        'end_date'      => 'nullable|date',
        // 'is_confirm'    => 'nullable|numeric',   // allow updating confirm status
        'is_visible'    => 'boolean',
        'remark'        => 'nullable|string',
        'supervisor_id' => 'nullable|numeric',
        'commission'    => 'nullable|numeric',
        'gst_number'    => 'nullable|string|max:255',
        'pan_number'     => 'nullable|string|max:255',
    ]);

    // Update only provided fields (others remain unchanged)
    $project->update($validated);

    return response()->json([
        'success' => true,
        'message' => 'Project updated successfully',
        'project' => $project
    ]);
}

public function updatedata(Request $request, $id)
{
    $user = auth()->user(); // Get logged-in user
    $project = Project::findOrFail($id);

    $validated = $request->validate([
        'customer_name' => 'nullable|string|max:255',
        'mobile_number' => 'nullable|string|max:255',
        'project_name'  => 'nullable|string|max:255',
        'project_cost'  => 'nullable|string|max:255',
        'work_place'    => 'nullable|string|max:255',
        'start_date'    => 'nullable|date',
        'end_date'      => 'nullable|date',
        'is_visible'    => 'boolean',
        'remark'        => 'nullable|string',
        'supervisor_id' => 'nullable|numeric',
        'commission'    => 'nullable|numeric',
        'gst_number'    => 'nullable|string|max:255',
        'pan_number'    => 'nullable|string|max:255',
        // 'is_confirm' => 'nullable|numeric', // if needed later
    ]);

    // Always assign company_id and user_id (to ensure integrity)
    $validated['user_id'] = $user->id;
    $validated['company_id'] = $user->company_id;

    // Update the project
    $project->update($validated);

    return response()->json([
        'success' => true,
        'message' => 'Project updated successfully',
        'project' => $project
    ]);
}




    // public function destroy(Project $project)
    // {
    //     $project->delete();
    //     return response()->json(null, 204);
    // }

    public function destroy($id)
{
    $project = Project::findOrFail($id);
    $project->delete();
    return response()->json(['message' => 'Project deleted'], 200);
}

}
