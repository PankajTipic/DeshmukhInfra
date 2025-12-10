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
        Schema::create('transaction', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('operator_id');
            $table->integer('total_work_point');
            
            // store with 2 decimal places
            $table->decimal('total_commission', 10, 2);
            $table->decimal('salary', 10, 2);
            $table->decimal('total_payment', 10, 2);

            // enum months same as Carbon (January to December)
            $table->enum('salary_month', [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ]);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction');
    }
};
