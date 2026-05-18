<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('income', function (Blueprint $table) {

            // Payment or Adjustment
            $table->enum('type', ['payment', 'adjustment'])
                  ->default('payment')
                  ->after('received_amount');

        });
    }

    public function down()
    {
        Schema::table('income', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
