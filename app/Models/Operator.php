<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Operator extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'mobile',
        'address',
        'payment',
        'company_id',
        'show',
        'type',
        'project_id',
        'bank_name',
        'account_number',
        'ifsc_code',
        'adhar_number',
        'pan_number',
        'gst_no'
    ];

        public function project()
    {
        // Make sure the table name is "projects" and primary key is "id"
        return $this->belongsTo(Project::class, 'project_id', 'id');
    }
     
}
