<?php
// app/Models/ProformaInvoiceDetail.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProformaInvoiceDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'proforma_invoice_id',
        'work_type',
        'uom',
        'qty',
        'price',
        'total_price',
        'remark',
        'gst_percent',
'cgst_amount',
'sgst_amount'
    ];

    protected $casts = [
        'qty' => 'decimal:2',
        'price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function proformaInvoice()
    {
        return $this->belongsTo(ProformaInvoice::class);
    }
}