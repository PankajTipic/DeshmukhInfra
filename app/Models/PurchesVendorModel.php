<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchesVendorModel extends Model
{
    use HasFactory;

      protected $table = 'purches_vendor'; 

    protected $fillable = [

        'company_id',
        'project_id',
        'vendor_id',
        'material_name',
        'about',
        'price_per_unit',
        'qty',
        'total',
        'date',

         // NEW ADDED FIELDS
        'gst_included',
        'gst_percent',
        'cgst_percent',
        'sgst_percent',

    ];



public function vendor()
{
    return $this->belongsTo(Operator::class, 'vendor_id', 'id');
}

public function project()
{
    return $this->belongsTo(Project::class, 'project_id', 'id');
}

public function operator()
{
    return $this->belongsTo(Operator::class, 'operator_id');
}






}

