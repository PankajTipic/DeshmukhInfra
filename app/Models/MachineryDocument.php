<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MachineryDocument extends Model
{
    use HasFactory;

    protected $fillable = [
    'machinery_id',
    'document_type',
    'document_number',
    'issue_date',
    'expiry_date',
    'document_file',
    'remark',
];

public function machinery()
{
    return $this->belongsTo(Machinery::class);
}
}
