<?php

namespace App\Http\Controllers;

use App\Models\InventoryLedger;
use App\Models\Product;
use App\Models\ProductBatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Handle stock receive/dispatch movements and immutable ledger records
// Ledger is append-only to preserve the audit trail (Blueprint §9.4)
class InventoryLedgerController extends Controller
{
    // List ledger transactions from the database
    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 50);

        $transactions = InventoryLedger::with(['product', 'batch', 'user'])
            ->orderBy('timestamp', 'desc')
            ->limit($limit)
            ->get()
            ->map(function (InventoryLedger $tx) {
                return [
                    'id' => (string) $tx->id,
                    'productId' => $tx->product_id,
                    'productName' => $tx->product?->name ?? 'Unknown',
                    'quantity' => $tx->quantity,
                    'type' => $tx->transaction_type === 'receive' ? 'Received' : 'Dispatched',
                    'transaction_type' => $tx->transaction_type,
                    'user' => $tx->user?->name ?? 'System',
                    'date' => $tx->timestamp?->toDateString() ?? now()->toDateString(),
                    'batchNumber' => $tx->batch?->batch_number,
                ];
            });

        return response()->json($transactions);
    }

    // Receive stock and create a new FIFO product batch + ledger entry
    public function receive(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'supplier' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            'batch_number' => 'nullable|string',
            'expiry_date' => 'nullable|date',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $product = Product::findOrFail($validated['product_id']);
            $batchNumber = $validated['batch_number'] ?? ('BATCH-' . date('Ymd') . '-' . rand(100, 999));
            $expiryDate = $validated['expiry_date'] ?? now()->addMonths($product->expiry_months ?: 12)->toDateString();

            $batch = ProductBatch::create([
                'product_id' => $product->id,
                'batch_number' => $batchNumber,
                'date_received' => now()->toDateString(),
                'quantity_received' => $validated['quantity'],
                'quantity_remaining' => $validated['quantity'],
                'expiry_date' => $expiryDate,
                'status' => 'active',
            ]);

            $ledger = InventoryLedger::create([
                'product_id' => $product->id,
                'product_batch_id' => $batch->id,
                'user_id' => $request->user()?->id,
                'transaction_type' => 'receive',
                'quantity' => $validated['quantity'],
                'timestamp' => now(),
            ]);

            return response()->json([
                'message' => 'Stock received and batch created successfully.',
                'batch' => $batch,
                'ledger' => $ledger,
            ], 201);
        });
    }

    // Dispatch stock using strict FIFO order across active batches
    // FIFO: always dispatch from the oldest non-expired batch first (Blueprint §5–6)
    public function dispatch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'department' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $product = Product::findOrFail($validated['product_id']);
            $needed = $validated['quantity'];

            $availableStock = (int) $product->activeBatches()->sum('quantity_remaining');
            if ($availableStock < $needed) {
                return response()->json([
                    'message' => "Insufficient stock. Available: {$availableStock}, Requested: {$needed}",
                ], 422);
            }

            // Pick oldest active batches first (FIFO)
            $batches = $product->activeBatches()->orderBy('date_received', 'asc')->orderBy('id', 'asc')->get();
            $ledgers = [];

            foreach ($batches as $batch) {
                if ($needed <= 0) break;

                $take = min($batch->quantity_remaining, $needed);
                $batch->quantity_remaining -= $take;
                if ($batch->quantity_remaining === 0) {
                    $batch->status = 'depleted';
                }
                $batch->save();

                $ledgers[] = InventoryLedger::create([
                    'product_id' => $product->id,
                    'product_batch_id' => $batch->id,
                    'user_id' => $request->user()?->id,
                    'transaction_type' => 'dispatch',
                    'quantity' => $take,
                    'timestamp' => now(),
                ]);

                $needed -= $take;
            }

            return response()->json([
                'message' => 'Stock dispatched successfully via FIFO batches.',
                'ledgers' => $ledgers,
            ]);
        });
    }
}
