<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PurchesVendorPayment;
use App\Models\PurchesVendorModel;

class PurchesVendorPaymentLog extends Model
{
    protected $table = 'purches_vendor_payment_log';

    protected $fillable = [
        'purches_vendor_id',
        'purches_vendor_payment_id',
        'paid_by',
        'payment_type',
        'amount',
        'payment_date',
        'description',
        'payment_file',
        'remark',
         'bank_name',
    'acc_number',
    'ifsc',
    'transaction_id'
    ];

    public function payment()
    {
        return $this->belongsTo(PurchesVendorPayment::class, 'purches_vendor_payment_id');
    }


public function purchase()
{
    return $this->belongsTo(PurchesVendorModel::class, 'purches_vendor_id', 'id');
}


  
}

