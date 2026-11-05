<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RotaryDetail extends Model
{
    use HasFactory;

    protected $table = 'rotary_details';

    protected $fillable = [
        'company_id',
        'drilling_record_id',
        'project_id',
        'date',
        'machine_id',
        'machine_no',
        'group_no',
        'site_engineer_id',
        'site_engineer',
        'operator_id',
        'operator_name',
        'helper_id',
        'helper_name',
        'shift_time',
        'open_reading_hr',
        'closing_reading_hr',
        'total_hours',
        'dia',
        'pile_no',
        'soft_soil',
        'hard_rock',
        'today_miter',
        'total_miter',
        'today_pile',
        'total_pile',
        'diesel_lit',
        'diesel_start_percent',
        'diesel_closing_percent',
        'diesel_use_percent',
        'bullet_use',
        'stock_bullet',
    ];

    public function drillingRecord()
    {
        return $this->belongsTo(DrillingRecord::class, 'drilling_record_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function machine()
    {
        return $this->belongsTo(Machinery::class, 'machine_id');
    }

    public function operator()
    {
        return $this->belongsTo(Operator::class, 'operator_id');
    }

    public function helper()
    {
        return $this->belongsTo(Operator::class, 'helper_id');
    }

    public function engineer()
    {
        return $this->belongsTo(User::class, 'site_engineer_id');
    }
}

