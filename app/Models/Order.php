<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\InvoiceRule;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'customer_id',
        'long',
        'lat',
        'finalAmount',
        'totalAmount',
        'paidAmount',
        'discount',
        'profit',
        'payLater',
        'isSettled',
        'paymentType',
        'invoiceType',
        'orderStatus',
        'deliveryDate',
        'deliveryTime',
        'invoiceDate',
        'show',
        'company_id',
        'created_by',
        'updated_by',
        'invoice_number',
        'gst','cgst','sgst','igst',
        'terms_and_conditions','payment_terms','note',
        'ref_id',
        	'po_number'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(OrderDetail::class);
    }

    protected $hidden = [
        'created_at',
        'updated_at',
    ];


    // ✅ Add this
    public function invoiceRules()
{
    return $this->hasMany(InvoiceRule::class, 'order_id');
}


}