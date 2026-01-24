<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('income', function (Blueprint $table) {
            
            $table->unsignedBigInteger('proforma_invoice_id')->nullable()->after('order_id');
            
            // Foreign key
            $table->foreign('proforma_invoice_id', 'income_pi_id_foreign')
                  ->references('id')
                  ->on('proforma_invoices')
                  ->onDelete('set null');
                  
            // Index
            $table->index('proforma_invoice_id');
        });
    }

    public function down()
    {
        Schema::table('income', function (Blueprint $table) {
            $table->dropForeign('income_pi_id_foreign');
            $table->dropIndex(['proforma_invoice_id']);
            $table->dropColumn('proforma_invoice_id');
        });
    }
};