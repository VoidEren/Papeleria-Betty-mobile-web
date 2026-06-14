<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venta extends Model
{
    protected $fillable = [
        'user_id',
        'cliente_nombre',
        'folio',
        'estado',
        'subtotal',
        'total',
        'notas',
        'fecha_venta',
        'fecha_recogida',
        'metodo_pago',
    ];

    protected $casts = [
        'fecha_venta'    => 'datetime',
        'fecha_recogida' => 'datetime',
        'subtotal'       => 'decimal:2',
        'total'          => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleVenta::class);
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class);
    }

    /**
     * Nombre mostrable del cliente (usuario registrado o nombre libre).
     */
    public function getClienteDisplayAttribute(): string
    {
        return $this->user?->name ?? $this->cliente_nombre ?? 'Cliente general';
    }
}
