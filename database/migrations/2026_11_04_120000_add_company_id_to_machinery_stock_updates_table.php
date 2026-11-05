<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('machinery_stock_updates')) {
            Schema::table('machinery_stock_updates', function (Blueprint $table) {
                if (!Schema::hasColumn('machinery_stock_updates', 'company_id')) {
                    $table->unsignedBigInteger('company_id')->nullable()->after('id');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('machinery_stock_updates')) {
            Schema::table('machinery_stock_updates', function (Blueprint $table) {
                if (Schema::hasColumn('machinery_stock_updates', 'company_id')) {
                    $table->dropColumn('company_id');
                }
            });
        }
    }
};

