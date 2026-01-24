<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VendorPayment extends Model
{
    protected $fillable = [
        'project_id',
        'vendor_id',
        'total_amount',
        'paid_amount',
        'balance_amount',
    ];

    public function logs()
    {
        return $this->hasMany(VendorPaymentLog::class);
    }

    public function vendor()
{
    return $this->belongsTo(Operator::class, 'vendor_id'); 
}

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

     public function onBehalfLogs()
    {
        return $this->hasMany(VendorOnBehalfPaymentLog::class);
    }
}

