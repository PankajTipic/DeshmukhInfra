<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drilling_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->date('date');
            $table->unsignedBigInteger('project_id');
            $table->string('oprator_helper')->nullable();
            $table->time('machine_start')->nullable();
            $table->time('machine_end')->nullable();
            $table->decimal('actual_machine_hr', 8, 2)->nullable();
            $table->integer('comp_rpm_start')->nullable();
            $table->integer('comp_rpm_end')->nullable();
            $table->decimal('com_actul_hr', 8, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drilling_records');
    }
};
