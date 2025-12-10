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
        'gst_percent',
'cgst_amount',
'sgst_amount'

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