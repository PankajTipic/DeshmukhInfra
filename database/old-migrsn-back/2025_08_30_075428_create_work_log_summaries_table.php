<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('work_log_summaries', function (Blueprint $table) {
            $table->id();
            $table->date('date'); // log date
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('project_id');
            $table->decimal('grand_total', 15, 2)->default(0); // total of work_points + survey
            $table->integer('count')->default(0); // number of records aggregated
            $table->timestamps();

            $table->unique(['date', 'company_id', 'project_id'], 'unique_daily_summary');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_log_summaries');
    }
};
