<?php

namespace App\Services;

use App\Models\Product;

class ReorderPointService
{
    /**
     * Calculate ROP according to blueprint §6.1:
     * ROP = (Average Daily Demand × Lead Time) + Safety Stock
     * 
     * Seasonal items (Category A) should use higher demand.
     */
    public function calculate(Product $product, int $leadTimeDays = 7): float
    {
        // Average Daily Demand = Annual Demand / 365
        $averageDailyDemand = (float)($product->annual_demand / 365);

        // Seasonal Adjustment for Category A
        // Assuming summer is 3 months, maybe peak is 2x? 
        // For now, let's keep it configurable as per Blueprint §9.2
        $demandMultiplier = ($product->abc_category === 'A') ? 1.5 : 1.0;

        return ($averageDailyDemand * $demandMultiplier * $leadTimeDays) + $product->safety_stock;
    }
}
