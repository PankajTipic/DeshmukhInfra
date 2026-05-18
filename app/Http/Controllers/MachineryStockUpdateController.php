<?php

// namespace App\Http\Controllers;

// use App\Models\MachineryStockUpdate;
// use App\Models\MachineryStockItem; 
// use App\Models\MachineryStockLog;
// use App\Models\MachineryStockMovement;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;

// class MachineryStockUpdateController extends Controller
// {
 
//     // ====================== CREATE / STORE ======================
// public function store(Request $request)
// {
//     $companyId = auth()->user()->company_id;

//     $request->validate([
//         'project_id' => 'required|exists:projects,id',
//         'machine_id' => 'required|exists:machineries,id',
//         'update_date' => 'required|date',
//         'stock_items' => 'required|array',
//     ]);

//     $stockUpdate = MachineryStockUpdate::create([
//         'sr_no' => $request->sr_no,
//         'company_id' => $companyId,
//         'project_id' => $request->project_id,
//         'machine_id' => $request->machine_id,
//         'hrs' => $request->hrs ?? 0,
//         'update_date' => $request->update_date,
//         'maintenance_date' => $request->maintenance_date,
//         'hammer' => $request->hammer,
//         'stock_details' => $request->stock_details,
//         'tamplet' => $request->tamplet,
//         'capping' => $request->capping,
//         'damage_part' => $request->damage_part,
//         'bit' => $request->bit,
//         'used_bit' => $request->used_bit,
//         'oil_bal' => $request->oil_bal ?? 0,
//         'supervisor_id' => $request->supervisor_id,
//         'remarks' => $request->remarks,
//         'created_by' => Auth::id(),
//     ]);

//     foreach ($request->stock_items as $item) {
//         if (!empty($item['stock_name'])) {
//             $issued = (float)($item['issued_qty'] ?? 0);
//             $used   = (float)($item['used_qty'] ?? 0);

//             MachineryStockItem::create([
//                 'machinery_stock_update_id' => $stockUpdate->id,
//                 'stock_name'   => $item['stock_name'],
//                 'issued_qty'   => $issued,
//                 'used_qty'     => $used,
//                 'transferred_qty' => 0,
//                 'remaining_qty' => $issued - $used,
//                 'remarks'      => $item['remarks'] ?? null,
//             ]);
//         }
//     }

//     return response()->json([
//         'status' => true,
//         'message' => 'Machinery Stock Updated Successfully',
//         'data' => $stockUpdate->load('stockItems')
//     ]);
// }

//     public function getData()
//     {
//         $companyId = auth()->user()->company_id;

//         $data = MachineryStockUpdate::with([
//             'project',
//             'machine',
//             'supervisor',
//             'stockItems',
//             'stockMovements.fromProject',
//             'stockMovements.toProject',
//             'stockMovements.fromMachine',
//             'stockMovements.toMachine',
//             'stockMovements.movedBy'
//         ])
//         ->where('company_id', $companyId)
//         ->orderBy('created_at', 'desc')
//         ->get();

//         return response()->json($data);
//     }

   

// public function transferStock(Request $request)
// {
//     $request->validate([
//         'stock_item_id' => 'required|exists:machinery_stock_items,id',
//         'to_project_id' => 'required|exists:projects,id',
//         'to_machine_id' => 'required|exists:machineries,id',
//         'quantity'      => 'required|numeric|min:0.01',
//         'reason'        => 'nullable|string'
//     ]);

//     $stockItem = MachineryStockItem::findOrFail($request->stock_item_id);

//     if ($stockItem->stockUpdate->company_id !== auth()->user()->company_id) {
//         return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
//     }

//     $available = $stockItem->remaining_qty ?? ($stockItem->issued_qty - $stockItem->used_qty - ($stockItem->transferred_qty ?? 0));

//     if ($request->quantity > $available) {
//         return response()->json(['status' => false, 'message' => 'Insufficient remaining quantity'], 400);
//     }

//     // Create Movement
//     MachineryStockMovement::create([
//         'machinery_stock_update_id' => $stockItem->machinery_stock_update_id,
//         'from_project_id' => $stockItem->stockUpdate->project_id,
//         'from_machine_id' => $stockItem->stockUpdate->machine_id,
//         'to_project_id'   => $request->to_project_id,
//         'to_machine_id'   => $request->to_machine_id,
//         'stock_name'      => $stockItem->stock_name,
//         'quantity'        => $request->quantity,
//         'reason'          => $request->reason,
//         'moved_by'        => Auth::id(),
//     ]);

//     // Update Stock
//     $stockItem->transferred_qty = ($stockItem->transferred_qty ?? 0) + $request->quantity;
//     $stockItem->remaining_qty   = $stockItem->issued_qty - $stockItem->used_qty - $stockItem->transferred_qty;
//     $stockItem->save();

//     // === Create Transfer Log ===
//     MachineryStockLog::create([
//         'machinery_stock_item_id' => $stockItem->id,
//         'type'                    => 'transferred',
//         'quantity'                => $request->quantity,
//         'remaining_after'         => $stockItem->remaining_qty,
//         'remarks'                 => $request->reason,
//         'created_by'              => Auth::id(),
//         'log_date'                => now()->toDateString(),
//     ]);

//     return response()->json([
//         'status'  => true,
//         'message' => 'Stock transferred successfully'
//     ]);
// }





//     public function update(Request $request, $id)
//     {
//         $companyId = auth()->user()->company_id;

//         $stockUpdate = MachineryStockUpdate::where('company_id', $companyId)
//                         ->findOrFail($id);

//         $request->validate([
//             'project_id' => 'required|exists:projects,id',
//             'machine_id' => 'required|exists:machineries,id',
//             'update_date' => 'required|date',
//         ]);

//         $stockUpdate->update([
//             'project_id' => $request->project_id,
//             'machine_id' => $request->machine_id,
//             'hrs' => $request->hrs ?? 0,
//             'update_date' => $request->update_date,
//             'maintenance_date' => $request->maintenance_date,
//             'hammer' => $request->hammer,
//             'stock_details' => $request->stock_details,
//             'tamplet' => $request->tamplet,
//             'capping' => $request->capping,
//             'damage_part' => $request->damage_part,
//             'bit' => $request->bit,
//             'used_bit' => $request->used_bit,
//             'oil_bal' => $request->oil_bal ?? 0,
//             'supervisor_id' => $request->supervisor_id,
//             'remarks' => $request->remarks,
//         ]);

//         return response()->json([
//             'status' => true,
//             'message' => 'Record Updated Successfully',
//             'data' => $stockUpdate->load('stockItems')
//         ]);
//     }


// public function updateStockItem(Request $request, $id)
// {
//     $companyId = auth()->user()->company_id;
//     $stockItem = MachineryStockItem::findOrFail($id);

//     if ($stockItem->stockUpdate->company_id !== $companyId) {
//         return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
//     }

//     $request->validate([
//         'stock_name' => 'required|string',
//         'issued_qty' => 'required|numeric|min:0',
//         'used_qty'   => 'required|numeric|min:0',
//     ]);

//     $issued = (float)$request->issued_qty;
//     $used   = (float)$request->used_qty;
//     $transferred = (float)($stockItem->transferred_qty ?? 0);
//     $oldUsed = (float)$stockItem->used_qty;

//     $stockItem->update([
//         'stock_name'     => $request->stock_name,
//         'issued_qty'     => $issued,
//         'used_qty'       => $used,
//         'transferred_qty'=> $transferred,
//         'remaining_qty'  => $issued - $used - $transferred,
//         'remarks'        => $request->remarks,
//     ]);

//     // === Create Log if Used Qty Increased ===
//     if ($used > $oldUsed) {
//         $usedQtyToday = $used - $oldUsed;

//         MachineryStockLog::create([
//             'machinery_stock_item_id' => $stockItem->id,
//             'type'                    => 'used',
//             'quantity'                => $usedQtyToday,
//             'remaining_after'         => $stockItem->remaining_qty,
//             'remarks'                 => $request->remarks,
//             'created_by'              => Auth::id(),
//             'log_date'                => now()->toDateString(),
//         ]);
//     }

//     return response()->json([
//         'status' => true,
//         'message' => 'Stock Item Updated Successfully',
//         'data' => $stockItem
//     ]);
// }




// public function getStockLogs($stock_item_id)
// {
//     $logs = MachineryStockLog::where('machinery_stock_item_id', $stock_item_id)
//                 ->with('stockItem')
//                 ->orderBy('log_date', 'desc')
//                 ->orderBy('created_at', 'desc')
//                 ->get();

//     return response()->json($logs);
// }


// }







namespace App\Http\Controllers;

use App\Models\MachineryStockUpdate;
use App\Models\MachineryStockItem;
use App\Models\MachineryStockLog;
use App\Models\MachineryStockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MachineryStockUpdateController extends Controller
{
    // ====================== CREATE / STORE ======================
    public function store(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'machine_id' => 'required|exists:machineries,id',
            'update_date' => 'required|date',
            'stock_items' => 'required|array',
        ]);

        $stockUpdate = MachineryStockUpdate::create([
            'sr_no' => $request->sr_no,
            'company_id' => $companyId,
            'project_id' => $request->project_id,
            'machine_id' => $request->machine_id,
            'hrs' => $request->hrs ?? 0,
            'update_date' => $request->update_date,
            'maintenance_date' => $request->maintenance_date,
            'hammer' => $request->hammer,
            'stock_details' => $request->stock_details,
            'tamplet' => $request->tamplet,
            'capping' => $request->capping,
            'damage_part' => $request->damage_part,
            'bit' => $request->bit,
            'used_bit' => $request->used_bit,
            'oil_bal' => $request->oil_bal ?? 0,
            'supervisor_id' => $request->supervisor_id,
            'remarks' => $request->remarks,
            'created_by' => Auth::id(),
        ]);

        foreach ($request->stock_items as $item) {
            if (!empty($item['stock_name'])) {
                $issued = (float)($item['issued_qty'] ?? 0);
                $used   = (float)($item['used_qty'] ?? 0);

                MachineryStockItem::create([
                    'machinery_stock_update_id' => $stockUpdate->id,
                    'stock_name'   => $item['stock_name'],
                    'issued_qty'   => $issued,
                    'used_qty'     => $used,
                    'transferred_qty' => 0,
                    'remaining_qty' => $issued - $used,
                    'remarks'      => $item['remarks'] ?? null,
                ]);
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Machinery Stock Updated Successfully',
            'data' => $stockUpdate->load('stockItems')
        ]);
    }

    // public function getData()
    // {
    //     $companyId = auth()->user()->company_id;

    //     $data = MachineryStockUpdate::with([
    //         'project',
    //         'machine',
    //         'supervisor',
    //         'stockItems',
    //         'stockMovements.fromProject',
    //         'stockMovements.toProject',
    //         'stockMovements.fromMachine',
    //         'stockMovements.toMachine',
    //         'stockMovements.movedBy'
    //     ])
    //     ->where('company_id', $companyId)
    //     ->orderBy('created_at', 'desc')
    //     ->get();

    //     return response()->json($data);
    // }

public function getData(Request $request)
{
    $companyId = auth()->user()->company_id;

    $query = MachineryStockUpdate::with([
        'project',
        'machine',
        'supervisor',
        'stockItems',
        'stockMovements.fromProject',
        'stockMovements.toProject',
        'stockMovements.fromMachine',
        'stockMovements.toMachine',
        'stockMovements.movedBy'
    ])
    ->where('company_id', $companyId);

    // Project Filter
    if ($request->has('project_id') && $request->project_id) {
        $query->where('project_id', $request->project_id);
    }

    // Machine Filter
    if ($request->has('machine_id') && $request->machine_id) {
        $query->where('machine_id', $request->machine_id);
    }

    // Optional: Date Range Filter
    if ($request->has('start_date') && $request->start_date) {
        $query->whereDate('update_date', '>=', $request->start_date);
    }
    if ($request->has('end_date') && $request->end_date) {
        $query->whereDate('update_date', '<=', $request->end_date);
    }

    $data = $query->orderBy('created_at', 'desc')->get();

    return response()->json($data);
}



    public function update(Request $request, $id)
    {
        $companyId = auth()->user()->company_id;

        $stockUpdate = MachineryStockUpdate::where('company_id', $companyId)
                        ->findOrFail($id);

        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'machine_id' => 'required|exists:machineries,id',
            'update_date' => 'required|date',
        ]);

        $stockUpdate->update([
            'project_id' => $request->project_id,
            'machine_id' => $request->machine_id,
            'hrs' => $request->hrs ?? 0,
            'update_date' => $request->update_date,
            'maintenance_date' => $request->maintenance_date,
            'hammer' => $request->hammer,
            'stock_details' => $request->stock_details,
            'tamplet' => $request->tamplet,
            'capping' => $request->capping,
            'damage_part' => $request->damage_part,
            'bit' => $request->bit,
            'used_bit' => $request->used_bit,
            'oil_bal' => $request->oil_bal ?? 0,
            'supervisor_id' => $request->supervisor_id,
            'remarks' => $request->remarks,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Record Updated Successfully',
            'data' => $stockUpdate->load('stockItems')
        ]);
    }


    // ====================== UPDATE STOCK ITEM (ADD USED QTY) ======================
    public function updateStockItem(Request $request, $id)
    {
        $companyId = auth()->user()->company_id;
        $stockItem = MachineryStockItem::findOrFail($id);

        if ($stockItem->stockUpdate->company_id !== $companyId) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'stock_name' => 'required|string',
            'used_qty'   => 'required|numeric|min:0',
        ]);

        $issued = (float)$stockItem->issued_qty;
        $additionalUsed = (float)$request->used_qty;
        $newUsed = $stockItem->used_qty + $additionalUsed;
        $transferred = (float)($stockItem->transferred_qty ?? 0);

        $stockItem->update([
            'stock_name'     => $request->stock_name,
            'used_qty'       => $newUsed,
            'transferred_qty'=> $transferred,
            'remaining_qty'  => $issued - $newUsed - $transferred,
            'remarks'        => $request->remarks,
        ]);

        // Create Log
        if ($additionalUsed > 0) {
            MachineryStockLog::create([
                'machinery_stock_item_id' => $stockItem->id,
                'type'                    => 'used',
                'quantity'                => $additionalUsed,
                'remaining_after'         => $stockItem->remaining_qty,
                'remarks'                 => $request->remarks,
                'created_by'              => Auth::id(),
                'log_date'                => now()->toDateString(),
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Stock Item Updated Successfully',
            'data' => $stockItem
        ]);
    }

    // ====================== TRANSFER STOCK ======================
    public function transferStock(Request $request)
    {
        $request->validate([
            'stock_item_id' => 'required|exists:machinery_stock_items,id',
            'to_project_id' => 'required|exists:projects,id',
            'to_machine_id' => 'required|exists:machineries,id',
            'quantity'      => 'required|numeric|min:0.01',
            'reason'        => 'nullable|string'
        ]);

        $stockItem = MachineryStockItem::findOrFail($request->stock_item_id);

        if ($stockItem->stockUpdate->company_id !== auth()->user()->company_id) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $available = $stockItem->remaining_qty ?? ($stockItem->issued_qty - $stockItem->used_qty - ($stockItem->transferred_qty ?? 0));

        if ($request->quantity > $available) {
            return response()->json(['status' => false, 'message' => 'Insufficient remaining quantity'], 400);
        }

        MachineryStockMovement::create([
            'machinery_stock_update_id' => $stockItem->machinery_stock_update_id,
            'from_project_id' => $stockItem->stockUpdate->project_id,
            'from_machine_id' => $stockItem->stockUpdate->machine_id,
            'to_project_id'   => $request->to_project_id,
            'to_machine_id'   => $request->to_machine_id,
            'stock_name'      => $stockItem->stock_name,
            'quantity'        => $request->quantity,
            'reason'          => $request->reason,
            'moved_by'        => Auth::id(),
        ]);

        $stockItem->transferred_qty = ($stockItem->transferred_qty ?? 0) + $request->quantity;
        $stockItem->remaining_qty   = $stockItem->issued_qty - $stockItem->used_qty - $stockItem->transferred_qty;
        $stockItem->save();

        MachineryStockLog::create([
            'machinery_stock_item_id' => $stockItem->id,
            'type'                    => 'transferred',
            'quantity'                => $request->quantity,
            'remaining_after'         => $stockItem->remaining_qty,
            'remarks'                 => $request->reason,
            'created_by'              => Auth::id(),
            'log_date'                => now()->toDateString(),
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Stock transferred successfully'
        ]);
    }


 // ====================== GET STOCK LOGS (with Transfer Details) ======================
public function getStockLogs($stock_item_id)
{
    $companyId = auth()->user()->company_id;

    $logs = MachineryStockLog::where('machinery_stock_item_id', $stock_item_id)
                ->whereHas('stockItem.stockUpdate', function($q) use ($companyId) {
                    $q->where('company_id', $companyId);
                })
                ->with([
                    'stockItem',
                    'stockItem.stockUpdate' // for safety
                ])
                ->orderBy('log_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

    // Enrich transfer logs with destination info
    $logs->each(function ($log) {
        if ($log->type === 'transferred') {
            $movement = MachineryStockMovement::where('machinery_stock_update_id', $log->stockItem->machinery_stock_update_id)
                ->where('stock_name', $log->stockItem->stock_name)
                ->where('quantity', $log->quantity)
                ->latest()
                ->first();

            if ($movement) {
                $log->to_project = $movement->toProject ? $movement->toProject->project_name : null;
                $log->to_machine = $movement->toMachine ? $movement->toMachine->machine_name : null;
            }
        }
    });

    return response()->json($logs);
}











}