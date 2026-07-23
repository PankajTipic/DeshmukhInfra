<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->string('name');
            $table->integer('base_type');
            $table->json('permissions')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // Insert default roles for backward compatibility
        DB::table('roles')->insert([
            ['name' => 'Super Admin', 'base_type' => 0, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Admin', 'base_type' => 1, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'User', 'base_type' => 2, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'User++', 'base_type' => 3, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Purchase Vendor', 'base_type' => 4, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Work Log User', 'base_type' => 5, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
