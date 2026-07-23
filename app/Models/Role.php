<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'base_type',
        'permissions',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'permissions' => 'array',
            'is_default' => 'boolean',
        ];
    }
}
