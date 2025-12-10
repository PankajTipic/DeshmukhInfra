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
        Schema::table('raw_material_logs', function (Blueprint $table) {
            // Add a price column (decimal, 10 digits total, 2 decimal places) after current_stock
            $table->decimal('price', 10, 2)->after('current_stock')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('raw_material_logs', function (Blueprint $table) {
            // Drop the price column if rolling back
            $table->dropColumn('price');
        });
    }
};
