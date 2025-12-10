<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_details', function (Blueprint $table) {

            $table->decimal('gst_percent', 5, 2)
                  ->nullable()
                  ->after('remark');   // 👈 after remark

            $table->decimal('cgst_amount', 10, 2)
                  ->nullable()
                  ->after('gst_percent');

            $table->decimal('sgst_amount', 10, 2)
                  ->nullable()
                  ->after('cgst_amount');
        });
    }

    public function down(): void
    {
        Schema::table('order_details', function (Blueprint $table) {
            $table->dropColumn([
                'gst_percent',
                'cgst_amount',
                'sgst_amount'
            ]);
        });
    }
};
