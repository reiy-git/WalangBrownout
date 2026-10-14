<?php

namespace App\Services;

use App\Models\Product;

class ReorderPointService
{
    /**
     * Calculate ROP according to blueprint §6.1:
     * ROP = (Average Daily Demand × Lead Time) + Safety Stock
     *
     * The seasonal multiplier is explicitly configured per product.
     */
    public function calculate(Product $product, int $leadTimeDays = 7): float
    {
        // Average Daily Demand = Annual Demand / 365
        $averageDailyDemand = (float) ($product->annual_demand / 365);

        $demandMultiplier = (float) ($product->seasonal_demand_multiplier ?: 1.0);

        return ($averageDailyDemand * $demandMultiplier * $leadTimeDays) + $product->safety_stock;
    }
}
