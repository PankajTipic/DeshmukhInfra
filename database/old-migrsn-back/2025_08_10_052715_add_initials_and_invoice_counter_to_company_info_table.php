<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up()
{
    Schema::table('company_info', function (Blueprint $table) {
        $table->string('initials')->nullable();
        $table->unsignedInteger('invoice_counter')->default(1)->after('initials');
    });
}

public function down()
{
    Schema::table('company_info', function (Blueprint $table) {
        $table->dropColumn(['initials', 'invoice_counter']);
    });
}
};
