<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku', 50)->unique();
            $table->string('name', 255);
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->enum('abc_category', ['A', 'B', 'C'])->default('B');
            $table->integer('expiry_months')->default(0);
            $table->integer('reorder_point')->default(0);
            $table->integer('safety_stock')->default(0);
            $table->decimal('annual_demand', 10, 2)->default(0);
            $table->date('last_reorder_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};