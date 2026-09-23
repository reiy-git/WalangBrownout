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

        $claire = User::updateOrCreate(
            ['email' => 'claire.delacruz@example.com'],
            [
                'name' => 'Claire Dela Cruz',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'active' => true,
            ]
        );

        // Additional WalangBrownout products. Category C products are consumables
        // with expiry dates so the FIFO and expiry-alert screens have useful data.
        $catalog = [
            ['sku' => 'APP-AC-002', 'name' => 'Daikin 2.0HP Inverter Floor Mounted Air Conditioner', 'cost' => 48900, 'category' => 'A', 'months' => 0, 'safety' => 4, 'demand' => 96, 'received' => 21, 'quantity' => 8, 'remaining' => 6, 'expiry' => now()->addYears(5), 'user' => $manager],
            ['sku' => 'APP-REF-003', 'name' => 'LG Smart Inverter Side-by-Side Refrigerator', 'cost' => 54000, 'category' => 'A', 'months' => 0, 'safety' => 3, 'demand' => 72, 'received' => 42, 'quantity' => 6, 'remaining' => 3, 'expiry' => now()->addYears(5), 'user' => $manager],
            ['sku' => 'APP-DHM-005', 'name' => 'Carrier Portable Dehumidifier 20L', 'cost' => 11200, 'category' => 'B', 'months' => 0, 'safety' => 8, 'demand' => 180, 'received' => 14, 'quantity' => 18, 'remaining' => 15, 'expiry' => now()->addYears(4), 'user' => $staff],
            ['sku' => 'IT-LAP-001', 'name' => 'Lenovo ThinkPad T14 Gen 4 Core i7 16GB', 'cost' => 64500, 'category' => 'B', 'months' => 0, 'safety' => 5, 'demand' => 120, 'received' => 30, 'quantity' => 12, 'remaining' => 9, 'expiry' => now()->addYears(4), 'user' => $manager],
            ['sku' => 'POS-SCN-005', 'name' => 'Zebra DS2208 2D Handheld Barcode Scanner', 'cost' => 4850, 'category' => 'B', 'months' => 0, 'safety' => 12, 'demand' => 360, 'received' => 60, 'quantity' => 20, 'remaining' => 7, 'expiry' => now()->addYears(4), 'user' => $staff],
            ['sku' => 'SUP-PPR-006', 'name' => 'Thermal POS Paper Rolls 80mm x 70mm (Box of 50)', 'cost' => 1850, 'category' => 'C', 'months' => 24, 'safety' => 25, 'demand' => 1800, 'received' => 2, 'quantity' => 60, 'remaining' => 58, 'expiry' => now()->addMonths(24), 'user' => $claire],
            ['sku' => 'MED-PPE-007', 'name' => 'Nitrile Heavy-Duty Workshop Gloves (Box of 100)', 'cost' => 620, 'category' => 'C', 'months' => 36, 'safety' => 30, 'demand' => 2400, 'received' => 7, 'quantity' => 100, 'remaining' => 85, 'expiry' => now()->addMonths(36), 'user' => $staff],
            ['sku' => 'MED-FAK-008', 'name' => 'Workplace First Aid Kit Refill Pack', 'cost' => 2150, 'category' => 'C', 'months' => 24, 'safety' => 8, 'demand' => 260, 'received' => 45, 'quantity' => 15, 'remaining' => 4, 'expiry' => now()->addDays(6), 'user' => $claire],
        ];

        foreach ($catalog as $index => $item) {
            $multiplier = $item['category'] === 'A' ? 1.5 : 1;
            $rop = (int) round((($item['demand'] / 365) * $multiplier * 7) + $item['safety']);
            $product = Product::updateOrCreate(['sku' => $item['sku']], [
                'name' => $item['name'],
                'unit_cost' => $item['cost'],
                'abc_category' => $item['category'],
                'expiry_months' => $item['months'],
                'reorder_point' => $rop,
                'safety_stock' => $item['safety'],
                'annual_demand' => $item['demand'],
                'last_reorder_date' => now()->subDays($item['received'])->toDateString(),
            ]);

            $batch = ProductBatch::updateOrCreate(['batch_number' => 'WBA-2026-' . str_pad((string) ($index + 10), 3, '0', STR_PAD_LEFT)], [
                'product_id' => $product->id,
                'date_received' => now()->subDays($item['received'])->toDateString(),
                'quantity_received' => $item['quantity'],
                'quantity_remaining' => $item['remaining'],
                'expiry_date' => $item['expiry']->toDateString(),
                'status' => 'active',
            ]);

            InventoryLedger::firstOrCreate([
                'product_id' => $product->id,
                'product_batch_id' => $batch->id,
                'transaction_type' => 'receive',
            ], [
                'user_id' => $item['user']->id,
                'quantity' => $item['quantity'],
                'timestamp' => now()->subDays($item['received']),
            ]);

            $dispatched = $item['quantity'] - $item['remaining'];
            if ($dispatched > 0) {
                InventoryLedger::create([
                    'product_id' => $product->id,
                    'product_batch_id' => $batch->id,
                    'user_id' => $staff->id,
                    'transaction_type' => 'dispatch',
                    'quantity' => $dispatched,
                    'timestamp' => now()->subDays(max(1, intdiv($item['received'], 2))),
                ]);
            }
        }

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

