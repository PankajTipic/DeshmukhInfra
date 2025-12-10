<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsesRawMaterial extends Model
{
    use HasFactory;

    protected $table = 'uses_raw_material'; 

    protected  $fillable =[
        'company_id',
        'drilling_record_id',
        'project_id',
        'material_id',
        'used_qty',
        'misc'
    ];


    public function material()
{
    return $this->belongsTo(RawMaterial::class, 'material_id');
}


}
