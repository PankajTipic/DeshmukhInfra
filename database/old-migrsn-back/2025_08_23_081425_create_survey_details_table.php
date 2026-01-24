<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('survey_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('project_id');
            $table->unsignedBigInteger('drilling_record_id');
            $table->string('survey_type');
            $table->string('survey_point');
            $table->decimal('rate', 10, 2)->nullable();
            $table->decimal('total', 12, 2)->nullable();
            $table->timestamps();

            $table->foreign('drilling_record_id')->references('id')->on('drilling_records')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('survey_details');
    }
};
