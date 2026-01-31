<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
    {
        // ────────────────────────────────────────────────
        // Fix proforma_invoice_details table
        // ────────────────────────────────────────────────
        Schema::table('proforma_invoice_details', function (Blueprint $table) {
            // qty - was double → change to decimal (same scale as order_details)
            $table->decimal('qty', 12, 2)->default(0)->change();

            // price - was double → now exact decimal
            $table->decimal('price', 12, 2)->default(0)->change();

            // total_price - was double → now exact decimal with larger capacity
            $table->decimal('total_price', 15, 2)->default(0)->change();

            // cgst_amount - was decimal(10,2) → increase to match large invoices
            $table->decimal('cgst_amount', 15, 2)->nullable()->change();

            // sgst_amount - was decimal(10,2) → increase
            $table->decimal('sgst_amount', 15, 2)->nullable()->change();

            // Optional future column (uncomment if needed later)
            // $table->decimal('igst_amount', 15, 2)->nullable()->after('sgst_amount');
        });

        // ────────────────────────────────────────────────
        // Fix proforma_invoices table (main header table)
        // ────────────────────────────────────────────────
        Schema::table('proforma_invoices', function (Blueprint $table) {
            // subtotal
            $table->decimal('subtotal', 15, 2)->default(0)->change();

            // discount
            $table->decimal('discount', 12, 2)->default(0)->change();

            // taxable_amount
            $table->decimal('taxable_amount', 15, 2)->default(0)->change();

            // Percentages - convert from double to decimal (more appropriate)
            $table->decimal('gst_percentage',  5, 2)->default(0)->change();
            $table->decimal('cgst_percentage', 5, 2)->default(0)->change();
            $table->decimal('sgst_percentage', 5, 2)->default(0)->change();
            $table->decimal('igst_percentage', 5, 2)->default(0)->change();

            // Tax amounts
            $table->decimal('gst_amount',  15, 2)->default(0)->change();
            $table->decimal('cgst_amount', 15, 2)->default(0)->change();
            $table->decimal('sgst_amount', 15, 2)->default(0)->change();
            $table->decimal('igst_amount', 15, 2)->default(0)->change();

            // Final & payment fields
            $table->decimal('final_amount',   15, 2)->default(0)->change();
            $table->decimal('paid_amount',    15, 2)->default(0)->change();
            $table->decimal('pending_amount', 15, 2)->default(0)->change();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proforma_tables', function (Blueprint $table) {
            //
        });
    }
};
