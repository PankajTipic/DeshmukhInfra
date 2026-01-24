<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorOnBehalfPaymentLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_payment_id',
        'expense_id',
        'paid_by',
        'amount',
        'payment_date',
        'payment_type',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    /**
     * Get the vendor payment that owns the log
     */
    public function vendorPayment()
    {
        return $this->belongsTo(VendorPayment::class);
    }

    /**
     * Get the associated expense
     */
    public function expense()
    {
        return $this->belongsTo(Expense::class);
    }
}