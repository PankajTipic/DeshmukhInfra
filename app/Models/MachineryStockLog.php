<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MachineryStockLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'machinery_stock_item_id',
        'type',
        'quantity',
        'remaining_after',
        'remarks',
        'created_by',
        'log_date'
    ];

    public function stockItem()
    {
        return $this->belongsTo(MachineryStockItem::class, 'machinery_stock_item_id');
    }
}