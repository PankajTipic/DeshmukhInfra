<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MachineryStockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'machinery_stock_update_id',
        'from_project_id',
        'from_machine_id',
        'to_project_id',
        'to_machine_id',
        'stock_name',
        'quantity',
        'reason',
        'moved_by',
    ];

    // ── Relationships ──────────────────────────────────────

    public function stockUpdate()
    {
        return $this->belongsTo(MachineryStockUpdate::class, 'machinery_stock_update_id');
    }

    public function fromProject()
    {
        return $this->belongsTo(Project::class, 'from_project_id');
    }

    public function fromMachine()
    {
        return $this->belongsTo(Machinery::class, 'from_machine_id');
    }

    public function toProject()
    {
        return $this->belongsTo(Project::class, 'to_project_id');
    }

    public function toMachine()
    {
        return $this->belongsTo(Machinery::class, 'to_machine_id');
    }

    public function movedBy()
    {
        return $this->belongsTo(User::class, 'moved_by');
    }
}