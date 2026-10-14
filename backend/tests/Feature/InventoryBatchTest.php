<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InventoryBatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_batches_excludes_depleted_empty_and_expired_batches(): void
    {
        $product = $this->createProduct();

        $eligible = $this->createBatch($product, 'ELIGIBLE', 5);
        $this->createBatch($product, 'DEPLETED', 5, ['status' => 'depleted']);
        $this->createBatch($product, 'EMPTY', 0);
        $this->createBatch($product, 'EXPIRED', 5, [
            'expiry_date' => today()->subDay()->toDateString(),
        ]);

        $this->assertSame(
            [$eligible->id],
            $product->activeBatches()->pluck('id')->all()
        );
    }

    public function test_dispatch_uses_oldest_eligible_batches_and_records_each_movement(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $product = $this->createProduct();

        $oldest = $this->createBatch($product, 'OLDEST', 3, [
            'date_received' => today()->subDays(3)->toDateString(),
        ]);
        $newer = $this->createBatch($product, 'NEWER', 5, [
            'date_received' => today()->subDay()->toDateString(),
        ]);
        $this->createBatch($product, 'EXPIRED', 50, [
            'expiry_date' => today()->subDay()->toDateString(),
        ]);

        $this->postJson('/api/transactions/dispatch', [
            'product_id' => $product->id,
            'department' => 'Operations',
            'quantity' => 5,
        ])->assertOk();

        $this->assertSame(0, $oldest->fresh()->quantity_remaining);
        $this->assertSame('depleted', $oldest->fresh()->status);
        $this->assertSame(3, $newer->fresh()->quantity_remaining);
        $this->assertDatabaseHas('inventory_ledgers', [
            'product_batch_id' => $oldest->id,
            'transaction_type' => 'dispatch',
            'quantity' => 3,
        ]);
        $this->assertDatabaseHas('inventory_ledgers', [
            'product_batch_id' => $newer->id,
            'transaction_type' => 'dispatch',
            'quantity' => 2,
        ]);
    }

    public function test_dispatch_rejects_insufficient_eligible_stock_without_mutating_batches(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $product = $this->createProduct();
        $eligible = $this->createBatch($product, 'ELIGIBLE', 3);
        $this->createBatch($product, 'EXPIRED', 20, [
            'expiry_date' => today()->subDay()->toDateString(),
        ]);

        $this->postJson('/api/transactions/dispatch', [
            'product_id' => $product->id,
            'department' => 'Operations',
            'quantity' => 4,
        ])->assertUnprocessable()
            ->assertJsonPath('message', 'Insufficient stock. Available: 3, Requested: 4');

        $this->assertSame(3, $eligible->fresh()->quantity_remaining);
        $this->assertDatabaseCount('inventory_ledgers', 0);
    }

    public function test_dashboard_reorder_alerts_use_aggregated_eligible_stock(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $product = $this->createProduct(['reorder_point' => 6]);
        $this->createBatch($product, 'CURRENT', 5);
        $this->createBatch($product, 'EXPIRED', 40, [
            'expiry_date' => today()->subDay()->toDateString(),
        ]);

        $this->getJson('/api/v1/dashboard/panel2')
            ->assertOk()
            ->assertJsonPath('reorder_alerts.0.current_stock', 5)
            ->assertJsonPath('reorder_alerts.0.reorder_point', 6);
    }

    public function test_expiry_alerts_include_batches_expiring_today(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $product = $this->createProduct(['abc_category' => 'C']);
        $batch = $this->createBatch($product, 'EXPIRES-TODAY', 2, [
            'expiry_date' => today()->toDateString(),
        ]);

        $this->getJson('/api/v1/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('summary_item_3.value', 1);

        $this->getJson('/api/v1/dashboard/panel2')
            ->assertOk()
            ->assertJsonPath('expiry_alerts.0.batch_number', $batch->batch_number);
    }

    public function test_manager_can_reconcile_a_batch_and_ledger_records_signed_delta_and_reason(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'manager']));
        $product = $this->createProduct();
        $batch = $this->createBatch($product, 'COUNTED', 8);

        $this->postJson("/api/product-batches/{$batch->id}/count", [
            'quantity' => 5,
            'reason' => 'Physical count after cycle count',
        ])->assertOk()
            ->assertJsonPath('batch.quantity_remaining', 5)
            ->assertJsonPath('ledger.transaction_type', 'count_adjustment')
            ->assertJsonPath('ledger.quantity', -3)
            ->assertJsonPath('ledger.quantity_before', 8)
            ->assertJsonPath('ledger.quantity_after', 5)
            ->assertJsonPath('ledger.notes', 'Physical count after cycle count');

        $this->assertSame(5, $batch->fresh()->quantity_remaining);
    }

    public function test_manager_counting_zero_depletes_batch_and_audits_the_count(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $product = $this->createProduct();
        $batch = $this->createBatch($product, 'EMPTY-COUNT', 2);

        $this->postJson("/api/product-batches/{$batch->id}/count", [
            'quantity' => 0,
            'reason' => 'Verified empty during cycle count',
        ])->assertOk()
            ->assertJsonPath('batch.status', 'depleted')
            ->assertJsonPath('ledger.quantity', -2)
            ->assertJsonPath('ledger.quantity_after', 0);
    }

    public function test_staff_cannot_reconcile_physical_stock_counts(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $product = $this->createProduct();
        $batch = $this->createBatch($product, 'COUNTED', 8);

        $this->postJson("/api/product-batches/{$batch->id}/count", [
            'quantity' => 5,
            'reason' => 'Physical count',
        ])->assertForbidden();

        $this->assertSame(8, $batch->fresh()->quantity_remaining);
        $this->assertDatabaseCount('inventory_ledgers', 0);
    }

    public function test_dashboard_reports_overstock_only_when_a_manager_configured_a_maximum(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $product = $this->createProduct(['max_stock_level' => 5]);
        $this->createBatch($product, 'CURRENT', 8);
        $this->createBatch($product, 'EXPIRED', 40, [
            'expiry_date' => today()->subDay()->toDateString(),
        ]);
        $this->createProduct(['sku' => 'NO-MAXIMUM']);

        $this->getJson('/api/v1/dashboard/panel2')
            ->assertOk()
            ->assertJsonPath('overstock_alerts.0.sku', $product->sku)
            ->assertJsonPath('overstock_alerts.0.current_stock', 8)
            ->assertJsonPath('overstock_alerts.0.max_stock_level', 5)
            ->assertJsonPath('overstock_alerts.0.excess_quantity', 3)
            ->assertJsonCount(1, 'overstock_alerts');
    }

    public function test_manager_can_configure_seasonal_multiplier_and_maximum_stock(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'manager']));

        $this->postJson('/api/products', [
            'sku' => 'SEASONAL-1',
            'name' => 'Seasonal product',
            'unit_cost' => 10,
            'abc_category' => 'A',
            'expiry_months' => 0,
            'safety_stock' => 2,
            'annual_demand' => 365,
            'seasonal_demand_multiplier' => 2,
            'max_stock_level' => 40,
        ])->assertCreated()
            ->assertJsonPath('product.seasonal_demand_multiplier', '2.00')
            ->assertJsonPath('product.max_stock_level', 40)
            ->assertJsonPath('product.reorder_point', 16);
    }

    public function test_product_batch_routes_do_not_allow_unledgered_quantity_edits_or_deletion(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'manager']));
        $product = $this->createProduct();
        $batch = $this->createBatch($product, 'AUDITED', 8);

        $this->putJson("/api/product-batches/{$batch->id}", [
            'quantity_remaining' => 2,
        ])->assertMethodNotAllowed();
        $this->deleteJson("/api/product-batches/{$batch->id}")
            ->assertMethodNotAllowed();

        $this->assertSame(8, $batch->fresh()->quantity_remaining);
        $this->assertDatabaseCount('inventory_ledgers', 0);
    }

    private function createProduct(array $attributes = []): Product
    {
        return Product::create(array_merge([
            'sku' => 'SKU-'.fake()->unique()->numerify('#####'),
            'name' => 'Test product',
            'unit_cost' => 10,
            'abc_category' => 'B',
            'expiry_months' => 12,
            'reorder_point' => 0,
            'safety_stock' => 0,
            'annual_demand' => 0,
        ], $attributes));
    }

    private function createBatch(Product $product, string $number, int $remaining, array $attributes = []): ProductBatch
    {
        return ProductBatch::create(array_merge([
            'product_id' => $product->id,
            'batch_number' => $number,
            'date_received' => today()->toDateString(),
            'quantity_received' => max($remaining, 1),
            'quantity_remaining' => $remaining,
            'expiry_date' => today()->addYear()->toDateString(),
            'status' => 'active',
        ], $attributes));
    }
}
