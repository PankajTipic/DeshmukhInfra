<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Use DB statement to alter column nullability to avoid doctrine/dbal issues
        DB::statement('ALTER TABLE machinery_stock_movements MODIFY from_machine_id BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE machinery_stock_movements MODIFY to_machine_id BIGINT UNSIGNED NULL');
    }

    public function down()
    {
        DB::statement('ALTER TABLE machinery_stock_movements MODIFY from_machine_id BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE machinery_stock_movements MODIFY to_machine_id BIGINT UNSIGNED NOT NULL');
    }
};
