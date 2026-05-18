<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('machinery_stock_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('machinery_stock_update_id')
                  ->constrained('machinery_stock_updates')
                  ->onDelete('cascade');
            
            $table->string('stock_name');
            $table->decimal('issued_qty', 10, 2)->default(0);
            $table->decimal('used_qty', 10, 2)->default(0);
            $table->decimal('remaining_qty', 10, 2)->default(0);
            $table->text('remarks')->nullable();
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('machinery_stock_items');
    }
};