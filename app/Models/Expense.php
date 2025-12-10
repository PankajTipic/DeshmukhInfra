<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;
    protected $fillable=[
        'project_id',
        'name',
        'desc',
        'expense_id',
        'qty',
        'price',
        'total_price',
        'expense_date',
        'contact',
        'payment_by',
        'payment_type',
        'pending_amount',
        'show',
        'isGst',
      'photoAvilable',
        'photo_url', 
        'photo_remark', 
        'company_id',
        'created_by',
        'updated_by',

        // New fields
        'bank_name',
        'acc_number',
        'ifsc',
        'aadhar',
        'pan',
        'transaction_id',

        'gst','sgst','cgst','igst'

    ];

    // /**
    //  * Get the item.
    //  */
    public function type()
    {
        return $this->belongTo(ExpenseType::class,'expense_id');
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = [
        'created_at',
        'updated_at',
    ];



public function expenseType()
{
    return $this->belongsTo(ExpenseType::class, 'expense_id');
}

public function customer()
{
    return $this->belongsTo(Customer::class, 'customer_id');
}

public function project()
    {
        return $this->belongsTo(Project::class, 'project_id', 'id');
    }

}
