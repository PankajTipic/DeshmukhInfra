<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'transaction'; // table name

    protected $fillable = [
        'operator_id',
        'total_work_point',
        'total_commission',
        'salary',
        'total_payment',
        'salary_month',
    ];

    /**
     * Relationships
     */

    // A transaction belongs to one operator
    public function operator()
    {
        return $this->belongsTo(Operator::class, 'operator_id');
    }
}
