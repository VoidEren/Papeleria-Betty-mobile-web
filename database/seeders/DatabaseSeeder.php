<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Producto;
use App\Models\Impresora;
use App\Models\TrabajoImpresion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Único Administrador con acceso al panel
        $admin = User::firstOrCreate(
            ['email' => 'admin@papebetty.com'],
            [
                'name' => 'Betty Administradora',
                'password' => Hash::make('password'),
                'is_mobile_app' => false,
            ]
        );

        // Clientes exclusivos de la App Móvil (no tienen acceso a este panel web)
        $maria = User::firstOrCreate(
            ['email' => 'maria@demo.com'],
            [
                'name' => 'María García (Cliente Móvil)',
                'password' => Hash::make(\Illuminate\Support\Str::random(32)),
                'is_mobile_app' => true,
            ]
        );

        $juan = User::firstOrCreate(
            ['email' => 'juan@demo.com'],
            [
                'name' => 'Juan Pérez (Cliente Móvil)',
                'password' => Hash::make(\Illuminate\Support\Str::random(32)),
                'is_mobile_app' => true,
            ]
        );

        // 2. Impresoras
        $impresora1 = Impresora::firstOrCreate(
            ['nombre' => 'Epson EcoTank L3250'],
            [
                'tipo' => 'inyeccion',
                'tiene_color' => true,
                'precio_hoja' => 0.50,
                'precio_tinta_negro_base' => 0.70,
                'precio_tinta_color_base' => 1.50,
                'activa' => true,
                'descripcion' => 'Inyección continua color de alta fidelidad para documentos y fotos.',
            ]
        );

        $impresora2 = Impresora::firstOrCreate(
            ['nombre' => 'HP LaserJet Pro M404dn'],
            [
                'tipo' => 'laser',
                'tiene_color' => false,
                'precio_hoja' => 0.40,
                'precio_tinta_negro_base' => 0.50,
                'precio_tinta_color_base' => 0.00,
                'activa' => true,
                'descripcion' => 'Láser monocromática de alta velocidad para copias y texto.',
            ]
        );

        $impresora3 = Impresora::firstOrCreate(
            ['nombre' => 'Brother DCP-T720DW Color'],
            [
                'tipo' => 'inyeccion',
                'tiene_color' => true,
                'precio_hoja' => 0.50,
                'precio_tinta_negro_base' => 0.65,
                'precio_tinta_color_base' => 1.40,
                'activa' => true,
                'descripcion' => 'Multifuncional rápida con alimentador automático y duplex.',
            ]
        );

        // 3. Catálogo de Productos para Inventario
        $productosData = [
            ['nombre' => 'Cuaderno Profesional Raya 100 Hojas Scribe', 'descripcion' => 'Pasta semirrígida, espiral metálico doble', 'precio' => 29.50, 'stock' => 45],
            ['nombre' => 'Cuaderno Profesional Cuadro Grande 100 Hojas', 'descripcion' => 'Cuadrícula 7mm, papel 56g/m²', 'precio' => 29.50, 'stock' => 38],
            ['nombre' => 'Bolígrafo BIC Cristal Mediano Negro (Caja 12)', 'descripcion' => 'Tinta suave punto mediano 1.0mm', 'precio' => 58.00, 'stock' => 16],
            ['nombre' => 'Bolígrafo BIC Cristal Mediano Azul', 'descripcion' => 'Punto mediano 1.0mm individual', 'precio' => 6.50, 'stock' => 85],
            ['nombre' => 'Bolígrafo BIC Cristal Mediano Rojo', 'descripcion' => 'Punto mediano 1.0mm individual', 'precio' => 6.50, 'stock' => 70],
            ['nombre' => 'Lápiz Grafito Dixon No. 2 HB', 'descripcion' => 'Con goma libre de látex', 'precio' => 5.00, 'stock' => 120],
            ['nombre' => 'Goma de Borrar Factis M-20', 'descripcion' => 'No mancha ni rompe el papel', 'precio' => 7.50, 'stock' => 60],
            ['nombre' => 'Sacapuntas Metálico Doble Maped', 'descripcion' => 'Cuerpo de aluminio resistente', 'precio' => 14.00, 'stock' => 25],
            ['nombre' => 'Juego de Geometría Baco 5 Piezas', 'descripcion' => 'Regla 30cm, 2 escuadras, transportador y compás', 'precio' => 48.00, 'stock' => 18],
            ['nombre' => 'Pegamento en Barra Pritt 22g', 'descripcion' => 'Secado rápido, 97% ingredientes naturales', 'precio' => 25.00, 'stock' => 30],
            ['nombre' => 'Tijeras Escolares Barrilito Punta Roma', 'descripcion' => 'Hojas de acero inoxidable 5 pulgadas', 'precio' => 19.50, 'stock' => 22],
            ['nombre' => 'Plastilina Escolar 10 Colores Barra', 'descripcion' => 'No tóxica, textura moldeable suave', 'precio' => 22.00, 'stock' => 14],
            ['nombre' => 'Papel Bond A4 75g (Paquete 500 hojas)', 'descripcion' => 'Blancura 95%, ideal para copias e impresión láser', 'precio' => 115.00, 'stock' => 10],
            ['nombre' => 'Folder Manila Tamaño Carta (Paquete 10)', 'descripcion' => 'Cartulina resistente con ceja', 'precio' => 35.00, 'stock' => 40],
            ['nombre' => 'Colores de Madera Prismacolor Junior 24 piezas', 'descripcion' => 'Mina resistente de 4mm, colores vivos', 'precio' => 149.00, 'stock' => 3], // Bajo stock
            ['nombre' => 'Corrector Líquido Bic Wite-Out', 'descripcion' => 'Secado rápido con aplicador de espuma', 'precio' => 21.00, 'stock' => 0], // Agotado
        ];

        foreach ($productosData as $p) {
            Producto::firstOrCreate(
                ['nombre' => $p['nombre']],
                $p
            );
        }

        // 4. Trabajos de Impresión de muestra
        if (TrabajoImpresion::count() === 0) {
            TrabajoImpresion::create([
                'impresora_id' => $impresora1->id,
                'user_id' => $maria->id,
                'cliente_nombre' => $maria->name,
                'hojas' => 15,
                'copias' => 2,
                'modo_color' => 'color',
                'cobertura_porcentaje' => 25,
                'precio_hoja_unit' => 0.50,
                'precio_tinta_unit' => 0.375,
                'precio_por_hoja' => 0.875,
                'total' => 26.25,
                'estado' => 'pendiente',
                'tipo_contenido' => 'documento_imagenes',
                'notas' => 'Imprimir en papel bond normal, engrapado.',
                'archivo_nombre' => 'Proyecto_Biologia_Final.pdf',
                'pagado' => false,
            ]);

            TrabajoImpresion::create([
                'impresora_id' => $impresora2->id,
                'user_id' => $juan->id,
                'cliente_nombre' => $juan->name,
                'hojas' => 8,
                'copias' => 1,
                'modo_color' => 'negro',
                'cobertura_porcentaje' => 15,
                'precio_hoja_unit' => 0.40,
                'precio_tinta_unit' => 0.075,
                'precio_por_hoja' => 0.475,
                'total' => 3.80,
                'estado' => 'completado',
                'tipo_contenido' => 'documento',
                'notas' => 'Juego de copias de identificación.',
                'archivo_nombre' => 'Documentos_Oficiales.pdf',
                'pagado' => true,
                'pagado_at' => now(),
            ]);
        }

        // 5. Ventas y reportes históricos
        $this->call(VentasSeeder::class);
    }
}
