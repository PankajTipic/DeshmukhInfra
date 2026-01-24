<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Income extends Model
{
    use HasFactory;

    // Table name (optional if it matches the plural form)
    protected $table = 'income';

    // Mass assignable fields
    protected $fillable = [
        'project_id',
        'order_id',
        'proforma_invoice_id',
        'company_id',
        'po_no',
        'po_date',
        'invoice_no',
        'invoice_date',
        'basic_amount',
        'gst_amount',
        'billing_amount',
        'received_amount',
        'received_by',
        'senders_bank',
        'payment_type',
        'receivers_bank',
        'pending_amount',
        'remark',
        'payment_date', 
    ];

    // Cast fields for proper data types
    protected $casts = [
        'po_date' => 'date',
        'invoice_date' => 'date',
        'basic_amount' => 'decimal:2',
        'gst_amount' => 'decimal:2',
        'billing_amount' => 'decimal:2',
        'received_amount' => 'decimal:2',
        'pending_amount' => 'decimal:2',
    ];

       public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
