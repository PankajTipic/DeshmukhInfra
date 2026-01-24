<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkLogSummary extends Model
{
    protected $fillable = [
        'date',
        'company_id',
        'project_id',
        'grand_total',
        'count',
    ];
}