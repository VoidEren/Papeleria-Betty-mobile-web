<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Impresora extends Model
{
    protected $fillable = [
        'nombre',
        'tipo',
        'tiene_color',
        'precio_hoja',
        'precio_tinta_negro_base',
        'precio_tinta_color_base',
        'activa',
        'descripcion',
    ];

    protected $casts = [
        'tiene_color'              => 'boolean',
        'activa'                   => 'boolean',
        'precio_hoja'              => 'decimal:4',
        'precio_tinta_negro_base'  => 'decimal:4',
        'precio_tinta_color_base'  => 'decimal:4',
    ];

    public function trabajos(): HasMany
    {
        return $this->hasMany(TrabajoImpresion::class);
    }

    /**
     * Calcula el costo de tinta por hoja dado cobertura (1–100) y modo.
     * Fórmula: base_tinta × (cobertura / 100)
     * El factor_tipo ya está implícito en los precios base que configura el admin
     * (laser naturalmente tendrá bases más bajas que inyección).
     */
    public function calcularTintaPorHoja(int $cobertura, string $modo): float
    {
        $base = $modo === 'color'
            ? (float) $this->precio_tinta_color_base
            : (float) $this->precio_tinta_negro_base;

        return round($base * ($cobertura / 100), 4);
    }

    /**
     * Costo total por hoja (papel + tinta).
     */
    public function calcularCostoPorHoja(int $cobertura, string $modo): float
    {
        return round((float) $this->precio_hoja + $this->calcularTintaPorHoja($cobertura, $modo), 4);
    }
}
