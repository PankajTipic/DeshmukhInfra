<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('dead_stocks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->integer('company_id');
            $table->date('deduction_date');
            $table->decimal('price', 10, 2);
            $table->integer('quantity');
            $table->decimal('total_value', 12, 2);
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('company_id')->references('company_id')->on('company_info')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dead_stocks');
    }
};