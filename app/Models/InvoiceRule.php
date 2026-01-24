<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Rules;

class InvoiceRule extends Model
{
    use HasFactory;

    // ✅ Table name (optional if it matches plural of model name)
    protected $table = 'invoice_rules';

    // ✅ Fillable columns for mass assignment
    protected $fillable = [
        'order_id',
        'rules_id',
    ];

    /**
     * Relationships
     */
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function rule()
    {
        return $this->belongsTo(Rules::class, 'rules_id');
    }


    

    
}
