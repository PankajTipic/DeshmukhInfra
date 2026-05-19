<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('machinery_stock_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('machinery_stock_item_id')->constrained('machinery_stock_items')->onDelete('cascade');
            $table->string('type', 50);   // issued, usage, transfer-out
            $table->decimal('quantity', 12, 2);
            $table->decimal('remaining_after', 12, 2);
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->date('log_date');   // Important for daily tracking
            $table->timestamps();
        });
    }
};