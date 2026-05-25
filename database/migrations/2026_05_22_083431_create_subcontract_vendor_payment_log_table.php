<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('subcontract_vendor_payment_log', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('subcontract_vendor_id')
                  ->constrained('subcontract_vendor')
                  ->onDelete('cascade');
            
            $table->string('payment_type');
            $table->string('paid_by');
            $table->decimal('amount', 15, 2);
            $table->date('payment_date');
            $table->text('description')->nullable();
            
            $table->timestamps();

            // ✅ Fixed: Short index name
            $table->index(
                ['subcontract_vendor_id', 'payment_date'], 
                'svpl_subcontract_id_date_index'   // Short custom name
            );
        });
    }

    public function down()
    {
        Schema::dropIfExists('subcontract_vendor_payment_log');
    }
};