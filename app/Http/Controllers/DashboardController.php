<?php


// namespace App\Http\Controllers;

// use App\Models\DrillingRecord;
// use App\Models\Expense;
// use App\Models\MachineReading;
// use App\Models\MachineryStockUpdate;
// use App\Models\Order;
// use App\Models\ProformaInvoice;
// use App\Models\Income;
// use App\Models\IncomeSummary;
// use App\Models\ExpenseSummary;
// use App\Models\WorkLogSummary;
// use App\Models\User;
// use Carbon\Carbon;
// use Illuminate\Http\Request;

// class DashboardController extends Controller
// {
//     public function todayLatestActivity(Request $request)
//     {
//         $companyId = auth()->user()->company_id ?? $request->company_id;

//         if (!$companyId) {
//             return response()->json(['success' => false, 'message' => 'Company ID required'], 400);
//         }

//         $date       = $request->date ? Carbon::parse($request->date) : Carbon::today();
//         $projectId  = $request->project_id;
//         $userId     = $request->user_id;

//         $data = [
//             'date'                    => $date->format('Y-m-d'),
//             'project_id'              => $projectId,
//             'user_id'                 => $userId,
//             'total_active_users'      => 0,
//             'category_summary'        => [],
//             'active_users'            => [],
//             'inactive_users'          => []
//         ];

//         // ==================== CATEGORY SUMMARY ====================
//         $categories = [
//             'drilling'        => DrillingRecord::class,
//             'expense'         => Expense::class,
//             'machine_reading' => MachineReading::class,
//             'stock_update'    => MachineryStockUpdate::class,
//             'order'           => Order::class,
//             'proforma'        => ProformaInvoice::class,
//             'income'          => Income::class,
//         ];

//         foreach ($categories as $key => $model) {
//             $query = $model::where('company_id', $companyId)
//                            ->whereDate('created_at', $date);

//             if ($projectId) $query->where('project_id', $projectId);

//             $count = $query->count();
//             $latest = $query->clone()->latest('created_at')->first();

//             $data['category_summary'][$key] = [
//                 'count'          => $count,
//                 'last_entry_time'=> $latest?->created_at?->format('H:i'),
//             ];
//         }

//         // ==================== USERS ====================
//         $usersQuery = User::where('company_id', $companyId)
//                           ->where('blocked', 0)
//                           ->select('id', 'name');

//         if ($userId) $usersQuery->where('id', $userId);

//         $users = $usersQuery->get();

//         // ==================== USER WISE FULL ACTIVITY ====================
//         foreach ($users as $user) {
//             $userActivity = [
//                 'user_id'       => $user->id,
//                 'user_name'     => $user->name,
//                 'total_entries' => 0,
//                 'details'       => [],
//                 'entries'       => []
//             ];

//             $hasActivity = false;

//             // 1. DRILLING
//             $drillings = DrillingRecord::where('company_id', $companyId)
//                 ->where('user_id', $user->id)
//                 ->whereDate('created_at', $date)
//                 ->when($projectId, fn($q) => $q->where('project_id', $projectId))
//                 ->with(['project:id,project_name', 'operator:id,name', 'workPoints', 'surveys'])
//                 ->latest('created_at')
//                 ->get();

//             if ($drillings->count() > 0) {
//                 $userActivity['details'][] = ['type' => 'Drilling / Work Log', 'count' => $drillings->count()];
//                 $userActivity['total_entries'] += $drillings->count();
//                 $userActivity['entries']['drilling'] = $drillings->map(fn($d) => $d->toArray());
//                 $hasActivity = true;
//             }

//             // 2. EXPENSE (with photos)
//             $expenses = Expense::where('company_id', $companyId)
//                 ->where('created_by', $user->id)
//                 ->whereDate('created_at', $date)
//                 ->when($projectId, fn($q) => $q->where('project_id', $projectId))
//                 ->with(['project:id,project_name', 'expenseType', 'photos'])
//                 ->latest('created_at')
//                 ->get();

//             if ($expenses->count() > 0) {
//                 $userActivity['details'][] = ['type' => 'Expense', 'count' => $expenses->count()];
//                 $userActivity['total_entries'] += $expenses->count();
//                 $userActivity['entries']['expense'] = $expenses->map(fn($e) => $e->toArray());
//                 $hasActivity = true;
//             }

//             // 3. MACHINE READING
//             $machineReadings = MachineReading::where('company_id', $companyId)
//                 ->where('user_id', $user->id)
//                 ->whereDate('created_at', $date)
//                 ->when($projectId, fn($q) => $q->where('project_id', $projectId))
//                 ->with(['drillingRecord', 'operator'])
//                 ->latest('created_at')
//                 ->get();

//             if ($machineReadings->count() > 0) {
//                 $userActivity['details'][] = ['type' => 'Machine Reading', 'count' => $machineReadings->count()];
//                 $userActivity['total_entries'] += $machineReadings->count();
//                 $userActivity['entries']['machine_reading'] = $machineReadings->map(fn($m) => $m->toArray());
//                 $hasActivity = true;
//             }

//             // 4. ORDER
//             $orders = Order::where('company_id', $companyId)
//                 ->where('created_by', $user->id)
//                 ->whereDate('created_at', $date)
//                 ->when($projectId, fn($q) => $q->where('project_id', $projectId))
//                 ->with(['project:id,project_name', 'items'])
//                 ->latest('created_at')
//                 ->get();

//             if ($orders->count() > 0) {
//                 $userActivity['details'][] = ['type' => 'Order / Invoice', 'count' => $orders->count()];
//                 $userActivity['total_entries'] += $orders->count();
//                 $userActivity['entries']['order'] = $orders->map(fn($o) => $o->toArray());
//                 $hasActivity = true;
//             }

//             // 5. PROFORMA
//             $proformas = ProformaInvoice::where('company_id', $companyId)
//                 ->where('created_by', $user->id)
//                 ->whereDate('created_at', $date)
//                 ->when($projectId, fn($q) => $q->where('project_id', $projectId))
//                 ->with(['project:id,project_name', 'details'])
//                 ->latest('created_at')
//                 ->get();

//             if ($proformas->count() > 0) {
//                 $userActivity['details'][] = ['type' => 'Proforma Invoice', 'count' => $proformas->count()];
//                 $userActivity['total_entries'] += $proformas->count();
//                 $userActivity['entries']['proforma'] = $proformas->map(fn($p) => $p->toArray());
//                 $hasActivity = true;
//             }

//             // 6. INCOME
//             $incomes = Income::where('company_id', $companyId)
//                 ->where('created_by', $user->id)   // assuming you have created_by field, otherwise adjust
//                 ->whereDate('created_at', $date)
//                 ->when($projectId, fn($q) => $q->where('project_id', $projectId))
//                 ->with(['project:id,project_name'])
//                 ->latest('created_at')
//                 ->get();

//             if ($incomes->count() > 0) {
//                 $userActivity['details'][] = ['type' => 'Income', 'count' => $incomes->count()];
//                 $userActivity['total_entries'] += $incomes->count();
//                 $userActivity['entries']['income'] = $incomes->map(fn($i) => $i->toArray());
//                 $hasActivity = true;
//             }

//             // Summaries (if needed)
//             // You can add them under a separate key if required

//             if ($hasActivity) {
//                 $data['total_active_users']++;
//                 $data['active_users'][] = $userActivity;
//             } else {
//                 $lastActivity = $this->getUserLastActivity($user->id, $companyId, $projectId);
//                 $data['inactive_users'][] = array_merge($userActivity, $lastActivity);
//             }
//         }

//         usort($data['active_users'], fn($a, $b) => $b['total_entries'] <=> $a['total_entries']);

//         return response()->json([
//             'success' => true,
//             'data'    => $data
//         ]);
//     }

//     private function getUserLastActivity($userId, $companyId, $projectId = null)
//     {
//         $lastDates = [];
//         $queries = [
//             DrillingRecord::where('user_id', $userId),
//             Expense::where('created_by', $userId),
//             MachineReading::where('user_id', $userId),
//             MachineryStockUpdate::where('created_by', $userId),
//             Order::where('created_by', $userId),
//             ProformaInvoice::where('created_by', $userId),
//             Income::where('created_by', $userId),
//         ];

//         foreach ($queries as $query) {
//             $q = $query->where('company_id', $companyId);
//             if ($projectId) $q->where('project_id', $projectId);
//             $last = $q->latest('created_at')->first();
//             if ($last && $last->created_at) {
//                 $lastDates[] = Carbon::parse($last->created_at);
//             }
//         }

//         if (empty($lastDates)) {
//             return ['last_activity' => null, 'days_ago' => null, 'status' => 'Never Entered'];
//         }

//         $latestDate = collect($lastDates)->max();
//         $daysAgo = Carbon::today()->diffInDays($latestDate);

//         return [
//             'last_activity' => $latestDate->format('d M Y H:i'),
//             'days_ago'      => $daysAgo,
//             'status'        => $daysAgo == 0 ? 'Today' : $daysAgo . ' days ago'
//         ];
//     }
// }









namespace App\Http\Controllers;

use App\Models\DrillingRecord;
use App\Models\Expense;
use App\Models\MachineReading;
use App\Models\MachineryStockUpdate;
use App\Models\Order;
use App\Models\ProformaInvoice;
use App\Models\Income;
use App\Models\PurchesVendorModel;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function todayLatestActivity(Request $request)
    {
        $companyId = auth()->user()->company_id ?? $request->company_id;

        if (!$companyId) {
            return response()->json(['success' => false, 'message' => 'Company ID required'], 400);
        }

        $date       = $request->date ? Carbon::parse($request->date) : Carbon::today();
        $projectId  = $request->project_id;
        $userId     = $request->user_id;

        $data = [
            'date'                    => $date->format('Y-m-d'),
            'project_id'              => $projectId,
            'user_id'                 => $userId,
            'total_active_users'      => 0,
            'category_summary'        => [],
            'active_users'            => [],
            'inactive_users'          => []
        ];

        // ==================== CATEGORY SUMMARY ====================
        $categories = [
            'drilling'        => DrillingRecord::class,
            'expense'         => Expense::class,
            'machine_reading' => MachineReading::class,
            'stock_update'    => MachineryStockUpdate::class,
            'order'           => Order::class,
            'proforma'        => ProformaInvoice::class,
            'income'          => Income::class,
            'purches_vendor'  => PurchesVendorModel::class,   // ← Purchase Vendor
        ];

        foreach ($categories as $key => $model) {
            $query = $model::where('company_id', $companyId)
                           ->whereDate('created_at', $date);

            if ($projectId) {
                $query->where('project_id', $projectId);
            }

            $count = $query->count();
            $latest = $query->clone()->latest('created_at')->first();

            $data['category_summary'][$key] = [
                'count'           => $count,
                'last_entry_time' => $latest?->created_at?->format('H:i'),
            ];
        }

        // ==================== USERS ACTIVITY ====================
        $usersQuery = User::where('company_id', $companyId)
                          ->where('blocked', 0)
                          ->select('id', 'name');

        if ($userId) $usersQuery->where('id', $userId);

        $users = $usersQuery->get();

        foreach ($users as $user) {
            $userActivity = [
                'user_id'       => $user->id,
                'user_name'     => $user->name,
                'total_entries' => 0,
                'details'       => [],
                'entries'       => []
            ];

            $hasActivity = false;

            // ====================== PURCHASE VENDOR (Fixed) ======================
            $purchases = PurchesVendorModel::where('company_id', $companyId)
             ->where('created_by', $user->id)
                ->whereDate('created_at', $date)
                ->when($projectId, fn($q) => $q->where('project_id', $projectId))
                // Try created_by first, fallback to all records if no created_by
                ->when(method_exists(PurchesVendorModel::class, 'getCreatedByColumn') || 
                      in_array('created_by', (new PurchesVendorModel)->getFillable()), 
                    fn($q) => $q->where('created_by', $user->id))
                ->with([
                    'vendor:id,name', 
                    'project:id,project_name',
                    'payment'
                ])
                ->latest('created_at')
                ->get();

            if ($purchases->count() > 0) {
                $userActivity['details'][] = ['type' => 'Purchase / Vendor', 'count' => $purchases->count()];
                $userActivity['total_entries'] += $purchases->count();
                $userActivity['entries']['purches_vendor'] = $purchases->map(fn($p) => $p->toArray());
                $hasActivity = true;
            }

            // ====================== STOCK UPDATE ======================
            $stockUpdates = MachineryStockUpdate::where('company_id', $companyId)
                ->where('created_by', $user->id)
                ->whereDate('created_at', $date)
                ->when($projectId, fn($q) => $q->where('project_id', $projectId))
                ->with(['project:id,project_name', 'machine:id,machine_name'])
                ->latest('created_at')
                ->get();

            if ($stockUpdates->count() > 0) {
                $userActivity['details'][] = ['type' => 'Stock Update', 'count' => $stockUpdates->count()];
                $userActivity['total_entries'] += $stockUpdates->count();
                $userActivity['entries']['stock_update'] = $stockUpdates->map(fn($s) => $s->toArray());
                $hasActivity = true;
            }

            // ====================== DRILLING ======================
            $drillings = DrillingRecord::where('company_id', $companyId)
                ->where('user_id', $user->id)
                ->whereDate('created_at', $date)
                ->when($projectId, fn($q) => $q->where('project_id', $projectId))
                ->with(['project:id,project_name', 'operator:id,name'])
                ->latest('created_at')
                ->get();

            if ($drillings->count() > 0) {
                $userActivity['details'][] = ['type' => 'Drilling / Work Log', 'count' => $drillings->count()];
                $userActivity['total_entries'] += $drillings->count();
                $userActivity['entries']['drilling'] = $drillings->map(fn($d) => $d->toArray());
                $hasActivity = true;
            }

            // ====================== EXPENSE ======================
            $expenses = Expense::where('company_id', $companyId)
                ->where('created_by', $user->id)
                ->whereDate('created_at', $date)
                ->when($projectId, fn($q) => $q->where('project_id', $projectId))
                ->with(['project:id,project_name', 'expenseType'])
                ->latest('created_at')
                ->get();

            if ($expenses->count() > 0) {
                $userActivity['details'][] = ['type' => 'Expense', 'count' => $expenses->count()];
                $userActivity['total_entries'] += $expenses->count();
                $userActivity['entries']['expense'] = $expenses->map(fn($e) => $e->toArray());
                $hasActivity = true;
            }

            // ====================== MACHINE READING ======================
            $machineReadings = MachineReading::where('company_id', $companyId)
                ->where('user_id', $user->id)
                ->whereDate('created_at', $date)
                ->when($projectId, fn($q) => $q->where('project_id', $projectId))
                ->with(['drillingRecord', 'operator'])
                ->latest('created_at')
                ->get();

            if ($machineReadings->count() > 0) {
                $userActivity['details'][] = ['type' => 'Machine Reading', 'count' => $machineReadings->count()];
                $userActivity['total_entries'] += $machineReadings->count();
                $userActivity['entries']['machine_reading'] = $machineReadings->map(fn($m) => $m->toArray());
                $hasActivity = true;
            }

            // ====================== ORDER ======================
            $orders = Order::where('company_id', $companyId)
                ->where('created_by', $user->id)
                ->whereDate('created_at', $date)
                ->when($projectId, fn($q) => $q->where('project_id', $projectId))
                ->with(['project:id,project_name'])
                ->latest('created_at')
                ->get();

            if ($orders->count() > 0) {
                $userActivity['details'][] = ['type' => 'Order / Invoice', 'count' => $orders->count()];
                $userActivity['total_entries'] += $orders->count();
                $userActivity['entries']['order'] = $orders->map(fn($o) => $o->toArray());
                $hasActivity = true;
            }

            // ====================== PROFORMA ======================
            $proformas = ProformaInvoice::where('company_id', $companyId)
                ->where('created_by', $user->id)
                ->whereDate('created_at', $date)
                ->when($projectId, fn($q) => $q->where('project_id', $projectId))
                ->with(['project:id,project_name'])
                ->latest('created_at')
                ->get();

            if ($proformas->count() > 0) {
                $userActivity['details'][] = ['type' => 'Proforma Invoice', 'count' => $proformas->count()];
                $userActivity['total_entries'] += $proformas->count();
                $userActivity['entries']['proforma'] = $proformas->map(fn($p) => $p->toArray());
                $hasActivity = true;
            }

            // ====================== INCOME ======================
            $incomes = Income::where('company_id', $companyId)
                ->where('created_by', $user->id)
                ->whereDate('created_at', $date)
                ->when($projectId, fn($q) => $q->where('project_id', $projectId))
                ->with(['project:id,project_name'])
                ->latest('created_at')
                ->get();

            if ($incomes->count() > 0) {
                $userActivity['details'][] = ['type' => 'Income', 'count' => $incomes->count()];
                $userActivity['total_entries'] += $incomes->count();
                $userActivity['entries']['income'] = $incomes->map(fn($i) => $i->toArray());
                $hasActivity = true;
            }

            if ($hasActivity) {
                $data['total_active_users']++;
                $data['active_users'][] = $userActivity;
            } else {
                $lastActivity = $this->getUserLastActivity($user->id, $companyId, $projectId);
                $data['inactive_users'][] = array_merge($userActivity, $lastActivity);
            }
        }

        usort($data['active_users'], fn($a, $b) => $b['total_entries'] <=> $a['total_entries']);

        return response()->json([
            'success' => true,
            'data'    => $data
        ]);
    }

    private function getUserLastActivity($userId, $companyId, $projectId = null)
    {
        $lastDates = [];

        $queries = [
            DrillingRecord::where('user_id', $userId),
            Expense::where('created_by', $userId),
            MachineReading::where('user_id', $userId),
            MachineryStockUpdate::where('created_by', $userId),
            Order::where('created_by', $userId),
            ProformaInvoice::where('created_by', $userId),
            Income::where('created_by', $userId),
            PurchesVendorModel::where('created_by', $userId), // Using company_id only for last activity
        ];

        foreach ($queries as $query) {
            $q = $query;
            if ($projectId) $q->where('project_id', $projectId);
            $last = $q->latest('created_at')->first();
            if ($last && $last->created_at) {
                $lastDates[] = Carbon::parse($last->created_at);
            }
        }

        if (empty($lastDates)) {
            return ['last_activity' => null, 'days_ago' => null, 'status' => 'Never Entered'];
        }

        $latestDate = collect($lastDates)->max();
        $daysAgo = Carbon::today()->diffInDays($latestDate);

        return [
            'last_activity' => $latestDate->format('d M Y H:i'),
            'days_ago'      => $daysAgo,
            'status'        => $daysAgo == 0 ? 'Today' : $daysAgo . ' days ago'
        ];
    }
}