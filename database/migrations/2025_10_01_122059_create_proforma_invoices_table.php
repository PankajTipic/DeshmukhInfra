<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('proforma_invoices', function (Blueprint $table) {
            $table->id();
            
            // Relationships - REMOVED customer_id
            $table->unsignedBigInteger('work_order_id'); // Links to orders table where invoiceType=2
            $table->unsignedBigInteger('project_id');
            $table->unsignedBigInteger('company_id');
            
            // Invoice Details
            $table->string('proforma_invoice_number')->unique();
            $table->string('tally_invoice_number')->nullable();
            $table->date('invoice_date');
            $table->date('delivery_date')->nullable();
            
            // Financial Details
            $table->double('subtotal', 15, 2)->default(0);
            $table->double('discount', 15, 2)->default(0);
            $table->double('taxable_amount', 15, 2)->default(0);
            
            // GST Details
            $table->double('gst_percentage', 5, 2)->default(18.00);
            $table->double('cgst_percentage', 5, 2)->default(9.00);
            $table->double('sgst_percentage', 5, 2)->default(9.00);
            $table->double('igst_percentage', 5, 2)->default(0.00);
            
            $table->double('gst_amount', 15, 2)->default(0);
            $table->double('cgst_amount', 15, 2)->default(0);
            $table->double('sgst_amount', 15, 2)->default(0);
            $table->double('igst_amount', 15, 2)->default(0);
            
            // Final Amounts
            $table->double('final_amount', 15, 2)->default(0);
            $table->double('paid_amount', 15, 2)->default(0);
            $table->double('pending_amount', 15, 2)->default(0);
            
            // Status
            $table->enum('payment_status', ['pending', 'partial', 'paid'])->default('pending');
            $table->enum('status', ['draft', 'sent', 'approved', 'cancelled'])->default('draft');
            
            // Metadata
            $table->text('notes')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by');
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign Keys - REMOVED customer_id foreign key
            $table->foreign('work_order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            
            // Indexes
            $table->index(['work_order_id', 'company_id']);
            $table->index('invoice_date');
            $table->index('payment_status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('proforma_invoices');
    }
};