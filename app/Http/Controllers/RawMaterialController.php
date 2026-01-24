<?php

namespace App\Http\Controllers;

use App\Models\RawMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\RawMaterialLog;
use App\Models\Expense;
use App\Models\ExpenseType; 
use App\Models\ExpenseSummary; 
use App\Models\UsesRawMaterial;

use Illuminate\Support\Facades\Auth;


class RawMaterialController extends Controller
{

    //     public function store(Request $request)
    // {

    //     $user = auth()->user();

    //     $request->validate([
    //         // 'company_id' => 'required|integer',
    //         'name' => 'required|string|max:255',
    //         'local_name' => 'nullable|string|max:255',
    //         'project_id' => 'required|integer',
    //         'current_stock' => 'nullable|numeric',
    //         'price'  => 'nullable|numeric',

    //     ]);

    //     DB::beginTransaction();

    //     $companyId = $user->company_id;

    //     try {
    //         // 1️⃣ Create RawMaterial
    //         $rawMaterial = RawMaterial::create([
    //             'company_id' => $companyId,
    //             'name'       => $request->name,
    //             'local_name' => $request->local_name,
    //         ]);

    //         // 2️⃣ Create RawMaterialLog
    //         RawMaterialLog::create([
    //             'material_id'   => $rawMaterial->id,   // foreign key
    //             'company_id'    => $companyId,
    //             'project_id'    => $request->project_id,
    //             'current_stock' => $request->current_stock,
    //             'price'         => $request->price,
    //             'capacity'     => $request->capacity,
    //             'total'      => $request->total,
    //             'unit'          => $request->unit,
    //         ]);

    //         DB::commit();

    //         return response()->json([
    //             'message' => 'Raw Material and Log saved successfully!',
    //             'material' => $rawMaterial
    //         ], 201);

    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         return response()->json([
    //             'message' => 'Failed to save data',
    //             'error'   => $e->getMessage()
    //         ], 500);
    //     }
    // }

public function store(Request $request)
{
    $user = auth()->user();

    // ✅ Only name, local_name & project_id are required
    $request->validate([
        'name'       => 'required|string|max:255',
        'local_name' => 'nullable|string|max:255',
        'project_id' => 'required|integer',
        'current_stock' => 'nullable|numeric',
        'price'      => 'nullable|numeric',
        'capacity'   => 'nullable|numeric',
        'total'      => 'nullable|numeric',
        'unit'       => 'nullable|string|max:50',
    ]);

    DB::beginTransaction();
    $companyId = $user->company_id;

    try {
        // 1️⃣ Create RawMaterial
        $rawMaterial = RawMaterial::create([
            'company_id' => $companyId,
            'name'       => $request->name,
            'local_name' => $request->local_name,
        ]);

        // 2️⃣ Create RawMaterialLog with default 0 if empty
        RawMaterialLog::create([
            'material_id'   => $rawMaterial->id,
            'company_id'    => $companyId,
            'project_id'    => $request->project_id,
            'current_stock' => $request->current_stock ?? 0,   // ✅ default 0
            'price'         => $request->price ?? 0,           // ✅ default 0
            'capacity'      => $request->capacity ?? 0,        // ✅ default 0
            'total'         => $request->total ?? 0,           // ✅ default 0
            'unit'          => $request->unit ?? 'NA',         // ✅ default NA or ''
        ]);

        DB::commit();

        return response()->json([
            'message'  => 'Raw Material and Log saved successfully!',
            'material' => $rawMaterial
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'message' => 'Failed to save data',
            'error'   => $e->getMessage()
        ], 500);
    }
}



// public function addQty(Request $request, $id)
// {
//     $request->validate([
//         'add_qty' => 'required|numeric|min:0',
//         'price'   => 'required|numeric|min:0',
//         'unit'    => 'required|string',
//     ]); 

//     $log = RawMaterialLog::where('material_id', $id)->latest()->firstOrFail();
//     $newStock = $log->current_stock + $request->add_qty;

//     $log->update([
//         'current_stock' => $newStock,
//         'price'         => $request->price,
//         'total'         => $newStock * $request->price,
//         'unit'          => $request->unit,
//     ]);

//     return response()->json(['message' => 'Quantity updated successfully', $log]);
// }

// public function addQty(Request $request, $id)
// {
//     $user = auth()->user();

//     $request->validate([
//         'add_qty' => 'required|numeric|min:0',
//         'price'   => 'required|numeric|min:0',
//         'unit'    => 'required|string|max:50',
//         'payment_by'   => 'nullable|string|max:255',
//         'payment_type' => 'nullable|string|max:255',
//         'transaction_id' => 'nullable|string|max:255',
//     ]);

//     DB::beginTransaction();

//     try {
//         $companyId = $user->company_id;

//         // ✅ Find the latest log entry for this material
//         $log = RawMaterialLog::where('material_id', $id)->latest()->firstOrFail();

//         // ✅ Calculate new stock and total
//         $newStock   = $log->current_stock + $request->add_qty;
//         $newTotal   = $newStock * $request->price;
//         $addedTotal = $request->add_qty * $request->price;

//         // ✅ Update the log with new stock, price, total
//         $log->update([
//             'current_stock' => $newStock,
//             'price'         => $request->price,
//             'total'         => $newTotal,
//             'unit'          => $request->unit,
//         ]);

//         // ✅ Fetch project_id from this log to keep linkage
//         $projectId = $log->project_id;

//         // ✅ Create an expense entry for the *added* quantity
//         $expenseTypeId = ExpenseType::where('company_id', $companyId)
//             ->where('name', 'Raw Material')
//             ->value('id');

//         Expense::create([
//             'project_id'     => $projectId,
//             'name'           => 'Raw Material Add Qty',
//             'desc'           => 'Added Qty to Material ID: '.$id,
//             'expense_id'     => $expenseTypeId,
//             'qty'            => $request->add_qty,
//             'price'          => $request->price,
//             'total_price'    => $addedTotal,
//             'expense_date'   => now()->format('Y-m-d'),
//             'payment_by'     => $request->payment_by ?? 'NA',
//             'payment_type'   => $request->payment_type ?? 'NA',
//             'transaction_id' => $request->transaction_id ?? 'NA',
//             'pending_amount' => 0,
//             'show'           => 1,
//             'isGst'          => 0,
//             'photo_url'      => 'NA',
//             'photo_remark'   => 'NA',
//             'company_id'     => $companyId,
//             'created_by'     => $user->id,
//             'updated_by'     => $user->id,
//         ]);

//         // ✅ Update ExpenseSummary for today
//         ExpenseSummary::updateOrCreate(
//             [
//                 'expense_date' => now()->format('Y-m-d'),
//                 'company_id'   => $companyId,
//                 'project_id'   => $projectId,
//             ],
//             [
//                 'total_expense' => DB::raw('total_expense + ' . $addedTotal),
//                 'expense_count' => DB::raw('expense_count + 1'),
//             ]
//         );

//         DB::commit();

//         return response()->json([
//             'message' => 'Quantity added and expense recorded successfully',
//             'data'    => $log->fresh()  // return updated log
//         ], 200);

//     } catch (\Exception $e) {
//         DB::rollBack();

//         return response()->json([
//             'message' => 'Failed to add quantity',
//             'error'   => $e->getMessage(),
//         ], 500);
//     }
// }

public function addQty(Request $request, $id)
{
    $user = auth()->user();

    $request->validate([
        'add_qty' => 'required|numeric|min:0',
        'price'   => 'required|numeric|min:0',
        'unit'    => 'required|string|max:50',
        'payment_by'   => 'nullable|string|max:255',
        'payment_type' => 'nullable|string|max:255',
        'transaction_id' => 'nullable|string|max:255',
        'expense_flag' => 'nullable|boolean', // ✅ new flag
    ]);

    DB::beginTransaction();

    try {
        $companyId = $user->company_id;

        // ✅ Find the latest log entry for this material
        $log = RawMaterialLog::where('material_id', $id)->latest()->firstOrFail();

        // ✅ Calculate new stock and total
        $newStock   = $log->current_stock + $request->add_qty;
        $newTotal   = $newStock * $request->price;
        $addedTotal = $request->add_qty * $request->price;

        // ✅ Update the log with new stock, price, total
        $log->update([
            'current_stock' => $newStock,
            'price'         => $request->price,
            'total'         => $newTotal,
            'unit'          => $request->unit,
        ]);

        // ✅ Create expense entry only if checkbox is checked
        if ($request->boolean('expense_flag', true)) {
            $projectId = $log->project_id;

            $expenseTypeId = ExpenseType::where('company_id', $companyId)
                ->where('name', 'Raw Material')
                ->value('id');

            Expense::create([
                'project_id'     => $projectId,
                'name'           => 'Raw Material Add Qty',
                'desc'           => 'Added Qty to Material ID: '.$id,
                'expense_id'     => $expenseTypeId,
                'qty'            => $request->add_qty,
                'price'          => $request->price,
                'total_price'    => $addedTotal,
                'expense_date'   => now()->format('Y-m-d'),
                'payment_by'     => $request->payment_by ?? 'NA',
                'payment_type'   => $request->payment_type ?? 'NA',
                'transaction_id' => $request->transaction_id ?? 'NA',
                'pending_amount' => 0,
                'show'           => 1,
                'isGst'          => 0,
                'photo_url'      => 'NA',
                'photo_remark'   => 'NA',
                'company_id'     => $companyId,
                'created_by'     => $user->id,
                'updated_by'     => $user->id,
            ]);

            // ✅ Update ExpenseSummary for today
            ExpenseSummary::updateOrCreate(
                [
                    'expense_date' => now()->format('Y-m-d'),
                    'company_id'   => $companyId,
                    'project_id'   => $projectId,
                ],
                [
                    'total_expense' => DB::raw('total_expense + ' . $addedTotal),
                    'expense_count' => DB::raw('expense_count + 1'),
                ]
            );
        }

        DB::commit();

        return response()->json([
            'message' => 'Quantity updated successfully',
            'data'    => $log->fresh()
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'message' => 'Failed to add quantity',
            'error'   => $e->getMessage(),
        ], 500);
    }
}




//     public function index(Request $request)
// {
//     $user = auth()->user();
//     $companyId = $user->company_id;

//     try {
//         // Fetch materials for the logged-in user's company
//         $materials = RawMaterial::with(['logs' => function ($query) {
//             $query->latest()->with('project');; // optional: get latest stock log

//         }])
//         ->where('company_id', $companyId)
//         ->get();

//         return response()->json([
//             'message'   => 'Raw Materials fetched successfully',
//             'materials' => $materials
//         ], 200);

//     } catch (\Exception $e) {
//         return response()->json([
//             'message' => 'Failed to fetch materials',
//             'error'   => $e->getMessage()
//         ], 500);
//     }
// }
public function index(Request $request)
{
    $user = auth()->user();
    $companyId = $user->company_id;
    $projectId = $request->project_id; // optional filter

    try {
        // Query only materials that have logs for this project (if project filter is applied)
        $materialsQuery = RawMaterial::where('company_id', $companyId)
            ->when($projectId, function ($query) use ($projectId) {
                $query->whereHas('logs', function ($q) use ($projectId) {
                    $q->where('project_id', $projectId);
                });
            });

        // Load logs filtered by project (if given) and latest first
        $materials = $materialsQuery->with(['logs' => function ($q) use ($projectId) {
            $q->latest()->with('project');

            if ($projectId) {
                $q->where('project_id', $projectId);
            }
        }])->get();

        return response()->json([
            'message'   => 'Raw Materials fetched successfully',
            'materials' => $materials
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to fetch materials',
            'error'   => $e->getMessage()
        ], 500);
    }
}


public function getMaterialByProject(Request $request)
{
    $user      = auth()->user();
    $companyId = $user->company_id;
    $projectId = $request->project_id; // optional filter

    try {
        $materials = RawMaterial::where('company_id', $companyId)
            ->when($projectId, function ($query) use ($projectId) {
                // Only raw materials that have logs for this project
                $query->whereHas('logs', function ($q) use ($projectId) {
                    $q->where('project_id', $projectId);
                });
            })
            ->with(['logs' => function ($q) use ($projectId) {
                // Always latest first
                $q->latest()->with('project');

                // ✅ if a project is selected, show ONLY that project's logs
                if ($projectId) {
                    $q->where('project_id', $projectId);
                }
            }])
            ->get();

        return response()->json([
            'message'   => 'Raw Materials fetched successfully',
            'materials' => $materials
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to fetch materials',
            'error'   => $e->getMessage()
        ], 500);
    }
}





public function update(Request $request, $id)
{
    $user = auth()->user();

    // ✅ Validate inputs
    $request->validate([
        'name'          => 'required|string|max:255',
        'local_name'    => 'nullable|string|max:255',
        'project_id'    => 'required|integer',
        'current_stock' => 'nullable|numeric',
        'price'  => 'nullable|numeric',
      
                'capacity'     => 'nullable|numeric',
                'total'      => 'nullable|numeric',
                'unit'          => 'nullable | string',
    ]);

    $companyId = $user->company_id;

    DB::beginTransaction();

    try {
        // 1️⃣ Find existing material (only within user's company)
        $rawMaterial = RawMaterial::where('company_id', $companyId)
            ->findOrFail($id);

        // 2️⃣ Update RawMaterial
        $rawMaterial->update([
            'name'       => $request->name,
            'local_name' => $request->local_name,
        ]);

        // 3️⃣ Either update latest log OR create a new log entry
        $latestLog = $rawMaterial->logs()->latest()->first();

        if ($latestLog) {
            // ✅ Update the existing latest log
            $latestLog->update([
                'project_id'    => $request->project_id,
                'current_stock' => $request->current_stock,
            ]);
        } else {
            // ✅ Create a new log if none exists
            RawMaterialLog::create([
                'material_id'   => $rawMaterial->id,
                'company_id'    => $companyId,
                'project_id'    => $request->project_id,
                'current_stock' => $request->current_stock,
                'price'         => $request->price,
                
                'capacity'     => $request->capacity,
                'total'      => $request->total,
                'unit'          => $request->unit,
            ]);
        }

        DB::commit();

        return response()->json([
            'message'  => 'Raw Material updated successfully!',
            'material' => $rawMaterial->load('logs.project') // include logs + project
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'message' => 'Failed to update Raw Material',
            'error'   => $e->getMessage()
        ], 500);
    }
}



public function destroy($id)
{
    $user = auth()->user();
    $companyId = $user->company_id;

    DB::beginTransaction();

    try {
        // 1️⃣ Find the RawMaterial within user's company
        $rawMaterial = RawMaterial::where('company_id', $companyId)->findOrFail($id);

        // 2️⃣ Delete all associated logs first (if any)
        $rawMaterial->logs()->delete();

        // 3️⃣ Delete the RawMaterial itself
        $rawMaterial->delete();

        DB::commit();

        return response()->json([
            'message' => 'Raw Material and its logs deleted successfully!'
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'message' => 'Failed to delete Raw Material',
            'error'   => $e->getMessage()
        ], 500);
    }
}




public function getRawMaterialsForSummary(Request $request)
{
    $companyId = auth()->user()->company_id;
    $projectId = $request->project_id ?? null;

    // Get used raw materials for company and optional project
    $usedMaterialsQuery = UsesRawMaterial::with('material')
        ->where('company_id', $companyId)
        ->when($projectId, function ($q) use ($projectId) {
            $q->where('project_id', $projectId);
        });

    $usedMaterials = $usedMaterialsQuery->get()->map(function ($item) {
        return [
            'id'            => $item->id,
            'material_id'   => $item->material_id,
            'material_name' => $item->material->name ?? null,
            'local_name'    => $item->material->local_name ?? null,
            'used_qty'      => $item->used_qty,
            'price'         => $item->material->price ?? null,
            'misc'          => $item->misc, // this is total amount used
        ];
    });

    return response()->json($usedMaterials, 200);
}











//     // ✅ Get all raw materials
//     // public function index()
//     // {
//     //     $materials = RawMaterial::all()
//     //         ->sortByDesc('isPackaging') // show visible first
//     //         ->values() // reset the index
    
//     //         // Map through each material to add min_qty logic
//     //         ->map(function ($item) {
//     //             $item->min_qty = $item->unit_qty >= (0.2 * $item->capacity);
//     //             return $item;
//     //         });
    
//     //     return response()->json($materials, 200);
//     // }


//     public function bulkUpdate(Request $request)
//     {
//         $data = $request->all();
    
//         $failedItems = [];
    
//         foreach ($data as $item) {
//             $rawMaterial = RawMaterial::find($item['id']);
    
//             if (!$rawMaterial) {
//                 $failedItems[] = ['id' => $item['id'], 'name' => null,'capacity'=>null,'quantity'=>null,'current_quantity'=>null];
//                 continue;
//             }
    
//             $quantity = $item['quantity'];
    
//             // Check if quantity is negative
//             if ($quantity < 0) {
//                 $failedItems[] = ['id' => $rawMaterial->id, 'name' => $rawMaterial->name,'capacity'=>$rawMaterial->capacity,'quantity'=>$quantity ,'current_quantity'=>$rawMaterial->unit_qty];
//                 continue;
//             }
    
//             // Check if adding quantity exceeds capacity
//             $newUnitQty = $rawMaterial->unit_qty + $quantity;
    
//             if ($newUnitQty > $rawMaterial->capacity) {
//                 $failedItems[] = ['id' => $rawMaterial->id, 'name' => $rawMaterial->name,'capacity'=>$rawMaterial->capacity,'quantity'=>$quantity,'current_quantity'=>$rawMaterial->unit_qty];
//                 continue;
//             }
//         }
    
//         if (!empty($failedItems)) {
//             // Return only failed items, do not update anything
//             return response()->json([
//                 'message' => 'Validation failed',
//                 'failed' => $failedItems
//             ], 200); // 422 Unprocessable Entity
//         }
    
//         // If no failures, proceed to update
//         DB::beginTransaction();
    
//         try {
//             foreach ($data as $item) {
//                 $rawMaterial = RawMaterial::find($item['id']);
//                 $quantity = $item['quantity'];
    
//                 $rawMaterial->unit_qty += $quantity;
//                 $rawMaterial->save();
//             }
    
//             DB::commit();
    
//             return response()->json([
//                 'message' => 'Bulk update successful'
//             ], 200);
    
//         } catch (\Exception $e) {
//             DB::rollBack();
    
//             return response()->json([
//                 'message' => 'Bulk update failed',
//                 'error' => $e->getMessage()
//             ], 500);
//         }
// }


//     public function index()
// {
//     // $materials = RawMaterial::all()
//     //     ->sortByDesc('isPackaging') // show visible first
//     //     ->values() // reset the index

//     //     ->map(function ($item) {
//     //         $percentage = ($item->unit_qty / $item->capacity) * 100;

//     //         if ($percentage < 20) {
//     //             $item->min_qty = 1;
//     //         } elseif ($percentage < 60) {
//     //             $item->min_qty = 2;
//     //         } else {
//     //             $item->min_qty = 3;
//     //         }

//     //         return $item;
//     //     });

//     // return response()->json($materials, 200);
//     $user = auth()->user();

//     if (!$user || !$user->company_id) {
//         return response()->json([
//             'status' => false,
//             'message' => 'Company ID not found for the logged-in user.'
//         ], 404);
//     }

//     $companyId = $user->company_id;

//     $materials = RawMaterial::where('company_id', $companyId)
//         ->orderByDesc('isPackaging') // show packaging materials first
//         ->get()
//         ->map(function ($item) {
//             $percentage = ($item->unit_qty / $item->capacity) * 100;

//             if ($percentage < 20) {
//                 $item->min_qty = 1;
//             } elseif ($percentage < 60) {
//                 $item->min_qty = 2;
//             } else {
//                 $item->min_qty = 3;
//             }

//             return $item;
//         });

//     return response()->json($materials, 200);
// }

// public function searchByName(Request $request) 
// {
//     // $search = $request->query('search');

//     // $materials = RawMaterial::query()
//     //     ->when($search, function ($query, $search) {
//     //         $search = strtolower(trim($search));
//     //         $query->where(function ($q) use ($search) {
//     //             $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
//     //               ->orWhereRaw('LOWER(local_name) LIKE ?', ["%{$search}%"]);
//     //         });
//     //     })
//     //     ->orderByDesc('isPackaging') // Show packaging materials first
//     //     ->get()
//     //     ->map(function ($item) {
//     //         $percentage = ($item->unit_qty / $item->capacity) * 100;

//     //         if ($percentage < 20) {
//     //             $item->min_qty = 1;
//     //         } elseif ($percentage < 60) {
//     //             $item->min_qty = 2;
//     //         } else {
//     //             $item->min_qty = 3;
//     //         }

//     //         return $item;
//     //     });

//     // return response()->json($materials, 200);
//     $user = auth()->user();

//     if (!$user) {
//         return response()->json(['error' => 'Unauthenticated.'], 401);
//     }

//     $search = $request->query('search');
//     $companyId = $user->company_id;

//     $materials = RawMaterial::query()
//         ->where('company_id', $companyId)
//         ->when($search, function ($query, $search) {
//             $search = strtolower(trim($search));
//             $query->where(function ($q) use ($search) {
//                 $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
//                   ->orWhereRaw('LOWER(local_name) LIKE ?', ["%{$search}%"]);
//             });
//         })
//         ->orderByDesc('isPackaging')
//         ->get()
//         ->map(function ($item) {
//             $percentage = ($item->unit_qty / $item->capacity) * 100;

//             if ($percentage < 20) {
//                 $item->min_qty = 1;
//             } elseif ($percentage < 60) {
//                 $item->min_qty = 2;
//             } else {
//                 $item->min_qty = 3;
//             }

//             return $item;
//         });

//     return response()->json($materials, 200);
// }


// public function criticalStock()
// {
//     $materials = RawMaterial::all()
//         ->filter(function ($item) {
//             return ($item->unit_qty / $item->capacity) * 100 < 20;
//         })
//         ->values() // reset array index
//         ->map(function ($item) {
//             $item->level = 'Critical – Empty Soon';
//             return $item;
//         });

//     return response()->json($materials, 200);
// }

    

//     // ✅ Get single raw material by ID
//     public function show($id)
//     {
//         $material = RawMaterial::find($id);
//         if (!$material) {
//             return response()->json(['message' => 'Raw Material not found'], 404);
//         }
//         return response()->json($material, 200);
//     }
    

//     public function showAll()
//     {
//         $materials = RawMaterial::select('id','name', 'unit_qty','unit')
//         ->get()
//         ->map(function ($material) {
//             return [
//                 'id' => $material->id,
//                 'name' => $material->name,
//                 // If you want to show remaining capacity, modify the logic accordingly.
//                 'available_qty' => $material->unit_qty,
//                 'unit'=>$material->unit
//             ];
//         });

//     return response()->json([
//         'success' => true,
//         'quantity' => $materials
//     ]);
//     }

//     public function getRawMaterialsByParam($isPackaging)
//     {
    
//     $user = Auth::user();

//     if (!$user || !$user->company_id) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Company ID not found for the user.',
//         ], 404);
//     }

//     $companyId = $user->company_id;

//     $materials = RawMaterial::select('id','name', 'unit_qty','unit','local_name')
//         ->where('isPackaging', $isPackaging)
//         ->where('company_id', $companyId)
//         ->get()
//         ->map(function ($material) {
//             return [
//                 'id' => $material->id,
//                 'name' => $material->name,
//                 'local_name' => $material->local_name,
//                 'available_qty' => $material->unit_qty,
//                 'unit' => $material->unit
//             ];
//         });

//     return response()->json([
//         'success' => true,
//         'quantity' => $materials
//     ]); 
//     }

//     public function updateRawMaterial(Request $request)
// {
//     $request->validate([
//         'name' => 'required|string',
//         'quantity' => 'required|numeric|min:0.01',
//     ]);

//     $rawMaterial = RawMaterial::where('name', 'LIKE', $request->name)->first();

//     if (!$rawMaterial) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Raw material not found.'
//         ], 404);
//     }

//     if ($request->quantity > $rawMaterial->unit_qty) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Requested quantity exceeds available stock.'
//         ], 400);
//     }

//     $rawMaterial->unit_qty -= $request->quantity;
//     $rawMaterial->save();

//     return response()->json([
//         'success' => true,
//         'message' => 'Raw material quantity updated successfully.',
//         'remaining_qty' => $rawMaterial->unit_qty
//     ]);
// }





//     // ✅ Create a new raw material
//     public function store(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//             'name'         => 'required|string',
//             'local_name'   => 'required|string',
//             'capacity'     => 'required|numeric',
//             'unit_qty'     => 'required|numeric',
//             'unit'         => 'required|string',
//             'isPackaging'  => 'required|boolean',
//             'isVisible'    => 'required|boolean',
//             'misc'         => 'nullable|string|max:256',
//         ]);
    
//         if ($validator->fails()) {
//             return response()->json(['errors' => $validator->errors()], 422);
//         }
    
//         $data = $request->only([
//             'name',
//             'local_name',
//             'capacity',
//             'unit_qty',
//             'unit',
//             'isPackaging',
//             'isVisible',
//             'misc',
//         ]);
    
//         // Set company_id and created_by from Auth user
//         $data['company_id'] = Auth::user()->company_id;
//         $data['created_by'] = Auth::id();
    
//         $rawMaterial = RawMaterial::create($data);
    
//         return response()->json($rawMaterial, 201);
//     }

//     // ✅ Update raw material by ID
// //     public function update(Request $request, $id)
// // {
// //     $rawMaterial = RawMaterial::find($id);
// //     if (!$rawMaterial) {
// //         return response()->json(['message' => 'Raw Material not found'], 404);
// //     }

// //     $validator = Validator::make($request->all(), [
// //         'company_id'   => 'sometimes|required|integer',
// //         'name'         => 'sometimes|required|string',
// //         'capacity'     => 'sometimes|required|numeric',
// //         'unit_qty'     => 'sometimes|required|numeric',
// //         'unit'         => 'sometimes|required|string',
// //         'isPackaging'  => 'sometimes|required|boolean',
// //         'isVisible'    => 'sometimes|required|boolean',
// //         'created_by'   => 'sometimes|required|integer',
// //         'misc'         => 'nullable|string|max:256',
// //     ]);

// //     if ($validator->fails()) {
// //         return response()->json(['errors' => $validator->errors()], 422);
// //     }

// //     $data = $request->all();

// //     // If unit_qty is present in the request, add it to the existing value
// //     if ($request->has('unit_qty')) {
// //         $data['unit_qty'] = $rawMaterial->unit_qty + $request->unit_qty;
// //     }

// //     $rawMaterial->update($data);

// //     return response()->json($rawMaterial, 200);
// // }

// public function update(Request $request, $id)
// {
//     $rawMaterial = RawMaterial::find($id);
//     $failedItems=[];
//     if (!$rawMaterial) {
       
//         return response()->json(['message' => 'Raw Material not found'], 404);
//     }

//     $validator = Validator::make($request->all(), [
//         'company_id'   => 'sometimes|required|integer',
//         'name'         => 'sometimes|required|string',
//         'capacity'     => 'sometimes|required|numeric',
//         'unit_qty'     => 'sometimes|required|numeric',
//         'unit'         => 'sometimes|required|string',
//         'isPackaging'  => 'sometimes|required|boolean',
//         'isVisible'    => 'sometimes|required|boolean',
//         'created_by'   => 'sometimes|required|integer',
//         'misc'         => 'nullable|string|max:256',
//     ]);

//     if ($validator->fails()) {
//         return response()->json(['errors' => $validator->errors()], 422);
//     }

//     $data = $request->all();

//     // Use current capacity or incoming capacity from request
//     $capacity = $request->has('capacity') ? $request->capacity : $rawMaterial->capacity;
    
    

//     // Check unit_qty constraint
//     if ($request->has('unit_qty')) {
//         $newUnitQty = $rawMaterial->unit_qty + $request->unit_qty;
//         if ($newUnitQty > $capacity) {
//             $failedItems[] = ['id' => $rawMaterial->id, 'name' => $rawMaterial->name,'capacity'=>$rawMaterial->capacity,'quantity'=>$request->unit_qty,'current_quantity'=>$rawMaterial->unit_qty];
//             return response()->json([
//                 'message' => 'Validation failed',
//                 'failed' => $failedItems
//             ], 200);
//         }
//         $data['unit_qty'] = $newUnitQty;
//     }

//     $rawMaterial->update($data);

//     return response()->json([
//         'updated' => 'data updated',
        
//     ], 200);
// }


//     // ✅ Delete raw material
//     public function destroy($id)
//     {
//         $rawMaterial = RawMaterial::find($id);
//         if (!$rawMaterial) {
//             return response()->json(['message' => 'Raw Material not found'], 404);
//         }

//         $rawMaterial->delete();
//         return response()->json(['message' => 'Raw Material deleted successfully'], 200);
//     }

//     // ✅ Optional: Filter raw materials by visibility
//     public function visible()
//     {
//         return response()->json(RawMaterial::where('isVisible', 1)->get(), 200);
//     }

//     // ✅ Optional: Filter by company ID
//     public function byCompany($companyId)
//     {
//         return response()->json(RawMaterial::where('company_id', $companyId)->get(), 200);
//     }

// public function downloadDemoCsv()
// {
//     $headers = [
//         'name',
//         'local_name',
//         'capacity',
//         'unit_qty',
//         'unit',
//     ];

//     $filename = 'raw_materials_demo.csv';
//     $handle = fopen('php://temp', 'r+');
//     fputcsv($handle, $headers);
//     rewind($handle);
//     $csvContent = stream_get_contents($handle);
//     fclose($handle);

//     return Response::make($csvContent, 200, [
//         'Content-Type' => 'text/csv',
//         'Content-Disposition' => "attachment; filename=$filename",
//     ]);
// }


// public function uploadCsvRawMaterial(Request $request)
// {
//     // Validate the file
//     $request->validate([
//         'file' => 'required|mimes:csv,txt|max:2048',
//     ]);

//     // Ensure the user is authenticated
//     $user = Auth::user();
//     if (!$user) {
//         return response()->json(['error' => 'Unauthorized.'], 401);
//     }

//     // Read the CSV
//     $path = $request->file('file')->getRealPath();
//     $rows = array_map('str_getcsv', file($path));

//     // Trim headers
//     $header = array_map(function($h) {
//         return trim($h, "\xEF\xBB\xBF \"\t\n\r");
//     }, $rows[0]);
//     unset($rows[0]);

//     $imported = 0;
//     $errors = [];

//     foreach ($rows as $index => $row) {
//         // Trim cells
//         $row = array_map(function($cell) {
//             return trim($cell, "\"\t\n\r ");
//         }, $row);

//         // Check for column mismatch
//         if (count($header) !== count($row)) {
//             $errors[] = [
//                 'row' => $index + 2,
//                 'errors' => ['CSV column count mismatch'],
//                 'data' => $row,
//             ];
//             continue;
//         }

//         $data = array_combine($header, $row);

//         // Inject fixed fields
//         $data['company_id'] = $user->company_id;
//         $data['isPackaging'] = 1;
//         $data['isVisible'] = 1;
//         $data['created_by'] = $user->id;

//         // Validate
//         $validator = Validator::make($data, [
//             'company_id'   => 'required|integer',
//             'name'         => 'required|string',
//             'local_name'   => 'nullable|string',
//             'capacity'     => 'required|numeric',
//             'unit_qty'     => 'required|numeric',
//             'unit'         => 'required|string',
//             'isPackaging'  => 'required|boolean',
//             'isVisible'    => 'required|boolean',
//             'created_by'   => 'required|integer',
//             'misc'         => 'nullable|string',
//         ]);

//         if ($validator->fails()) {
//             $errors[] = [
//                 'row' => $index + 2,
//                 'errors' => $validator->errors()->all(),
//                 'data' => $data,
//             ];
//             continue;
//         }

//         // Save to DB
//         RawMaterial::create($data);
//         $imported++;
//     }

//     return response()->json([
//         'message' => "$imported raw materials imported successfully.",
//         'errors' => $errors,
//     ]);
// }


// public function usedQuantity(Request $request)
// {
//     $request->validate([
//         'material_id' => 'required|exists:raw_materials,id',
//         'quantity'    => 'required|numeric|min:1',
//         'employee'    => 'required|string',
//         'date'        => 'required|date',
//     ]);

//     $material = RawMaterial::findOrFail($request->material_id);
//     $companyId = Auth::user()->company_id;

//     if ($material->unit_qty < $request->quantity) {
//         return response()->json(['error' => 'Not enough stock'], 422);
//     }

//     $material->unit_qty -= $request->quantity;
//     $material->save();

//     RawMaterialLog::create([
//         'material_id' => $material->id,
//         'company_id'  => $companyId,
//         'type'        => 'used',
//         'quantity'    => $request->quantity,
//         'employee'    => $request->employee,
//         'date'        => $request->date,
//     ]);

//     return response()->json(['success' => true]);
// }
// public function addQuantity(Request $request)
// {
//     $request->validate([
//         'material_id' => 'required|exists:raw_materials,id',
//         'quantity'    => 'required|numeric|min:1',
//         'employee'    => 'required|string',
//         'date'        => 'required|date',
//         'type'        => 'required|in:add,buy',
//         'rate'        => 'nullable|numeric|min:0',
//         'total'       => 'nullable|numeric|min:0',
//     ]);

//     $material   = \App\Models\RawMaterial::findOrFail($request->material_id);
//     $companyId  = \Auth::user()->company_id;
//     $userId     = \Auth::id();

//     // ✅ 1. Update quantity
//     $material->unit_qty += $request->quantity;

//     // ✅ 2. Also increase capacity if it's a purchase
//     if ($request->type === 'buy') {
//         $material->capacity += $request->quantity;
//     }

//     $material->save();

//     // ✅ 3. Ensure numeric precision for rate/total
//     $rate  = $request->type === 'buy' ? round((float) $request->rate, 2) : null;
//     $total = $request->type === 'buy' ? round((float) $request->total, 2) : null;

//     // ✅ 4. Log in raw_material_logs
//     \App\Models\RawMaterialLog::create([
//         'material_id' => $material->id,
//         'company_id'  => $companyId,
//         'type'        => $request->type,
//         'quantity'    => $request->quantity,
//         'employee'    => $request->employee,
//         'date'        => $request->date,
//         'rate'        => $rate,
//         'total'       => $total,
//     ]);

//     // ✅ 5. If type is 'buy', log it as an expense
//     if ($request->type === 'buy' && $total > 0) {
//         // 🔁 Get dynamic expense_type_id for "Buy Inventory"
//         $expenseTypeId = \App\Models\ExpenseType::where('name', 'Buy Inventory')
//             ->where('company_id', $companyId)
//             ->value('id');

//         // ❗ Optional: auto-create if missing
//         if (!$expenseTypeId) {
//             $expenseType = \App\Models\ExpenseType::create([
//                 'name' => 'Buy Inventory',
//                 'company_id' => $companyId,
//                 'created_by' => $userId,
//                 'updated_by' => $userId,
//             ]);
//             $expenseTypeId = $expenseType->id;
//         }

//         \App\Models\Expense::create([
//             'name'         => 'Buy Inventory ' . $material->name,
//             'expense_date' => $request->date,
//             'price'        => $rate,
//             'qty'          => round($request->quantity, 2),
//             'total_price'  => $total,
//             'expense_id'   => $expenseTypeId,
//             'show'         => true,
//             'company_id'   => $companyId,
//             'created_by'   => $userId,
//             'updated_by'   => $userId,
//         ]);

//         // ✅ 6. Update expense summary
//         \App\Models\ExpenseSummary::updateOrCreate(
//             [
//                 'expense_date' => $request->date,
//                 'company_id'   => $companyId,
//             ],
//             [
//                 'total_expense' => \DB::raw('total_expense + ' . $total),
//                 'expense_count' => \DB::raw('expense_count + 1'),
//             ]
//         );
//     }

//     return response()->json(['success' => true]);
// }


// public function getMaterialLogs(Request $request, $material_id)
// {
//     $company_id = auth()->user()->company_id;

//     $logs = \App\Models\RawMaterialLog::where('material_id', $material_id)
//         ->where('company_id', $company_id)
//         ->latest('date')
//         ->take(10)
//         ->get();

//     return response()->json($logs);
// }




}
