<?php

namespace App\Http\Controllers;

use App\Models\ProductBatch;
use Illuminate\Http\JsonResponse;

class ProductBatchController extends Controller
{
    // List all inventory batches
    public function index(): JsonResponse
    {
        $batches = ProductBatch::with('product')->get();

        return response()->json($batches);
    }

    // Show details of one specific batch
    public function show(ProductBatch $productBatch): JsonResponse
    {
        $productBatch->load('product');

        return response()->json($productBatch);
    }
}