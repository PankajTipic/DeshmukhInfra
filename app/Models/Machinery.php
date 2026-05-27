<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Machinery extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'machine_name',
        'reg_number',
        'ownership_type',

         'rc_number',
    'engine_number',
    'chassis_number',
    'puc_number',
    'insurance_policy_number',
    'machine_serial_number',
    ];



     // ✅ Add This Relationship
    public function documents()
    {
        return $this->hasMany(MachineryDocument::class);
    }

}
