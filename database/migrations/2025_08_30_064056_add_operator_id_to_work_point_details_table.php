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
        Schema::table('work_point_details', function (Blueprint $table) {
            $table->unsignedBigInteger('operator_id')->nullable()->after('drilling_record_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_point_details', function (Blueprint $table) {
            $table->dropColumn('operator_id');
        });
    }
};
