<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('raw_material_logs', function (Blueprint $table) {
            // Drop old unnecessary columns
            $table->dropColumn([
                'type',
                'quantity',
                'employee',
                'date',
                'rate',
                'total',
            ]);

            // Add new columns
            $table->unsignedBigInteger('project_id')->after('company_id');
            $table->decimal('current_stock', 12, 2)->default(0)->after('project_id');
        });
    }

    public function down(): void
    {
        Schema::table('raw_material_logs', function (Blueprint $table) {
            // Rollback: remove new columns
            $table->dropColumn(['project_id', 'current_stock']);

            // Recreate old columns
            $table->enum('type', ['add', 'used', 'buy'])->nullable();
            $table->decimal('quantity', 10, 2)->nullable();
            $table->string('employee')->nullable();
            $table->date('date')->nullable();
            $table->decimal('rate', 10, 2)->nullable();
            $table->decimal('total', 12, 2)->nullable();
        });
    }
};
