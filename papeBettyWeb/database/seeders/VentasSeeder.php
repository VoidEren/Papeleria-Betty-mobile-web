<?php

namespace Database\Seeders;

use App\Models\DetalleVenta;
use App\Models\User;
use App\Models\Venta;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class VentasSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener usuarios existentes (móviles o todos)
        $usuarios = User::all();

        // Si no hay usuarios, crear algunos de demo
        if ($usuarios->isEmpty()) {
            $usuarios = collect([
                User::create([
                    'name'           => 'María García',
                    'email'          => 'maria@demo.com',
                    'password'       => bcrypt('password'),
                    'is_mobile_app'  => true,
                ]),
                User::create([
                    'name'           => 'Juan Pérez',
                    'email'          => 'juan@demo.com',
                    'password'       => bcrypt('password'),
                    'is_mobile_app'  => true,
                ]),
            ]);
        }

        $productos = [
            ['desc' => 'Copia simple B/N', 'tipo' => 'copia',      'precio' => 1.50],
            ['desc' => 'Copia doble carta', 'tipo' => 'copia',      'precio' => 2.00],
            ['desc' => 'Impresión color',   'tipo' => 'impresion',  'precio' => 5.00],
            ['desc' => 'Impresión B/N',     'tipo' => 'impresion',  'precio' => 2.50],
            ['desc' => 'Pluma BIC',         'tipo' => 'articulo',   'precio' => 8.00],
            ['desc' => 'Cuaderno',          'tipo' => 'articulo',   'precio' => 35.00],
            ['desc' => 'Folder Manila',     'tipo' => 'articulo',   'precio' => 5.50],
            ['desc' => 'Engrapadora',       'tipo' => 'articulo',   'precio' => 75.00],
        ];

        // Fechas distribuidas a lo largo del tiempo (para poder filtrar por periodo)
        $fechas = [
            Carbon::create(2022, 6, 3),
            Carbon::create(2022, 6, 15),
            Carbon::create(2023, 1, 10),
            Carbon::create(2023, 3, 22),
            Carbon::create(2024, 7, 5),
            Carbon::create(2024, 11, 30),
            Carbon::create(2025, 6, 1),
            Carbon::create(2025, 6, 12),
            Carbon::create(2025, 6, 20),
            Carbon::now()->subDays(2),
            Carbon::now()->subDays(5),
            Carbon::now(),
        ];

        $folio = 1000;

        foreach ($fechas as $fecha) {
            foreach ($usuarios as $usuario) {
                // Seleccionar 3-5 productos al azar
                $seleccionados = collect($productos)->shuffle()->take(rand(3, 5));

                $detalles = $seleccionados->map(function ($p) {
                    $cantidad = rand(1, 10);
                    return [
                        'tipo'           => $p['tipo'],
                        'descripcion'    => $p['desc'],
                        'cantidad'       => $cantidad,
                        'precio_unitario'=> $p['precio'],
                        'subtotal'       => round($cantidad * $p['precio'], 2),
                    ];
                });

                $total = $detalles->sum('subtotal');

                $venta = Venta::create([
                    'user_id'     => $usuario->id,
                    'folio'       => 'F-' . $folio++,
                    'estado'      => 'pagada',
                    'subtotal'    => $total,
                    'total'       => $total,
                    'fecha_venta' => $fecha,
                ]);

                foreach ($detalles as $detalle) {
                    DetalleVenta::create(array_merge(['venta_id' => $venta->id], $detalle));
                }
            }
        }
    }
}
