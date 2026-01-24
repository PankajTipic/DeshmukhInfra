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
            // Add project_id right after id
            $table->unsignedBigInteger('customer_id')->nullable()->after('id');

            // Add other columns
            $table->string('contact')->nullable()->after('total_price');
            $table->string('payment_by')->nullable()->after('contact');
            $table->string('payment_type')->nullable()->after('payment_by');
            $table->double('pending_amount')->nullable()->after('payment_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn([
                'project_id',
                'contact',
                'payment_by',
                'payment_type',
                'pending_amount',
            ]);
        });
    }
};
