<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdvancedPayment extends Model
{
    protected $fillable = [
        'order_id',
        'project_id',
        'proforma_id',
        'advanced_amount',
        'payment_date',
        'received_from',
        'payment_type',
        'senders_bank',
        'receivers_bank',
        'transaction_number',
        'remark',
    ];

    // Relationships (optional but useful)
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function proforma()
    {
        return $this->belongsTo(ProformaInvoice::class, 'proforma_id');
    }
}
