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
        Schema::table('expense_summaries', function (Blueprint $table) {
            // Add project_id column
            $table->unsignedBigInteger('project_id')->nullable()->after('company_id');

            // Drop old unique constraint first
            $table->dropUnique(['expense_date', 'company_id']);

            // Add new unique constraint with project_id
            $table->unique(['expense_date', 'company_id', 'project_id'], 'unique_expense_summary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expense_summaries', function (Blueprint $table) {
            $table->dropUnique('unique_expense_summary');
            $table->dropColumn('project_id');

            // Restore old unique constraint
            $table->unique(['expense_date', 'company_id']);
        });
    }
};
