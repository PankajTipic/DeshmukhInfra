// database/migrations/xxxx_xx_xx_create_order_summaries_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrderSummariesTable extends Migration
{
    public function up(): void
    {
        Schema::create('order_summaries', function (Blueprint $table) {
            $table->id();
            $table->date('invoice_date');
            $table->unsignedBigInteger('company_id');
            $table->integer('order_count')->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['invoice_date', 'company_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_summaries');
    }
}
