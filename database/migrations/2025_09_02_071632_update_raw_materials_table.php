<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('raw_materials', function (Blueprint $table) {
            // Drop unwanted columns
            $table->dropColumn([
                'capacity',
                'unit_qty',
                'unit',
                'isPackaging',
                'isVisible',
                'created_by',
                'updated_by',
                'misc'
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('raw_materials', function (Blueprint $table) {
            // Re-add dropped columns if rollback is needed
            $table->double('capacity')->nullable();
            $table->double('unit_qty')->nullable();
            $table->string('unit')->nullable();
            $table->boolean('isPackaging')->default(0);
            $table->boolean('isVisible')->default(1);
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->string('misc')->nullable();
        });
    }
};
