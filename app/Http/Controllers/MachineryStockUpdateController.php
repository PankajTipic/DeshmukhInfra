<?php

namespace App\Http\Controllers;

use App\Models\MachineryStockItem;
use App\Models\MachineryStockLog;
use App\Models\MachineryStockMovement;
use App\Models\MachineryStockUpdate;
use App\Models\Project;
use App\Models\Machinery;
use App\Models\Operator; // Supervisors are Operators of type '0'
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * MachineryStockUpdateController
 *
 * Handles all API endpoints consumed by MachineryStockTable.js (MachineryOS UI).
 * Fully aligned to the database schemas.
 */
class MachineryStockUpdateController extends Controller
{
    // ──────────────────────────────────────────────────────────
    // HELPERS — guess category and format responses
    // ──────────────────────────────────────────────────────────

    private function guessCategory($name): string
    {
        $name = strtolower($name);
        if (str_contains($name, 'fuel') || str_contains($name, 'diesel') || str_contains($name, 'petrol')) {
            return 'Fuel';
        }
        if (str_contains($name, 'oil') || str_contains($name, 'grease') || str_contains($name, 'lubricant')) {
            return 'Lubricant';
        }
        if (str_contains($name, 'bit') || str_contains($name, 'hammer') || str_contains($name, 'tool') || str_contains($name, 'capping') || str_contains($name, 'tamplet')) {
            return 'Tool';
        }
        if (str_contains($name, 'filter') || str_contains($name, 'belt') || str_contains($name, 'nut') || str_contains($name, 'bolt') || str_contains($name, 'hose') || str_contains($name, 'spare')) {
            return 'Spare Part';
        }
        return 'Consumable';
    }

    private function formatStockItem(MachineryStockItem $s): array
    {
        $parent = $s->stockUpdate;
        return [
            'id'          => $s->id,
            'projectId'   => $parent ? $parent->project_id : null,
            'machineId'   => $parent ? $parent->machine_id : null,
            'itemName'    => $s->stock_name,
            'unit'        => 'NOS',
            'initialQty'  => (float) $s->issued_qty,
            'currentQty'  => (float) $s->remaining_qty,
            'minQty'      => (float) ($s->issued_qty * 0.2), // Low stock alert at 20%
            'category'    => $this->guessCategory($s->stock_name),
            'createdAt'   => optional($s->created_at)->toDateString(),
        ];
    }

    private function formatLog(MachineryStockLog $l): array
    {
        return [
            'id'           => $l->id,
            'stockId'      => $l->machinery_stock_item_id,
            'type'         => $l->type,                          // 'issued' | 'usage' | 'transfer-out'
            'qty'          => (float) $l->quantity,
            'note'         => $l->remarks ?? '',
            'date'         => $l->log_date ?? optional($l->created_at)->toDateString(),
            'by'           => optional($l->createdBy)->name ?? 'System',
            'balanceAfter' => (float) $l->remaining_after,       // DB column is remaining_after
        ];
    }

    private function formatTransfer(MachineryStockMovement $m): array
    {
        return [
            'id'            => $m->id,
            'stockId'       => $m->machinery_stock_update_id,
            'itemName'      => $m->stock_name,
            'fromProjectId' => $m->from_project_id,
            'toProjectId'   => $m->to_project_id,
            'qty'           => (float) $m->quantity,
            'note'          => $m->reason ?? '',
            'date'          => optional($m->created_at)->toDateString(),
            'by'            => optional($m->movedBy)->name ?? 'System',
        ];
    }

    // ══════════════════════════════════════════════════════════
    // MASTERS  — GET /api/machinery/masters
    // ══════════════════════════════════════════════════════════

    public function getMasters()
    {
        $companyId = auth()->user()->company_id;

        $projects = Project::where('company_id', $companyId)
            ->orderBy('project_name')
            ->get()
            ->map(fn($p) => [
                'id'   => $p->id,
                'name' => $p->project_name,
            ]);

        $machines = Machinery::where('company_id', $companyId)
            ->orderBy('machine_name')
            ->get()
            ->map(fn($m) => [
                'id'   => $m->id,
                'name' => $m->machine_name,
                'type' => $m->machine_type ?? $m->type ?? '',
            ]);

        $supervisors = Operator::where('company_id', $companyId)
            ->where('type', '0') // '0' represents supervisor in database
            ->orderBy('name')
            ->get()
            ->map(fn($s) => [
                'id'   => $s->id,
                'name' => $s->name,
            ]);

        return response()->json([
            'projects'    => $projects,
            'machines'    => $machines,
            'supervisors' => $supervisors,
        ]);
    }

    // ══════════════════════════════════════════════════════════
    // STOCK MASTER  — GET /api/machinery/stock
    // ══════════════════════════════════════════════════════════

    public function getStockMaster(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $query = MachineryStockItem::whereHas('stockUpdate', function($q) use ($companyId) {
            $q->where('company_id', $companyId);
        });

        if ($request->project_id) {
            $query->whereHas('stockUpdate', fn($q) => $q->where('project_id', $request->project_id));
        }
        if ($request->machine_id) {
            $query->whereHas('stockUpdate', fn($q) => $q->where('machine_id', $request->machine_id));
        }

        $items = $query->orderBy('created_at', 'desc')->get();

        $formatted = $items->map(fn($s) => $this->formatStockItem($s));

        if ($request->category) {
            $formatted = $formatted->filter(fn($s) => $s['category'] === $request->category)->values();
        }

        return response()->json($formatted);
    }

    // ══════════════════════════════════════════════════════════
    // ADD STOCK MASTER  — POST /api/machinery/stock
    // ══════════════════════════════════════════════════════════

    public function storeStockMaster(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'machine_id'  => 'nullable|exists:machineries,id',
            'item_name'   => 'required|string|max:255',
            'unit'        => 'required|string|max:50',
            'initial_qty' => 'required|numeric|min:0',
            'min_qty'     => 'required|numeric|min:0',
            'category'    => 'required|in:Consumable,Fuel,Lubricant,Spare Part,Tool',
        ]);

        $update = MachineryStockUpdate::create([
            'company_id'  => $companyId,
            'project_id'  => $request->project_id,
            'machine_id'  => $request->machine_id,
            'update_date' => now()->toDateString(),
            'remarks'     => 'Added via Stock Inventory',
            'created_by'  => auth()->id(),
        ]);

        $stockItem = MachineryStockItem::create([
            'machinery_stock_update_id' => $update->id,
            'stock_name'                => $request->item_name,
            'issued_qty'                => $request->initial_qty,
            'used_qty'                  => 0,
            'remaining_qty'             => $request->initial_qty,
            'remarks'                   => 'Initial stock added',
        ]);

        // Record the initial "issued" log entry
        MachineryStockLog::create([
            'machinery_stock_item_id' => $stockItem->id,
            'type'                    => 'issued',
            'quantity'                => $request->initial_qty,
            'remaining_after'         => $request->initial_qty,
            'remarks'                 => 'Initial stock added',
            'created_by'              => auth()->id(),
            'log_date'                => now()->toDateString(),
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Stock item added successfully',
            'data'    => $this->formatStockItem($stockItem),
        ], 201);
    }

    // ══════════════════════════════════════════════════════════
    // RECORD USAGE  — POST /api/machinery/stock/use
    // ══════════════════════════════════════════════════════════

    public function useStock(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $request->validate([
            'stock_item_id' => 'required|exists:machinery_stock_items,id',
            'qty'           => 'required|numeric|min:0.01',
            'note'          => 'nullable|string|max:500',
        ]);

        $stock = MachineryStockItem::findOrFail($request->stock_item_id);

        // Company guard
        if ($stock->stockUpdate->company_id !== $companyId) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        // Stock check
        if ($request->qty > $stock->remaining_qty) {
            return response()->json([
                'status'  => false,
                'message' => 'Insufficient stock. Available: ' . $stock->remaining_qty,
            ], 422);
        }

        $newRemaining = $stock->remaining_qty - $request->qty;
        $newUsed = $stock->used_qty + $request->qty;
        $stock->update([
            'used_qty'      => $newUsed,
            'remaining_qty' => $newRemaining,
        ]);

        $log = MachineryStockLog::create([
            'machinery_stock_item_id' => $stock->id,
            'type'                    => 'usage',
            'quantity'                => $request->qty,
            'remaining_after'         => $newRemaining,
            'remarks'                 => $request->note,
            'created_by'              => auth()->id(),
            'log_date'                => now()->toDateString(),
        ]);

        $log->load('createdBy');

        return response()->json([
            'status'  => true,
            'message' => 'Usage recorded successfully',
            'data'    => [
                'stock' => $this->formatStockItem($stock),
                'log'   => $this->formatLog($log),
            ],
        ]);
    }

    // ══════════════════════════════════════════════════════════
    // TRANSFER STOCK  — POST /api/machinery/stock/transfer
    // ══════════════════════════════════════════════════════════

    public function transferStock(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $request->validate([
            'stock_item_id' => 'required|exists:machinery_stock_items,id',
            'to_project_id' => 'required|exists:projects,id',
            'to_machine_id' => 'nullable|exists:machineries,id',
            'qty'           => 'required|numeric|min:0.01',
            'note'          => 'nullable|string|max:500',
        ]);

        $stock = MachineryStockItem::findOrFail($request->stock_item_id);
        $parent = $stock->stockUpdate;

        // Company guard
        if ($parent->company_id !== $companyId) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        // Stock check
        if ($request->qty > $stock->remaining_qty) {
            return response()->json([
                'status'  => false,
                'message' => 'Insufficient stock. Available: ' . $stock->remaining_qty,
            ], 422);
        }

        $newRemaining = $stock->remaining_qty - $request->qty;
        $newTransferred = ($stock->transferred_qty ?? 0) + $request->qty;
        $stock->update([
            'transferred_qty' => $newTransferred,
            'remaining_qty'   => $newRemaining,
        ]);

        // Movement record (transfer log)
        $movement = MachineryStockMovement::create([
            'machinery_stock_update_id' => $parent->id,
            'from_project_id'           => $parent->project_id,
            'from_machine_id'           => $parent->machine_id,
            'to_project_id'             => $request->to_project_id,
            'to_machine_id'             => $request->to_machine_id,
            'stock_name'                => $stock->stock_name,
            'quantity'                  => $request->qty,
            'reason'                    => $request->note,
            'moved_by'                  => auth()->id(),
        ]);

        // Log entry (type = 'transfer-out')
        $log = MachineryStockLog::create([
            'machinery_stock_item_id' => $stock->id,
            'type'                    => 'transfer-out',
            'quantity'                => $request->qty,
            'remaining_after'         => $newRemaining,
            'remarks'                 => $request->note,
            'created_by'              => auth()->id(),
            'log_date'                => now()->toDateString(),
        ]);

        // Create/Update arrival item at destination
        $targetUpdate = MachineryStockUpdate::where('company_id', $companyId)
            ->where('project_id', $request->to_project_id)
            ->where('machine_id', $request->to_machine_id)
            ->where('update_date', now()->toDateString())
            ->first();

        if (!$targetUpdate) {
            $targetUpdate = MachineryStockUpdate::create([
                'company_id'  => $companyId,
                'project_id'  => $request->to_project_id,
                'machine_id'  => $request->to_machine_id,
                'update_date' => now()->toDateString(),
                'remarks'     => 'Transferred stock arrival',
                'created_by'  => auth()->id(),
            ]);
        }

        $targetItem = MachineryStockItem::where('machinery_stock_update_id', $targetUpdate->id)
            ->where('stock_name', $stock->stock_name)
            ->first();

        if ($targetItem) {
            $targetRemaining = $targetItem->remaining_qty + $request->qty;
            $targetIssued = $targetItem->issued_qty + $request->qty;
            $targetItem->update([
                'issued_qty'    => $targetIssued,
                'remaining_qty' => $targetRemaining,
            ]);
        } else {
            $targetItem = MachineryStockItem::create([
                'machinery_stock_update_id' => $targetUpdate->id,
                'stock_name'                => $stock->stock_name,
                'issued_qty'                => $request->qty,
                'used_qty'                  => 0,
                'remaining_qty'             => $request->qty,
                'remarks'                   => 'Received from project ' . ($parent->project->project_name ?? $parent->project_id),
            ]);
        }

        // Log the transfer-in on the destination stock item
        MachineryStockLog::create([
            'machinery_stock_item_id' => $targetItem->id,
            'type'                    => 'issued',
            'quantity'                => $request->qty,
            'remaining_after'         => $targetItem->remaining_qty,
            'remarks'                 => 'Transferred from ' . ($parent->project->project_name ?? $parent->project_id),
            'created_by'              => auth()->id(),
            'log_date'                => now()->toDateString(),
        ]);

        $movement->load('movedBy');

        return response()->json([
            'status'    => true,
            'message'   => 'Stock transferred successfully',
            'data'      => [
                'stock'    => $this->formatStockItem($stock),
                'transfer' => $this->formatTransfer($movement),
            ],
        ]);
    }

    // ══════════════════════════════════════════════════════════
    // STOCK HISTORY  — GET /api/machinery/stock/{id}/history
    // ══════════════════════════════════════════════════════════

    public function getStockHistory($id)
    {
        $companyId = auth()->user()->company_id;

        $stock = MachineryStockItem::findOrFail($id);

        if ($stock->stockUpdate->company_id !== $companyId) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $logs = MachineryStockLog::with('createdBy')
            ->where('machinery_stock_item_id', $stock->id)
            ->orderBy('log_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $logs->map(fn($l) => $this->formatLog($l)),
        ]);
    }

    // ══════════════════════════════════════════════════════════
    // ALL TRANSFER LOGS  — GET /api/machinery/transfers
    // ══════════════════════════════════════════════════════════

    public function getTransferLogs(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $movements = MachineryStockMovement::with(['movedBy', 'fromProject', 'toProject'])
            ->whereHas('stockUpdate', fn($q) => $q->where('company_id', $companyId))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(
            $movements->map(fn($m) => $this->formatTransfer($m))
        );
    }

    // ══════════════════════════════════════════════════════════
    // DAILY LOGS  — GET /api/machinery/daily-logs
    // ══════════════════════════════════════════════════════════

    public function getDailyLogs(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $logs = MachineryStockUpdate::with(['project', 'machine', 'supervisor'])
            ->where('company_id', $companyId)
            ->where('hrs', '>', 0)
            ->when($request->project_id, fn($q) => $q->where('project_id', $request->project_id))
            ->when($request->date, fn($q) => $q->whereDate('update_date', $request->date))
            ->orderBy('update_date', 'desc')
            ->get();

        return response()->json(
            $logs->map(fn($l) => [
                'id'           => $l->id,
                'projectId'    => $l->project_id,
                'machineId'    => $l->machine_id,
                'supervisorId' => $l->supervisor_id,
                'date'         => $l->update_date,
                'hoursWorked'  => (float) $l->hrs,
                'hammer'       => $l->hammer ?? '',
                'capping'      => $l->capping ?? '',
                'bit'          => $l->bit ?? '',
                'used_bit'     => $l->used_bit ?? '',
                'damage_part'  => $l->damage_part ?? '',
                'tamplet'      => $l->tamplet ?? '',
                'workDone'     => $l->stock_details ?? '',
                'remarks'      => $l->remarks ?? '',
                'status'       => 'active',
            ])
        );
    }

    // ══════════════════════════════════════════════════════════
    // ADD DAILY LOG  — POST /api/machinery/daily-logs
    // ══════════════════════════════════════════════════════════

    public function storeDailyLog(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $request->validate([
            'project_id'    => 'required|exists:projects,id',
            'machine_id'    => 'required|exists:machineries,id',
            'supervisor_id' => 'nullable|exists:operators,id',
            'date'          => 'required|date',
            'hours_worked'  => 'required|numeric|min:0|max:24',
            'work_done'     => 'nullable|string',
            'remarks'       => 'nullable|string',
            'hammer'        => 'nullable|string',
            'capping'       => 'nullable|string',
            'bit'           => 'nullable|string',
            'used_bit'      => 'nullable|string',
            'damage_part'   => 'nullable|string',
            'tamplet'       => 'nullable|string',
        ]);

        $log = MachineryStockUpdate::create([
            'company_id'    => $companyId,
            'project_id'    => $request->project_id,
            'machine_id'    => $request->machine_id,
            'supervisor_id' => $request->supervisor_id,
            'update_date'   => $request->date,
            'hrs'           => $request->hours_worked,
            'remarks'       => $request->remarks,
            'hammer'        => $request->hammer,
            'capping'       => $request->capping,
            'bit'           => $request->bit,
            'used_bit'      => $request->used_bit,
            'damage_part'   => $request->damage_part,
            'tamplet'       => $request->tamplet,
            'stock_details' => $request->work_done,
            'created_by'    => auth()->id(),
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Daily log added successfully',
            'data'    => [
                'id'           => $log->id,
                'projectId'    => $log->project_id,
                'machineId'    => $log->machine_id,
                'supervisorId' => $log->supervisor_id,
                'date'         => $log->update_date,
                'hoursWorked'  => (float) $log->hrs,
                'hammer'       => $log->hammer ?? '',
                'capping'      => $log->capping ?? '',
                'bit'          => $log->bit ?? '',
                'used_bit'     => $log->used_bit ?? '',
                'damage_part'  => $log->damage_part ?? '',
                'tamplet'      => $log->tamplet ?? '',
                'workDone'     => $log->stock_details ?? '',
                'remarks'      => $log->remarks ?? '',
                'status'       => 'active',
            ],
        ], 201);
    }

    // ══════════════════════════════════════════════════════════
    // MAINTENANCE LOGS  — GET /api/machinery/maintenance
    // ══════════════════════════════════════════════════════════

    public function getMaintenanceLogs(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $logs = MachineryStockUpdate::with(['machine', 'project', 'supervisor'])
            ->where('company_id', $companyId)
            ->whereNotNull('maintenance_date')
            ->when($request->machine_id, fn($q) => $q->where('machine_id', $request->machine_id))
            ->orderBy('maintenance_date', 'desc')
            ->get();

        return response()->json(
            $logs->map(fn($l) => [
                'id'        => $l->id,
                'machineId' => $l->machine_id,
                'projectId' => $l->project_id,
                'date'      => $l->maintenance_date,
                'type'      => $l->damage_part ? 'Breakdown' : 'Preventive',
                'desc'      => trim(($l->remarks ? $l->remarks : '') . ($l->damage_part ? ' Damaged: '.$l->damage_part : '')),
                'cost'      => (float)($l->cost ?? 0.0),
                'nextDue'   => $l->next_due,
                'by'        => $l->serviced_by ?? (optional($l->supervisor)->name ?? 'System'),
            ])
        );
    }

    // ══════════════════════════════════════════════════════════
    // ADD MAINTENANCE  — POST /api/machinery/maintenance
    // ══════════════════════════════════════════════════════════

    public function storeMaintenance(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $request->validate([
            'machine_id' => 'required|exists:machineries,id',
            'project_id' => 'nullable|exists:projects,id',
            'date'       => 'required|date',
            'type'       => 'required|in:Preventive,Breakdown,Scheduled,Emergency',
            'desc'       => 'required|string',
            'cost'       => 'nullable|numeric|min:0',
            'next_due'   => 'nullable|date',
            'by'         => 'nullable|string|max:255',
        ]);

        $log = MachineryStockUpdate::create([
            'company_id'       => $companyId,
            'machine_id'       => $request->machine_id,
            'project_id'       => $request->project_id,
            'update_date'      => $request->date,
            'maintenance_date' => $request->date,
            'damage_part'      => $request->type === 'Breakdown' ? $request->desc : null,
            'remarks'          => $request->desc,
            'cost'             => $request->cost ?? 0.0,
            'next_due'         => $request->next_due ?: null,
            'serviced_by'      => $request->by ?: null,
            'created_by'       => auth()->id(),
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Maintenance record added successfully',
            'data'    => [
                'id'        => $log->id,
                'machineId' => $log->machine_id,
                'projectId' => $log->project_id,
                'date'      => $log->maintenance_date,
                'type'      => $request->type,
                'desc'      => $log->remarks,
                'cost'      => (float)($log->cost ?? 0.0),
                'nextDue'   => $log->next_due,
                'by'        => $log->serviced_by ?? ($request->by ?? auth()->user()->name),
            ],
        ], 201);
    }

    // ══════════════════════════════════════════════════════════
    // DASHBOARD SUMMARY  — GET /api/machinery/dashboard
    // ══════════════════════════════════════════════════════════

    public function getDashboard()
    {
        $companyId = auth()->user()->company_id;
        $today     = now()->toDateString();

        $stockItems = MachineryStockItem::whereHas('stockUpdate', function($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->get();

        $critical = $stockItems->filter(fn($s) => $s->remaining_qty <= ($s->issued_qty * 0.2))->count();
        
        $lowStock = $stockItems->filter(function ($s) {
            if (!$s->issued_qty) return false;
            $pct = ($s->remaining_qty / $s->issued_qty) * 100;
            return $pct <= 30 && $s->remaining_qty > ($s->issued_qty * 0.2);
        })->count();

        $dailyLogsCount = MachineryStockUpdate::where('company_id', $companyId)
            ->where('hrs', '>', 0)
            ->whereDate('update_date', $today)
            ->count();

        $hoursToday = MachineryStockUpdate::where('company_id', $companyId)
            ->where('hrs', '>', 0)
            ->whereDate('update_date', $today)
            ->sum('hrs');

        $overdueM = 0;

        $transfers = MachineryStockMovement::whereHas('stockUpdate', function($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->count();

        return response()->json([
            'stockItems'     => $stockItems->count(),
            'criticalAlerts' => $critical,
            'lowStock'       => $lowStock,
            'todayLogs'      => $dailyLogsCount,
            'hoursToday'     => (float) $hoursToday,
            'overdueM'       => $overdueM,
            'totalTransfers' => $transfers,
        ]);
    }

    // ══════════════════════════════════════════════════════════
    // STOCK MASTER CRUD ACTIONS (EDIT/DELETE)
    // ══════════════════════════════════════════════════════════

    public function updateStockMaster(Request $request, $id)
    {
        $companyId = auth()->user()->company_id;
        $stockItem = MachineryStockItem::findOrFail($id);
        
        if ($stockItem->stockUpdate->company_id !== $companyId) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'machine_id'  => 'nullable|exists:machineries,id',
            'item_name'   => 'required|string|max:255',
            'unit'        => 'required|string|max:50',
            'initial_qty' => 'required|numeric|min:0',
            'min_qty'     => 'required|numeric|min:0',
            'category'    => 'required|in:Consumable,Fuel,Lubricant,Spare Part,Tool',
        ]);

        $stockItem->stockUpdate->update([
            'project_id' => $request->project_id,
            'machine_id' => $request->machine_id,
        ]);

        $stockItem->update([
            'stock_name'    => $request->item_name,
            'issued_qty'    => $request->initial_qty,
            'remaining_qty' => $request->initial_qty - $stockItem->used_qty,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Stock item updated successfully',
            'data'    => $this->formatStockItem($stockItem),
        ]);
    }

    public function deleteStockMaster($id)
    {
        $companyId = auth()->user()->company_id;
        $stockItem = MachineryStockItem::findOrFail($id);

        if ($stockItem->stockUpdate->company_id !== $companyId) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $stockItem->delete();
        
        return response()->json([
            'status'  => true,
            'message' => 'Stock item deleted successfully',
        ]);
    }

    // ══════════════════════════════════════════════════════════
    // DAILY LOG CRUD ACTIONS (EDIT/DELETE)
    // ══════════════════════════════════════════════════════════

    public function updateDailyLog(Request $request, $id)
    {
        $companyId = auth()->user()->company_id;
        $log = MachineryStockUpdate::findOrFail($id);

        if ($log->company_id !== $companyId) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'project_id'    => 'required|exists:projects,id',
            'machine_id'    => 'required|exists:machineries,id',
            'supervisor_id' => 'nullable|exists:operators,id',
            'date'          => 'required|date',
            'hours_worked'  => 'required|numeric|min:0|max:24',
            'work_done'     => 'nullable|string',
            'remarks'       => 'nullable|string',
            'hammer'        => 'nullable|string',
            'capping'       => 'nullable|string',
            'bit'           => 'nullable|string',
            'used_bit'      => 'nullable|string',
            'damage_part'   => 'nullable|string',
            'tamplet'       => 'nullable|string',
        ]);

        $log->update([
            'project_id'    => $request->project_id,
            'machine_id'    => $request->machine_id,
            'supervisor_id' => $request->supervisor_id,
            'update_date'   => $request->date,
            'hrs'           => $request->hours_worked,
            'remarks'       => $request->remarks,
            'hammer'        => $request->hammer,
            'capping'       => $request->capping,
            'bit'           => $request->bit,
            'used_bit'      => $request->used_bit,
            'damage_part'   => $request->damage_part,
            'tamplet'       => $request->tamplet,
            'stock_details' => $request->work_done,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Daily log updated successfully',
            'data'    => [
                'id'           => $log->id,
                'projectId'    => $log->project_id,
                'machineId'    => $log->machine_id,
                'supervisorId' => $log->supervisor_id,
                'date'         => $log->update_date,
                'hoursWorked'  => (float) $log->hrs,
                'hammer'       => $log->hammer ?? '',
                'capping'      => $log->capping ?? '',
                'bit'          => $log->bit ?? '',
                'used_bit'     => $log->used_bit ?? '',
                'damage_part'  => $log->damage_part ?? '',
                'tamplet'      => $log->tamplet ?? '',
                'workDone'     => $log->stock_details ?? '',
                'remarks'      => $log->remarks ?? '',
                'status'       => 'active',
            ],
        ]);
    }

    public function deleteDailyLog($id)
    {
        $companyId = auth()->user()->company_id;
        $log = MachineryStockUpdate::findOrFail($id);

        if ($log->company_id !== $companyId) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $log->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Daily log deleted successfully',
        ]);
    }

    // ══════════════════════════════════════════════════════════
    // MAINTENANCE CRUD ACTIONS (EDIT/DELETE)
    // ══════════════════════════════════════════════════════════

    public function updateMaintenance(Request $request, $id)
    {
        $companyId = auth()->user()->company_id;
        $log = MachineryStockUpdate::findOrFail($id);

        if ($log->company_id !== $companyId) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'machine_id' => 'required|exists:machineries,id',
            'project_id' => 'nullable|exists:projects,id',
            'date'       => 'required|date',
            'type'       => 'required|in:Preventive,Breakdown,Scheduled,Emergency',
            'desc'       => 'required|string',
            'cost'       => 'nullable|numeric|min:0',
            'next_due'   => 'nullable|date',
            'by'         => 'nullable|string|max:255',
        ]);

        $log->update([
            'machine_id'       => $request->machine_id,
            'project_id'       => $request->project_id,
            'update_date'      => $request->date,
            'maintenance_date' => $request->date,
            'damage_part'      => $request->type === 'Breakdown' ? $request->desc : null,
            'remarks'          => $request->desc,
            'cost'             => $request->cost ?? 0.0,
            'next_due'         => $request->next_due ?: null,
            'serviced_by'      => $request->by ?: null,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Maintenance record updated successfully',
            'data'    => [
                'id'        => $log->id,
                'machineId' => $log->machine_id,
                'projectId' => $log->project_id,
                'date'      => $log->maintenance_date,
                'type'      => $request->type,
                'desc'      => $log->remarks,
                'cost'      => (float)($log->cost ?? 0.0),
                'nextDue'   => $log->next_due,
                'by'        => $log->serviced_by ?? ($request->by ?? auth()->user()->name),
            ],
        ]);
    }

    public function deleteMaintenance($id)
    {
        $companyId = auth()->user()->company_id;
        $log = MachineryStockUpdate::findOrFail($id);

        if ($log->company_id !== $companyId) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $log->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Maintenance record deleted successfully',
        ]);
    }

    // ══════════════════════════════════════════════════════════
    // TRANSFER CRUD ACTIONS (EDIT/DELETE)
    // ══════════════════════════════════════════════════════════

    public function updateTransferLog(Request $request, $id)
    {
        $companyId = auth()->user()->company_id;
        $movement = MachineryStockMovement::findOrFail($id);

        if ($movement->stockUpdate->company_id !== $companyId) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'qty'  => 'required|numeric|min:0.01',
            'note' => 'nullable|string|max:500',
        ]);

        $movement->update([
            'quantity' => $request->qty,
            'reason'   => $request->note,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Transfer record updated successfully',
            'data'    => $this->formatTransfer($movement),
        ]);
    }

    public function deleteTransferLog($id)
    {
        $companyId = auth()->user()->company_id;
        $movement = MachineryStockMovement::findOrFail($id);

        if ($movement->stockUpdate->company_id !== $companyId) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $movement->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Transfer record deleted successfully',
        ]);
    }
}