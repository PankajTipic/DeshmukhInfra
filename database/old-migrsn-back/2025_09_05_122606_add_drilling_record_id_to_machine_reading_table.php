<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('machine_reading', function (Blueprint $table) {
            $table->unsignedBigInteger('drilling_record_id')->after('company_id')->nullable();
            
            // If you want to link with drilling_records table
            // $table->foreign('drilling_record_id')->references('id')->on('drilling_records')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('machine_reading', function (Blueprint $table) {
            $table->dropForeign(['drilling_record_id']); // only if you added foreign key
            $table->dropColumn('drilling_record_id');
        });
    }
};
