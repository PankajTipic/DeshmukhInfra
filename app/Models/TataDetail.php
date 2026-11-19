<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TataDetail extends Model
{
    use HasFactory;

    protected $table = 'tata_details';

    protected $fillable = [
        'company_id',
        'drilling_record_id',
        'project_id',
        'date',
        'shift',
        'site_location',
        'hole_type',
        'machine_id',
        'machine_no',
        'open_reading',
        'closing_reading',
        'today_hours',
        'hole_size',
        'today_mtr',
        'total_mtr',
        'operator_id',
        'operator_name',
        'helper_id',
        'helper_name',
        'today_diesel_used',
        'total_diesel_taken',
        'today_holes',
        'total_holes',
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
}
