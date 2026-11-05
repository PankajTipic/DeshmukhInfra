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
        if (!Schema::hasTable('rotary_details')) {
            Schema::create('rotary_details', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('company_id');
                $table->unsignedBigInteger('drilling_record_id')->nullable()->index();
                $table->unsignedBigInteger('project_id')->nullable()->index();
                $table->date('date')->nullable();
                $table->unsignedBigInteger('machine_id')->nullable();
                $table->string('machine_no')->nullable();
                $table->string('group_no')->nullable();
                $table->unsignedBigInteger('site_engineer_id')->nullable();
                $table->string('site_engineer')->nullable();
                $table->unsignedBigInteger('operator_id')->nullable();
                $table->string('operator_name')->nullable();
                $table->unsignedBigInteger('helper_id')->nullable();
                $table->string('helper_name')->nullable();
                $table->string('shift_time')->nullable();
                $table->decimal('open_reading_hr', 10, 2)->nullable();
                $table->decimal('closing_reading_hr', 10, 2)->nullable();
                $table->decimal('total_hours', 10, 2)->nullable();
                $table->decimal('dia', 10, 2)->nullable();
                $table->string('pile_no')->nullable();
                $table->decimal('soft_soil', 10, 2)->nullable();
                $table->decimal('hard_rock', 10, 2)->nullable();
                $table->decimal('today_miter', 10, 2)->nullable();
                $table->decimal('total_miter', 10, 2)->nullable();
                $table->decimal('today_pile', 10, 2)->nullable();
                $table->decimal('total_pile', 10, 2)->nullable();
                $table->decimal('diesel_lit', 10, 2)->nullable();
                $table->decimal('diesel_start_percent', 10, 2)->nullable();
                $table->decimal('diesel_closing_percent', 10, 2)->nullable();
                $table->decimal('diesel_use_percent', 10, 2)->nullable();
                $table->decimal('bullet_use', 10, 2)->nullable();
                $table->decimal('stock_bullet', 10, 2)->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rotary_details');
    }
};

