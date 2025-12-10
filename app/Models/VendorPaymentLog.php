<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VendorPaymentLog extends Model
{
    protected $fillable = [
        'vendor_payment_id',
        'expense_id',
        'payment_type',
        'paid_by', 
        'amount',
        'payment_date',
        'description',
    ];

    public function vendorPayment()
    {
        return $this->belongsTo(VendorPayment::class);
    }

    public function expense()
    {
        return $this->belongsTo(Expense::class, 'expense_id');
    }
}
