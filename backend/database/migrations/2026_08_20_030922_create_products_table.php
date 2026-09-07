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
            $table->increments('id');
            $table->string('sku', 50);
            $table->string('name', 255);
            $table->decimal('unit_cost', 10, 2);
            $table->enum('abc_category', ['A', 'B', 'C']);
            $table->integer('expiry_months');
            $table->integer('reorder_point');
            $table->integer('safety_stock');
            $table->decimal('annual_demand', 10, 2);
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