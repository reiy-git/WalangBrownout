<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'name',
        'unit_cost',
        'abc_category',
        'expiry_months',
        'reorder_point',
        'safety_stock',
        'annual_demand',
        'last_reorder_date',
    ];

    // Define model attribute data type casts
    protected function casts(): array
    {
        return [
            'unit_cost' => 'decimal:2',
            'annual_demand' => 'decimal:2',
            'last_reorder_date' => 'date',
        ];
    }

    // Relationship to all associated batches
    public function batches(): HasMany
    {
        return $this->hasMany(ProductBatch::class);
    }

    // Relationship to non-expired batches with remaining stock
    public function activeBatches(): HasMany
    {
        // # ponytail: Dynamically define active. Prevents needing a cron job to set status='expired'.
        return $this->hasMany(ProductBatch::class)
            ->where('quantity_remaining', '>', 0)
            ->where('expiry_date', '>=', now()->toDateString());
    }
}