<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExpensePhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'expense_id',
        'photo_url',
        'photo_type',
        'file_size',
        'remark',
    ];

    public function expense()
    {
        return $this->belongsTo(Expense::class);
    }
}