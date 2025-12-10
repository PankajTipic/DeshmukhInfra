<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Database\Eloquent\Model;

// class Otp extends Model
// {
//     use HasFactory;
// }
namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;


class Otp extends Model
{
use HasFactory;


protected $fillable = [
'email', 'code_hash', 'expires_at', 'consumed_at', 'attempts',
];


protected $casts = [
'expires_at' => 'datetime',
'consumed_at' => 'datetime',
];


public function scopeActive($query)
{
return $query->whereNull('consumed_at')->where('expires_at', '>', now());
}


public function markConsumed(): void
{
$this->forceFill(['consumed_at' => now()])->save();
}


public function incrementAttempt(): void
{
$this->forceFill(['attempts' => $this->attempts + 1])->save();
}
}
