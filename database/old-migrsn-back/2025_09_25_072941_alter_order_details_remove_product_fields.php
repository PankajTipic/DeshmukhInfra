<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('order_details', function (Blueprint $table) {
            // Drop unnecessary columns
            $table->dropColumn(['product_id', 'product_sizes_id', 'product_local_name', 'size_name', 'size_local_name', 'eQty', 'dPrice', 'product_unit', 'company_id']);
            
            // Rename and repurpose columns
            $table->renameColumn('product_name', 'work_type');
            $table->renameColumn('dQty', 'qty');
            $table->renameColumn('oPrice', 'price');
        });
    }

    public function down()
    {
        Schema::table('order_details', function (Blueprint $table) {
            // Reverse renames
            $table->renameColumn('work_type', 'product_name');
            $table->renameColumn('qty', 'dQty');
            $table->renameColumn('price', 'oPrice');
            
            // Add back dropped columns (adjust types as per original)
            $table->unsignedBigInteger('product_id')->after('order_id');
            $table->unsignedBigInteger('product_sizes_id')->after('product_id');
            $table->string('product_local_name')->nullable()->after('product_name');
            $table->string('size_name')->nullable()->after('product_local_name');
            $table->string('size_local_name')->nullable()->after('size_name');
            $table->integer('eQty')->after('dQty');
            $table->double('dPrice')->after('oPrice');
            $table->string('product_unit')->nullable()->after('product_name');
            $table->integer('company_id')->nullable()->after('remark');
        });
    }
};