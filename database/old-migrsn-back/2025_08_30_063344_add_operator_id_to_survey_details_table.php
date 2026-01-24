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
        Schema::table('survey_details', function (Blueprint $table) {
            $table->unsignedBigInteger('operator_id')->nullable()->after('drilling_record_id'); 
            // 👆 Added after drilling_record_id

            // If you want foreign key reference to users table (optional):
            // $table->foreign('operator_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_details', function (Blueprint $table) {
            $table->dropColumn('operator_id');
        });
    }
};
