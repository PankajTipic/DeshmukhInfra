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
       Schema::create('income', function (Blueprint $table) {
    $table->id();
    $table->integer('project_id');
    $table->integer('company_id');
    $table->string('po_no');
    $table->date('po_date');
    $table->string('invoice_no');
    $table->date('invoice_date');
    $table->decimal('basic_amount', 15, 2);
    $table->decimal('gst_amount', 15, 2);
    $table->decimal('billing_amount', 15, 2);
    $table->decimal('received_amount', 15, 2);
    $table->string('received_by');
    $table->string('senders_bank');
    $table->enum('payment_type',['imps','rtgs','upi','cash','cheque']);
    $table->string('receivers_bank');
    $table->decimal('pending_amount', 15, 2);
    $table->string('remark');
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('income');
    }
};
