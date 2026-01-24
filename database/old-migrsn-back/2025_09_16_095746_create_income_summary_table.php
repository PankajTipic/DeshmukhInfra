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
        Schema::create('income_summary', function (Blueprint $table) {
            $table->id();
            $table->integer('company_id');
            $table->integer('project_id');
            $table->date('date');
            $table->decimal('total_amount', 15, 2);
            $table->decimal('pending_amount', 15, 2);
            $table->integer('invoice_count');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('income_summary');
    }
};
