<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\WorkPointDetail;
use App\Models\SurveyDetail;
use App\Models\Project;
use App\Models\Operator;
use App\Models\MachineReading;
use App\Models\UsesRawMaterial;


class DrillingRecord extends Model 
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'date',
        'project_id',
        'oprator_helper',
        'machine_start',
        'machine_end',
        'actual_machine_hr',
        'comp_rpm_start',
        'comp_rpm_end',
        'com_actul_hr',
    ];

    // Relationships
    public function workPoints()
    {
        return $this->hasMany(WorkPointDetail::class, 'drilling_record_id');
    }

    public function surveys()
    {
        return $this->hasMany(SurveyDetail::class, 'drilling_record_id');
    }

   
    public function surveyDetail()
    {
        return $this->hasMany(SurveyDetail::class, 'drilling_record_id');
    }

    public function workPointDetail()
    {
        return $this->hasMany(WorkPointDetail::class, 'drilling_record_id');
    }

    public function customer()
{
    return $this->belongsTo(Customer::class, 'project_id', 'id');
}

public function project()
{
    return $this->belongsTo(Project::class, 'project_id', 'id');
}

public function operator()
{
    return $this->belongsTo(Operator::class, 'oprator_helper', 'id');
}



//  public function machineReadings()
//     {
//         return $this->hasMany(MachineReading::class, 'project_id', 'id');
//         // OR if you store drilling_record_id in machine_readings table, use:
//         // return $this->hasMany(MachineReading::class, 'drilling_record_id', 'id');
//     }

//     public function machineReading()
// {
//     return $this->hasMany(MachineReading::class, 'drilling_record_id');
// }

public function machineReading()
{
    return $this->hasMany(MachineReading::class, 'drilling_record_id');
}


public function compressorRpm()
    {
        return $this->hasMany(CompressorRpm::class, 'drilling_record_id');
    }


    // App\Models\DrillingRecord.php

public function uses_raw_material()
{
    // Example: one record has many raw material usages
    return $this->hasMany(UsesRawMaterial::class, 'drilling_record_id', 'id');
}


// public function usesRawMaterial()
// {
//     // drilling_record_id must exist in uses_raw_material table
//     return $this->hasMany(UsesRawMaterial::class, 'drilling_record_id', 'id');
// }


}
