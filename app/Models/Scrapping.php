<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Scrapping extends Model
{
    use HasFactory;
     // Define the table associated with the model
     protected $table = 'scrap_enquiry';

     // Specify the attributes that are mass assignable
     protected $fillable = [
         'name',
         'email',
         'mobile',
         'location',
         'vehicle_category',
         'vehicle_company',
         'vehiclename',
         'status',
         'otp',
         'otp_expires_at',
         'is_verified'
     ];
}
