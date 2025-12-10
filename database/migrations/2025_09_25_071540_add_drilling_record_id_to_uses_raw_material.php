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
        Schema::table('uses_raw_material', function (Blueprint $table) {
            $table->unsignedBigInteger('drilling_record_id')->after('company_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('uses_raw_material', function (Blueprint $table) {
            //
        });
    }
};
