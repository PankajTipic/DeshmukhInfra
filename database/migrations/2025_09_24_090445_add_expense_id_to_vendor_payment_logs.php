<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('vendor_payment_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('expense_id')->nullable()->after('vendor_payment_id');
            
            $table->foreign('expense_id')
                  ->references('id')
                  ->on('expenses')
                  ->onDelete('set null');
        });
    }

    public function down(): void {
        Schema::table('vendor_payment_logs', function (Blueprint $table) {
            $table->dropForeign(['expense_id']);
            $table->dropColumn('expense_id');
        });
    }
};