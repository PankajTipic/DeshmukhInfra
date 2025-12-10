<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->decimal('gst', 10, 2)->nullable()->after('total_price');
            $table->decimal('sgst', 10, 2)->nullable()->after('gst');
            $table->decimal('cgst', 10, 2)->nullable()->after('sgst');
            $table->decimal('igst', 10, 2)->nullable()->after('cgst');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn(['gst', 'sgst', 'cgst', 'igst']);
        });
    }
};
