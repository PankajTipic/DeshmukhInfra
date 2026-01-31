<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    use HasFactory;
    protected $fillable=[
        'order_id',
        'work_type',
        'uom',
        'qty',
        'price',
        'total_price',
        'remark',
        'work_sub_description',
        'gst_percent',
'cgst_amount',
'sgst_amount'

    ];

    protected $casts = [
        'qty'           => 'decimal:2',
        'price'         => 'decimal:2',
        'total_price'   => 'decimal:2',
        'gst_percent'   => 'decimal:2',
        'cgst_amount'   => 'decimal:2',
        'sgst_amount'   => 'decimal:2',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = [
        'created_at',
        'updated_at',
    ];
}