<?php

namespace App\Http\Controllers;

use App\Models\DeadStock;
use App\Models\ProductSize;
use App\Models\Expense;
use App\Models\ExpenseType;
use App\Models\ExpenseSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DeadStockController extends Controller
{
  public function store(Request $request)
{
    $user = Auth::user();

    $validated = $request->validate([
        'product_id' => 'required|exists:products,id',
        'price' => 'required|numeric|min:0',
        'quantity' => 'required|integer|min:1',
        'expense_type_id' => 'nullable|exists:expense_types,id',
    ]);

    $total = $validated['price'] * $validated['quantity'];

    DB::transaction(function () use ($validated, $user, $total) {
        // Reduce stock
        $productSize = ProductSize::where('product_id', $validated['product_id'])->firstOrFail();

        if ($productSize->stock < $validated['quantity']) {
            throw new \Exception('Not enough stock to deduct.');
        }

        $productSize->stock -= $validated['quantity'];
        $productSize->save();

        // Create dead stock record
        $deadStock = DeadStock::create([
            'product_id' => $validated['product_id'],
            'company_id' => $user->company_id,
            'deduction_date' => Carbon::today()->format('Y-m-d'),
            'price' => $validated['price'],
            'quantity' => $validated['quantity'],
            'total_value' => $total,
        ]);

        // Get product details
        $product = $productSize->product;
        $expenseName = "Dead product: " . $product->name;
        $expenseDate = Carbon::today()->format('Y-m-d');

        // 🔁 Get expense_type_id dynamically if not provided
        $expenseTypeId = $validated['expense_type_id'] ?? ExpenseType::where('name', 'Dead Stock')
            ->where('company_id', $user->company_id)
            ->value('id');

        // Create expense entry
        $expense = Expense::create([
            'name' => $expenseName,
            'expense_date' => $expenseDate,
            'price' => $validated['price'],
            'qty' => $validated['quantity'],
            'total_price' => $total,
            'expense_id' => $expenseTypeId,
            'show' => true,
            'company_id' => $user->company_id,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        // Update expense summary
        ExpenseSummary::updateOrCreate(
            [
                'expense_date' => $expenseDate,
                'company_id' => $user->company_id,
            ],
            [
                'total_expense' => DB::raw('total_expense + ' . $total),
                'expense_count' => DB::raw('expense_count + 1'),
            ]
        );
    });

    return response()->json(['message' => 'Dead stock recorded and expense created successfully']);
}

    // Optional: List records
    public function index()
    {
        return DeadStock::with(['product', 'company'])->latest()->get();
    }
}