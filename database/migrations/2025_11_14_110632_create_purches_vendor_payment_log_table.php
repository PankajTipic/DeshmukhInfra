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
    Schema::create('purches_vendor_payment_log', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('purches_vendor_id');
        $table->unsignedBigInteger('purches_vendor_payment_id');
        $table->string('paid_by')->nullable();
        $table->string('payment_type')->nullable();   // Cash / Bank / UPI
        $table->decimal('amount', 10, 2);
        $table->date('payment_date');
        $table->text('description')->nullable();
        $table->timestamps();

        $table->foreign('purches_vendor_id')
            ->references('id')
            ->on('purches_vendor')
            ->onDelete('cascade');

        $table->foreign('purches_vendor_payment_id')
            ->references('id')
            ->on('purches_vendor_payment')
            ->onDelete('cascade');
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purches_vendor_payment_log');
    }
};
