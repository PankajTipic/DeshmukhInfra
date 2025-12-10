<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name',
        'mobile_number',
        'supervisor_id',
        'company_id',
        'user_id',
        'project_name',
        'project_cost',
        'work_place',
        'start_date',
        'end_date',
        'is_visible',
        'remark',
        'commission',
        'gst_number',
        'is_confirm',
        'pan_number',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
    ];


    public function supervisor()
{
    return $this->belongsTo(User::class, 'supervisor_id', 'id');
}

public function user()
{
    return $this->belongsTo(User::class, 'user_id');
}



}
