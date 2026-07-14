<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_point_details', function (Blueprint $table) {
            $table->decimal('diesel', 10, 2)->nullable()->after('total');
            $table->string('uom')->nullable()->after('diesel');
        });

        Schema::table('survey_details', function (Blueprint $table) {
            $table->decimal('diesel', 10, 2)->nullable()->after('total');
            $table->string('uom')->nullable()->after('diesel');
        });
    }

    public function down(): void
    {
        Schema::table('work_point_details', function (Blueprint $table) {
            $table->dropColumn(['diesel', 'uom']);
        });

        Schema::table('survey_details', function (Blueprint $table) {
            $table->dropColumn(['diesel', 'uom']);
        });
    }
};
