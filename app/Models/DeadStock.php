<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeadStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'company_id',
        'deduction_date',
        'price',
        'quantity',
        'total_value',
    ];

    // Optional relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function company()
    {
        return $this->belongsTo(CompanyInfo::class, 'company_id');
    }
}

