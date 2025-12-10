<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncomeSummary extends Model
{
    use HasFactory;

    // Table name (optional if it matches the plural of the model name)
    protected $table = 'income_summary';

    // Fields that are mass assignable
    protected $fillable = [
        'company_id',
        'project_id',
        'income_id', 
        'date',
        'total_amount',
        'pending_amount',
        'invoice_count'
    ];

  

    // Cast decimal fields to float with 2 decimal places
    protected $casts = [
        'date' => 'date',
        'total_amount' => 'decimal:2',
        'pending_amount' => 'decimal:2',
    ];
}
