<?php

namespace App\Http\Controllers;

use App\Models\ProductBatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductBatchController extends Controller
{
    // List all inventory batches
    public function index(): JsonResponse
    {
        $batches = ProductBatch::with('product')->get();

        return response()->json($batches);
    }

    // Add a new batch of products
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'batch_number' => 'required|string|max:100',
            'date_received' => 'required|date',
            'quantity_received' => 'required|integer|min:0',
            'quantity_remaining' => 'required|integer|min:0',
            'expiry_date' => 'required|date',
            'status' => 'required|in:active,depleted,expired',
        ]);

        $batch = ProductBatch::create($validated);

        $batch->load('product');

        return response()->json([
            'message' => 'Product batch created successfully.',
            'product_batch' => $batch,
        ], 201);
    }

    // Show details of one specific batch
    public function show(ProductBatch $productBatch): JsonResponse
    {
        $productBatch->load('product');

        return response()->json($productBatch);
    }

    // Fix or update batch info
    public function update(Request $request, ProductBatch $productBatch): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'sometimes|required|exists:products,id',
            'batch_number' => 'sometimes|required|string|max:100',
            'date_received' => 'sometimes|required|date',
            'quantity_received' => 'sometimes|required|integer|min:0',
            'quantity_remaining' => 'sometimes|required|integer|min:0',
            'expiry_date' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:active,depleted,expired',
        ]);

        $productBatch->update($validated);

        $productBatch->load('product');

        return response()->json([
            'message' => 'Product batch updated successfully.',
            'product_batch' => $productBatch,
        ]);
    }

    // Remove a batch record
    public function destroy(ProductBatch $productBatch): JsonResponse
    {
        $productBatch->delete();

        return response()->json([
            'message' => 'Product batch deleted successfully.',
        ]);
    }
}