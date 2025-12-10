<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('budgets', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('project_id')->nullable();
        $table->string('project_name');
        $table->decimal('budget', 12, 2);
        $table->decimal('project_amount', 12, 2);
        $table->date('start_date')->nullable();
        $table->date('end_date')->nullable();
        $table->string('work_place')->nullable();
        $table->decimal('total_work_cost', 12, 2)->default(0);
        $table->timestamps();

        $table->foreign('project_id')->references('id')->on('projects')->onDelete('set null');
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
