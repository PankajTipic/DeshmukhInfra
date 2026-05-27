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
        Schema::create('machinery_documents', function (Blueprint $table) {

            $table->id();

            $table->foreignId('machinery_id')
                ->constrained('machineries')
                ->onDelete('cascade');

            $table->enum('document_type', [
                'PUC',
                'INSURANCE',
                'FITNESS',
                'PERMIT',
                'ROAD_TAX',
                'OTHER'
            ]);

            $table->string('document_number')->nullable();

            $table->date('issue_date')->nullable();

            $table->date('expiry_date')->nullable();

            $table->string('document_file')->nullable();

            $table->text('remark')->nullable();

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machinery_documents');
    }
};