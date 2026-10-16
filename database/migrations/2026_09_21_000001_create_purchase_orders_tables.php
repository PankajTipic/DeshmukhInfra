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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->index();
            $table->unsignedBigInteger('project_id')->nullable()->index();
            $table->unsignedBigInteger('vendor_id')->index();
            $table->string('po_number')->index();
            $table->date('po_date');
            $table->date('delivery_date')->nullable();
            $table->string('reference_no')->nullable();
            $table->string('tax_type')->default('intra_state'); // intra_state (CGST+SGST) or inter_state (IGST)
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('taxable_amount', 15, 2)->default(0);
            $table->decimal('cgst_amount', 15, 2)->default(0);
            $table->decimal('sgst_amount', 15, 2)->default(0);
            $table->decimal('igst_amount', 15, 2)->default(0);
            $table->decimal('total_tax', 15, 2)->default(0);
            $table->decimal('round_off', 10, 2)->default(0);
            $table->decimal('final_amount', 15, 2)->default(0);
            $table->string('status')->default('Issued'); // Draft, Issued, Partially Received, Completed, Cancelled
            $table->text('payment_terms')->nullable();
            $table->text('delivery_terms')->nullable();
            $table->text('terms_and_conditions')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            // Foreign keys where applicable
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('set null');
            $table->foreign('vendor_id')->references('id')->on('operators')->onDelete('cascade');
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('purchase_order_id')->index();
            $table->string('item_name');
            $table->text('description')->nullable();
            $table->string('hsn_code')->nullable();
            $table->string('uom', 50)->default('Nos');
            $table->decimal('qty', 15, 2)->default(1);
            $table->decimal('rate', 15, 2)->default(0);
            $table->decimal('taxable_amount', 15, 2)->default(0);
            $table->decimal('gst_percent', 5, 2)->default(0);
            $table->decimal('cgst_amount', 15, 2)->default(0);
            $table->decimal('sgst_amount', 15, 2)->default(0);
            $table->decimal('igst_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->string('remark')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('purchase_order_id')->references('id')->on('purchase_orders')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
    }
};
