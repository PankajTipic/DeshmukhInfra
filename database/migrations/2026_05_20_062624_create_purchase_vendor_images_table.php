<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('purchase_vendor_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purches_vendor_id')
                  ->constrained('purches_vendors')
                  ->onDelete('cascade');
            
            $table->string('image_path');           // Stored path
            $table->string('original_name')->nullable();
            $table->string('remark')->nullable();
            $table->string('type')->nullable();     // image or pdf
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('purchase_vendor_images');
    }
};