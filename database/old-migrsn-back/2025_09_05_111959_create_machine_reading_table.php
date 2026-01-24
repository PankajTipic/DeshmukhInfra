<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('machine_reading', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('oprator_id')->nullable();
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->decimal('machine_start',8,2)->nullable();
            $table->decimal('machine_end',8,2)->nullable();
            $table->decimal('actual_machine_hr', 8, 2)->nullable(); // example: 123456.78
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machine_reading');
    }
};
