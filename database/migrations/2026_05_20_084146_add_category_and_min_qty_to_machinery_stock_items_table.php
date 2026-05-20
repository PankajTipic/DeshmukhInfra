<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('machinery_stock_items', function (Blueprint $table) {
        $table->string('category')->nullable()->after('stock_name');
        $table->decimal('min_qty', 10, 2)->default(0)->after('remaining_qty');
        $table->string('unit')->default('NOS')->after('stock_name');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machinery_stock_items', function (Blueprint $table) {
            //
        });
    }
};
