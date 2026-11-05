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
use App\Models\CompanyInfo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

/**
 * MachineryStockUpdateController
 *
 * Handles all API endpoints consumed by MachineryStockTable.js (MachineryOS UI).
 * Fully aligned to the database schemas.
 */
class MachineryStockUpdateController extends Controller
{
    // ──────────────────────────────────────────────────────────
    // HELPERS — schema resilience, company resolution, formatting
    // ──────────────────────────────────────────────────────────

    private function ensureStockColumnsExist(): void
    {
        try {
            if (Schema::hasTable('machinery_stock_updates')) {
                if (!Schema::hasColumn('machinery_stock_updates', 'company_id')) {
                    Schema::table('machinery_stock_updates', function (Blueprint $table) {
                        $table->unsignedBigInteger('company_id')->nullable()->after('id');
                    });
                }
            }
            if (Schema::hasTable('machinery_stock_items')) {
                Schema::table('machinery_stock_items', function (Blueprint $table) {
                    if (!Schema::hasColumn('machinery_stock_items', 'category')) {
                        $table->string('category')->nullable()->after('stock_name');
                    }
                    if (!Schema::hasColumn('machinery_stock_items', 'unit')) {
                        $table->string('unit')->default('NOS')->after('stock_name');
                    }
                    if (!Schema::hasColumn('machinery_stock_items', 'min_qty')) {
                        $table->decimal('min_qty', 10, 2)->default(0)->after('remaining_qty');
                    }
                    if (!Schema::hasColumn('machinery_stock_items', 'price')) {
                        $table->decimal('price', 12, 2)->default(0)->after('min_qty');
                    }
                    if (!Schema::hasColumn('machinery_stock_items', 'total_price')) {
                        $table->decimal('total_price', 15, 2)->default(0)->after('price');
                    }
                });
            }
            if (Schema::hasTable('machinery_stock_logs')) {
                if (!Schema::hasColumn('machinery_stock_logs', 'remaining_after')) {
                    Schema::table('machinery_stock_logs', function (Blueprint $table) {
                        $table->decimal('remaining_after', 12, 2)->default(0)->after('quantity');
                    });
                }
            }
        } catch (\Throwable $e) {
            \Log::warning('ensureStockColumnsExist warning: ' . $e->getMessage());
        }
    }

    private function resolveCompanyId(?Request $request = null)
    {
        $user = auth()->user();
        if ($user && !empty($user->company_id)) {
            return $user->company_id;
        }
        if ($request) {
            if ($request->filled('project_id')) {
                $c = Project::where('id', $request->project_id)->value('company_id');
                if ($c) return $c;
            }
            if ($request->filled('machine_id')) {
                $c = Machinery::where('id', $request->machine_id)->value('company_id');
                if ($c) return $c;
            }
        }
        $c = Project::whereNotNull('company_id')->value('company_id');
        if ($c) return $c;
        return CompanyInfo::value('id') ?: null;
    }

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
        $price = (float) ($s->price ?? 0);
        $remainingQty = (float) $s->remaining_qty;
        $issuedQty = (float) $s->issued_qty;
        $totalPrice = (float) ($s->total_price ?? ($price * $remainingQty));
        $initialTotalPrice = (float) ($price * $issuedQty);

        return [
            'id'                => $s->id,
            'projectId'         => $parent ? $parent->project_id : null,
            'machineId'         => $parent ? $parent->machine_id : null,
            'itemName'          => $s->stock_name,
            'unit'              => $s->unit ?? 'NOS',
            'price'             => $price,
            'totalPrice'        => $totalPrice,
            'initialTotalPrice' => $initialTotalPrice,
            'initialQty'        => $issuedQty,
            'currentQty'        => $remainingQty,
            'minQty'            => (float) ($s->min_qty ?? ($issuedQty * 0.2)),
            'category'          => $s->category ?? $this->guessCategory($s->stock_name),
            'createdAt'         => optional($s->created_at)->toDateString(),
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
        $user = auth()->user();
        $companyId = $user ? $user->company_id : null;

        $projectsQuery = Project::query();
        if ($companyId) {
            $projectsQuery->where(function ($q) use ($companyId) {
                $q->where('company_id', $companyId)->orWhereNull('company_id');
            });
        }
        $projects = $projectsQuery->orderBy('project_name')->get();
        if ($projects->isEmpty()) {
            $projects = Project::orderBy('project_name')->get();
        }
        $formattedProjects = $projects->map(fn($p) => [
            'id'           => $p->id,
            'name'         => $p->project_name ?? $p->name ?? "Project #{$p->id}",
            'project_name' => $p->project_name ?? $p->name ?? "Project #{$p->id}",
        ]);

        $machinesQuery = Machinery::query();
        if ($companyId) {
            $machinesQuery->where(function ($q) use ($companyId) {
                $q->where('company_id', $companyId)->orWhereNull('company_id');
            });
        }
        $machines = $machinesQuery->orderBy('machine_name')->get();
        if ($machines->isEmpty()) {
            $machines = Machinery::orderBy('machine_name')->get();
        }
        $formattedMachines = $machines->map(fn($m) => [
            'id'           => $m->id,
            'name'         => $m->machine_name ?? $m->name ?? "Machine #{$m->id}",
            'machine_name' => $m->machine_name ?? $m->name ?? "Machine #{$m->id}",
            'type'         => $m->machine_type ?? $m->type ?? '',
        ]);

        $supervisorsQuery = Operator::where('type', '0');
        if ($companyId) {
            $supervisorsQuery->where(function ($q) use ($companyId) {
                $q->where('company_id', $companyId)->orWhereNull('company_id');
            });
        }
        $supervisors = $supervisorsQuery->orderBy('name')->get();
        if ($supervisors->isEmpty()) {
            $supervisors = Operator::where('type', '0')->orderBy('name')->get();
        }
        $formattedSupervisors = $supervisors->map(fn($s) => [
            'id'   => $s->id,
            'name' => $s->name ?? "Supervisor #{$s->id}",
        ]);

        return response()->json([
            'projects'    => $formattedProjects,
            'machines'    => $formattedMachines,
            'supervisors' => $formattedSupervisors,
        ]);
    }

    // ══════════════════════════════════════════════════════════
    // STOCK MASTER  — GET /api/machinery/stock
    // ══════════════════════════════════════════════════════════

    public function getStockMaster(Request $request)
    {
        $this->ensureStockColumnsExist();
        $companyId = $this->resolveCompanyId($request);

        $query = MachineryStockItem::query();
        if ($companyId && Schema::hasColumn('machinery_stock_updates', 'company_id')) {
            $query->whereHas('stockUpdate', function($q) use ($companyId) {
                $q->where(function ($sub) use ($companyId) {
                    $sub->where('company_id', $companyId)->orWhereNull('company_id');
                });
            });
        }

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
        $this->ensureStockColumnsExist();
        $companyId = $this->resolveCompanyId($request);

        // Support batch stock items array if submitted from MachineryStockUpdation form
        if ($request->has('stock_items') && is_array($request->stock_items)) {
            $request->validate([
                'project_id'  => 'required|exists:projects,id',
                'machine_id'  => 'required|exists:machineries,id',
            ], [
                'project_id.required' => 'Please select a Project.',
                'project_id.exists'   => 'Selected Project is invalid.',
                'machine_id.required' => 'Please select a Machine.',
                'machine_id.exists'   => 'Selected Machine is invalid.',
            ]);

            try {
                $updateData = [
                    'project_id'       => $request->project_id,
                    'machine_id'       => $request->machine_id,
                    'supervisor_id'    => $request->supervisor_id,
                    'update_date'      => $request->update_date ?? now()->toDateString(),
                    'maintenance_date' => $request->maintenance_date,
                    'hrs'              => $request->hrs ?? 0,
                    'oil_bal'          => $request->oil_bal ?? 0,
                    'hammer'           => $request->hammer,
                    'tamplet'          => $request->tamplet,
                    'capping'          => $request->capping,
                    'damage_part'      => $request->damage_part,
                    'bit'              => $request->bit,
                    'used_bit'         => $request->used_bit,
                    'remarks'          => $request->remarks ?? 'Added via Stock Inventory',
                    'created_by'       => auth()->id(),
                ];
                if (Schema::hasColumn('machinery_stock_updates', 'company_id') && $companyId) {
                    $updateData['company_id'] = $companyId;
                }

                $update = MachineryStockUpdate::create($updateData);

                $createdItems = [];
                $hasPrice = Schema::hasColumn('machinery_stock_items', 'price');
                $hasTotalPrice = Schema::hasColumn('machinery_stock_items', 'total_price');
                $hasMinQty = Schema::hasColumn('machinery_stock_items', 'min_qty');
                $hasCategory = Schema::hasColumn('machinery_stock_items', 'category');
                $hasUnit = Schema::hasColumn('machinery_stock_items', 'unit');
                $hasRemAfter = Schema::hasColumn('machinery_stock_logs', 'remaining_after');

                foreach ($request->stock_items as $item) {
                    if (empty($item['stock_name'])) continue;
                    $iPrice = (float) ($item['price'] ?? 0);
                    $iIssued = (float) ($item['issued_qty'] ?? 0);
                    $iUsed = (float) ($item['used_qty'] ?? 0);
                    $iRemaining = $iIssued - $iUsed;
                    $iTotalPrice = $iRemaining * $iPrice;

                    $itemData = [
                        'machinery_stock_update_id' => $update->id,
                        'stock_name'                => $item['stock_name'],
                        'issued_qty'                => $iIssued,
                        'used_qty'                  => $iUsed,
                        'remaining_qty'             => $iRemaining,
                        'remarks'                   => $item['remarks'] ?? 'Stock added',
                    ];
                    if ($hasMinQty) $itemData['min_qty'] = $item['min_qty'] ?? ($iIssued * 0.2);
                    if ($hasCategory) $itemData['category'] = $item['category'] ?? $this->guessCategory($item['stock_name']);
                    if ($hasUnit) $itemData['unit'] = $item['unit'] ?? 'NOS';
                    if ($hasPrice) $itemData['price'] = $iPrice;
                    if ($hasTotalPrice) $itemData['total_price'] = $iTotalPrice;

                    $sItem = MachineryStockItem::create($itemData);

                    $logData = [
                        'machinery_stock_item_id' => $sItem->id,
                        'type'                    => 'issued',
                        'quantity'                => $iIssued,
                        'remarks'                 => 'Initial stock added',
                        'created_by'              => auth()->id(),
                        'log_date'                => now()->toDateString(),
                    ];
                    if ($hasRemAfter) $logData['remaining_after'] = $iRemaining;

                    MachineryStockLog::create($logData);

                    $createdItems[] = $this->formatStockItem($sItem);
                }

                return response()->json([
                    'status'  => true,
                    'message' => 'Stock items added successfully',
                    'data'    => $createdItems,
                ], 201);
            } catch (\Exception $e) {
                \Log::error('Stock items batch error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
                return response()->json([
                    'status'  => false,
                    'message' => 'Failed to save stock items: ' . $e->getMessage(),
                ], 422);
            }
        }

        $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'machine_id'  => 'required|exists:machineries,id',
            'item_name'   => 'required|string|max:255',
            'unit'        => 'required|string|max:50',
            'initial_qty' => 'required|numeric|min:0',
            'min_qty'     => 'required|numeric|min:0',
            'price'       => 'nullable|numeric|min:0',
            'category'    => 'required|in:Consumable,Fuel,Lubricant,Spare Part,Tool,Spare',
        ], [
            'project_id.required'  => 'Please select a Project.',
            'project_id.exists'    => 'Selected Project is invalid.',
            'machine_id.required'  => 'Please select a Machine.',
            'machine_id.exists'    => 'Selected Machine is invalid.',
            'item_name.required'   => 'Please enter the Item Name.',
            'unit.required'        => 'Please select a Unit.',
            'initial_qty.required' => 'Please enter Initial Quantity.',
            'category.required'    => 'Please select a Category.',
        ]);

        try {
            $updateData = [
                'project_id'  => $request->project_id,
                'machine_id'  => $request->machine_id,
                'update_date' => now()->toDateString(),
                'remarks'     => 'Added via Stock Inventory',
                'created_by'  => auth()->id(),
            ];
            if (Schema::hasColumn('machinery_stock_updates', 'company_id') && $companyId) {
                $updateData['company_id'] = $companyId;
            }

            $update = MachineryStockUpdate::create($updateData);

            $price = (float) ($request->price ?? 0);
            $initialQty = (float) $request->initial_qty;
            $totalPrice = $initialQty * $price;

            $itemData = [
                'machinery_stock_update_id' => $update->id,
                'stock_name'                => $request->item_name,
                'issued_qty'                => $initialQty,
                'used_qty'                  => 0,
                'remaining_qty'             => $initialQty,
                'remarks'                   => 'Initial stock added',
            ];
            if (Schema::hasColumn('machinery_stock_items', 'min_qty')) {
                $itemData['min_qty'] = $request->min_qty ?? ($initialQty * 0.2);
            }
            if (Schema::hasColumn('machinery_stock_items', 'price')) {
                $itemData['price'] = $price;
            }
            if (Schema::hasColumn('machinery_stock_items', 'total_price')) {
                $itemData['total_price'] = $totalPrice;
            }
            if (Schema::hasColumn('machinery_stock_items', 'category')) {
                $itemData['category'] = $request->category;
            }
            if (Schema::hasColumn('machinery_stock_items', 'unit')) {
                $itemData['unit'] = $request->unit ?? 'NOS';
            }

            $stockItem = MachineryStockItem::create($itemData);

            // Record the initial "issued" log entry
            $logData = [
                'machinery_stock_item_id' => $stockItem->id,
                'type'                    => 'issued',
                'quantity'                => $initialQty,
                'remarks'                 => 'Initial stock added',
                'created_by'              => auth()->id(),
                'log_date'                => now()->toDateString(),
            ];
            if (Schema::hasColumn('machinery_stock_logs', 'remaining_after')) {
                $logData['remaining_after'] = $initialQty;
            }
            MachineryStockLog::create($logData);

            return response()->json([
                'status'  => true,
                'message' => 'Stock item added successfully',
                'data'    => $this->formatStockItem($stockItem),
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Stock store error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'status'  => false,
                'message' => 'Failed to save stock item: ' . $e->getMessage(),
            ], 422);
        }
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
        $newTotalPrice = $newRemaining * ($stock->price ?? 0);
        $stock->update([
            'used_qty'      => $newUsed,
            'remaining_qty' => $newRemaining,
            'total_price'   => $newTotalPrice,
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
            'to_machine_id' => 'required|exists:machineries,id',
            'qty'           => 'required|numeric|min:0.01',
            'note'          => 'nullable|string|max:500',
        ], [
            'stock_item_id.required' => 'Stock item is required.',
            'to_project_id.required' => 'Please select a destination Project.',
            'to_project_id.exists'   => 'Selected destination Project is invalid.',
            'to_machine_id.required' => 'Please select a destination Machine.',
            'to_machine_id.exists'   => 'Selected destination Machine is invalid.',
            'qty.required'           => 'Please enter a valid transfer quantity.',
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

        try {
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
        } catch (\Exception $e) {
            \Log::error('Stock transfer error: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Failed to transfer stock. Please ensure valid Destination Project and Machine are selected.',
            ], 422);
        }
    }

    // ══════════════════════════════════════════════════════════
    // STOCK HISTORY  — GET /api/machinery/stock/{id}/history
    // ══════════════════════════════════════════════════════════

    public function getStockHistory($id)
    {
        $this->ensureStockColumnsExist();
        $companyId = $this->resolveCompanyId();

        $stock = MachineryStockItem::with(['stockUpdate', 'logs.createdBy'])->findOrFail($id);

        if ($companyId && $stock->stockUpdate && $stock->stockUpdate->company_id && $stock->stockUpdate->company_id !== $companyId) {
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
        $this->ensureStockColumnsExist();
        $companyId = $this->resolveCompanyId();
        $today     = now()->toDateString();
        $hasCompanyIdCol = Schema::hasColumn('machinery_stock_updates', 'company_id');

        $stockItemsQuery = MachineryStockItem::query();
        if ($companyId && $hasCompanyIdCol) {
            $stockItemsQuery->whereHas('stockUpdate', function($q) use ($companyId) {
                $q->where(function ($sub) use ($companyId) {
                    $sub->where('company_id', $companyId)->orWhereNull('company_id');
                });
            });
        }
        $stockItems = $stockItemsQuery->get();

        $critical = $stockItems->filter(fn($s) => $s->remaining_qty <= ($s->issued_qty * 0.2))->count();
        
        $lowStock = $stockItems->filter(function ($s) {
            if (!$s->issued_qty) return false;
            $pct = ($s->remaining_qty / $s->issued_qty) * 100;
            return $pct <= 30 && $s->remaining_qty > ($s->issued_qty * 0.2);
        })->count();

        $dailyLogsQuery = MachineryStockUpdate::where('hrs', '>', 0)
            ->whereDate('update_date', $today);
        if ($companyId && $hasCompanyIdCol) {
            $dailyLogsQuery->where(function ($sub) use ($companyId) {
                $sub->where('company_id', $companyId)->orWhereNull('company_id');
            });
        }
        $dailyLogsCount = $dailyLogsQuery->count();
        $hoursToday = $dailyLogsQuery->sum('hrs');

        $overdueM = 0;

        $transfersQuery = MachineryStockMovement::query();
        if ($companyId && $hasCompanyIdCol) {
            $transfersQuery->whereHas('stockUpdate', function($q) use ($companyId) {
                $q->where(function ($sub) use ($companyId) {
                    $sub->where('company_id', $companyId)->orWhereNull('company_id');
                });
            });
        }
        $transfers = $transfersQuery->count();

        $totalStockValue = $stockItems->sum(fn($s) => (float)($s->remaining_qty * ($s->price ?? 0)));
        $totalInitialStockValue = $stockItems->sum(fn($s) => (float)($s->issued_qty * ($s->price ?? 0)));

        return response()->json([
            'stockItems'         => $stockItems->count(),
            'criticalAlerts'     => $critical,
            'lowStock'           => $lowStock,
            'todayLogs'          => $dailyLogsCount,
            'hoursToday'         => (float) $hoursToday,
            'overdueM'           => $overdueM,
            'totalTransfers'     => $transfers,
            'totalStockValue'    => $totalStockValue,
            'totalInitialValue'  => $totalInitialStockValue,
        ]);
    }

    // ══════════════════════════════════════════════════════════
    // STOCK MASTER CRUD ACTIONS (EDIT/DELETE)
    // ══════════════════════════════════════════════════════════

    public function updateStockMaster(Request $request, $id)
    {
        $this->ensureStockColumnsExist();
        $companyId = $this->resolveCompanyId($request);
        $stockItem = MachineryStockItem::findOrFail($id);
        
        if ($companyId && $stockItem->stockUpdate && $stockItem->stockUpdate->company_id && $stockItem->stockUpdate->company_id !== $companyId) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'machine_id'  => 'required|exists:machineries,id',
            'item_name'   => 'required|string|max:255',
            'unit'        => 'required|string|max:50',
            'initial_qty' => 'required|numeric|min:0',
            'min_qty'     => 'required|numeric|min:0',
            'price'       => 'nullable|numeric|min:0',
            'category'    => 'required|in:Consumable,Fuel,Lubricant,Spare Part,Tool,Spare',
        ], [
            'project_id.required'  => 'Please select a Project.',
            'project_id.exists'    => 'Selected Project is invalid.',
            'machine_id.required'  => 'Please select a Machine.',
            'machine_id.exists'    => 'Selected Machine is invalid.',
            'item_name.required'   => 'Please enter the Item Name.',
            'initial_qty.required' => 'Please enter Initial Quantity.',
            'unit.required'        => 'Please select a Unit.',
            'category.required'    => 'Please select a Category.',
        ]);

        try {
            if ($stockItem->stockUpdate) {
                $stockItem->stockUpdate->update([
                    'project_id' => $request->project_id,
                    'machine_id' => $request->machine_id,
                ]);
            }

            $price = $request->has('price') ? (float) $request->price : (float) ($stockItem->price ?? 0);
            $newRemaining = $request->initial_qty - ($stockItem->used_qty ?? 0);
            $totalPrice = $newRemaining * $price;

            $updateFields = [
                'stock_name'    => $request->item_name,
                'issued_qty'    => $request->initial_qty,
                'remaining_qty' => $newRemaining,
            ];
            if (Schema::hasColumn('machinery_stock_items', 'unit')) {
                $updateFields['unit'] = $request->unit ?? $stockItem->unit ?? 'NOS';
            }
            if (Schema::hasColumn('machinery_stock_items', 'price')) {
                $updateFields['price'] = $price;
            }
            if (Schema::hasColumn('machinery_stock_items', 'total_price')) {
                $updateFields['total_price'] = $totalPrice;
            }
            if (Schema::hasColumn('machinery_stock_items', 'min_qty')) {
                $updateFields['min_qty'] = $request->min_qty ?? ($request->initial_qty * 0.2);
            }
            if (Schema::hasColumn('machinery_stock_items', 'category')) {
                $updateFields['category'] = $request->category;
            }

            $stockItem->update($updateFields);

            return response()->json([
                'status'  => true,
                'message' => 'Stock item updated successfully',
                'data'    => $this->formatStockItem($stockItem),
            ]);
        } catch (\Exception $e) {
            \Log::error('Stock update error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'status'  => false,
                'message' => 'Failed to update stock item: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function deleteStockMaster($id)
    {
        $companyId = $this->resolveCompanyId();
        $stockItem = MachineryStockItem::findOrFail($id);

        if ($companyId && $stockItem->stockUpdate && $stockItem->stockUpdate->company_id && $stockItem->stockUpdate->company_id !== $companyId) {
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

    // public function updateTransferLog(Request $request, $id)
    // {
    //     $companyId = auth()->user()->company_id;
    //     $movement = MachineryStockMovement::findOrFail($id);

    //     if ($movement->stockUpdate->company_id !== $companyId) {
    //         return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
    //     }

    //     $request->validate([
    //         'qty'  => 'required|numeric|min:0.01',
    //         'note' => 'nullable|string|max:500',
    //     ]);

    //     $movement->update([
    //         'quantity' => $request->qty,
    //         'reason'   => $request->note,
    //     ]);

    //     return response()->json([
    //         'status'  => true,
    //         'message' => 'Transfer record updated successfully',
    //         'data'    => $this->formatTransfer($movement),
    //     ]);
    // }



    public function updateTransferLog(Request $request, $id)
{
    $companyId = auth()->user()->company_id;
    $movement = MachineryStockMovement::with(['stockUpdate.stockItems'])->findOrFail($id);

    if ($movement->stockUpdate->company_id !== $companyId) {
        return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
    }

    $request->validate([
        'qty'  => 'required|numeric|min:0.01',
        'note' => 'nullable|string|max:500',
    ]);

    $oldQty = $movement->quantity;
    $newQty = $request->qty;
    $difference = $newQty - $oldQty;   // positive = increase transfer, negative = decrease

    $stockName = $movement->stock_name;

    // Get source and destination stock items
    $sourceStockItem = MachineryStockItem::where('machinery_stock_update_id', $movement->machinery_stock_update_id)
        ->where('stock_name', $stockName)
        ->first();

    // Find destination stock update (this is tricky - you need to find the correct destination record)
    $destinationStockUpdate = MachineryStockUpdate::where('project_id', $movement->to_project_id)
        ->where('machine_id', $movement->to_machine_id)
        ->latest('update_date') // or use specific date if you have it
        ->first();

    $destinationStockItem = $destinationStockUpdate 
        ? MachineryStockItem::where('machinery_stock_update_id', $destinationStockUpdate->id)
            ->where('stock_name', $stockName)
            ->first()
        : null;

    if (!$sourceStockItem) {
        return response()->json(['status' => false, 'message' => 'Source stock item not found'], 404);
    }

    // === Validation: Can we increase the transfer? ===
    if ($newQty > $oldQty) {
        $additionalNeeded = $difference;
        if ($sourceStockItem->remaining_qty < $additionalNeeded) {
            return response()->json([
                'status' => false,
                'message' => "Insufficient stock at source. Available: {$sourceStockItem->remaining_qty}"
            ], 422);
        }
    }

    // === Step 1: Reverse Old Transfer ===
    if ($sourceStockItem) {
        $sourceStockItem->increment('remaining_qty', $oldQty);
        $sourceStockItem->decrement('transferred_qty', $oldQty);
    }

    if ($destinationStockItem) {
        $destinationStockItem->decrement('remaining_qty', $oldQty); // or however you track received stock
        // You might also have a 'received_qty' field - adjust as per your logic
    }

    // === Step 2: Apply New Transfer ===
    if ($sourceStockItem) {
        $sourceStockItem->decrement('remaining_qty', $newQty);
        $sourceStockItem->increment('transferred_qty', $newQty);
    }

    if ($destinationStockItem) {
        $destinationStockItem->increment('remaining_qty', $newQty);
    }

    // Update the movement log
    $movement->update([
        'quantity' => $newQty,
        'reason'   => $request->note,
    ]);

    // Optional: Create new log entries in MachineryStockLog if you have audit trail

    return response()->json([
        'status'  => true,
        'message' => 'Transfer updated successfully',
        'data'    => $this->formatTransfer($movement->fresh()),
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