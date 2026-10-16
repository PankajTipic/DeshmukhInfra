<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $table = 'purchase_order_items';

    protected $fillable = [
        'purchase_order_id',
        'item_name',
        'description',
        'hsn_code',
        'uom',
        'qty',
        'rate',
        'taxable_amount',
        'gst_percent',
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'total_amount',
        'remark',
        'sort_order',
    ];

    protected $casts = [
        'qty'            => 'decimal:2',
        'rate'           => 'decimal:2',
        'taxable_amount' => 'decimal:2',
        'gst_percent'    => 'decimal:2',
        'cgst_amount'    => 'decimal:2',
        'sgst_amount'    => 'decimal:2',
        'igst_amount'    => 'decimal:2',
        'total_amount'   => 'decimal:2',
        'sort_order'     => 'integer',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
    }
}
