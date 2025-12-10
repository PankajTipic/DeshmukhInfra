<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;




    class PurchesVendorPayment extends Model
{
    protected $table = 'purches_vendor_payment';

    protected $fillable = [
        'purches_vendor_id',
        'amount',
        'paid_amount',
        'balance_amount'
    ];

    public function logs()
    {
        return $this->hasMany(PurchesVendorPaymentLog::class, 'purches_vendor_payment_id');
    }

     // NEW RELATION (important)
    public function purchase()
    {
        return $this->belongsTo(PurchesVendorModel::class, 'purches_vendor_id', 'id');
    }

    public function vendor()
{
    return $this->belongsTo(PurchesVendorModel::class, 'purches_vendor_id');
}




}

