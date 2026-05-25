<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubcontractVendor extends Model
{
    use HasFactory;

    protected $table = 'subcontract_vendor';

    protected $fillable = [
        'project_id',
        'company_id',
        'order_id',
        'vendor_id',
        'total_amount',
        'paid_amount',
        'pending_amount',
    ];

    // Relationships
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function paymentLogs()
    {
        return $this->hasMany(SubcontractVendorPaymentLog::class);
    }

    // Optional: Helper to update pending amount automatically
    public function updatePendingAmount()
    {
        $this->pending_amount = $this->total_amount - $this->paid_amount;
        $this->save();
    }


    public function operator()   // or vendor() - both fine
{
    return $this->belongsTo(Operator::class, 'vendor_id', 'id');
}

}