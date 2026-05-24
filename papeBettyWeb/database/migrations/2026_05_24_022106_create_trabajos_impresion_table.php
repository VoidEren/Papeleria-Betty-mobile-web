<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trabajos_impresion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('impresora_id')->constrained('impresoras')->restrictOnDelete();
            $table->foreignId('venta_id')->nullable()->constrained('ventas')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('cliente_nombre')->nullable();       // Para clientes sin cuenta

            // Detalles del trabajo
            $table->unsignedSmallInteger('hojas');             // Hojas por copia
            $table->unsignedSmallInteger('copias')->default(1);// Número de copias
            $table->enum('modo_color', ['negro', 'color']);
            $table->unsignedTinyInteger('cobertura_porcentaje'); // 1–100

            // Precios calculados (guardados para histórico)
            $table->decimal('precio_hoja_unit', 8, 4);         // Costo papel por hoja
            $table->decimal('precio_tinta_unit', 8, 4);        // Costo tinta por hoja
            $table->decimal('precio_por_hoja', 8, 4);          // papel + tinta por hoja
            $table->decimal('total', 10, 2);                   // total final del trabajo

            $table->enum('estado', ['pendiente', 'en_proceso', 'completado', 'cancelado'])
                  ->default('pendiente');
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trabajos_impresion');
    }
};
