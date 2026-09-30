<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryLedgerController;
use App\Http\Controllers\ProductBatchController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Public authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Authenticated API routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth session
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard metrics
    Route::prefix('v1/dashboard')->group(function () {
        Route::get('/summary', [DashboardController::class, 'summary']);
        Route::get('/panel1', [DashboardController::class, 'panel1']);
        Route::get('/panel2', [DashboardController::class, 'panel2']);
    });

    // Warehouse operations are available to authenticated managers and staff.
    Route::post('/transactions/receive', [InventoryLedgerController::class, 'receive']);
    Route::post('/transactions/dispatch', [InventoryLedgerController::class, 'dispatch']);

    // Admin/Manager routes
    Route::middleware('manager')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('product-batches', ProductBatchController::class)->except(['store']);
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);
    });

    // Public/Staff routes (view only + transactions)
    Route::apiResource('products', ProductController::class)->only(['index', 'show']);
    Route::get('/transactions', [InventoryLedgerController::class, 'index']);
});

