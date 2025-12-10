<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('internal_money_transfers', function (Blueprint $table) {
            $table->id();
            $table->integer('company_id');
            $table->foreign('company_id')->references('company_id')->on('company_info')->onDelete('cascade');
            $table->string('from_account');
            $table->string('to_account');
            $table->decimal('amount', 15, 2);
            $table->date('transfer_date');
            $table->text('description')->nullable();
            $table->string('reference_number')->nullable();
            $table->timestamps();
            $table->softDeletes();


            
            $table->index(['company_id', 'transfer_date']);
            $table->index('from_account');
            $table->index('to_account');
        });
    }

    public function down()
    {
        Schema::dropIfExists('internal_money_transfers');
    }
};