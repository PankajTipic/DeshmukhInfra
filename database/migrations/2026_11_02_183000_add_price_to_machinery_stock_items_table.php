<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('machinery_stock_items', function (Blueprint $table) {
            if (!Schema::hasColumn('machinery_stock_items', 'price')) {
                $table->decimal('price', 12, 2)->default(0)->after('min_qty');
            }
            if (!Schema::hasColumn('machinery_stock_items', 'total_price')) {
                $table->decimal('total_price', 15, 2)->default(0)->after('price');
            }
        });
    }

    public function down(): void
    {
        Schema::table('machinery_stock_items', function (Blueprint $table) {
            if (Schema::hasColumn('machinery_stock_items', 'total_price')) {
                $table->dropColumn('total_price');
            }
            if (Schema::hasColumn('machinery_stock_items', 'price')) {
                $table->dropColumn('price');
            }
        });
    }
};

