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
        if (!Schema::hasTable('tata_details')) {
            Schema::create('tata_details', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('company_id');
                $table->unsignedBigInteger('drilling_record_id')->nullable()->index();
                $table->unsignedBigInteger('project_id')->nullable()->index();
                $table->date('date')->nullable();
                $table->string('shift')->nullable();
                $table->string('site_location')->nullable();
                $table->string('hole_type')->nullable();
                $table->unsignedBigInteger('machine_id')->nullable();
                $table->string('machine_no')->nullable();
                $table->decimal('open_reading', 10, 2)->nullable();
                $table->decimal('closing_reading', 10, 2)->nullable();
                $table->decimal('today_hours', 10, 2)->nullable();
                $table->string('hole_size')->nullable();
                $table->decimal('today_mtr', 10, 2)->nullable();
                $table->decimal('total_mtr', 10, 2)->nullable();
                $table->unsignedBigInteger('operator_id')->nullable();
                $table->string('operator_name')->nullable();
                $table->unsignedBigInteger('helper_id')->nullable();
                $table->string('helper_name')->nullable();
                $table->decimal('today_diesel_used', 10, 2)->nullable();
                $table->decimal('total_diesel_taken', 10, 2)->nullable();
                $table->decimal('today_holes', 10, 2)->nullable();
                $table->decimal('total_holes', 10, 2)->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tata_details');
    }
};
