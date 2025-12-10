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
            // Add capacity before current_stock
            $table->string('capacity')->nullable()->before('current_stock');

            // Add total after price
            $table->decimal('total', 15, 2)->nullable()->after('price');

            // Add unit after total
            $table->string('unit')->nullable()->after('total');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('raw_material_logs', function (Blueprint $table) {
            $table->dropColumn(['capacity', 'total', 'unit']);
        });
    }
};
