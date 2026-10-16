<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $table = 'purchase_orders';

    protected $fillable = [
        'company_id',
        'project_id',
        'vendor_id',
        'po_number',
        'po_date',
        'delivery_date',
        'reference_no',
        'tax_type',
        'subtotal',
        'discount',
        'taxable_amount',
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'total_tax',
        'round_off',
        'final_amount',
        'status',
        'payment_terms',
        'delivery_terms',
        'terms_and_conditions',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'po_date'         => 'date',
        'delivery_date'   => 'date',
        'subtotal'        => 'decimal:2',
        'discount'        => 'decimal:2',
        'taxable_amount'  => 'decimal:2',
        'cgst_amount'     => 'decimal:2',
        'sgst_amount'     => 'decimal:2',
        'igst_amount'     => 'decimal:2',
        'total_tax'       => 'decimal:2',
        'round_off'       => 'decimal:2',
        'final_amount'    => 'decimal:2',
    ];

    public function vendor()
    {
        return $this->belongsTo(Operator::class, 'vendor_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class, 'purchase_order_id')->orderBy('sort_order', 'asc')->orderBy('id', 'asc');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
