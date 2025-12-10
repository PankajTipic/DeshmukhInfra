<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExpenseSummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'expense_date',
        'company_id',
        'total_expense',
        'expense_count',
        'project_id'
    ];
}

