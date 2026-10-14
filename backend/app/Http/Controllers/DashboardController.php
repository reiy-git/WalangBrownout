<?php

namespace App\Http\Controllers;

use App\Models\InventoryLedger;
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
        $lowStockCount = $this->lowStockProducts()->count();

        $expiringSoonCount = ProductBatch::where('status', 'active')
            ->where('quantity_remaining', '>', 0)
            ->whereHas('product', fn ($q) => $q->where('abc_category', 'C'))
            ->whereBetween('expiry_date', [today()->toDateString(), today()->addDays(7)->toDateString()])
            ->count();

        $totalInventoryValue = ProductBatch::join('products', 'products.id', '=',
            'product_batches.product_id')
            ->where('product_batches.status', 'active')
            ->where('product_batches.quantity_remaining', '>', 0)
            ->whereDate('product_batches.expiry_date', '>=', today())
            ->sum(DB::raw('product_batches.quantity_remaining * products.unit_cost'));

        return response()->json([
            'summary_item_1' => ['label' => 'Total Products', 'value' => $totalProducts],
            'summary_item_2' => ['label' => 'Low Stock Alerts', 'value' => $lowStockCount],
            'summary_item_3' => ['label' => 'Expiring Soon (Category C)', 'value' => $expiringSoonCount],
            'summary_item_4' => ['label' => 'Total Inventory Value', 'value' => round((float)
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
            $currentStock = (int) $product->current_stock;

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
            ->where('quantity_remaining', '>', 0)
            ->whereHas('product', fn ($q) => $q->where('abc_category', 'C'))
            ->whereBetween('expiry_date', [today()->toDateString(), today()->addDays(7)->toDateString()])
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

        $overstockAlerts = Product::select('products.*')
            ->leftJoinSub($this->eligibleStockTotals(), 'stock_totals', function ($join) {
                $join->on('stock_totals.product_id', '=', 'products.id');
            })
            ->selectRaw('COALESCE(stock_totals.current_stock, 0) AS current_stock')
            ->whereNotNull('products.max_stock_level')
            ->whereRaw('COALESCE(stock_totals.current_stock, 0) > products.max_stock_level')
            ->get()
            ->map(fn (Product $product) => [
                'sku' => $product->sku,
                'name' => $product->name,
                'current_stock' => (int) $product->current_stock,
                'max_stock_level' => $product->max_stock_level,
                'excess_quantity' => (int) $product->current_stock - $product->max_stock_level,
            ]);

        return response()->json([
            'reorder_alerts' => $reorderAlerts,
            'expiry_alerts' => $expiryAlerts,
            'overstock_alerts' => $overstockAlerts,
        ]);
    }

    // Filter products whose current stock is at or below ROP
    // ROP: Trigger alert based on Reorder Point formula (Blueprint §6.1, §9.2)
    private function lowStockProducts()
    {
        return Product::select('products.*')
            ->leftJoinSub($this->eligibleStockTotals(), 'stock_totals', function ($join) {
                $join->on('stock_totals.product_id', '=', 'products.id');
            })
            ->selectRaw('COALESCE(stock_totals.current_stock, 0) AS current_stock')
            ->whereRaw('COALESCE(stock_totals.current_stock, 0) <= products.reorder_point');
    }

    private function eligibleStockTotals()
    {
        return ProductBatch::query()
            ->select('product_id')
            ->selectRaw('SUM(quantity_remaining) AS current_stock')
            ->where('status', 'active')
            ->where('quantity_remaining', '>', 0)
            ->whereDate('expiry_date', '>=', today())
            ->groupBy('product_id');
    }
}
