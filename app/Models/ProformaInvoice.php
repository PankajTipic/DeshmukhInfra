<?php
// app/Models/ProformaInvoice.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProformaInvoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'work_order_id',
        'project_id',
        // 'customer_id', // REMOVED
        'company_id',
        'proforma_invoice_number',
        'tally_invoice_number',
        'invoice_date',
        'delivery_date',
        'subtotal',
        'discount',
        'taxable_amount',
        'gst_percentage',
        'cgst_percentage',
        'sgst_percentage',
        'igst_percentage',
        'gst_amount',
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'final_amount',
        'paid_amount',
        'pending_amount',
        'payment_status',
        'status',
        'notes',
        'terms_conditions',
        'created_by',
        'updated_by',
        'payment_terms',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'delivery_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'taxable_amount' => 'decimal:2',
        'gst_percentage' => 'decimal:2',
        'cgst_percentage' => 'decimal:2',
        'sgst_percentage' => 'decimal:2',
        'igst_percentage' => 'decimal:2',
        'gst_amount' => 'decimal:2',
        'cgst_amount' => 'decimal:2',
        'sgst_amount' => 'decimal:2',
        'igst_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'pending_amount' => 'decimal:2',
    ];

    protected $appends = ['customer']; // Add customer as virtual attribute

    // Relationships
    public function workOrder()
    {
        return $this->belongsTo(Order::class, 'work_order_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // Virtual relationship through project
    public function getCustomerAttribute()
    {
        if (!$this->project) {
            return null;
        }
        
        return [
            'name' => $this->project->customer_name,
            'mobile' => $this->project->mobile_number,
            'address' => $this->project->work_place,
            'gst_number' => $this->project->gst_number ?? null,
        ];
    }

    public function details()
    {
        return $this->hasMany(ProformaInvoiceDetail::class);
    }

    public function rules()
    {
        return $this->belongsToMany(Rules::class, 'proforma_invoice_rules', 'proforma_invoice_id', 'rules_id')
                    ->withTimestamps();
    }

    public function invoiceRules()
    {
        return $this->hasMany(ProformaInvoiceRule::class);
    }

    public function incomes()
    {
        return $this->hasMany(Income::class, 'proforma_invoice_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Accessors & Mutators
    public function getRemainingAmountAttribute()
    {
        return $this->final_amount - $this->paid_amount;
    }

    public function getPaymentProgressAttribute()
    {
        if ($this->final_amount <= 0) return 0;
        return round(($this->paid_amount / $this->final_amount) * 100, 2);
    }

    // Scopes
    public function scopeForWorkOrder($query, $workOrderId)
    {
        return $query->where('work_order_id', $workOrderId);
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    public function scopePartiallyPaid($query)
    {
        return $query->where('payment_status', 'partial');
    }

    public function scopeFullyPaid($query)
    {
        return $query->where('payment_status', 'paid');
    }
}