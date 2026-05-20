<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseVendorImage extends Model
{
    use HasFactory;

    protected $table = 'purchase_vendor_images';

    protected $fillable = [
        'purches_vendor_id',
        'image_path',
        'original_name',
        'remark',
        'type'
    ];

    public function purchaseVendor()
    {
        return $this->belongsTo(PurchesVendorModel::class, 'purches_vendor_id');
    }
}