<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Database\Eloquent\Model;

// class MachineReading extends Model
// {
//     use HasFactory;

//     protected $table = 'machine_reading'; // explicitly define table

//     protected $fillable = [
//         'company_id',
//         'oprator_id',
//         'project_id',
//         'user_id',
//         'machine_start',
//         'machine_end',
//         'actual_machine_hr',
//     ];

//     // Example relationships (optional - uncomment if needed)
//     /*
//     public function company()
//     {
//         return $this->belongsTo(Company::class);
//     }

//     public function oprator()
//     {
//         return $this->belongsTo(User::class, 'oprator_id');
//     }

//     public function project()
//     {
//         return $this->belongsTo(Project::class);
//     }

//     public function user()
//     {
//         return $this->belongsTo(User::class);
//     }
//     */



//      public function drillingRecord()
//     {
//         return $this->belongsTo(DrillingRecord::class, 'drilling_record_id');
//     }

// }


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MachineReading extends Model
{
    use HasFactory;

    protected $table = 'machine_reading'; // explicitly define table

    protected $fillable = [
        'company_id',
        'drilling_record_id',   // ✅ Add this
        'oprator_id',
        'project_id',
        'user_id',
        'machine_id',
        'machine_start',
        'machine_end',
        'actual_machine_hr',
    ];

    public function drillingRecord()
    {
        return $this->belongsTo(DrillingRecord::class, 'drilling_record_id');
    }

     public function operator()
    {
        return $this->belongsTo(Operator::class, 'oprator_id');
    }
}

