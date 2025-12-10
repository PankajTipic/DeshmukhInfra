<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawMaterial extends Model
{
    use HasFactory;
    protected $table = 'raw_materials';

    protected $fillable = [
        'company_id',
        'name',
        'local_name',
        
    ];

   

    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';



    public function logs()
{
    return $this->hasMany(RawMaterialLog::class, 'material_id');
}


public function material()
{
    return $this->belongsTo(RawMaterial::class, 'material_id');
}



}
