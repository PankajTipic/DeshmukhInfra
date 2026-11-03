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
        Schema::table('order_details', function (Blueprint $table) {
            $table->decimal('qty', 12, 3)->default(0)->change();
        });

        Schema::table('proforma_invoice_details', function (Blueprint $table) {
            $table->decimal('qty', 12, 3)->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_details', function (Blueprint $table) {
            $table->decimal('qty', 10, 2)->default(0)->change();
        });

        Schema::table('proforma_invoice_details', function (Blueprint $table) {
            $table->decimal('qty', 12, 2)->default(0)->change();
        });
    }
};

