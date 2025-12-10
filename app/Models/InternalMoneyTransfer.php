<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InternalMoneyTransfer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'from_account',
        'to_account',
        'amount',
        'transfer_date',
        'description',
        'reference_number',
        'project_id'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transfer_date' => 'date',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function project()
{
    return $this->belongsTo(Project::class);
}
}