<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkPointDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'project_id',
         'operator_id',
        'drilling_record_id',
        'work_type',
        'work_point',
        'rate',
        'total',
    ];

    // Relationship
    public function drillingRecord()
    {
        return $this->belongsTo(DrillingRecord::class, 'drilling_record_id');
    }
}
