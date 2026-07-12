<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trabajos_impresion', function (Blueprint $table) {
            // Archivo subido por el cliente
            $table->string('archivo_path')->nullable()->after('notas');
            $table->string('archivo_nombre')->nullable()->after('archivo_path'); // nombre original

            // Tipo de contenido (afecta el recargo de tinta)
            $table->enum('tipo_contenido', ['documento', 'documento_imagenes', 'imagen_completa'])
                  ->default('documento')
                  ->after('archivo_nombre');

            // Cobertura real detectada por el escáner de tinta (%)
            $table->unsignedTinyInteger('cobertura_real')->nullable()->after('tipo_contenido');

            // Recargo por imágenes calculado
            $table->decimal('recargo_imagen', 8, 4)->default(0)->after('cobertura_real');

            // Control de pago obligatorio antes de imprimir
            $table->boolean('pagado')->default(false)->after('recargo_imagen');
            $table->timestamp('pagado_at')->nullable()->after('pagado');
        });
    }

    public function down(): void
    {
        Schema::table('trabajos_impresion', function (Blueprint $table) {
            $table->dropColumn([
                'archivo_path',
                'archivo_nombre',
                'tipo_contenido',
                'cobertura_real',
                'recargo_imagen',
                'pagado',
                'pagado_at',
            ]);
        });
    }
};
