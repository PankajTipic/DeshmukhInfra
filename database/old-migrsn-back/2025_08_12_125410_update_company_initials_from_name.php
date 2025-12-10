<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update initials based on first 3 letters of company_name (remove spaces, uppercase)
        DB::statement("
            UPDATE company_info
            SET initials = UPPER(LEFT(REPLACE(company_name, ' ', ''), 3));
        ");
    }

    public function down(): void
    {
        // Optionally revert initials to NULL (or keep them unchanged if rollback not needed)
        DB::statement("
            UPDATE company_info
            SET initials = NULL;
        ");
    }
};
