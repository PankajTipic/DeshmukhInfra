<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompressorRpm extends Model
{
    use HasFactory;

    protected $table = 'compressor_rpm';

    protected $fillable = [
        'company_id',
        'drilling_record_id',
        'oprator_id',
        'project_id',
        'user_id',
        'machine_id',
        'comp_rpm_start',
        'comp_rpm_end',
        'com_actul_hr',
    ];
}
