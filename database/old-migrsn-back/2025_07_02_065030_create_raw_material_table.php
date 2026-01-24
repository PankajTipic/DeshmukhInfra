<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('raw_materials', function (Blueprint $table) {
            $table->id();
            $table->integer('company_id');
            $table->string('name');
            $table->string('local_name');
            $table->double('capacity');
            $table->double('unit_qty');
            $table->string('unit');
            $table->tinyInteger('isPackaging');
            $table->tinyInteger('isVisible');
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();
            $table->string('misc')->nullable();
        });

        // Add the foreign key constraint after table creation
        if (Schema::hasTable('company_info')) {
            Schema::table('raw_materials', function (Blueprint $table) {
                $table->foreign('company_id')->references('company_id')->on('company_info');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('raw_materials');
    }
};
