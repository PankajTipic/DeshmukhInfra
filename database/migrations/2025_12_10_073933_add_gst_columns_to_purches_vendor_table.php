<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purches_vendor', function (Blueprint $table) {

            $table->boolean('gst_included')
                  ->default(false)
                  ->after('total');

            $table->decimal('gst_percent', 5, 2)
                  ->nullable()
                  ->after('gst_included');

            $table->decimal('cgst_percent', 5, 2)
                  ->nullable()
                  ->after('gst_percent');

            $table->decimal('sgst_percent', 5, 2)
                  ->nullable()
                  ->after('cgst_percent');
        });
    }

    public function down(): void
    {
        Schema::table('purches_vendor', function (Blueprint $table) {
            $table->dropColumn([
                'gst_included',
                'gst_percent',
                'cgst_percent',
                'sgst_percent',
            ]);
        });
    }
};
