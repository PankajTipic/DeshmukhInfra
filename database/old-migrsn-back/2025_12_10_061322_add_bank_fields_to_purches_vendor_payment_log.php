<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('purches_vendor_payment_log', function (Blueprint $table) {
            $table->string('bank_name')->nullable()->after('remark');
            $table->string('acc_number')->nullable()->after('bank_name');
            $table->string('ifsc')->nullable()->after('acc_number');
            $table->string('transaction_id')->nullable()->after('ifsc'); // COMMON for UPI & BANK
        });
    }

    public function down()
    {
        Schema::table('purches_vendor_payment_log', function (Blueprint $table) {
            $table->dropColumn(['bank_name', 'acc_number', 'ifsc', 'transaction_id']);
        });
    }
};
