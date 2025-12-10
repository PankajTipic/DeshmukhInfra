<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BudgetWork extends Model
{
    protected $fillable = [
        'budget_id', 'operator_id', 'work_type', 'points', 'rate', 'total'
    ];

    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    public function operator()
    {
        return $this->belongsTo(Operator::class);
    }
}

