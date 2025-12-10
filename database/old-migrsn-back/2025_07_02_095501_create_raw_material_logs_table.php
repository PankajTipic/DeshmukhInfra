<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRawMaterialLogsTable extends Migration
{
    public function up()
    {
        Schema::create('raw_material_logs', function (Blueprint $table) {
            $table->id();

            // Material & Company IDs
            $table->unsignedBigInteger('material_id');
            $table->integer('company_id'); // ✅ Your custom FK

            // Log Info
            $table->enum('type', ['add', 'used', 'buy']);
            $table->decimal('quantity', 10, 2);
            $table->string('employee');
            $table->date('date');
            $table->decimal('rate', 10, 2)->nullable();  // only for 'buy'
            $table->decimal('total', 12, 2)->nullable(); // only for 'buy'

            $table->timestamps();

            // Foreign Keys
            $table->foreign('material_id')->references('id')->on('raw_materials')->onDelete('cascade');

            // ✅ Foreign key to `company_info(company_id)`
            $table->foreign('company_id')->references('company_id')->on('company_info')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('raw_material_logs');
    }
}
