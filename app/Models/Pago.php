<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pago extends Model
{
    protected $table = 'pagos';

    protected $fillable = [
        'venta_id',
        'user_id',
        'metodo',
        'ultimos_cuatro',
        'banco',
        'referencia',
        'banco_origen',
        'monto',
        'fecha_pago',
    ];

    protected $casts = [
        'monto'      => 'decimal:2',
        'fecha_pago' => 'datetime',
    ];

    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Número de tarjeta censurado: **** **** **** XXXX
     */
    public function getNumeroTarjetaCensuradoAttribute(): string
    {
        if (!$this->ultimos_cuatro) {
            return '**** **** **** ****';
        }
        return '**** **** **** ' . $this->ultimos_cuatro;
    }

    /**
     * Etiqueta legible del método de pago.
     */
    public function getMetodoLabelAttribute(): string
    {
        return match ($this->metodo) {
            'tarjeta_debito'  => 'Tarjeta Débito',
            'tarjeta_credito' => 'Tarjeta Crédito',
            'transferencia'   => 'Transferencia',
            default           => $this->metodo,
        };
    }
}
