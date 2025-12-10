<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('operators', function (Blueprint $table) {
            $table->string('bank_name')->nullable()->after('project_id');
            $table->string('account_number')->nullable()->after('bank_name');
            $table->string('adhar_number')->nullable()->after('account_number');
            $table->string('ifsc_code')->nullable()->after('adhar_number');
            $table->string('pan_number')->nullable()->after('ifsc_code');
        });
    }

    public function down(): void
    {
        Schema::table('operators', function (Blueprint $table) {
            $table->dropColumn([
                'bank_name',
                'account_number',
                'adhar_number',
                'ifsc_code',
                'pan_number'
            ]);
        });
    }
};
