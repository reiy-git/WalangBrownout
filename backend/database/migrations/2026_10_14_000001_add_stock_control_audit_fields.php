<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('seasonal_demand_multiplier', 4, 2)->default(1.00);
            $table->unsignedInteger('max_stock_level')->nullable();
        });

        DB::table('products')
            ->where('abc_category', 'A')
            ->update(['seasonal_demand_multiplier' => 1.50]);

        Schema::table('inventory_ledgers', function (Blueprint $table) {
            $table->text('notes')->nullable();
            $table->integer('quantity_before')->nullable();
            $table->integer('quantity_after')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('inventory_ledgers', function (Blueprint $table) {
            $table->dropColumn(['notes', 'quantity_before', 'quantity_after']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['seasonal_demand_multiplier', 'max_stock_level']);
        });
    }
};
