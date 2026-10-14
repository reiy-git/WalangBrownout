<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

// Represents an inventory item and its stock-control settings
class Product extends Model
{
    use HasFactory; // Enables model factories for seeding and testing

    // Columns allowed for mass assignment (create/update with an array)
    protected $fillable = [
        'sku',  // Unique stock keeping unit code
        'name',  // Product name
        'unit_cost',  // Cost per unit
        'abc_category',  // ABC analysis class (A = high value, C = low)
        'expiry_months',  // Shelf life in months
        'reorder_point',   // Stock level that triggers a new order
        'safety_stock',  // Buffer stock kept for demand spikes
        'annual_demand',  // Expected units sold per year (used for EOQ)
        'last_reorder_date',  // When the item was last reordered
    ];

    // Converts attributes to the right PHP types when read from the database
    protected function casts(): array
    {
        return [
            'unit_cost' => 'decimal:2',  // Keep 2 decimal places for money
            'annual_demand' => 'decimal:2',
            'last_reorder_date' => 'date',  // Returns a Carbon date instance
        ];
    }

    // One product can have many stock batches (each with its own expiry/quantity)
    public function batches(): HasMany
    {
        return $this->hasMany(ProductBatch::class);
    }
}