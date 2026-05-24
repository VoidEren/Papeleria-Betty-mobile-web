<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrabajoImpresion extends Model
{
    protected $table = 'trabajos_impresion';

    protected $fillable = [
        'impresora_id',
        'venta_id',
        'user_id',
        'cliente_nombre',
        'hojas',
        'copias',
        'modo_color',
        'cobertura_porcentaje',
        'precio_hoja_unit',
        'precio_tinta_unit',
        'precio_por_hoja',
        'total',
        'estado',
        'notas',
    ];

    protected $casts = [
        'precio_hoja_unit'  => 'decimal:4',
        'precio_tinta_unit' => 'decimal:4',
        'precio_por_hoja'   => 'decimal:4',
        'total'             => 'decimal:2',
    ];

    public function impresora(): BelongsTo
    {
        return $this->belongsTo(Impresora::class);
    }

    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getClienteDisplayAttribute(): string
    {
        return $this->user?->name ?? $this->cliente_nombre ?? 'Sin cliente';
    }

    /** Etiqueta legible del estado */
    public function getEstadoLabelAttribute(): string
    {
        return match ($this->estado) {
            'pendiente'   => 'Pendiente',
            'en_proceso'  => 'En proceso',
            'completado'  => 'Completado',
            'cancelado'   => 'Cancelado',
            default       => $this->estado,
        };
    }
}
