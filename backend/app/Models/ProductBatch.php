<?php

namespace App\Models;

<<<<<<< HEAD
=======
use Illuminate\Database\Eloquent\Factories\HasFactory;
>>>>>>> 3b86ef5c652b696a11b341c3222f577945737d2b
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductBatch extends Model
{
<<<<<<< HEAD
    protected $fillable = [
        'product_id',
        'batch_number',
=======
    use HasFactory;

    protected $fillable = [
        'product_id',
        'batch_number',
        'date_received',
        'quantity_received',
>>>>>>> 3b86ef5c652b696a11b341c3222f577945737d2b
        'quantity_remaining',
        'expiry_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
<<<<<<< HEAD
            'expiry_date' => 'date',
=======
            'date_received' => 'date',
            'expiry_date' => 'date',
            'quantity_received' => 'integer',
>>>>>>> 3b86ef5c652b696a11b341c3222f577945737d2b
            'quantity_remaining' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> 3b86ef5c652b696a11b341c3222f577945737d2b
