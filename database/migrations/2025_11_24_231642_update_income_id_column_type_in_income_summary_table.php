<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up()
{
    Schema::table('income_summary', function (Blueprint $table) {
        $table->unsignedBigInteger('income_id')->change();
    });
}

public function down()
{
    Schema::table('income_summary', function (Blueprint $table) {
        // revert back to old type if needed
        $table->string('income_id')->change();
    });
}

};
