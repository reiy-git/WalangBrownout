<?php

use App\Http\Controllers\AuthController;
<<<<<<< HEAD
use App\Http\Controllers\DashboardController;
=======
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductBatchController;
>>>>>>> 3b86ef5c652b696a11b341c3222f577945737d2b
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
<<<<<<< HEAD
});

Route::middleware('auth:sanctum')->prefix('v1/dashboard')->group(function () {
    Route::get('/summary', [DashboardController::class, 'summary']);
    Route::get('/panel1', [DashboardController::class, 'panel1']);
    Route::get('/panel2', [DashboardController::class, 'panel2']);
=======

    // Products
    Route::apiResource('products', ProductController::class);

    // Product Batches
    Route::apiResource('product-batches', ProductBatchController::class);
>>>>>>> 3b86ef5c652b696a11b341c3222f577945737d2b
});