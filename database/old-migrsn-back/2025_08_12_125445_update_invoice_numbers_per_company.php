<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared("
            -- Reset variables
            SET @company_id = 0;
            SET @counter = 0;

            -- Update all orders with proper invoice numbers
            UPDATE orders o
            JOIN (
                SELECT 
                    o.id,
                    ci.initials,
                    o.company_id,
                    @counter := IF(@company_id = o.company_id, @counter + 1, 1) AS counter,
                    @company_id := o.company_id AS dummy
                FROM orders o
                JOIN company_info ci ON ci.company_id = o.company_id
                ORDER BY o.company_id, o.created_at ASC
            ) t ON o.id = t.id
            SET o.invoice_number = CONCAT(t.initials, '-', t.counter);

            -- Update invoice_counter for all companies (including those without orders)
            UPDATE company_info ci
            LEFT JOIN (
                SELECT company_id, 
                       MAX(CAST(SUBSTRING_INDEX(invoice_number, '-', -1) AS UNSIGNED)) + 1 AS next_counter
                FROM orders
                GROUP BY company_id
            ) x ON ci.company_id = x.company_id
            SET ci.invoice_counter = COALESCE(x.next_counter, 1);
        ");
    }

    public function down(): void
    {
        DB::unprepared("
            UPDATE orders SET invoice_number = NULL;
            UPDATE company_info SET invoice_counter = 1;
        ");
    }
};
