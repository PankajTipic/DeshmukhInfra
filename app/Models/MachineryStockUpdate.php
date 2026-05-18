<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MachineryStockUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
         'company_id','sr_no', 'project_id', 'machine_id', 'hrs', 'update_date',
        'maintenance_date', 'hammer', 'stock_details', 'tamplet',
        'capping', 'damage_part', 'bit', 'used_bit', 'oil_bal',
        'supervisor_id', 'remarks', 'created_by'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function machine()
    {
        return $this->belongsTo(Machinery::class, 'machine_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(Operator::class, 'supervisor_id');
    }

    public function stockItems()
    {
        return $this->hasMany(MachineryStockItem::class);
    }

    public function machineryStockItems()
{
    return $this->hasMany(
        MachineryStockItem::class,
        'machinery_stock_update_id',
        'id'
    );
}

public function stockMovements()
{
    return $this->hasMany(MachineryStockMovement::class);
}

}