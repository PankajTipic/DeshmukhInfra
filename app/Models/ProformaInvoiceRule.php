<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProformaInvoiceRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'proforma_invoice_id',
        'rules_id',
    ];

    public function proformaInvoice()
    {
        return $this->belongsTo(ProformaInvoice::class);
    }

    public function rule()
    {
        return $this->belongsTo(Rules::class, 'rules_id');
    }
}