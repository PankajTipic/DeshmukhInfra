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
    Schema::create('purches_vendor_payment', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('purches_vendor_id');
        $table->decimal('amount', 10, 2)->default(0);   // total bill amount
        $table->decimal('paid_amount', 10, 2)->default(0);
        $table->decimal('balance_amount', 10, 2)->default(0);
        $table->timestamps();

        $table->foreign('purches_vendor_id')
            ->references('id')
            ->on('purches_vendor')
            ->onDelete('cascade');
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purches_vendor_payment');
    }
};
