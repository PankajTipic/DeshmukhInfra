<?php

namespace App\Http\Controllers;

use App\Models\InternalMoneyTransfer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InternalMoneyTransferController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Authentication required'], 401);
            }

            $query = InternalMoneyTransfer::with('project:id,project_name')
                ->where('company_id', $user->company_id)
                ->orderBy('transfer_date', 'desc')
                ->orderBy('created_at', 'desc');

            if ($request->has('start_date')) {
                $query->where('transfer_date', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->where('transfer_date', '<=', $request->end_date);
            }

            if ($request->has('account')) {
                $account = $request->account;
                $query->where(function($q) use ($account) {
                    $q->where('from_account', $account)
                      ->orWhere('to_account', $account);
                });
            }

            if ($request->has('project_id')) {
                $query->where('project_id', $request->project_id);
            }

            $transfers = $query->get();

            return response()->json($transfers);

        } catch (\Exception $e) {
            Log::error("Error fetching internal money transfers: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch internal money transfers',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'from_account' => 'required|string|max:255',
            'to_account' => 'required|string|max:255|different:from_account',
            'amount' => 'required|numeric|min:0.01',
            'transfer_date' => 'required|date',
            'project_id' => 'nullable|exists:projects,id',
            'description' => 'nullable|string|max:1000',
            'reference_number' => 'nullable|string|max:255',
        ]);

        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Authentication required'], 401);
            }

            DB::beginTransaction();

            $transfer = InternalMoneyTransfer::create([
                'company_id' => $user->company_id,
                'project_id' => $request->project_id,
                'from_account' => $request->from_account,
                'to_account' => $request->to_account,
                'amount' => $request->amount,
                'transfer_date' => $request->transfer_date,
                'description' => $request->description,
                'reference_number' => $request->reference_number,
            ]);

            // Load project relationship
            $transfer->load('project:id,project_name');

            DB::commit();

            Log::info("Internal money transfer created. ID: {$transfer->id}, From: {$transfer->from_account}, To: {$transfer->to_account}, Amount: {$transfer->amount}");

            return response()->json([
                'message' => 'Internal money transfer recorded successfully',
                'transfer' => $transfer
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error creating internal money transfer: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to record internal money transfer',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'from_account' => 'required|string|max:255',
            'to_account' => 'required|string|max:255|different:from_account',
            'amount' => 'required|numeric|min:0.01',
            'transfer_date' => 'required|date',
            'project_id' => 'nullable|exists:projects,id',
            'description' => 'nullable|string|max:1000',
            'reference_number' => 'nullable|string|max:255',
        ]);

        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Authentication required'], 401);
            }

            DB::beginTransaction();

            $transfer = InternalMoneyTransfer::where('company_id', $user->company_id)
                ->findOrFail($id);

            $transfer->update([
                'project_id' => $request->project_id,
                'from_account' => $request->from_account,
                'to_account' => $request->to_account,
                'amount' => $request->amount,
                'transfer_date' => $request->transfer_date,
                'description' => $request->description,
                'reference_number' => $request->reference_number,
            ]);

            // Load project relationship
            $transfer->load('project:id,project_name');

            DB::commit();

            Log::info("Internal money transfer updated. ID: {$transfer->id}");

            return response()->json([
                'message' => 'Internal money transfer updated successfully',
                'transfer' => $transfer
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error updating internal money transfer ID $id: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update internal money transfer',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Authentication required'], 401);
            }

            $transfer = InternalMoneyTransfer::where('company_id', $user->company_id)
                ->findOrFail($id);

            $transfer->delete();

            Log::info("Internal money transfer deleted. ID: {$transfer->id}");

            return response()->json([
                'message' => 'Internal money transfer deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error("Error deleting internal money transfer ID $id: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to delete internal money transfer',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Authentication required'], 401);
            }

            $transfers = InternalMoneyTransfer::with('project:id,project_name')
                ->where('company_id', $user->company_id)
                ->whereBetween('transfer_date', [$request->start_date, $request->end_date])
                ->orderBy('transfer_date', 'asc')
                ->orderBy('created_at', 'asc')
                ->get();

            $filename = "internal_money_transfers_" . 
                        Carbon::parse($request->start_date)->format('Y-m-d') . "_to_" . 
                        Carbon::parse($request->end_date)->format('Y-m-d') . ".csv";

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
            ];

            $callback = function() use ($transfers) {
                $file = fopen('php://output', 'w');
                
                fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
                
                fputcsv($file, [
                    'Transfer Date',
                    'Project Name',
                    'From Account',
                    'To Account',
                    'Amount (₹)',
                    'Reference Number',
                    'Description',
                    'Created At'
                ]);

                foreach ($transfers as $transfer) {
                    fputcsv($file, [
                        Carbon::parse($transfer->transfer_date)->format('d-M-Y'),
                        $transfer->project ? $transfer->project->project_name : '-',
                        $transfer->from_account,
                        $transfer->to_account,
                        number_format($transfer->amount, 2),
                        $transfer->reference_number ?? '-',
                        $transfer->description ?? '-',
                        Carbon::parse($transfer->created_at)->format('d-M-Y H:i:s'),
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            Log::error("Error downloading internal money transfers report: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to download report',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function accountSummary(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Authentication required'], 401);
            }

            $query = InternalMoneyTransfer::where('company_id', $user->company_id);

            if ($request->has('start_date')) {
                $query->where('transfer_date', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->where('transfer_date', '<=', $request->end_date);
            }

            $transfers = $query->get();

            $accountSummary = [];
            
            foreach ($transfers as $transfer) {
                if (!isset($accountSummary[$transfer->from_account])) {
                    $accountSummary[$transfer->from_account] = [
                        'account' => $transfer->from_account,
                        'total_out' => 0,
                        'total_in' => 0,
                        'net' => 0
                    ];
                }
                $accountSummary[$transfer->from_account]['total_out'] += $transfer->amount;

                if (!isset($accountSummary[$transfer->to_account])) {
                    $accountSummary[$transfer->to_account] = [
                        'account' => $transfer->to_account,
                        'total_out' => 0,
                        'total_in' => 0,
                        'net' => 0
                    ];
                }
                $accountSummary[$transfer->to_account]['total_in'] += $transfer->amount;
            }

            foreach ($accountSummary as $account => &$data) {
                $data['net'] = $data['total_in'] - $data['total_out'];
            }

            return response()->json([
                'summary' => array_values($accountSummary),
                'total_transfers' => $transfers->count(),
                'total_amount' => $transfers->sum('amount')
            ]);

        } catch (\Exception $e) {
            Log::error("Error fetching account summary: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch account summary',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}