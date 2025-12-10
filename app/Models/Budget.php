<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    protected $fillable = [
        'company_id',
        'project_id', 'project_name', 'budget', 'project_amount',
        'start_date', 'end_date', 'work_place', 'total_work_cost'
    ];

    public function works()
    {
        return $this->hasMany(BudgetWork::class);
    }
}
