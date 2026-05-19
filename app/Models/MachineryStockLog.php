<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MachineryStockLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'machinery_stock_item_id',
        'type',           // 'issued' | 'usage' | 'transfer-out'
        'quantity',
        'remaining_after',  // DB column is remaining_after
        'remarks',
        'created_by',
        'log_date',
    ];

    // ── Relationships ──────────────────────────────────────

    public function stockItem()
    {
        return $this->belongsTo(MachineryStockItem::class, 'machinery_stock_item_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}