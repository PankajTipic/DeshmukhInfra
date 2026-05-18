<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('machinery_stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('machinery_stock_update_id')
                  ->nullable()
                  ->constrained('machinery_stock_updates')
                  ->onDelete('cascade');

            $table->foreignId('from_project_id')->constrained('projects');
            $table->foreignId('from_machine_id')->constrained('machineries');
            
            $table->foreignId('to_project_id')->constrained('projects');
            $table->foreignId('to_machine_id')->constrained('machineries');

            $table->string('stock_name');
            $table->decimal('quantity', 10, 2);
            $table->text('reason')->nullable(); // e.g. "Transferred after work completed"
            $table->foreignId('moved_by')->constrained('users');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('machinery_stock_movements');
    }
};