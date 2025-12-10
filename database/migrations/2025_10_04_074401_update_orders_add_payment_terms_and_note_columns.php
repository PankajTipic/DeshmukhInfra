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
        Schema::table('orders', function (Blueprint $table) {
            // ✅ Rename existing column
            $table->renameColumn('terms', 'terms_and_conditions');

            // ✅ Add new columns after 'igst'
            $table->text('payment_terms')->nullable()->after('igst');
            $table->text('note')->nullable()->after('payment_terms');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // ✅ Revert column name back
            $table->renameColumn('terms_and_conditions', 'terms');

            // ✅ Drop newly added columns
            $table->dropColumn(['payment_terms', 'note']);
        });
    }
};
