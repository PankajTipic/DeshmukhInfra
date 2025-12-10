<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyInfo extends Model
{
    use HasFactory;

    protected $table = 'company_info';

    protected $fillable = [
        'company_id',
        'land_mark',
        'Tal',
        'Dist',
        'Pincode',
        'phone_no',
        'bank_name',
        'account_no',
        'IFSC_code',
        'logo',
        'sign',
        'paymentQRCode',
        'block_status',
        'company_name',
        'appMode',
        'subscribed_plan',
        'subscription_validity',
        'refer_by_id',
        'invoice_counter', // ✅ Added so we can mass-assign counter
        'initials',        // ✅ Store initials for invoice numbers
        'gst_number',      // ✅ Added GST number
        'pan_number',      // ✅ Added PAN number
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $primaryKey = 'company_id';

    // ✅ Default value at model level
    protected $attributes = [
        'invoice_counter' => 1, // starts at 1
    ];

    public function referredBy()
    {
        return $this->belongsTo(OnboardingPartner::class, 'refer_by_id');
    }
}
