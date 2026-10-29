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
        Schema::table('machine_reading', function (Blueprint $table) {
            if (!Schema::hasColumn('machine_reading', 'diesel_filled')) {
                $table->decimal('diesel_filled', 10, 2)->default(0)->nullable()->after('actual_machine_hr');
            }
            if (!Schema::hasColumn('machine_reading', 'diesel_avg')) {
                $table->decimal('diesel_avg', 10, 2)->default(0)->nullable()->after('diesel_balance');
            }
        });

        Schema::table('compressor_rpm', function (Blueprint $table) {
            if (!Schema::hasColumn('compressor_rpm', 'diesel_filled')) {
                $table->decimal('diesel_filled', 10, 2)->default(0)->nullable()->after('com_actul_hr');
            }
            if (!Schema::hasColumn('compressor_rpm', 'diesel_avg')) {
                $table->decimal('diesel_avg', 10, 2)->default(0)->nullable()->after('diesel_balance');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machine_reading', function (Blueprint $table) {
            if (Schema::hasColumn('machine_reading', 'diesel_filled')) {
                $table->dropColumn('diesel_filled');
            }
            if (Schema::hasColumn('machine_reading', 'diesel_avg')) {
                $table->dropColumn('diesel_avg');
            }
        });

        Schema::table('compressor_rpm', function (Blueprint $table) {
            if (Schema::hasColumn('compressor_rpm', 'diesel_filled')) {
                $table->dropColumn('diesel_filled');
            }
            if (Schema::hasColumn('compressor_rpm', 'diesel_avg')) {
                $table->dropColumn('diesel_avg');
            }
        });
    }
};
