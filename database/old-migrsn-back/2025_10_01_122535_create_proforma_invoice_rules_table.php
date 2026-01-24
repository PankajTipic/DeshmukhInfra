<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('proforma_invoice_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('proforma_invoice_id');
            $table->unsignedBigInteger('rules_id');
            $table->timestamps();
            
            // Foreign Keys
            $table->foreign('proforma_invoice_id', 'pir_pi_id_foreign')
                  ->references('id')
                  ->on('proforma_invoices')
                  ->onDelete('cascade');
                  
            $table->foreign('rules_id')
                  ->references('id')
                  ->on('rules')
                  ->onDelete('cascade');
                  
            // Unique constraint
            $table->unique(['proforma_invoice_id', 'rules_id'], 'pi_rule_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('proforma_invoice_rules');
    }
};