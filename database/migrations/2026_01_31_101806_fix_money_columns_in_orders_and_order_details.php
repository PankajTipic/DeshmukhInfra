<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
    {
        // ────────────────────────────────────────────────
        // Fix order_details table
        // ────────────────────────────────────────────────
        Schema::table('order_details', function (Blueprint $table) {
            // price - was decimal(10,0) → now with 2 decimals
            $table->decimal('price', 12, 2)->change();

            // total_price - was DOUBLE → now exact decimal
            $table->decimal('total_price', 15, 2)->change();

            // Make cgst/sgst bigger in case of large orders
            $table->decimal('cgst_amount', 15, 2)->nullable()->change();
            $table->decimal('sgst_amount', 15, 2)->nullable()->change();

            // Optional: if you ever add these columns later
            // $table->decimal('igst_amount', 15, 2)->nullable()->change();
        });

        // ────────────────────────────────────────────────
        // Fix orders table (main invoice header)
        // ────────────────────────────────────────────────
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('finalAmount', 15, 2)->change();
            $table->decimal('totalAmount',  15, 2)->change();
            $table->decimal('paidAmount',   15, 2)->change();
            $table->decimal('discount',     12, 2)->change();

            $table->decimal('gst',   15, 2)->nullable()->change();
            $table->decimal('cgst',  15, 2)->nullable()->change();
            $table->decimal('sgst',  15, 2)->nullable()->change();
            $table->decimal('igst',  15, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            //
        });
    }
};
