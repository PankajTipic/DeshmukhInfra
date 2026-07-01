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
        Schema::table('machineries', function (Blueprint $table) {
            if (!Schema::hasColumn('machineries', 'diesel_balance')) {
                $table->decimal('diesel_balance', 10, 2)->default(0)->nullable();
            }
        });

        Schema::table('machine_reading', function (Blueprint $table) {
            if (!Schema::hasColumn('machine_reading', 'diesel_used')) {
                $table->decimal('diesel_used', 10, 2)->default(0)->nullable();
            }
            if (!Schema::hasColumn('machine_reading', 'diesel_balance')) {
                $table->decimal('diesel_balance', 10, 2)->default(0)->nullable();
            }
        });

        Schema::table('compressor_rpm', function (Blueprint $table) {
            if (!Schema::hasColumn('compressor_rpm', 'diesel_used')) {
                $table->decimal('diesel_used', 10, 2)->default(0)->nullable();
            }
            if (!Schema::hasColumn('compressor_rpm', 'diesel_balance')) {
                $table->decimal('diesel_balance', 10, 2)->default(0)->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machineries', function (Blueprint $table) {
            if (Schema::hasColumn('machineries', 'diesel_balance')) {
                $table->dropColumn('diesel_balance');
            }
        });

        Schema::table('machine_reading', function (Blueprint $table) {
            if (Schema::hasColumn('machine_reading', 'diesel_used')) {
                $table->dropColumn('diesel_used');
            }
            if (Schema::hasColumn('machine_reading', 'diesel_balance')) {
                $table->dropColumn('diesel_balance');
            }
        });

        Schema::table('compressor_rpm', function (Blueprint $table) {
            if (Schema::hasColumn('compressor_rpm', 'diesel_used')) {
                $table->dropColumn('diesel_used');
            }
            if (Schema::hasColumn('compressor_rpm', 'diesel_balance')) {
                $table->dropColumn('diesel_balance');
            }
        });
    }
};
