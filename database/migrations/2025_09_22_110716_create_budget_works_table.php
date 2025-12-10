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
    Schema::create('budget_works', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('budget_id');
        $table->unsignedBigInteger('operator_id');
        $table->string('work_type');
        $table->integer('points')->default(0);
        $table->decimal('rate', 12, 2)->default(0);
        $table->decimal('total', 12, 2)->default(0);
        $table->timestamps();

        $table->foreign('budget_id')->references('id')->on('budgets')->onDelete('cascade');
        $table->foreign('operator_id')->references('id')->on('operators')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_works');
    }
};
