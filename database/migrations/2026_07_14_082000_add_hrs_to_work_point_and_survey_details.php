<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_point_details', function (Blueprint $table) {
            $table->decimal('hrs', 8, 2)->nullable()->after('uom');
        });

        Schema::table('survey_details', function (Blueprint $table) {
            $table->decimal('hrs', 8, 2)->nullable()->after('uom');
        });
    }

    public function down(): void
    {
        Schema::table('work_point_details', function (Blueprint $table) {
            $table->dropColumn(['hrs']);
        });

        Schema::table('survey_details', function (Blueprint $table) {
            $table->dropColumn(['hrs']);
        });
    }
};
