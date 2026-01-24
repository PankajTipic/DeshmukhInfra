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
        Schema::table('projects', function (Blueprint $table) {
            // Add supervisor_id before project_name
            $table->unsignedBigInteger('supervisor_id')->after('id');

            // Add commission after work_place
            $table->decimal('commission', 8, 2)->nullable()->after('work_place');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['supervisor_id', 'commission']);
        });
    }
};
