<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawMaterialLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'material_id',
        'company_id',
       'project_id',
       'current_stock',
       'price',
       'capacity', 'total', 'unit'
    ];

    public function material()
    {
        return $this->belongsTo(RawMaterial::class, 'material_id');
    }

    public function company()
    {
        return $this->belongsTo(CompanyInfo::class, 'company_id', 'company_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }
}
