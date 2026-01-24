// database/migrations/xxxx_xx_xx_create_onboarding_partners_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOnboardingPartnersTable extends Migration
{
    public function up()
    {
        Schema::create('onboarding_partners', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('mobile')->unique();
            $table->string('password');
            $table->unsignedBigInteger('type_id');
            $table->integer('type')->default(3);
            $table->string('bank_name');
            $table->string('account_number');
            $table->string('ifsc_code');
            $table->timestamps();

            $table->foreign('type_id')->references('id')->on('onboarding_partner_types')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('onboarding_partners');
    }
}
