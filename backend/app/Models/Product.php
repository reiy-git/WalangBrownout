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

    protected function casts(): array
    {
        return [
            'unit_cost' => 'decimal:2',
            'annual_demand' => 'decimal:2',
            'last_reorder_date' => 'date',
        ];
    }

    public function batches(): HasMany
    {
        return $this->hasMany(ProductBatch::class);
    }
}