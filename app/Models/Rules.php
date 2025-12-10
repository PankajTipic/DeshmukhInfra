<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rules extends Model
{
        use HasFactory;

    /**
     * The table associated with the model.
     *
     * (Optional since Laravel auto-detects plural of 'Rule' as 'rules')
     */
    protected $table = 'rules';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'company_id',
        'type',
        'description',
        'is_active',
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relationship: A Rule belongs to a Company.
     */
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
