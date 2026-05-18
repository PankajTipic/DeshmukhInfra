<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('machinery_stock_updates', function (Blueprint $table) {
            $table->id();
            $table->string('sr_no')->nullable();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('machine_id')->constrained('machineries')->onDelete('cascade');
            $table->decimal('hrs', 10, 2)->default(0);
            $table->date('update_date');
            $table->date('maintenance_date')->nullable();
            $table->text('hammer')->nullable();
            $table->text('stock_details')->nullable();
            $table->string('tamplet')->nullable();
            $table->string('capping')->nullable();
            $table->string('damage_part')->nullable();
            $table->string('bit')->nullable();
            $table->string('used_bit')->nullable();
            $table->decimal('oil_bal', 10, 2)->default(0);
            $table->foreignId('supervisor_id')->constrained('operators')->onDelete('set null');
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('machinery_stock_updates');
    }
};