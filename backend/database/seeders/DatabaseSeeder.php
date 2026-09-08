<?php

namespace Database\Seeders;

use App\Models\InventoryLedger;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Manager & Staff Users
        $manager = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Rely Briones',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'active' => true,
            ]
        );

        $admin = User::updateOrCreate(
            ['email' => 'admin@walangbrownout.ph'],
            [
                'name' => 'Toni Owfler',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'active' => true,
            ]
        );

        $staff = User::updateOrCreate(
            ['email' => 'staff@example.com'],
            [
                'name' => 'Marriyell Burgos',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'ron.canayong@example.com'],
            [
                'name' => 'Ron Canayong',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'active' => true,
            ]
        );

        // Seed Sample Products
        $p1 = Product::updateOrCreate(
            ['sku' => 'APP-AC-001'],
            [
                'name' => '1.5HP Split Type Inverter Air Conditioner',
                'unit_cost' => 26500.00,
                'abc_category' => 'A',
                'expiry_months' => 0,
                'reorder_point' => 20,
                'safety_stock' => 10,
                'annual_demand' => 500.00,
                'last_reorder_date' => now()->subDays(15)->toDateString(),
            ]
        );

        $p2 = Product::updateOrCreate(
            ['sku' => 'APP-REF-002'],
            [
                'name' => 'Double Door Refrigerator 8.5 cu ft',
                'unit_cost' => 17990.00,
                'abc_category' => 'B',
                'expiry_months' => 0,
                'reorder_point' => 15,
                'safety_stock' => 8,
                'annual_demand' => 240.00,
                'last_reorder_date' => now()->subDays(30)->toDateString(),
            ]
        );

        $p3 = Product::updateOrCreate(
            ['sku' => 'ACC-FLT-003'],
            [
                'name' => 'HEPA Air Purifier Replacement Filter',
                'unit_cost' => 1250.00,
                'abc_category' => 'C',
                'expiry_months' => 12,
                'reorder_point' => 25,
                'safety_stock' => 10,
                'annual_demand' => 800.00,
                'last_reorder_date' => now()->subDays(5)->toDateString(),
            ]
        );

        $p4 = Product::updateOrCreate(
            ['sku' => 'APP-FAN-004'],
            [
                'name' => 'Stand Fan 16-inch Metal Blade',
                'unit_cost' => 2450.00,
                'abc_category' => 'A',
                'expiry_months' => 0,
                'reorder_point' => 15,
                'safety_stock' => 8,
                'annual_demand' => 600.00,
                'last_reorder_date' => now()->subDays(40)->toDateString(),
            ]
        );

        // Seed Batches (FIFO tracking)
        $b1 = ProductBatch::updateOrCreate(
            ['batch_number' => 'BATCH-2026-001'],
            [
                'product_id' => $p1->id,
                'date_received' => now()->subDays(20)->toDateString(),
                'quantity_received' => 30,
                'quantity_remaining' => 30,
                'expiry_date' => now()->addYears(3)->toDateString(),
                'status' => 'active',
            ]
        );

        $b2 = ProductBatch::updateOrCreate(
            ['batch_number' => 'BATCH-2026-002'],
            [
                'product_id' => $p2->id,
                'date_received' => now()->subDays(10)->toDateString(),
                'quantity_received' => 20,
                'quantity_remaining' => 20,
                'expiry_date' => now()->addYears(5)->toDateString(),
                'status' => 'active',
            ]
        );

        $b3 = ProductBatch::updateOrCreate(
            ['batch_number' => 'BATCH-2026-003'],
            [
                'product_id' => $p3->id,
                'date_received' => now()->subDays(5)->toDateString(),
                'quantity_received' => 50,
                'quantity_remaining' => 50,
                'expiry_date' => now()->addDays(5)->toDateString(), // Expiring soon for Cat C demo
                'status' => 'active',
            ]
        );

        $b4 = ProductBatch::updateOrCreate(
            ['batch_number' => 'BATCH-2026-004'],
            [
                'product_id' => $p4->id,
                'date_received' => now()->subDays(40)->toDateString(),
                'quantity_received' => 6,
                'quantity_remaining' => 6, // Low stock demo (6 <= 15 ROP)
                'expiry_date' => now()->addYears(4)->toDateString(),
                'status' => 'active',
            ]
        );

        // Seed Ledger Entries
        InventoryLedger::firstOrCreate(
            ['product_id' => $p1->id, 'product_batch_id' => $b1->id, 'transaction_type' => 'receive'],
            [
                'user_id' => $manager->id,
                'quantity' => 30,
                'timestamp' => now()->subDays(20),
            ]
        );

        InventoryLedger::firstOrCreate(
            ['product_id' => $p2->id, 'product_batch_id' => $b2->id, 'transaction_type' => 'receive'],
            [
                'user_id' => $manager->id,
                'quantity' => 20,
                'timestamp' => now()->subDays(10),
            ]
        );

        InventoryLedger::firstOrCreate(
            ['product_id' => $p3->id, 'product_batch_id' => $b3->id, 'transaction_type' => 'receive'],
            [
                'user_id' => $staff->id,
                'quantity' => 50,
                'timestamp' => now()->subDays(5),
            ]
        );

        InventoryLedger::firstOrCreate(
            ['product_id' => $p4->id, 'product_batch_id' => $b4->id, 'transaction_type' => 'receive'],
            [
                'user_id' => $manager->id,
                'quantity' => 6,
                'timestamp' => now()->subDays(40),
            ]
        );
    }
}

