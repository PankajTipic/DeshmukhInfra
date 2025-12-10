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
        Schema::create('compressor_rpm', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->index();
            $table->unsignedBigInteger('drilling_record_id')->index(); // ✅ linked to drilling_records table
            $table->unsignedBigInteger('oprator_id')->nullable()->index();
            $table->unsignedBigInteger('project_id')->nullable()->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->unsignedBigInteger('machine_id')->nullable()->index();

            $table->decimal('comp_rpm_start', 10, 2)->nullable();
            $table->decimal('comp_rpm_end', 10, 2)->nullable();
            $table->decimal('com_actul_hr', 10, 2)->nullable();

            $table->timestamps();

            // Optional foreign keys (add if tables exist)
            // $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            // $table->foreign('drilling_record_id')->references('id')->on('drilling_records')->onDelete('cascade');
            // $table->foreign('oprator_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compressor_rpm');
    }
};
