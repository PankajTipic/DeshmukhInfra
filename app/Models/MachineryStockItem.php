<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MachineryStockItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'machinery_stock_update_id',
        'stock_name',
        'issued_qty',
        'used_qty',
        'remaining_qty',
        'remarks'
    ];

    public function stockUpdate()
    {
        return $this->belongsTo(MachineryStockUpdate::class, 'machinery_stock_update_id');
    }

    public function machineryStockUpdate()
{
    return $this->belongsTo(
        MachineryStockUpdate::class,
        'machinery_stock_update_id',
        'id'
    );
}
}