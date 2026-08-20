<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'batch_number',
        'date_received',
        'quantity_received',
        'quantity_remaining',
        'expiry_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'date_received' => 'date',
            'expiry_date' => 'date',
            'quantity_received' => 'integer',
            'quantity_remaining' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}