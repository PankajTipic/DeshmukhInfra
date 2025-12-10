<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('api_keys', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Who is using this key (TIPIC Hub, etc.)
            $table->string('key')->unique(); // API key string
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('api_keys');
    }
};

