<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\DrillingRecord;
use App\Models\WorkPointDetail;
use App\Models\SurveyDetail;
use App\Models\Project;
use App\Models\Operator;
use App\Models\WorkLogSummary; 
// use Illuminate\Support\Facades\DB;
use App\Models\ExpenseSummary;
use App\Models\MachineReading;
use App\Models\CompressorRpm;
use App\Models\RawMaterialLog;
use App\Models\UsesRawMaterial;
use App\Models\RawMaterial;
use App\Models\Machinery;

use Carbon\Carbon;
use App\Models\Order;
use App\Models\OrderDetail; 
use App\Models\ProformaInvoice;
use App\Models\ProformaInvoiceDetail;
use App\Models\Income;
use App\Models\IncomeSummary;



class DrillingController
{
     




public function store(Request $request)
{
    $user = auth()->user();

    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    if (!$user->company_id) {
        return response()->json(['message' => 'Company ID missing for this user'], 422);
    }

    $userId    = $user->id;
    $companyId = $user->company_id;

    // ✅ Step 1: Validate
    $validated = $request->validate([
        'diesel_used'    => 'nullable|numeric',
        'diesel_balance' => 'nullable|numeric',
       
    ]);

    // ✅ Step 2: Always override company_id with logged-in user
    $drillingRecord = DrillingRecord::create([
        'user_id'        => $userId,
        'company_id'     => $companyId,
        'project_id'     => $request->project_id ?? null,
        'date'           => $request->date ?? now()->toDateString(),
        'oprator_helper' => $request->oprator_helper,
    ]);

    $operatorId = $drillingRecord->oprator_helper;

    // ✅ Step 2.1: Create Machine Reading entries & deduct diesel from Machinery
    if ($request->has('machineReading') && is_array($request->machineReading)) {
        foreach ($request->machineReading as $reading) {
            MachineReading::create([
                'company_id'        => $companyId,
                'drilling_record_id'=> $drillingRecord->id,
                'oprator_id'        => $reading['oprator_id'] ?? null,
                'project_id'        => $request->project_id ?? null,
                'user_id'           => $userId,
                'machine_id'        => $reading['machine_id'] ?? null,
                'machine_start'     => $reading['machine_start'] ?? null,
                'machine_end'       => $reading['machine_end'] ?? null,
                'actual_machine_hr' => $reading['actual_machine_hr'] ?? null,
                'diesel_used'       => $reading['diesel_used'] ?? null,
                'diesel_balance'    => $reading['diesel_balance'] ?? null,
            ]);

            // 🔥 Deduct diesel_used from Machinery.diesel_balance
            $dieselUsed = floatval($reading['diesel_used'] ?? 0);
            $machineId  = $reading['machine_id'] ?? null;
            if ($machineId && $dieselUsed > 0) {
                Machinery::where('id', $machineId)
                    ->where('company_id', $companyId)
                    ->decrement('diesel_balance', $dieselUsed);
            }
        }
    }

    // ✅ Step 2.2: Create Compressor RPM entries & deduct diesel from Machinery
    if ($request->has('compressor_rpm') && is_array($request->compressor_rpm)) {
        foreach ($request->compressor_rpm as $rpm) {
            CompressorRpm::create([
                'company_id'         => $companyId,
                'drilling_record_id' => $drillingRecord->id,
                'oprator_id'         => $rpm['oprator_id'] ?? null,
                'project_id'         => $request->project_id ?? null,
                'user_id'            => $userId,
                'machine_id'         => $rpm['machine_id'] ?? null,
                'comp_rpm_start'     => $rpm['comp_rpm_start'] ?? null,
                'comp_rpm_end'       => $rpm['comp_rpm_end'] ?? null,
                'com_actul_hr'       => $rpm['com_actul_hr'] ?? null,
                'diesel_used'        => $rpm['diesel_used'] ?? null,
                'diesel_balance'     => $rpm['diesel_balance'] ?? null,
            ]);

            // 🔥 Deduct diesel_used from Machinery.diesel_balance
            $dieselUsed = floatval($rpm['diesel_used'] ?? 0);
            $machineId  = $rpm['machine_id'] ?? null;
            if ($machineId && $dieselUsed > 0) {
                Machinery::where('id', $machineId)
                    ->where('company_id', $companyId)
                    ->decrement('diesel_balance', $dieselUsed);
            }
        }
    }







$usedRawMaterials = [];

if ($request->has('raw_material_usage') && is_array($request->raw_material_usage)) {
    foreach ($request->raw_material_usage as $usage) {
        $materialId = $usage['material_id'] ?? null;
        $qtyUsed    = $usage['qty_used'] ?? 0;
        $miscInput  = $usage['misc'] ?? null; // optional text or notes

        if ($materialId && $qtyUsed > 0) {

            // Get the latest log for this material and project
            $rawLog = RawMaterialLog::where('company_id', $companyId)
                ->where('material_id', $materialId)
                ->when($request->project_id, function ($q) use ($request) {
                    $q->where('project_id', $request->project_id);
                })
                ->latest()
                ->first();

            if ($rawLog) {
                $pricePerUnit = $rawLog->price ?? 0; // price per unit
                $amountUsed   = $qtyUsed * $pricePerUnit;

                // Deduct quantity (but not below zero)
                $newQty = max(0, $rawLog->current_stock - $qtyUsed);

                // Deduct total amount/value (but not below zero)
                $newTotal = max(0, $rawLog->total - $amountUsed);

                // Update RawMaterialLog
                $rawLog->update([
                    'current_stock' => $newQty,
                    'total'         => $newTotal,
                ]);
            }

            // Store usage in UsesRawMaterial table
            $used = UsesRawMaterial::create([
                'company_id'  => $companyId,
                'project_id'  => $request->project_id ?? null,
                'drilling_record_id' => $drillingRecord->id,
                'material_id' => $materialId,
                'used_qty'    => $qtyUsed,
                'price'       => $rawLog->price ?? 0, // unit price
                'misc'        => $amountUsed,         // store total amount used here
            ]);

            $usedRawMaterials[] = $used;
        }
    }
}



    // Initialize totals for WorkLogSummary
    $totalWorkPoints = 0;
    $totalSurveys = 0;

    // ✅ Step 3: Work Points
    if ($request->has('work_points') && is_array($request->work_points)) {
        foreach ($request->work_points as $workPoint) {
            $totalWorkPoints += $workPoint['total'] ?? 0;

            WorkPointDetail::create([
                'company_id'         => $companyId,
                'project_id'         => $request->project_id ?? null,
                'drilling_record_id' => $drillingRecord->id,
                'work_type'          => $workPoint['work_type'] ?? null,
                'work_point'         => $workPoint['work_point'] ?? null,
                'uom'                => $workPoint['uom'] ?? null,
                'rate'               => $workPoint['rate'] ?? null,
                'total'              => $workPoint['total'] ?? null,
                'diesel'             => $workPoint['diesel'] ?? null,
                'hrs'                => $workPoint['hrs'] ?? null,
                'operator_id'        => $workPoint  ['operator_id'] ?? null,
            ]);
        }
    }

    // ✅ Step 4: Surveys
    if ($request->has('surveys') && is_array($request->surveys)) {
        foreach ($request->surveys as $survey) {
            $totalSurveys += $survey['total'] ?? 0;

            SurveyDetail::create([
                'company_id'         => $companyId,
                'project_id'         => $request->project_id ?? null,
                'drilling_record_id' => $drillingRecord->id,
                'survey_type'        => $survey['survey_type'] ?? null,
                'survey_point'       => $survey['survey_point'] ?? null,
                'uom'                => $survey['uom'] ?? null,
                'rate'               => $survey['rate'] ?? null,
                'total'              => $survey['total'] ?? null,
                'diesel'             => $survey['diesel'] ?? null,
                'hrs'                => $survey['hrs'] ?? null,
                'operator_id'        => $survey['operator_id'] ?? null,
            ]);
        }
    }

    // ✅ Step 5: Update Work Log Summary
    $logDate    = $validated['date'] ?? now()->toDateString();  // use request date if provided
    $projectId  = $request->project_id ?? null;
    $grandTotal = $totalWorkPoints + $totalSurveys;

    $summary = WorkLogSummary::firstOrNew([
        'date'       => $logDate,
        'company_id' => $companyId,
        'project_id' => $projectId,
    ]);

    $summary->grand_total += $grandTotal;
    $summary->count += 1;
    $summary->save();

    // ✅ Step 6: Return
    return response()->json([
        'message' => 'Drilling record, machine reading, work points and survey details stored successfully!',
        'data'    => [
            // 'drilling_record' => $drillingRecord->load('workPoints', 'surveys','machine_reading'),
            'drilling_record' => $drillingRecord->load('workPoints', 'surveys','compressorRpm','machineReading'),
            'uses_raw_material' => $usedRawMaterials,
            // 'machine_reading' => $machineReading,
        ],
        'summary' => $summary
    ], 201);
}



    /**
 * Display a listing of the drilling records.
 */


public function index(Request $request)
{
    $companyId = auth()->user()->company_id;

    $records = DrillingRecord::with([
            'surveyDetail',
            'workPointDetail',
             'compressorRpm', 
            'machineReading.operator',
            'project:id,project_name',
            'operator:id,name'
        ])
        ->where('company_id', $companyId)

        // ✅ Date filter
        ->when($request->start_date && $request->end_date, function ($query) use ($request) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        })

        // ✅ Project name filter
        ->when($request->project_name, function ($query) use ($request) {
            $query->whereHas('project', function ($q) use ($request) {
                $q->where('project_name', 'like', '%' . $request->project_name . '%');
            });
        })

        // ✅ Point filter (unchanged)
        ->when($request->max_point, function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('workPointDetail', function ($w) use ($request) {
                    $w->where('work_point', '<=', $request->max_point);
                })
                ->orWhereHas('surveyDetail', function ($s) use ($request) {
                    $s->where('survey_point', '<=', $request->max_point);
                })
                ->orWhereHas('machineReading', function ($m) use ($request) {
                    $m->where('actual_machine_hr', '<=', $request->max_point);
                })
                 ->orWhereHas('compressorRpm', function ($c) use ($request) {
                        $c->where('com_actul_hr', '<=', $request->max_point);
                    });
            });
        })

        // ✅ Relations consistency check
        ->where(function ($query) {
            $query->whereHas('surveyDetail', function ($q) {
                $q->whereColumn('survey_details.company_id', 'drilling_records.company_id')
                  ->orWhereColumn('survey_details.project_id', 'drilling_records.project_id')
                  ->orWhereColumn('survey_details.drilling_record_id', 'drilling_records.id');
            })
            ->orWhereHas('workPointDetail', function ($q) {
                $q->whereColumn('work_point_details.company_id', 'drilling_records.company_id')
                  ->orWhereColumn('work_point_details.project_id', 'drilling_records.project_id')
                  ->orWhereColumn('work_point_details.drilling_record_id', 'drilling_records.id');
            })
            ->orWhereHas('machineReading', function ($q) {
                $q->whereColumn('machine_reading.company_id', 'drilling_records.company_id')
                  ->orWhereColumn('machine_reading.project_id', 'drilling_records.project_id')
                  ->orWhereColumn('machine_reading.drilling_record_id', 'drilling_records.id');
            })
             ->orWhereHas('compressorRpm', function ($q) {
                $q->whereColumn('compressor_rpm.company_id', 'drilling_records.company_id')
                  ->orWhereColumn('compressor_rpm.project_id', 'drilling_records.project_id')
                  ->orWhereColumn('compressor_rpm.drilling_record_id', 'drilling_records.id');
            });
        })
        ->orderBy('id', 'desc')
        ->get();

    return response()->json([
        'message' => 'Drilling records fetched successfully!',
        'data' => $records
    ], 200);
}




    // -------------------------------
    // User-specific data (for type=2)
    // -------------------------------


public function getDataByUserId(Request $request)
{
    $companyId = auth()->user()->company_id;
    $userId    = auth()->id();

    // ✅ Step 1: Get all project IDs supervised by this user
    $projectIds = \App\Models\Project::where('company_id', $companyId)
                    ->where('supervisor_id', $userId)
                    ->pluck('id');

    // ✅ Step 2: Fetch drilling records belonging to those projects
    $records = \App\Models\DrillingRecord::with([
            'surveyDetail',
            'workPointDetail',
            'compressorRpm',
            'machineReading.operator',
            'project:id,project_name',
            'operator:id,name'
        ])
        ->where('company_id', $companyId)
        ->whereIn('project_id', $projectIds) // <-- Filter by supervised projects

        // ✅ Optional date range filter
        ->when($request->start_date && $request->end_date, function ($query) use ($request) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        })

        // ✅ Optional project name filter
        ->when($request->project_name, function ($query) use ($request) {
            $query->whereHas('project', function ($q) use ($request) {
                $q->where('project_name', 'like', '%' . $request->project_name . '%');
            });
        })

        // ✅ Optional max point filter (from related tables)
        ->when($request->max_point, function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('workPointDetail', function ($w) use ($request) {
                    $w->where('work_point', '<=', $request->max_point);
                })
                ->orWhereHas('surveyDetail', function ($s) use ($request) {
                    $s->where('survey_point', '<=', $request->max_point);
                })
                ->orWhereHas('machineReading', function ($m) use ($request) {
                    $m->where('actual_machine_hr', '<=', $request->max_point);
                })
                ->orWhereHas('compressorRpm', function ($c) use ($request) {
                    $c->where('com_actul_hr', '<=', $request->max_point);
                });
            });
        })

        // ✅ Data consistency check
        ->where(function ($query) {
            $query->whereHas('surveyDetail', function ($q) {
                $q->whereColumn('survey_details.company_id', 'drilling_records.company_id')
                  ->orWhereColumn('survey_details.project_id', 'drilling_records.project_id')
                  ->orWhereColumn('survey_details.drilling_record_id', 'drilling_records.id');
            })
            ->orWhereHas('workPointDetail', function ($q) {
                $q->whereColumn('work_point_details.company_id', 'drilling_records.company_id')
                  ->orWhereColumn('work_point_details.project_id', 'drilling_records.project_id')
                  ->orWhereColumn('work_point_details.drilling_record_id', 'drilling_records.id');
            })
            ->orWhereHas('machineReading', function ($q) {
                $q->whereColumn('machine_reading.company_id', 'drilling_records.company_id')
                  ->orWhereColumn('machine_reading.project_id', 'drilling_records.project_id')
                  ->orWhereColumn('machine_reading.drilling_record_id', 'drilling_records.id');
            })
            ->orWhereHas('compressorRpm', function ($q) {
                $q->whereColumn('compressor_rpm.company_id', 'drilling_records.company_id')
                  ->orWhereColumn('compressor_rpm.project_id', 'drilling_records.project_id')
                  ->orWhereColumn('compressor_rpm.drilling_record_id', 'drilling_records.id');
            });
        })

        ->orderBy('id', 'desc')
        ->get();

    return response()->json([
        'message' => 'Project-wise Drilling Records fetched successfully!',
        'data'    => $records
    ], 200);
}







public function filterRecords(Request $request)
{
    // Get logged-in user's company_id and user_id
    $companyId = auth()->user()->company_id;
    $userId    = auth()->id();

    // Get filters from request
    $startDate   = $request->input('start_date');   // e.g. 2025-08-01
    $endDate     = $request->input('end_date');     // e.g. 2025-08-31
    $maxPoint    = $request->input('max_point');    // e.g. 500

    $records = DrillingRecord::with(['surveyDetail', 'workPointDetail', 'customer:id,name'])
        ->where('company_id', $companyId)
        ->where('user_id', $userId)
        
        // ✅ Date range filter
        ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        })

        // ✅ Point-wise filter (work_point <= maxPoint OR survey_point <= maxPoint)
        ->when($maxPoint, function ($query) use ($maxPoint) {
            $query->where(function ($q) use ($maxPoint) {
                $q->whereHas('workPointDetail', function ($w) use ($maxPoint) {
                    $w->where('work_point', '<=', $maxPoint);
                })
                ->orWhereHas('surveyDetail', function ($s) use ($maxPoint) {
                    $s->where('survey_point', '<=', $maxPoint);
                });
            });
        })

        ->orderBy('id', 'desc')
        ->get();

    return response()->json([
        'message' => 'Filtered drilling records fetched successfully!',
        'data' => $records
    ], 200);
}




/**
 * Display the specified drilling record by ID.
 */
public function show($id)
{
    $record = DrillingRecord::find($id);

    if (!$record) {
        return response()->json([
            'message' => 'Drilling record not found!'
        ], 404);
    }

    return response()->json([
        'message' => 'Drilling record fetched successfully!',
        'data' => $record
    ], 200);
}



public function invoice(Request $request)
{
    $pointLimit = $request->input('point'); // e.g. 500

    // Get all drilling records with work points ordered properly
    $query = DrillingRecord::with(['surveyDetail', 'workPointDetail' => function ($q) {
        $q->orderBy('id', 'asc'); // or orderBy date if needed
    }]);

    // ✅ Date Filter
    if ($request->has('start_date') && $request->has('end_date')) {
        $startDate = $request->input('start_date');
        $endDate   = $request->input('end_date');

        $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereHas('surveyDetail', function ($sub) use ($startDate, $endDate) {
                $sub->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->orWhereHas('workPointDetail', function ($sub) use ($startDate, $endDate) {
                $sub->whereBetween('created_at', [$startDate, $endDate]);
            });
        });
    }

    $records = $query->get();

    // ✅ Accumulate work_point until it reaches the requested total
    if ($pointLimit) {
        $filtered = collect();
        $runningTotal = 0;

        foreach ($records as $record) {
            // Filter work points inside each record
            $selectedWorkPoints = collect();
            foreach ($record->workPointDetail as $wp) {
                if ($runningTotal >= $pointLimit) break;
                $runningTotal += (int)$wp->work_point;
                $selectedWorkPoints->push($wp);
            }

            if ($selectedWorkPoints->isNotEmpty()) {
                $record->setRelation('workPointDetail', $selectedWorkPoints);
                $filtered->push($record);
            }

            if ($runningTotal >= $pointLimit) break;
        }

        $records = $filtered;
    }

    return response()->json([
        'message' => 'Filtered drilling records fetched successfully!',
        'data' => $records
    ], 200);
}

// Proper backend for workLogSummaryReport
 public function workLogSummaryReport(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $perPage = $request->query('perPage', 30);
        $cursor = $request->query('cursor');
        $projectId = $request->query('projectId');

        if (!$startDate || !$endDate) {
            return response()->json(['error' => 'Start and End date are required.'], 400);
        }

        $user = Auth::user();
        $companyId = $user->company_id;

        try {
            // Overall summary from work_log_summaries
            $summaryQuery = DB::table('work_log_summaries')
                ->where('company_id', $companyId)
                ->whereBetween('date', [$startDate, $endDate]);

            if ($projectId) {
                $summaryQuery->where('project_id', $projectId);
            }

            $summary = $summaryQuery->selectRaw('
                SUM(grand_total) as totalWorkAmount,
                SUM(count) as totalLogs
            ')->first();

            // Cursor-based paginated daily summary
            $query = DB::table('work_log_summaries')
                ->leftJoin('projects', 'work_log_summaries.project_id', '=', 'projects.id')
                ->where('work_log_summaries.company_id', $companyId)
                ->whereBetween('work_log_summaries.date', [$startDate, $endDate]);

            if ($projectId) {
                $query->where('work_log_summaries.project_id', $projectId);
            }

            $query->select(
                'work_log_summaries.date',
                'work_log_summaries.grand_total as totalWorkAmount',
                'work_log_summaries.count as logCount',
                'projects.project_name as project_name'
            )->orderBy('work_log_summaries.date');

            $logs = $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor);

            return response()->json([
                'logs' => $logs->items(),
                'next_cursor' => $logs->nextCursor()?->encode(),
                'has_more_pages' => $logs->hasMorePages(),
                'summary' => [
                    'totalWorkAmount' => $summary->totalWorkAmount ?? 0,
                    'totalLogs' => $summary->totalLogs ?? 0,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Report generation failed: ' . $e->getMessage()], 500);
        }
    }




    public function getMonthlyReportSummeries(Request $request)
{
    $user = Auth::user();
    $companyId = $user->company_id;
    $year = $request->query('year', date('Y'));
 
    try {
        // Get monthly work summary data
        $monthlyWork = DB::table('work_log_summaries')
            ->where('company_id', $companyId)
            ->whereYear('date', $year)
            ->selectRaw('MONTH(`date`) as month, SUM(grand_total) as total')
            ->groupBy(DB::raw('MONTH(`date`)'))
            ->get()
            ->keyBy('month');
 
        // Get monthly expense data
        $monthlyExpenses = ExpenseSummary::where('company_id', $companyId)
            ->whereYear('expense_date', $year)
            ->selectRaw('MONTH(expense_date) as month, SUM(total_expense) as total')
            ->groupBy(DB::raw('MONTH(expense_date)'))
            ->get()
            ->keyBy('month');
 
        // Initialize arrays for 12 months
        $workData = array_fill(0, 12, 0);
        $expenseData = array_fill(0, 12, 0);
        $PLdata = array_fill(0, 12, 0);
 
        // Fill work data
        foreach ($monthlyWork as $month => $data) {
            $workData[$month - 1] = floatval($data->total);
        }
 
        // Fill expense data
        foreach ($monthlyExpenses as $month => $data) {
            $expenseData[$month - 1] = floatval($data->total);
        }
 
        // Calculate P&L
        for ($i = 0; $i < 12; $i++) {
            $PLdata[$i] = $workData[$i] - $expenseData[$i];
        }
 
        $result = [
    'success' => true,
    'year' => $year,
    // 👇 keep the same key names expected by frontend
    'monthlySales' => $workData,   // actually work summary
    'monthlyExpense' => $expenseData,
    'monthlyPandL' => $PLdata,
    'totals' => [
        'totalSales' => array_sum($workData), // work total
        'totalExpenses' => array_sum($expenseData),
        'totalPL' => array_sum($PLdata),
    ]
];
 
        return response()->json($result);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Monthly summary report failed: ' . $e->getMessage()], 500);
    }
}
 




public function update(Request $request, $id)
{
    $user = auth()->user();

    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    if (!$user->company_id) {
        return response()->json(['message' => 'Company ID missing for this user'], 422);
    }

    $userId    = $user->id;
    $companyId = $user->company_id;


    // ✅ Step 2: Find the existing record
    $drillingRecord = DrillingRecord::where('company_id', $companyId)->findOrFail($id);

    // ✅ Step 3: Update drilling record
    $drillingRecord->update([
        'project_id'     => $request->project_id ?? $drillingRecord->project_id,
        'date'           => $request->date ?? $drillingRecord->date,
        'oprator_helper' => $request->oprator_helper ?? $drillingRecord->oprator_helper,
    ]);

    // ✅ Step 4: Restore old diesel to Machinery before deleting old readings
    $oldMachineReadings = MachineReading::where('drilling_record_id', $drillingRecord->id)->get();
    foreach ($oldMachineReadings as $oldReading) {
        $oldDiesel = floatval($oldReading->diesel_used ?? 0);
        if ($oldReading->machine_id && $oldDiesel > 0) {
            Machinery::where('id', $oldReading->machine_id)
                ->where('company_id', $companyId)
                ->increment('diesel_balance', $oldDiesel);
        }
    }

    $oldCompressorReadings = CompressorRPM::where('drilling_record_id', $drillingRecord->id)->get();
    foreach ($oldCompressorReadings as $oldRpm) {
        $oldDiesel = floatval($oldRpm->diesel_used ?? 0);
        if ($oldRpm->machine_id && $oldDiesel > 0) {
            Machinery::where('id', $oldRpm->machine_id)
                ->where('company_id', $companyId)
                ->increment('diesel_balance', $oldDiesel);
        }
    }

    // Delete old relations
    MachineReading::where('drilling_record_id', $drillingRecord->id)->delete();
    WorkPointDetail::where('drilling_record_id', $drillingRecord->id)->delete();
    SurveyDetail::where('drilling_record_id', $drillingRecord->id)->delete();
    CompressorRPM::where('drilling_record_id', $drillingRecord->id)->delete();

    // Initialize totals for WorkLogSummary
    $totalWorkPoints = 0;
    $totalSurveys = 0;

    // ✅ Step 5: Insert Machine Reading entries & deduct diesel
    if ($request->has('machineReading') && is_array($request->machineReading)) {
        foreach ($request->machineReading as $reading) {
            MachineReading::create([
                'company_id'         => $companyId,
                'drilling_record_id' => $drillingRecord->id,
                'oprator_id'         => $reading['oprator_id'] ?? null,
                'project_id'         => $request->project_id ?? null,
                'user_id'            => $userId,
                'machine_id'         => $reading['machine_id'] ?? null,
                'machine_start'      => $reading['machine_start'] ?? null,
                'machine_end'        => $reading['machine_end'] ?? null,
                'actual_machine_hr'  => $reading['actual_machine_hr'] ?? null,
                'diesel_used'        => $reading['diesel_used'] ?? null,
                'diesel_balance'     => $reading['diesel_balance'] ?? null,
            ]);

            // 🔥 Deduct diesel_used from Machinery.diesel_balance
            $dieselUsed = floatval($reading['diesel_used'] ?? 0);
            $machineId  = $reading['machine_id'] ?? null;
            if ($machineId && $dieselUsed > 0) {
                Machinery::where('id', $machineId)
                    ->where('company_id', $companyId)
                    ->decrement('diesel_balance', $dieselUsed);
            }
        }
    }

    // ✅ Step 6: Insert Compressor RPM entries & deduct diesel
    if ($request->has('compressor_rpm') && is_array($request->compressor_rpm)) {
        foreach ($request->compressor_rpm as $rpm) {
            CompressorRpm::create([
                'company_id'         => $companyId,
                'drilling_record_id' => $drillingRecord->id,
                'oprator_id'         => $rpm['oprator_id'] ?? null,
                'project_id'         => $request->project_id ?? null,
                'user_id'            => $userId,
                'machine_id'         => $rpm['machine_id'] ?? null,
                'comp_rpm_start'     => $rpm['comp_rpm_start'] ?? null,
                'comp_rpm_end'       => $rpm['comp_rpm_end'] ?? null,
                'com_actul_hr'       => $rpm['com_actul_hr'] ?? null,
                'diesel_used'        => $rpm['diesel_used'] ?? null,
                'diesel_balance'     => $rpm['diesel_balance'] ?? null,
            ]);

            // 🔥 Deduct diesel_used from Machinery.diesel_balance
            $dieselUsed = floatval($rpm['diesel_used'] ?? 0);
            $machineId  = $rpm['machine_id'] ?? null;
            if ($machineId && $dieselUsed > 0) {
                Machinery::where('id', $machineId)
                    ->where('company_id', $companyId)
                    ->decrement('diesel_balance', $dieselUsed);
            }
        }
    }

    // ✅ Step 6: Insert Work Points
    if ($request->has('work_points') && is_array($request->work_points)) {
        foreach ($request->work_points as $workPoint) {
            $totalWorkPoints += $workPoint['total'] ?? 0;

            WorkPointDetail::create([
                'company_id'         => $companyId,
                'project_id'         => $request->project_id ?? null,
                'drilling_record_id' => $drillingRecord->id,
                'work_type'          => $workPoint['work_type'] ?? null,
                'work_point'         => $workPoint['work_point'] ?? null,
                'uom'                => $workPoint['uom'] ?? null,
                'rate'               => $workPoint['rate'] ?? null,
                'total'              => $workPoint['total'] ?? null,
                'diesel'             => $workPoint['diesel'] ?? null,
                'hrs'                => $workPoint['hrs'] ?? null,
                'operator_id'        => $workPoint['operator_id'] ?? null,
            ]);
        }
    }

    // ✅ Step 7: Insert Surveys
    if ($request->has('surveys') && is_array($request->surveys)) {
        foreach ($request->surveys as $survey) {
            $totalSurveys += $survey['total'] ?? 0;

            SurveyDetail::create([
                'company_id'         => $companyId,
                'project_id'         => $request->project_id ?? null,
                'drilling_record_id' => $drillingRecord->id,
                'survey_type'        => $survey['survey_type'] ?? null,
                'survey_point'       => $survey['survey_point'] ?? null,
                'uom'                => $survey['uom'] ?? null,
                'rate'               => $survey['rate'] ?? null,
                'total'              => $survey['total'] ?? null,
                'diesel'             => $survey['diesel'] ?? null,
                'hrs'                => $survey['hrs'] ?? null,
                'operator_id'        => $survey['operator_id'] ?? null,
            ]);
        }
    }

    // ✅ Step 8: Update Work Log Summary
    $logDate    = $request->date ?? $drillingRecord->date ?? now()->toDateString();
    $projectId  = $request->project_id ?? null;
    $grandTotal = $totalWorkPoints + $totalSurveys;

    $summary = WorkLogSummary::firstOrNew([
        'date'       => $logDate,
        'company_id' => $companyId,
        'project_id' => $projectId,
    ]);

    // 🔄 Recalculate instead of increment
    $summary->grand_total = $grandTotal;
    $summary->count = DrillingRecord::where('company_id', $companyId)
        ->where('project_id', $projectId)
        ->whereDate('date', $logDate)
        ->count();
    $summary->save();

    // ✅ Step 9: Return
    return response()->json([
        'message' => 'Drilling record and related data updated successfully!',
        'data'    => $drillingRecord->load('workPoints', 'surveys', 'machineReading','compressorRpm'),
        'summary' => $summary
    ], 200);
}







public function getById($id)
{
    $record = DrillingRecord::with(['machineReading', 'workPoints', 'surveys', 'project','compressorRpm', 'uses_raw_material.material:id,name'])
                ->where('company_id', auth()->user()->company_id) // optional filter
                ->findOrFail($id);

    return response()->json([
        'message' => 'Record fetched successfully!',
        'data'    => $record
    ], 200);
}



public function destroy($id)
{
    $user = auth()->user();

    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    $companyId = $user->company_id;

    // ✅ Find the drilling record
    $record = DrillingRecord::where('company_id', $companyId)
        ->where('id', $id)
        ->first();

    if (!$record) {
        return response()->json(['message' => 'Record not found'], 404);
    }

    // ✅ Transaction for safe delete
    DB::beginTransaction();

    try {
        // 1️⃣ Delete Machine Readings
        MachineReading::where('drilling_record_id', $record->id)->delete();

        //  Delete Composser RMP Readings
        compressorRpm::where('drilling_record_id', $record->id)->delete();

        // 2️⃣ Delete Work Points
        $workPointsTotal = WorkPointDetail::where('drilling_record_id', $record->id)
            ->sum('total');
        WorkPointDetail::where('drilling_record_id', $record->id)->delete();

        // 3️⃣ Delete Surveys
        $surveyTotal = SurveyDetail::where('drilling_record_id', $record->id)
            ->sum('total');
        SurveyDetail::where('drilling_record_id', $record->id)->delete();

        // 4️⃣ Update Work Log Summary (decrement totals)
        $summary = WorkLogSummary::where('date', $record->date)
            ->where('company_id', $companyId)
            ->where('project_id', $record->project_id)
            ->first();

        if ($summary) {
            $summary->grand_total -= ($workPointsTotal + $surveyTotal);
            $summary->count = max(0, $summary->count - 1);

            // if everything becomes zero you can decide to delete or keep
            if ($summary->grand_total <= 0 && $summary->count <= 0) {
                $summary->delete();
            } else {
                $summary->save();
            }
        }

        // 5️⃣ Finally delete the drilling record itself
        $record->delete();

        DB::commit();

        return response()->json([
            'message' => 'Drilling record and all related data deleted successfully.',
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Failed to delete record.',
            'error'   => $e->getMessage(),
        ], 500);
    }
}

















// public function getProjectSummary(Request $request)
// {
//     $today = Carbon::today();

//     $start = Carbon::parse($request->input('start_date', $today))->startOfDay();
//     $end   = Carbon::parse($request->input('end_date',   $today))->endOfDay();

//     $projectId   = $request->input('project_id');
//     $projectType = $request->input('project_type');

//     // ── Fetch projects that have activity in period ───────────────────────────────
//     $projectIdsQuery = DrillingRecord::query()
//         ->whereBetween('date', [$start, $end])
//         ->select('project_id')
//         ->distinct();

//     if ($projectId)   $projectIdsQuery->where('project_id', $projectId);
//     if ($projectType) $projectIdsQuery->whereHas('project', fn($q) => $q->where('type', $projectType));

//     $projectIds = $projectIdsQuery->pluck('project_id')->unique();

//     // Also include projects with orders or proforma in period (union)
//     $projectIds = $projectIds->merge(
//         Order::whereBetween('invoice_date', [$start, $end])
//             ->when($projectId,   fn($q) => $q->where('project_id', $projectId))
//             ->when($projectType, fn($q) => $q->whereHas('project', fn($qq) => $qq->where('type', $projectType)))
//             ->pluck('project_id')
//     )->merge(
//         ProformaInvoice::whereBetween('invoice_date', [$start, $end])
//             ->when($projectId,   fn($q) => $q->where('project_id', $projectId))
//             ->when($projectType, fn($q) => $q->whereHas('project', fn($qq) => $qq->where('type', $projectType)))
//             ->pluck('project_id')
//     )->unique();

//     if ($projectIds->isEmpty()) {
//         return response()->json([
//             'status' => 'success',
//             'date_range' => ['start' => $start->toDateString(), 'end' => $end->toDateString()],
//             'filters' => compact('projectId', 'projectType'),
//             'projects' => [],
//             'message' => 'No activity found in selected period'
//         ]);
//     }

//     // ── Load detailed data ────────────────────────────────────────────────────────
//     $projects = Project::with([
//         'drillingRecords' => fn($q) => $q
//             ->whereBetween('date', [$start, $end])
//             ->with([
//                 'surveys',           // surveyDetail
//                 'workPoints',        // workPointDetail
//                 'compressorRpm',
//                 'machineReading.operator'  // if you want operator name etc.
//             ])
//             ->orderBy('date'),
//     ])->with([
//         'orders' => fn($q) => $q
//             ->whereBetween('invoice_date', [$start, $end])  // adjust date field if needed
//             ->with('items'),
//     ])->with([
//         'proformaInvoices' => fn($q) => $q
//             ->whereBetween('invoice_date', [$start, $end])
//             ->with(['details', 'incomes'])
//             ->orderBy('invoice_date', 'desc'),
//     ])->whereIn('id', $projectIds)
//       ->get();

//     $result = $projects->map(function ($project) {
//         return [
//             'project_id'       => $project->id,
//             'project_name'     => $project->project_name ?? $project->name ?? 'Unknown',
//             'project_type'     => $project->project_type?->name ?? $project->type ?? null,

//             // Optional summary (you can calculate if needed)
//             'summary' => [
//                 'drilling_days'      => $project->drillingRecords->count(),
//                 'total_work_points'  => $project->drillingRecords->sum(fn($r) => $r->workPoints->sum('total')),
//                 'total_survey'       => $project->drillingRecords->sum(fn($r) => $r->surveys->sum('total')),
//                 'order_count'        => $project->orders->count(),
//                 'proforma_count'     => $project->proformaInvoices->count(),
//             ],

//             'drilling_records'   => $project->drillingRecords->map(fn($record) => $record->toArray())->all(),
//             'orders'             => $project->orders->map(fn($order) => $order->toArray())->all(),
//             'proforma_invoices'  => $project->proformaInvoices->map(fn($pi) => $pi->toArray())->all(),
//         ];
//     })->values();

//     return response()->json([
//         'status'       => 'success',
//         'date_range'   => ['start' => $start->toDateString(), 'end' => $end->toDateString()],
//         'filters'      => compact('projectId', 'projectType'),
//         'projects'     => $result,
//         'total_projects' => $result->count(),
//     ]);
// }



public function getProjectSummary(Request $request)
{
    $today = Carbon::today();

    // ============================
    // Date Filter (Only for Drilling)
    // ============================

    $start = Carbon::parse($request->input('start_date', $today))->startOfDay();
    $end   = Carbon::parse($request->input('end_date',   $today))->endOfDay();

    // ============================
    // Filters
    // ============================

    $projectId   = $request->input('project_id');
    $projectType = $request->input('project_type');


    // ====================================================
    // Main Project Query
    // ====================================================

    $projects = Project::query()

        // Project Filter
        ->when($projectId, function ($q) use ($projectId) {
            $q->where('id', $projectId);
        })

        // Project Type Filter
        ->when($projectType, function ($q) use ($projectType) {
            $q->where('type', $projectType);
        })


        // ===================== DRILLING (DATE WISE) =====================
        ->with([
            'drillingRecords' => function ($q) use ($start, $end) {

                $q->whereBetween('date', [$start, $end])

                  ->with([
                      'surveys',
                      'workPoints',
                      'compressorRpm',
                      'machineReading.operator'
                  ])

                  ->orderBy('date', 'asc');
            }
        ])


        // ===================== ORDERS (PROJECT WISE) =====================
        ->with([
            'orders' => function ($q) {

                $q->with('items')

                  ->orderBy('invoiceDate', 'desc');
            }
        ])


        // ===================== PROFORMA (PROJECT WISE) =====================
        ->with([
            'proformaInvoices' => function ($q) {

                $q->with([
                    'details',
                    'incomes'
                ])

                ->orderBy('invoice_date', 'desc');
            }
        ])


        // ===================== INCOME (PROJECT WISE) =====================
        ->with([
            'incomes' => function ($q) {

                $q->orderBy('payment_date', 'desc');
            }
        ])


        // ===================== INCOME SUMMARY (PROJECT WISE) =====================
        ->with([
            'incomeSummary'
        ])


        ->get();


    // ====================================================
    // No Data Found
    // ====================================================

    if ($projects->isEmpty()) {

        return response()->json([

            'status' => 'success',

            'date_range' => [
                'start' => $start->toDateString(),
                'end'   => $end->toDateString()
            ],

            'filters' => compact('projectId', 'projectType'),

            'projects' => [],

            'message' => 'No data found'

        ]);
    }


    // ====================================================
    // Format Response
    // ====================================================

    $result = $projects->map(function ($project) {

        // -------------------------------
        // Payment Calculation
        // -------------------------------

        $totalReceived = $project->incomes->sum('amount');
        $totalPending  = $project->incomes->sum('pending_amount');
        $balance       = $totalPending;


        // -------------------------------
        // Work Calculation (From Drilling)
        // -------------------------------

        $totalWork = $project->drillingRecords
            ->flatMap(fn($r) => $r->workPoints)
            ->sum('total');


        // -------------------------------
        // Order Total
        // -------------------------------

        $totalOrderAmount = $project->orders->sum('total_amount');


        // -------------------------------
        // Proforma Total
        // -------------------------------

        $totalProformaAmount = $project->proformaInvoices->sum('total_amount');


        return [

            // ================= BASIC =================

            'project_id'   => $project->id,
            'project_name' => $project->project_name ?? $project->name,
            'project_type' => $project->type ?? null,


            // ================= SUMMARY =================

            'summary' => [

                'total_work_done'   => $totalWork,

                'order_total'       => $totalOrderAmount,
                'proforma_total'    => $totalProformaAmount,

                'payment_received' => $totalReceived,
                'payment_pending'  => $totalPending,
                'balance'          => $balance,

                'drilling_days'     => $project->drillingRecords->count(),
                'order_count'       => $project->orders->count(),
                'proforma_count'    => $project->proformaInvoices->count(),
            ],


            // ================= FULL DATA =================

            'drilling_records'  => $project->drillingRecords,

            'orders'            => $project->orders,

            'proforma_invoices' => $project->proformaInvoices,

            'incomes'           => $project->incomes,

            'income_summary'    => $project->incomeSummary,
        ];
    });


    // ====================================================
    // Final Response
    // ====================================================

    return response()->json([

        'status' => 'success',

        'date_range' => [
            'start' => $start->toDateString(),
            'end'   => $end->toDateString()
        ],

        'filters' => compact('projectId', 'projectType'),

        'total_projects' => $result->count(),

        'projects' => $result

    ]);
}



    /**
     * Work Type Report — aggregates Work Details + Survey Details by type
     */
    public function workTypeReport(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $companyId = $user->company_id;
        $fromDate  = $request->query('from_date', now()->startOfMonth()->toDateString());
        $toDate    = $request->query('to_date', now()->endOfMonth()->toDateString());

        // Query Work Point Details joined with drilling_records for date filter
        $workData = DB::table('work_point_details')
            ->join('drilling_records', 'work_point_details.drilling_record_id', '=', 'drilling_records.id')
            ->where('work_point_details.company_id', $companyId)
            ->whereBetween('drilling_records.date', [$fromDate, $toDate])
            ->select(
                'work_point_details.work_type as type_name',
                'work_point_details.uom',
                DB::raw('SUM(CAST(work_point_details.work_point AS DECIMAL(10,2))) as done'),
                DB::raw('SUM(CAST(work_point_details.hrs AS DECIMAL(10,2))) as hrs'),
                DB::raw('SUM(CAST(work_point_details.diesel AS DECIMAL(10,2))) as fuel')
            )
            ->groupBy('work_point_details.work_type', 'work_point_details.uom')
            ->get();

        // Query Survey Details joined with drilling_records for date filter
        $surveyData = DB::table('survey_details')
            ->join('drilling_records', 'survey_details.drilling_record_id', '=', 'drilling_records.id')
            ->where('survey_details.company_id', $companyId)
            ->whereBetween('drilling_records.date', [$fromDate, $toDate])
            ->select(
                'survey_details.survey_type as type_name',
                'survey_details.uom',
                DB::raw('SUM(CAST(survey_details.survey_point AS DECIMAL(10,2))) as done'),
                DB::raw('SUM(CAST(survey_details.hrs AS DECIMAL(10,2))) as hrs'),
                DB::raw('SUM(CAST(survey_details.diesel AS DECIMAL(10,2))) as fuel')
            )
            ->groupBy('survey_details.survey_type', 'survey_details.uom')
            ->get();

        // Merge both datasets by type_name
        $merged = [];

        foreach ($workData as $row) {
            $key = $row->type_name;
            if (!isset($merged[$key])) {
                $merged[$key] = ['type_name' => $row->type_name, 'uom' => $row->uom, 'done' => 0, 'hrs' => 0, 'fuel' => 0];
            }
            $merged[$key]['done'] += floatval($row->done);
            $merged[$key]['hrs']  += floatval($row->hrs);
            $merged[$key]['fuel'] += floatval($row->fuel);
        }

        foreach ($surveyData as $row) {
            $key = $row->type_name;
            if (!isset($merged[$key])) {
                $merged[$key] = ['type_name' => $row->type_name, 'uom' => $row->uom, 'done' => 0, 'hrs' => 0, 'fuel' => 0];
            }
            $merged[$key]['done'] += floatval($row->done);
            $merged[$key]['hrs']  += floatval($row->hrs);
            $merged[$key]['fuel'] += floatval($row->fuel);
        }

        // Calculate derived values
        $result = [];
        foreach ($merged as $item) {
            $workPerHr = ($item['hrs'] > 0) ? round($item['done'] / $item['hrs'], 2) : 0;
            $workPerL  = ($item['fuel'] > 0) ? round($item['done'] / $item['fuel'], 2) : 0;

            $result[] = [
                'type_name'  => $item['type_name'],
                'uom'        => $item['uom'],
                'done'       => round($item['done'], 2),
                'hrs'        => round($item['hrs'], 2),
                'fuel'       => round($item['fuel'], 2),
                'work_per_hr' => $workPerHr,
                'work_per_l'  => $workPerL,
            ];
        }

        return response()->json([
            'data'      => $result,
            'from_date' => $fromDate,
            'to_date'   => $toDate,
        ]);
    }

    /**
     * Multi-Site Breakdown Report — groups by project location, then by work type
     */
    public function multiSiteReport(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $companyId = $user->company_id;
        $date = $request->query('date', now()->toDateString());

        // Work Data
        $workData = DB::table('work_point_details')
            ->join('drilling_records', 'work_point_details.drilling_record_id', '=', 'drilling_records.id')
            ->leftJoin('projects', 'work_point_details.project_id', '=', 'projects.id')
            ->where('work_point_details.company_id', $companyId)
            ->whereDate('drilling_records.date', $date)
            ->select(
                'projects.id as project_id',
                'projects.project_name',
                'projects.customer_name',
                'work_point_details.work_type as type_name',
                'work_point_details.uom',
                DB::raw('SUM(CAST(work_point_details.work_point AS DECIMAL(10,2))) as done'),
                DB::raw('SUM(CAST(work_point_details.hrs AS DECIMAL(10,2))) as hrs'),
                DB::raw('SUM(CAST(work_point_details.diesel AS DECIMAL(10,2))) as fuel')
            )
            ->groupBy('projects.id', 'projects.project_name', 'projects.customer_name', 'work_point_details.work_type', 'work_point_details.uom')
            ->get();

        // Survey Data
        $surveyData = DB::table('survey_details')
            ->join('drilling_records', 'survey_details.drilling_record_id', '=', 'drilling_records.id')
            ->leftJoin('projects', 'survey_details.project_id', '=', 'projects.id')
            ->where('survey_details.company_id', $companyId)
            ->whereDate('drilling_records.date', $date)
            ->select(
                'projects.id as project_id',
                'projects.project_name',
                'projects.customer_name',
                'survey_details.survey_type as type_name',
                'survey_details.uom',
                DB::raw('SUM(CAST(survey_details.survey_point AS DECIMAL(10,2))) as done'),
                DB::raw('SUM(CAST(survey_details.hrs AS DECIMAL(10,2))) as hrs'),
                DB::raw('SUM(CAST(survey_details.diesel AS DECIMAL(10,2))) as fuel')
            )
            ->groupBy('projects.id', 'projects.project_name', 'projects.customer_name', 'survey_details.survey_type', 'survey_details.uom')
            ->get();

        // Grouping by Project Location
        $sites = [];

        $processData = function($data) use (&$sites) {
            foreach ($data as $row) {
                $siteKey = $row->project_id ? $row->project_id : 'unassigned';
                $siteName = $row->project_name ? $row->project_name . ($row->customer_name ? ' - ' . $row->customer_name : '') : 'Unassigned Project';
                
                if (!isset($sites[$siteKey])) {
                    $sites[$siteKey] = [
                        'project_id'   => $row->project_id,
                        'project_name' => $siteName,
                        'total_done'   => 0,
                        'total_hrs'    => 0,
                        'total_fuel'   => 0,
                        'avg_yield'    => 0,
                        'work_types'   => []
                    ];
                }

                $typeKey = $row->type_name;
                if (!isset($sites[$siteKey]['work_types'][$typeKey])) {
                    $sites[$siteKey]['work_types'][$typeKey] = [
                        'type_name' => $row->type_name,
                        'uom'       => $row->uom,
                        'done'      => 0,
                        'hrs'       => 0,
                        'fuel'      => 0,
                    ];
                }

                $sites[$siteKey]['work_types'][$typeKey]['done'] += floatval($row->done);
                $sites[$siteKey]['work_types'][$typeKey]['hrs']  += floatval($row->hrs);
                $sites[$siteKey]['work_types'][$typeKey]['fuel'] += floatval($row->fuel);
                
                $sites[$siteKey]['total_done'] += floatval($row->done);
                $sites[$siteKey]['total_hrs']  += floatval($row->hrs);
                $sites[$siteKey]['total_fuel'] += floatval($row->fuel);
            }
        };

        $processData($workData);
        $processData($surveyData);

        // Calculate derived fields
        $result = [];
        foreach ($sites as $site) {
            $site['avg_yield'] = ($site['total_hrs'] > 0) ? round($site['total_done'] / $site['total_hrs'], 2) : 0;
            
            $processedTypes = [];
            foreach ($site['work_types'] as $type) {
                $workPerHr = ($type['hrs'] > 0) ? round($type['done'] / $type['hrs'], 2) : 0;
                $workPerL  = ($type['fuel'] > 0) ? round($type['done'] / $type['fuel'], 2) : 0;

                $processedTypes[] = [
                    'type_name'   => $type['type_name'],
                    'uom'         => $type['uom'],
                    'done'        => round($type['done'], 2),
                    'hrs'         => round($type['hrs'], 2),
                    'fuel'        => round($type['fuel'], 2),
                    'work_per_hr' => $workPerHr,
                    'work_per_l'  => $workPerL,
                ];
            }
            $site['work_types'] = $processedTypes;

            // Round site totals
            $site['total_done'] = round($site['total_done'], 2);
            $site['total_hrs']  = round($site['total_hrs'], 2);
            $site['total_fuel'] = round($site['total_fuel'], 2);

            $result[] = $site;
        }

        return response()->json([
            'data' => $result,
            'date' => $date,
        ]);
    }
}