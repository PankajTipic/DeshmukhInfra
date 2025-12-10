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
        Schema::create('purches_vendor', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comapany_id');
            $table->unsignedBigInteger('project_id');
            $table->unsignedBigInteger('vendor_id');
            $table->string('material_name');
            $table->integer('price_per_unit');
            $table->integer('qty');
            $table->integer('total');
            $table->date('date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purches_vendor');
    }
};
