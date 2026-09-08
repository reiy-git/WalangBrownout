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
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')->after('id')->constrained()->onDelete('restrict');
            $table->timestamp('order_date')->after('user_id')->default(now());
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending')->change();
            $table->integer('total_items')->after('status')->default(0);
            $table->decimal('total_amount', 12, 2)->after('total_items')->default(0);
            $table->text('notes')->after('total_amount')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'order_date', 'total_items', 'total_amount', 'notes']);
        });
    }
};
