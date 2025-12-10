<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class FakeApiUser extends Authenticatable
{
    protected $attributes = [
        'id'    => 0,
        'name'  => 'API Key User',
        'email' => 'api@system.local',
        'type'  => 1, // default type=1 for API key requests
    ];
}
