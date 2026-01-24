<?php
// database/migrations/2025_01_15_100001_create_proforma_invoice_details_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('proforma_invoice_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('proforma_invoice_id');
            
            // Work Details
            $table->string('work_type');
            $table->double('qty', 15, 2)->default(0);
            $table->double('price', 15, 2)->default(0);
            $table->double('total_price', 15, 2)->default(0);
            $table->text('remark')->nullable();
            
            $table->timestamps();
            
            // Foreign Key
            $table->foreign('proforma_invoice_id', 'pi_details_pi_id_foreign')
                  ->references('id')
                  ->on('proforma_invoices')
                  ->onDelete('cascade');
                  
            // Index
            $table->index('proforma_invoice_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('proforma_invoice_details');
    }
};