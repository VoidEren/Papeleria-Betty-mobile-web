<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('impresoras', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');                            // Ej: "HP LaserJet Pro M404n"
            $table->enum('tipo', ['laser', 'inyeccion']);       // Tecnología de impresión
            $table->boolean('tiene_color')->default(false);     // ¿Puede imprimir en color?

            // Costo del papel por hoja (MXN)
            $table->decimal('precio_hoja', 8, 4)->default(0.50);

            // Precio de referencia de TINTA a cobertura del 100%
            // La fórmula escala linealmente: tinta_real = base × (cobertura% / 100)
            $table->decimal('precio_tinta_negro_base', 8, 4)->default(2.00);
            $table->decimal('precio_tinta_color_base', 8, 4)->default(5.00);

            $table->boolean('activa')->default(true);
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('impresoras');
    }
};
