<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductMedia extends Model
{
    use HasFactory;

    protected $table = 'product_medias';

    protected $fillable = [
        'product_id',
        'company_id',
        'url',
        'description',
        'type',
        'show',
    ];

    /**
     * Relationships
     */

    // ProductMedia belongs to a Product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // ProductMedia belongs to a Company
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
