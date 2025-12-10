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
    Schema::create('expense_summaries', function (Blueprint $table) {
        $table->id();
        $table->date('expense_date');
        $table->unsignedBigInteger('company_id');
        $table->decimal('total_expense', 10, 2)->default(0);
        $table->integer('expense_count')->default(0);
        $table->timestamps();

        $table->unique(['expense_date', 'company_id']);
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expense_summaries');
    }
};
