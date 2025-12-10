<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->string('bank_name')->nullable();
            $table->string('acc_number')->nullable();
            $table->string('ifsc')->nullable();
            $table->string('aadhar')->nullable();
            $table->string('pan')->nullable();
            $table->string('transaction_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn([
                'bank_name',
                'acc_number',
                'ifsc',
                'aadhar',
                'pan',
                'transaction_id',
            ]);
        });
    }
};
