<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderSummary extends Model
{
    protected $fillable = [
        'invoice_date',
        'company_id',
        'order_count',
        'total_amount',
        'paid_amount',
    ];
}
