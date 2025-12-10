// database/migrations/xxxx_xx_xx_create_onboarding_partner_types_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOnboardingPartnerTypesTable extends Migration
{
    public function up()
    {
        Schema::create('onboarding_partner_types', function (Blueprint $table) {
            $table->id();
            $table->string('partner_type');
            $table->decimal('commission', 8, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('onboarding_partner_types');
    }
}
