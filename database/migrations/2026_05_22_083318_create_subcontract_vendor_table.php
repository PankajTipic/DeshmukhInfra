<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('subcontract_vendor', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            
            $table->decimal('total_amount', 15, 2)->default(0.00);
            $table->decimal('paid_amount', 15, 2)->default(0.00);
            $table->decimal('pending_amount', 15, 2)->default(0.00);
            
            $table->timestamps();
            
            $table->index(['project_id', 'vendor_id']);
            $table->index('order_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('subcontract_vendor');
    }
};