<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('machinery_stock_updates', function (Blueprint $table) {
            $table->decimal('cost', 12, 2)->nullable()->after('remarks');
            $table->date('next_due')->nullable()->after('cost');
            $table->string('serviced_by')->nullable()->after('next_due');
        });
    }

    public function down()
    {
        Schema::table('machinery_stock_updates', function (Blueprint $table) {
            $table->dropColumn(['cost', 'next_due', 'serviced_by']);
        });
    }
};
