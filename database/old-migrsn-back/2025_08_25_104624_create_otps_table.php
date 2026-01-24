<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
public function up(): void
{
Schema::create('otps', function (Blueprint $table) {
$table->id();
$table->string('email')->index();
$table->string('code_hash'); // store hashed OTP only
$table->dateTime('expires_at')->index();
$table->dateTime('consumed_at')->nullable()->index();
$table->unsignedTinyInteger('attempts')->default(0);
$table->timestamps();
});
}


public function down(): void
{
Schema::dropIfExists('otps');
}
};