<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // After customer_name → mobile_number
            $table->string('mobile_number',20)->nullable()->after('customer_name');

            // After project_name → project_cost
            $table->decimal('project_cost',15,2)->nullable()->after('project_name');

            // After commission → gst_number
            $table->string('gst_number',50)->nullable()->after('commission');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['mobile_number','project_cost','gst_number']);
        });
    }
};
