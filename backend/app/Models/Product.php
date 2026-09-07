<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
<<<<<<< HEAD
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
=======
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

>>>>>>> 3b86ef5c652b696a11b341c3222f577945737d2b
    public function batches(): HasMany
    {
        return $this->hasMany(ProductBatch::class);
    }
<<<<<<< HEAD

    /**
     * Get the active product batches for the product.
     */
    public function activeBatches(): HasMany
    {
        return $this->hasMany(ProductBatch::class)->where('status', 'active');
    }
}
=======
}
>>>>>>> 3b86ef5c652b696a11b341c3222f577945737d2b
