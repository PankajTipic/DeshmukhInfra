<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubcontractVendorPaymentLog extends Model
{
    use HasFactory;

    protected $table = 'subcontract_vendor_payment_log';

    protected $fillable = [
        'subcontract_vendor_id',
        'payment_type',
        'paid_by',
        'amount',
        'payment_date',
        'description',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount'       => 'decimal:2',
    ];

    // Relationships
    public function subcontractVendor()
    {
        return $this->belongsTo(SubcontractVendor::class);
    }
}