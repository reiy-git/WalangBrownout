<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Represents a single delivery/lot of a product, tracked separately for FEFO and expiry
class ProductBatch extends Model
{
    use HasFactory;  // Enables model factories for seeding and testing

    protected $fillable = [
        'product_id',  // Foreign key linking this batch to its product
        'batch_number',  // Supplier or internal lot identifier
        'date_received',  // When the batch arrived in stock
        'quantity_received',  // Original quantity delivered
        'quantity_remaining',  // Units still on hand after issues/sales
        'expiry_date',  // When the batch becomes unusable
        'status',  // Batch state (e.g. active, expired, depleted)
    ];

    // Converts attributes to the right PHP types when read from the database
    protected function casts(): array
    {
        return [
            'date_received' => 'date',   // Returns a Carbon date instance
            'expiry_date' => 'date',  // Carbon date — useful for expiry comparisons
            'quantity_received' => 'integer',  // Whole units only
            'quantity_remaining' => 'integer',
        ];
    }

    // Each batch belongs to exactly one product (inverse of Product::batches)
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}