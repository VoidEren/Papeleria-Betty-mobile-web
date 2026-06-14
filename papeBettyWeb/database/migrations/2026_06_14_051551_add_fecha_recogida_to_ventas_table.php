<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            // Fecha en que el cliente puede recoger su pedido (mínimo 10 min después del pago)
            $table->timestamp('fecha_recogida')->nullable()->after('fecha_venta');
            // Método de pago general (para referencia rápida)
            $table->enum('metodo_pago', ['tarjeta_debito', 'tarjeta_credito', 'transferencia', 'efectivo'])
                  ->nullable()
                  ->after('fecha_recogida');
        });
    }

    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->dropColumn(['fecha_recogida', 'metodo_pago']);
        });
    }
};
