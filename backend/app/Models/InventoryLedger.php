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

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'timestamp' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(ProductBatch::class, 'product_batch_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
