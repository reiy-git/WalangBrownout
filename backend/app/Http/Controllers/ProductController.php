<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // Get all products along with their batches
    public function index(): JsonResponse
    {
        $products = Product::with('batches')->get();

        return response()->json($products);
    }

    // Save a new product to the database
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sku' => 'required|string|max:50|unique:products,sku',
            'name' => 'required|string|max:255',
            'unit_cost' => 'required|numeric|min:0',
            'abc_category' => 'required|in:A,B,C',
            'expiry_months' => 'required|integer|min:0',
            'reorder_point' => 'required|integer|min:0',
            'safety_stock' => 'required|integer|min:0',
            'annual_demand' => 'required|numeric|min:0',
            'last_reorder_date' => 'nullable|date',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully.',
            'product' => $product,
        ], 201);
    }

    // Fetch a single product and its batches
    public function show(Product $product): JsonResponse
    {
        $product->load('batches');

        return response()->json($product);
    }

    // Update product info
    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'sku' => 'sometimes|required|string|max:50|unique:products,sku,' . $product->id,
            'name' => 'sometimes|required|string|max:255',
            'unit_cost' => 'sometimes|required|numeric|min:0',
            'abc_category' => 'sometimes|required|in:A,B,C',
            'expiry_months' => 'sometimes|required|integer|min:0',
            'reorder_point' => 'sometimes|required|integer|min:0',
            'safety_stock' => 'sometimes|required|integer|min:0',
            'annual_demand' => 'sometimes|required|numeric|min:0',
            'last_reorder_date' => 'nullable|date',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => $product,
        ]);
    }

    // Delete a product from inventory
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }
}