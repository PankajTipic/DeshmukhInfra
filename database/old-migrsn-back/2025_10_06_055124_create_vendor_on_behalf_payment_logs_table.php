<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('vendor_on_behalf_payment_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vendor_payment_id');
            $table->unsignedBigInteger('expense_id')->nullable();
            $table->string('paid_by'); // Who made the payment (bank/person)
            $table->decimal('amount', 12, 2);
            $table->date('payment_date');
            $table->string('payment_type')->default('cash'); // cash, online, cheque, etc.
            $table->text('description')->nullable(); // What was paid for (salary, raw material, etc.)
            $table->timestamps();

            $table->foreign('vendor_payment_id')
                  ->references('id')
                  ->on('vendor_payments')
                  ->onDelete('cascade');
            
            $table->foreign('expense_id')
                  ->references('id')
                  ->on('expenses')
                  ->onDelete('set null');
        });
    }

    public function down(): void {
        Schema::dropIfExists('vendor_on_behalf_payment_logs');
    }
};