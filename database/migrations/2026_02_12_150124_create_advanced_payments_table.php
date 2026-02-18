<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('advanced_payments', function (Blueprint $table) {
            $table->id();

            // 🔗 References
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('project_id');
            $table->unsignedBigInteger('proforma_id')->nullable();

            // 💰 Payment Info
            $table->decimal('advanced_amount', 15, 2);

            $table->date('payment_date');

            $table->string('received_from'); // party / client name
            $table->string('payment_type');

            $table->string('senders_bank')->nullable();
            $table->string('receivers_bank')->nullable();

            $table->string('transaction_number')->nullable();

            $table->text('remark')->nullable();

            $table->timestamps();

            // (Optional but Recommended Foreign Keys)
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();
            $table->foreign('proforma_id')->references('id')->on('proforma_invoices')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advanced_payments');
    }
};
