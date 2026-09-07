<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'abc_category',
        'reorder_point',
        'safety_stock',
        'unit_cost',
    ];

    /**
     * Get the product batches for the product.
     */
    public function batches(): HasMany
    {
        return $this->hasMany(ProductBatch::class);
    }

    /**
     * Get the active product batches for the product.
     */
    public function activeBatches(): HasMany
    {
        return $this->hasMany(ProductBatch::class)->where('status', 'active');
    }
}
