<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('cgst', 10, 2)->after('invoice_number')->nullable();
            $table->decimal('sgst', 10, 2)->after('cgst')->nullable();
            $table->decimal('gst', 10, 2)->after('sgst')->nullable();
            $table->decimal('igst', 10, 2)->after('gst')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['cgst', 'sgst', 'gst', 'igst']);
        });
    }
};
