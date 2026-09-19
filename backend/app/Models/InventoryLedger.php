<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryLedger extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'product_batch_id',
        'user_id',
        'transaction_type',
        'quantity',
        'timestamp',
    ];

    // Define model attribute data type casts
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'timestamp' => 'datetime',
        ];
    }

    // Relationship to affected product
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Relationship to specific product batch involved
    public function batch(): BelongsTo
    {
        return $this->belongsTo(ProductBatch::class, 'product_batch_id');
    }

    // Relationship to user who authorized movement
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
