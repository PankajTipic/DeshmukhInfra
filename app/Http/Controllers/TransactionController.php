<?php
namespace App\Http\Controllers;
use App\Models\WorkPointDetail;
use App\Models\Operator;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Transaction;
use App\Models\Expense;
use App\Models\ExpenseType;
use App\Models\ExpenseSummary;
use App\Models\Project; 
use Illuminate\Support\Facades\DB;

 
class TransactionController extends Controller{

    



// public function getOperatorsByProduct(Request $request)
// {
//     $request->validate([
//         'product_id' => 'required|integer',
//         'month'      => 'required|string',
//         'year'       => 'required|integer'
//     ]);

//     $companyId = auth()->user()->company_id;
//     $productId = $request->product_id;
//     $month     = $request->month;
//     $year      = $request->year;

//     $monthNumber = Carbon::parse($month . ' ' . $year)->month;
//     $startDate   = Carbon::createFromDate($year, $monthNumber, 1)->startOfDay();
//     $endDate     = Carbon::createFromDate($year, $monthNumber, 1)->endOfMonth()->endOfDay();

//     $project = Project::where('id', $productId)
//         ->where('company_id', $companyId)
//         ->first(['id', 'commission']);

//     if (!$project) {
//         return response()->json(['success' => false, 'message' => 'Project not found'], 404);
//     }

//     $operatorStats = WorkPointDetail::where('company_id', $companyId)
//         ->where('project_id', $productId)
//         ->whereBetween('created_at', [$startDate, $endDate])
//         ->selectRaw('operator_id, SUM(work_point) as total_work_point')
//         ->groupBy('operator_id')
//         ->get()
//         ->keyBy('operator_id');

//     // $allOperators = Operator::whereIn('id', $operatorStats->pluck('operator_id'))
//     //     ->where('company_id', $companyId)
//     //     ->get(['id','name','mobile','address','payment','type']);
//     // ✅ IDs of operators who actually worked
// $operatorIds = $operatorStats->pluck('operator_id');

// // ✅ IDs of supervisors (type 0) in the same company and project
// $supervisorIds = Operator::where('company_id', $companyId)
//     ->where('type', 0)
   
//     ->pluck('id');

// // ✅ Merge both sets
// $allIds = $operatorIds->merge($supervisorIds)->unique();

// $allOperators = Operator::whereIn('id', $allIds)
//     ->where('company_id', $companyId)
//     ->get(['id','name','mobile','address','payment','type']);


//     $operators   = [];
//     $supervisors = [];

//     foreach ($allOperators as $op) {
//         // $stats = $operatorStats[$op->id];
//         // $monthWorkPoint = $stats->total_work_point ?? 0;
//         $stats = $operatorStats->get($op->id);
// $monthWorkPoint = $stats->total_work_point ?? 0;


//         $alreadyPaidPoints = Transaction::where('operator_id',$op->id)
//             ->where('salary_month',$month)
//             ->sum('total_work_point');

//         $remainingPoints = max($monthWorkPoint - $alreadyPaidPoints, 0);
//         $commission      = $project->commission;

//         if ($op->type == 1) {
//             // Row for already paid portion
//             if ($alreadyPaidPoints > 0) {
//                 $operators[] = (object)[
//                     'id'               => $op->id,
//                     'name'             => $op->name,
//                     'mobile'           => $op->mobile,
//                     'address'          => $op->address,
//                     'payment'          => $op->payment,
//                     'commission'       => $commission,
//                     'total_work_point' => $alreadyPaidPoints,
//                     'total_commission' => $alreadyPaidPoints * $commission,
//                     'is_paid'          => true,
//                 ];
//             }

//             // Row for remaining or first payment
//             if ($remainingPoints > 0 || $alreadyPaidPoints == 0) {
//                 $isFirstPayment = ($alreadyPaidPoints == 0);
//                 $operators[] = (object)[
//                     'id'               => $op->id,
//                     'name'             => $op->name,
//                     'mobile'           => $op->mobile,
//                     'address'          => $op->address,
//                     'payment'          => $isFirstPayment ? $op->payment : 0,
//                     'commission'       => $commission,
//                     'total_work_point' => $isFirstPayment ? $monthWorkPoint : $remainingPoints,
//                     'total_commission' => ($isFirstPayment ? $monthWorkPoint : $remainingPoints) * $commission,
//                     'is_paid'          => false,
//                 ];
//             }

//         } else {
//             $isPaid = Transaction::where('operator_id',$op->id)
//                 ->where('salary_month',$month)
//                 ->exists();

//             $supervisors[] = (object)[
//                 'id'               => $op->id,
//                 'name'             => $op->name,
//                 'mobile'           => $op->mobile,
//                 'address'          => $op->address,
//                 'payment'          => $op->payment,
//                 'commission'       => null,
//                 'total_work_point' => 0,
//                 'total_commission' => $op->payment,
//                 'is_paid'          => $isPaid,
//             ];
//         }
//     }

//     usort($operators, fn($a,$b) => $a->is_paid === $b->is_paid ? 0 : ($a->is_paid ? -1 : 1));

//     return response()->json([
//         'success'     => true,
//         'operators'   => array_values($operators),
//         'supervisors' => array_values($supervisors)
//     ]);
// }


// public function getOperatorsByProduct(Request $request)
// {
//     $request->validate([
//         'product_id' => 'required|integer',
//         'month'      => 'required|string',
//         'year'       => 'required|integer'
//     ]);

//     $companyId = auth()->user()->company_id;
//     $productId = $request->product_id;
//     $month     = $request->month;
//     $year      = $request->year;

//     $monthNumber = Carbon::parse($month . ' ' . $year)->month;
//     $startDate   = Carbon::createFromDate($year, $monthNumber, 1)->startOfDay();
//     $endDate     = Carbon::createFromDate($year, $monthNumber, 1)->endOfMonth()->endOfDay();

//     // ✅ Get project details
//     $project = Project::where('id', $productId)
//         ->where('company_id', $companyId)
//         ->first(['id', 'commission']);

//     if (!$project) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Project not found'
//         ], 404);
//     }

//     // ✅ Operator work stats for the selected month & project
//     $operatorStats = WorkPointDetail::where('company_id', $companyId)
//         ->where('project_id', $productId)
//         ->whereBetween('created_at', [$startDate, $endDate])
//         ->selectRaw('operator_id, SUM(work_point) as total_work_point')
//         ->groupBy('operator_id')
//         ->get()
//         ->keyBy('operator_id');

//     // ✅ IDs of operators who actually worked
//     $operatorIds = $operatorStats->pluck('operator_id');

//     // ✅ Supervisors assigned ONLY to the selected project
//     $supervisorIds = Operator::where('company_id', $companyId)
//         ->where('type', 0)
//         ->where('project_id', $productId)   // 👈 IMPORTANT filter
//         ->pluck('id');

//     // ✅ Merge both sets
//     $allIds = $operatorIds->merge($supervisorIds)->unique();

//     $allOperators = Operator::whereIn('id', $allIds)
//         ->where('company_id', $companyId)
//         ->get(['id','name','mobile','address','payment','type']);

//     $operators   = [];
//     $supervisors = [];

//     foreach ($allOperators as $op) {
//         $stats = $operatorStats->get($op->id);
//         $monthWorkPoint = $stats->total_work_point ?? 0;

//         $alreadyPaidPoints = Transaction::where('operator_id', $op->id)
//             ->where('salary_month', $month)
//             ->sum('total_work_point');

//         $remainingPoints = max($monthWorkPoint - $alreadyPaidPoints, 0);
//         $commission      = $project->commission;

//         if ($op->type == 1) {
//             // ✅ Already paid row
//             if ($alreadyPaidPoints > 0) {
//                 $operators[] = (object)[
//                     'id'               => $op->id,
//                     'name'             => $op->name,
//                     'mobile'           => $op->mobile,
//                     'address'          => $op->address,
//                     'payment'          => $op->payment,
//                     'commission'       => $commission,
//                     'total_work_point' => $alreadyPaidPoints,
//                     'total_commission' => $alreadyPaidPoints * $commission,
//                     'is_paid'          => true,
//                 ];
//             }

//             // ✅ Remaining or first payment row
//             if ($remainingPoints > 0 || $alreadyPaidPoints == 0) {
//                 $isFirstPayment = ($alreadyPaidPoints == 0);
//                 $operators[] = (object)[
//                     'id'               => $op->id,
//                     'name'             => $op->name,
//                     'mobile'           => $op->mobile,
//                     'address'          => $op->address,
//                     'payment'          => $isFirstPayment ? $op->payment : 0,
//                     'commission'       => $commission,
//                     'total_work_point' => $isFirstPayment ? $monthWorkPoint : $remainingPoints,
//                     'total_commission' => ($isFirstPayment ? $monthWorkPoint : $remainingPoints) * $commission,
//                     'is_paid'          => false,
//                 ];
//             }

//         } else {
//             // ✅ Supervisor (type 0)
//             $isPaid = Transaction::where('operator_id', $op->id)
//                 ->where('salary_month', $month)
//                 ->exists();

//             $supervisors[] = (object)[
//                 'id'               => $op->id,
//                 'name'             => $op->name,
//                 'mobile'           => $op->mobile,
//                 'address'          => $op->address,
//                 'payment'          => $op->payment,
//                 'commission'       => null,
//                 'total_work_point' => 0,
//                 'total_commission' => $op->payment,
//                 'is_paid'          => $isPaid,
//             ];
//         }
//     }

//     // ✅ Sort operators: paid first
//     usort($operators, fn($a, $b) =>
//         $a->is_paid === $b->is_paid ? 0 : ($a->is_paid ? -1 : 1)
//     );

//     return response()->json([
//         'success'     => true,
//         'operators'   => array_values($operators),
//         'supervisors' => array_values($supervisors)
//     ]);
// }
public function getOperatorsByProduct(Request $request)
{
    $request->validate([
        'product_id' => 'required|integer',
        'month'      => 'required|string', // Ex: "March"
        'year'       => 'required|integer' // Ex: 2025
    ]);

    $companyId = auth()->user()->company_id;
    $productId = $request->product_id;
    $month     = $request->month;
    $year      = $request->year;

    // ------------------------------------------------------
    // 1️⃣ Calculate date range for the SELECTED month
    // ------------------------------------------------------
    $monthNumber = Carbon::parse($month . ' ' . $year)->month;
    $startDate   = Carbon::createFromDate($year, $monthNumber, 1)->startOfDay();
    $endDate     = Carbon::createFromDate($year, $monthNumber, 1)->endOfMonth()->endOfDay();

    // ------------------------------------------------------
    // 2️⃣ Get project with commission
    // ------------------------------------------------------
    $project = Project::where('id', $productId)
        ->where('company_id', $companyId)
        ->first(['id', 'commission']);

    if (!$project) {
        return response()->json([
            'success' => false,
            'message' => 'Project not found'
        ], 404);
    }

    // ------------------------------------------------------
    // 3️⃣ ✅ Check if ANY previous salary is pending
    // ------------------------------------------------------
    $previousPending = WorkPointDetail::query()
        ->join('drilling_records', 'drilling_records.id', '=', 'work_point_details.drilling_record_id')
        ->leftJoin('transaction', function ($join) {
            $join->on('transaction.operator_id', '=', 'work_point_details.operator_id');
        })
        ->where('work_point_details.company_id', $companyId)
        ->where('work_point_details.project_id', $productId)
        ->where('drilling_records.date', '<', $startDate)
        ->selectRaw("DATE_FORMAT(drilling_records.date, '%Y-%m') as ym,
                     work_point_details.operator_id,
                     SUM(work_point_details.work_point) as total_points")
        ->groupBy('ym','work_point_details.operator_id')
        ->get()
        ->groupBy('ym')
        ->filter(function ($records, $ym) {
            // for each month-year, check if FULL payment exists
            [$yr,$mn] = explode('-', $ym);
            $monthName = Carbon::createFromFormat('!m', $mn)->format('F');
            foreach ($records as $rec) {
                $paid = Transaction::where('operator_id', $rec->operator_id)
                    ->where('salary_month', $monthName)
                    ->whereYear('created_at', $yr)
                    ->sum('total_work_point');
                if ($paid < $rec->total_points) {
                    return true; // pending for this month
                }
            }
            return false;
        })
        ->keys(); // collection of pending YYYY-MM

    $previousPendingFlag = $previousPending->isNotEmpty();
    $previousPendingMsg  = $previousPendingFlag
        ? "The previous payment is pending"
        : null;

    // ------------------------------------------------------
    // 4️⃣ Operator work stats for the SELECTED month
    // ------------------------------------------------------
    $operatorStats = WorkPointDetail::query()
        ->join('drilling_records', 'drilling_records.id', '=', 'work_point_details.drilling_record_id')
        ->where('work_point_details.company_id', $companyId)
        ->where('work_point_details.project_id', $productId)
        ->whereBetween('drilling_records.date', [$startDate, $endDate])
        ->selectRaw('work_point_details.operator_id, SUM(work_point_details.work_point) as total_work_point')
        ->groupBy('work_point_details.operator_id')
        ->get()
        ->keyBy('operator_id');

    $operatorIds = $operatorStats->pluck('operator_id');

    // Supervisors assigned to the project
    $supervisorIds = Operator::where('company_id', $companyId)
        ->where('type', 0)
        ->where('project_id', $productId)
        ->pluck('id');

    $allIds = $operatorIds->merge($supervisorIds)->unique();

    $allOperators = Operator::whereIn('id', $allIds)
        ->where('company_id', $companyId)
        ->get(['id','name','mobile','address','payment','type']);

    $operators   = [];
    $supervisors = [];

    foreach ($allOperators as $op) {
        $stats = $operatorStats->get($op->id);
        $monthWorkPoint = $stats->total_work_point ?? 0;

        $alreadyPaidPoints = Transaction::where('operator_id', $op->id)
            ->where('salary_month', $month)
            ->whereYear('created_at', $year)
            ->sum('total_work_point');

        $remainingPoints = max($monthWorkPoint - $alreadyPaidPoints, 0);
        $commission      = $project->commission;

        // Pending months (for display only)
        $pendingMonths = WorkPointDetail::query()
            ->join('drilling_records', 'drilling_records.id', '=', 'work_point_details.drilling_record_id')
            ->where('work_point_details.company_id', $companyId)
            ->where('work_point_details.project_id', $productId)
            ->where('work_point_details.operator_id', $op->id)
            ->where('drilling_records.date', '<', $startDate)
            ->selectRaw("DATE_FORMAT(drilling_records.date, '%Y-%m') as ym")
            ->groupBy('ym')
            ->get()
            ->pluck('ym')
            ->filter(function ($ym) use ($op) {
                [$yr,$mn] = explode('-', $ym);
                return !Transaction::where('operator_id', $op->id)
                    ->where('salary_month', Carbon::createFromFormat('!m', $mn)->format('F'))
                    ->whereYear('created_at', $yr)
                    ->exists();
            })
            ->values();

        if ($op->type == 1) {
            if ($alreadyPaidPoints > 0) {
                $operators[] = (object)[
                    'id'               => $op->id,
                    'name'             => $op->name,
                    'mobile'           => $op->mobile,
                    'address'          => $op->address,
                    'payment'          => $op->payment,
                    'commission'       => $commission,
                    'total_work_point' => $alreadyPaidPoints,
                    'total_commission' => $alreadyPaidPoints * $commission,
                    'is_paid'          => true,
                    'pending_months'   => $pendingMonths
                ];
            }

            if ($remainingPoints > 0 || $alreadyPaidPoints == 0) {
                $isFirstPayment = ($alreadyPaidPoints == 0);
                $operators[] = (object)[
                    'id'               => $op->id,
                    'name'             => $op->name,
                    'mobile'           => $op->mobile,
                    'address'          => $op->address,
                    'payment'          => $isFirstPayment ? $op->payment : 0,
                    'commission'       => $commission,
                    'total_work_point' => $isFirstPayment ? $monthWorkPoint : $remainingPoints,
                    'total_commission' => ($isFirstPayment ? $monthWorkPoint : $remainingPoints) * $commission,
                    'is_paid'          => false,
                    'pending_months'   => $pendingMonths
                ];
            }
        } else {
            $isPaid = Transaction::where('operator_id', $op->id)
                ->where('salary_month', $month)
                ->whereYear('created_at', $year)
                ->exists();

            $supervisors[] = (object)[
                'id'               => $op->id,
                'name'             => $op->name,
                'mobile'           => $op->mobile,
                'address'          => $op->address,
                'payment'          => $op->payment,
                'commission'       => null,
                'total_work_point' => 0,
                'total_commission' => $op->payment,
                'is_paid'          => $isPaid,
                'pending_months'   => $pendingMonths
            ];
        }
    }

    usort($operators, fn($a, $b) =>
        $a->is_paid === $b->is_paid ? 0 : ($a->is_paid ? -1 : 1)
    );

    // ------------------------------------------------------
    // 5️⃣ Return final response
    // ------------------------------------------------------
    return response()->json([
        'success'               => true,
        'operators'             => array_values($operators),
        'supervisors'           => array_values($supervisors),
        'previous_payment_msg'  => $previousPendingMsg,   // ✅ New message
        'previous_pending_months' => $previousPending     // ✅ Optional: show which months
    ]);
}

    
























// public function storeTransaction(Request $request)
// {
//     $request->validate([
//         'id'               => 'required|integer', // operator_id
//         'payment'          => 'required|numeric',
//         'total_commission' => 'required|numeric',
//         'total_work_point' => 'required|numeric',
//         'month'            => 'required|string',
//         'year'             => 'required|integer',
//         'project_id'       => 'required|integer'
//     ]);

//     $month = $request->month;
//     $year  = $request->year;

//     $salaryMonth = $month . '-' . $year;

//     // Prevent duplicate payment for the same month
//     $exists = Transaction::where('operator_id', $request->id)
//         ->where('salary_month', $month)
//         ->exists();

//     if ($exists) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Transaction already exists for this operator in ' . $salaryMonth,
//         ], 409);
//     }

//     try {
//         DB::beginTransaction();

//         $transaction = Transaction::create([
//             'operator_id'      => $request->id,
//             'total_work_point' => $request->total_work_point,
//             'total_commission' => $request->total_commission,
//             'salary'           => $request->payment,
//             'total_payment'    => $request->payment + $request->total_commission,
//             'salary_month'     => $month,
//         ]);

//         $expenceTypeId = ExpenseType::where('company_id', auth()->user()->company_id)
//                                  ->where('name', 'Salary')
//                                  ->value('id');

//         $expenseData = [
//             'project_id'     => $request->project_id,
//             'name'           => 'Operator Salary',
//             'desc'           => 'Operator Salary',
//             'expense_id'     => $expenceTypeId,
//             'qty'            => 1,
//             'price'          => $request->payment + $request->total_commission,
//             'total_price'    => $request->payment + $request->total_commission,
//             'expense_date'   => now()->format('Y-m-d'),
//             'payment_by'     => 'Owner',
//             'payment_type'   => 'Cash',
//             'pending_amount' => 0,
//             'show'           => 1,
//             'isGst'          => 0,
//             'photo_url'      => 'NA',
//             'photo_remark'   => 'NA',
//             'company_id'     => auth()->user()->company_id,
//             'created_by'     => auth()->user()->id,
//             'updated_by'     => auth()->user()->id,
//         ];

//         $Expence=Expense::create($expenseData);

//          ExpenseSummary::updateOrCreate(
//     [
//         'expense_date' => now()->format('Y-m-d'),
//         'company_id'   => auth()->user()->company_id,
//         'project_id'   => $request->project_id, // 🔹 add this
//     ],
//     [
//         'total_expense' => DB::raw('total_expense + ' . $request->payment + $request->total_commission),
//         'expense_count' => DB::raw('expense_count + 1'),
//     ]
// );

//         DB::commit();

//         return response()->json([
//             'success'     => true,
//             'message'     => 'Transaction saved successfully',
//             'transaction' => $transaction
//         ]);

//     } catch (\Exception $e) {
//         DB::rollBack();

//         return response()->json([
//             'success' => false,
//             'message' => 'Failed to save transaction',
//             'error'   => $e->getMessage()
//         ], 500);
//     }
// }











// public function storeTransaction(Request $request)
// {
//     $request->validate([
//         'id'               => 'required|integer', // operator_id
//         'payment'          => 'required|numeric',
//         'total_commission' => 'required|numeric',
//         'total_work_point' => 'required|numeric',
//         'month'            => 'required|string',
//         'year'             => 'required|integer',
//         'project_id'       => 'required|integer'
//     ]);

//     $month = $request->month;
//     $year  = $request->year;

//     $salaryMonth = $month . '-' . $year;

//     // ✅ Prevent duplicate payment for the same month
//     $exists = Transaction::where('operator_id', $request->id)
//         ->where('salary_month', $month) // keep only month for uniqueness
//         ->exists();

//     if ($exists) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Transaction already exists for this operator in ' . $salaryMonth,
//         ], 409);
//     }

//     // ✅ Find operator type
//     $operator = Operator::where('id', $request->id)
//         ->where('company_id', auth()->user()->company_id)
//         ->first(['id', 'type']);

//     if (!$operator) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Operator not found',
//         ], 404);
//     }

//     try {
//         DB::beginTransaction();

//         if ($operator->type == 1) {
//             // 🔹 TYPE 1 = OPERATOR (Current Logic)
//             $totalPayment = $request->payment + $request->total_commission;

//             $transaction = Transaction::create([
//                 'operator_id'      => $request->id,
//                 'total_work_point' => $request->total_work_point,
//                 'total_commission' => $request->total_commission,
//                 'salary'           => $request->payment,
//                 'total_payment'    => $totalPayment,
//                 'salary_month'     => $month,
//             ]);

//             $expenceTypeId = ExpenseType::where('company_id', auth()->user()->company_id)
//                 ->where('name', 'Salary')
//                 ->value('id');

//             $expenseData = [
//                 'project_id'     => $request->project_id,
//                 'name'           => 'Operator Salary',
//                 'desc'           => 'Operator Salary',
//                 'expense_id'     => $expenceTypeId,
//                 'qty'            => 1,
//                 'price'          => $totalPayment,
//                 'total_price'    => $totalPayment,
//                 'expense_date'   => now()->format('Y-m-d'),
//                 'payment_by'     => 'Owner',
//                 'payment_type'   => 'Cash',
//                 'pending_amount' => 0,
//                 'show'           => 1,
//                 'isGst'          => 0,
//                 'photo_url'      => 'NA',
//                 'photo_remark'   => 'NA',
//                 'company_id'     => auth()->user()->company_id,
//                 'created_by'     => auth()->user()->id,
//                 'updated_by'     => auth()->user()->id,
//             ];
//             Expense::create($expenseData);

//             ExpenseSummary::updateOrCreate(
//                 [
//                     'expense_date' => now()->format('Y-m-d'),
//                     'company_id'   => auth()->user()->company_id,
//                     'project_id'   => $request->project_id,
//                 ],
//                 [
//                     'total_expense' => DB::raw('total_expense + ' . $totalPayment),
//                     'expense_count' => DB::raw('expense_count + 1'),
//                 ]
//             );

//         } else {
//             // 🔹 TYPE 0 = SUPERVISOR (Fixed Salary Only)
//             $transaction = Transaction::create([
//                 'operator_id'      => $request->id,
//                 'total_work_point' => 0,
//                 'total_commission' => 0,
//                 'salary'           => $request->payment,
//                 'total_payment'    => $request->payment, // Only salary
//                 'salary_month'     => $month,
//             ]);

//             $expenceTypeId = ExpenseType::where('company_id', auth()->user()->company_id)
//                 ->where('name', 'Salary')
//                 ->value('id');

//             $expenseData = [
//                 'project_id'     => $request->project_id,
//                 'name'           => 'Supervisor Salary',
//                 'desc'           => 'Supervisor Salary',
//                 'expense_id'     => $expenceTypeId,
//                 'qty'            => 1,
//                 'price'          => $request->payment,
//                 'total_price'    => $request->payment,
//                 'expense_date'   => now()->format('Y-m-d'),
//                 'payment_by'     => 'Owner',
//                 'payment_type'   => 'Cash',
//                 'pending_amount' => 0,
//                 'show'           => 0, // 👈 optional: hide if needed
//                 'isGst'          => 0,
//                 'photo_url'      => 'NA',
//                 'photo_remark'   => 'NA',
//                 'company_id'     => auth()->user()->company_id,
//                 'created_by'     => auth()->user()->id,
//                 'updated_by'     => auth()->user()->id,
//             ];
//             Expense::create($expenseData);

//             ExpenseSummary::updateOrCreate(
//                 [
//                     'expense_date' => now()->format('Y-m-d'),
//                     'company_id'   => auth()->user()->company_id,
//                     'project_id'   => $request->project_id,
//                 ],
//                 [
//                     'total_expense' => DB::raw('total_expense + ' . $request->payment),
//                     'expense_count' => DB::raw('expense_count + 1'),
//                 ]
//             );
//         }

//         DB::commit();

//         return response()->json([
//             'success'     => true,
//             'message'     => 'Transaction saved successfully',
//             'transaction' => $transaction
//         ]);

//     } catch (\Exception $e) {
//         DB::rollBack();

//         return response()->json([
//             'success' => false,
//             'message' => 'Failed to save transaction',
//             'error'   => $e->getMessage()
//         ], 500);
//     }
// }




public function storeTransaction(Request $request)
{
    $request->validate([
        'id'               => 'required|integer', // operator_id
        'payment'          => 'required|numeric',
        'total_commission' => 'required|numeric',
        'total_work_point' => 'required|numeric',
        'month'            => 'required|string',
        'year'             => 'required|integer',
        'project_id'       => 'required|integer',
        'payment_by'       => 'required|string',
        'payment_type'     => 'required|string',
        'transaction_id'   => 'required|string',
    ]);

    $month = $request->month;
    $year  = $request->year;

    // ✅ Check if a SALARY has already been paid for this operator/month
    $salaryAlreadyPaid = Transaction::where('operator_id', $request->id)
        ->where('salary_month', $month)
        ->where('salary', '>', 0)
        ->exists();

    // ✅ Fetch operator & bank details
    $operator = Operator::where('id', $request->id)
        ->where('company_id', auth()->user()->company_id)
        ->first([
            'id','type','bank_name','account_number','ifsc_code','adhar_number','pan_number'
        ]);

    if (!$operator) {
        return response()->json([
            'success' => false,
            'message' => 'Operator not found',
        ], 404);
    }

    try {
        DB::beginTransaction();

        // ✅ Salary amount (only once per month)
        $salaryAmount = $salaryAlreadyPaid ? 0 : $request->payment;

        if ($operator->type == 1) {
            // 🔹 OPERATOR: salary + commission
            $totalPayment = $salaryAmount + $request->total_commission;

            $transaction = Transaction::create([
                'operator_id'      => $request->id,
                'total_work_point' => $request->total_work_point,
                'total_commission' => $request->total_commission,
                'salary'           => $salaryAmount,
                'total_payment'    => $totalPayment,
                'salary_month'     => $month,
            ]);

            // $expenceTypeId = ExpenseType::where('company_id', auth()->user()->company_id)
            //     ->where('name', 'Salary')
            //     ->value('id');
            $expenseTypeId = ExpenseType::where('company_id', auth()->user()->company_id)
    ->where('name', 'Operator Payment')
    ->value('id');


            Expense::create([
                'project_id'     => $request->project_id,
                'name'           => 'Operator Payment',
                'desc'           => $salaryAmount > 0
                                    ? 'Operator Salary + Commission'
                                    : 'Operator Commission',
                'expense_id'     => $expenseTypeId,
                'qty'            => 1,
                'price'          => $totalPayment,
                'total_price'    => $totalPayment,
                'expense_date'   => now()->format('Y-m-d'),
                'payment_by'     => $request->payment_by,
                'payment_type'   => $request->payment_type,
                'transaction_id' => $request->transaction_id,
                'pending_amount' => 0,
                'show'           => 1,
                'isGst'          => 0,
                'photo_url'      => 'NA',
                'photo_remark'   => 'NA',
                'company_id'     => auth()->user()->company_id,
                'created_by'     => auth()->user()->id,
                'updated_by'     => auth()->user()->id,

                // ✅ Bank details from Operator
                'bank_name'   => $operator->bank_name,
                'acc_number'  => $operator->account_number,
                'ifsc'        => $operator->ifsc_code,
                'aadhar'      => $operator->adhar_number,
                'pan'         => $operator->pan_number,
            ]);

            ExpenseSummary::updateOrCreate(
                [
                    'expense_date' => now()->format('Y-m-d'),
                    'company_id'   => auth()->user()->company_id,
                    'project_id'   => $request->project_id,
                ],
                [
                    'total_expense' => DB::raw('total_expense + ' . $totalPayment),
                    'expense_count' => DB::raw('expense_count + 1'),
                ]
            );

        } else {
            // 🔹 SUPERVISOR: salary only
            $totalPayment = $salaryAmount;

            $transaction = Transaction::create([
                'operator_id'      => $request->id,
                'total_work_point' => 0,
                'total_commission' => 0,
                'salary'           => $salaryAmount,
                'total_payment'    => $totalPayment,
                'salary_month'     => $month,
            ]);

            if ($salaryAmount > 0) {
                $expenceTypeId = ExpenseType::where('company_id', auth()->user()->company_id)
                    ->where('name', 'Salary')
                    ->value('id');

                Expense::create([
                    'project_id'     => $request->project_id,
                    'name'           => 'Supervisor Salary',
                    'desc'           => 'Supervisor Salary Payment',
                    'expense_id'     => $expenceTypeId,
                    'qty'            => 1,
                    'price'          => $salaryAmount,
                    'total_price'    => $salaryAmount,
                    'expense_date'   => now()->format('Y-m-d'),
                    'payment_by'     => $request->payment_by,
                    'payment_type'   => $request->payment_type,
                    'transaction_id' => $request->transaction_id,
                    'pending_amount' => 0,
                    'show'           => 0,
                    'isGst'          => 0,
                    'photo_url'      => 'NA',
                    'photo_remark'   => 'NA',
                    'company_id'     => auth()->user()->company_id,
                    'created_by'     => auth()->user()->id,
                    'updated_by'     => auth()->user()->id,

                    // ✅ Bank details from Operator
                    'bank_name'   => $operator->bank_name,
                    'acc_number'  => $operator->account_number,
                    'ifsc'        => $operator->ifsc_code,
                    'aadhar'      => $operator->adhar_number,
                    'pan'         => $operator->pan_number,
                ]);

                ExpenseSummary::updateOrCreate(
                    [
                        'expense_date' => now()->format('Y-m-d'),
                        'company_id'   => auth()->user()->company_id,
                        'project_id'   => $request->project_id,
                    ],
                    [
                        'total_expense' => DB::raw('total_expense + ' . $salaryAmount),
                        'expense_count' => DB::raw('expense_count + 1'),
                    ]
                );
            }
        }

        DB::commit();

        return response()->json([
            'success'     => true,
            'message'     => 'Transaction saved successfully',
            'salary_paid' => $salaryAmount > 0,
            'transaction' => $transaction
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Failed to save transaction',
            'error'   => $e->getMessage()
        ], 500);
    }
}



}
 