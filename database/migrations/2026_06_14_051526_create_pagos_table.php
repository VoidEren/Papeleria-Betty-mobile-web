<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venta_id')->constrained('ventas')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            // Método de pago
            $table->enum('metodo', ['tarjeta_debito', 'tarjeta_credito', 'transferencia']);

            // Tarjeta (solo últimos 4 dígitos por seguridad)
            $table->string('ultimos_cuatro', 4)->nullable();  // Ej: "4321"
            $table->string('banco')->nullable();               // Ej: "BBVA", "BANAMEX"

            // Transferencia
            $table->string('referencia')->nullable();          // Número de referencia de transferencia
            $table->string('banco_origen')->nullable();        // Banco desde el que se transfirió

            $table->decimal('monto', 10, 2);
            $table->timestamp('fecha_pago')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
