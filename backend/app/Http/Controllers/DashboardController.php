<?php

namespace App\Http\Controllers;

use App\Models\InventoryLedger;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductBatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Manager dashboard KPI calculations and activity feeds
class DashboardController extends Controller
{
    // Compute total inventory valuations and warning counters
    public function summary(Request $request): JsonResponse
    {
        $totalProducts = Product::count();
        $lowStockCount = $this->lowStockProducts()->get()->count();

        $expiringSoonCount = ProductBatch::where('status', 'active')
            ->whereHas('product', fn ($q) => $q->where('abc_category', 'C'))
            ->whereBetween('expiry_date', [now(), now()->addDays(7)])
            ->count();

        $pendingOrders = Order::where('status', 'pending')->count();

        $totalInventoryValue = ProductBatch::join('products', 'products.id', '=',
            'product_batches.product_id')
            ->where('product_batches.status', 'active')
            ->sum(DB::raw('product_batches.quantity_remaining * products.unit_cost'));

        return response()->json([
            'summary_item_1' => ['label' => 'Total Products', 'value' => $totalProducts],
            'summary_item_2' => ['label' => 'Low Stock Alerts', 'value' => $lowStockCount],
            'summary_item_3' => ['label' => 'Expiring Soon (Category C)', 'value' =>
                $expiringSoonCount],
            'summary_item_4' => ['label' => 'Pending Orders', 'value' => $pendingOrders],
            'summary_item_5' => ['label' => 'Total Inventory Value', 'value' => round((float)
                $totalInventoryValue, 2)],
        ]);
    }

    // Get recent inventory ledger stream
    public function panel1(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 10);

        $entries = InventoryLedger::with(['product', 'batch', 'user'])
            ->orderByDesc('timestamp')
            ->limit($limit)
            ->get();

        $panel1 = $entries->map(function (InventoryLedger $entry) {
            return [
                'product_name' => $entry->product?->name,
                'sku' => $entry->product?->sku,
                'transaction_type' => $entry->transaction_type,
                'quantity' => $entry->quantity,
                'batch_number' => $entry->batch?->batch_number,
                'user' => $entry->user?->name,
                'timestamp' => $entry->timestamp?->toIso8601String(),
            ];
        });

        return response()->json(['panel1' => $panel1]);
    }

    // Get low stock warnings and FIFO batch alerts
    public function panel2(Request $request): JsonResponse
    {
        $reorderAlerts = $this->lowStockProducts()->get()->map(function (Product $product) {
            $currentStock = (int) $product->activeBatches()->sum('quantity_remaining');

            return [
                'sku' => $product->sku,
                'name' => $product->name,
                'abc_category' => $product->abc_category,
                'current_stock' => $currentStock,
                'reorder_point' => $product->reorder_point,
                'alert_level' => $currentStock <= $product->safety_stock ? 'critical' :
                    'warning',
            ];
        });

        $expiryAlerts = ProductBatch::with('product')
            ->where('status', 'active')
            ->whereHas('product', fn ($q) => $q->where('abc_category', 'C'))
            ->whereBetween('expiry_date', [now(), now()->addDays(7)])
            ->orderBy('expiry_date')
            ->get()
            ->map(function (ProductBatch $batch) {
                return [
                    'batch_number' => $batch->batch_number,
                    'product_name' => $batch->product?->name,
                    'quantity_remaining' => $batch->quantity_remaining,
                    'expiry_date' => $batch->getRawOriginal('expiry_date'),
                    'pick_order' => 'FIFO',
                ];
            });

        return response()->json([
            'reorder_alerts' => $reorderAlerts,
            'expiry_alerts' => $expiryAlerts,
        ]);
    }

    // Filter products whose current stock is at or below ROP
    // ROP: Trigger alert based on Reorder Point formula (Blueprint §6.1, §9.2)
    private function lowStockProducts()
    {
        return Product::select('products.*')
            ->whereRaw(
                '(SELECT COALESCE(SUM(quantity_remaining), 0)
                    FROM product_batches
                    WHERE product_batches.product_id = products.id
                    AND product_batches.status = ?) <= products.reorder_point',
                ['active']
            );
    }
}

