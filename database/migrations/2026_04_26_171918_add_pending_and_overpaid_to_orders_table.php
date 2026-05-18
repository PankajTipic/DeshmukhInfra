<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {

            // Remaining amount
            $table->decimal('pending_amount', 10, 2)
                  ->default(0)
                  ->after('paidAmount');

            // Extra amount (if bill reduced)
            $table->decimal('overpaid_amount', 10, 2)
                  ->default(0)
                  ->after('pending_amount');

        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['pending_amount', 'overpaid_amount']);
        });
    }
};