<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ReporteController extends Controller
{
    /**
     * Página principal de reportes — pasa la lista de clientes al frontend.
     */
    public function index()
    {
        $clientes = User::orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Reportes', [
            'clientes' => $clientes,
        ]);
    }

    /**
     * API endpoint: devuelve los datos filtrados en JSON.
     * Query params:
     *   - cliente_id : int | "todos"
     *   - periodo    : "dia" | "semana" | "mes" | "anio"
     *   - fecha      : YYYY-MM-DD  (para dia)
     *   - semana     : YYYY-Www    (para semana, ej. 2025-W23)
     *   - mes        : YYYY-MM     (para mes)
     *   - anio       : YYYY        (para año)
     */
    public function datos(Request $request)
    {
        $request->validate([
            'periodo'    => 'required|in:dia,semana,mes,anio',
            'cliente_id' => 'nullable',
        ]);

        $periodo    = $request->input('periodo');
        $clienteId  = $request->input('cliente_id');

        // ── Rango de fechas ────────────────────────────────────────────────
        [$inicio, $fin] = $this->calcularRango($request, $periodo);

        // ── Query base ─────────────────────────────────────────────────────
        $query = Venta::with(['detalles', 'user'])
            ->whereBetween('fecha_venta', [$inicio, $fin])
            ->where('estado', '!=', 'cancelada');

        if ($clienteId && $clienteId !== 'todos') {
            $query->where('user_id', $clienteId);
        }

        $ventas = $query->orderBy('fecha_venta', 'desc')->get();

        // ── Transformar al formato que necesita el frontend ────────────────
        $datos = $ventas->map(function (Venta $venta) {
            return [
                'id'            => $venta->id,
                'folio'         => $venta->folio,
                'fecha'         => $venta->fecha_venta->format('d/m/Y H:i'),
                'cliente'       => $venta->user?->name ?? $venta->cliente_nombre ?? 'Sin cliente',
                'cliente_email' => $venta->user?->email ?? '—',
                'total'         => (float) $venta->total,
                'detalles'      => $venta->detalles->map(fn($d) => [
                    'tipo'            => $d->tipo,
                    'descripcion'     => $d->descripcion,
                    'cantidad'        => $d->cantidad,
                    'precio_unitario' => (float) $d->precio_unitario,
                    'subtotal'        => (float) $d->subtotal,
                ]),
            ];
        });

        // ── Resumen de totales ─────────────────────────────────────────────
        $allDetalles = $ventas->flatMap(fn($v) => $v->detalles);

        $resumen = [
            'total_copias'      => (float) $allDetalles->where('tipo', 'copia')->sum('subtotal'),
            'total_impresiones' => (float) $allDetalles->where('tipo', 'impresion')->sum('subtotal'),
            'total_articulos'   => (float) $allDetalles->where('tipo', 'articulo')->sum('subtotal'),
            'gran_total'        => (float) $ventas->sum('total'),
            'num_ventas'        => $ventas->count(),
        ];

        return response()->json([
            'ventas'  => $datos,
            'resumen' => $resumen,
            'periodo' => [
                'inicio' => $inicio->format('d/m/Y'),
                'fin'    => $fin->format('d/m/Y'),
            ],
        ]);
    }

    // ────────────────────────────────────────────────────────────────────────
    private function calcularRango(Request $request, string $periodo): array
    {
        switch ($periodo) {
            case 'dia':
                $fecha  = Carbon::parse($request->input('fecha', now()->toDateString()));
                $inicio = $fecha->copy()->startOfDay();
                $fin    = $fecha->copy()->endOfDay();
                break;

            case 'semana':
                // semana en formato YYYY-Www  (ej. 2025-W21)
                $raw = $request->input('semana', now()->format('Y-\WW'));
                $fecha = Carbon::now();
                if (preg_match('/^(\d{4})-W(\d{1,2})$/', $raw, $m)) {
                    $fecha = Carbon::now()->setISODate((int)$m[1], (int)$m[2]);
                }
                $inicio = $fecha->copy()->startOfWeek();
                $fin    = $fecha->copy()->endOfWeek();
                break;

            case 'mes':
                $raw    = $request->input('mes', now()->format('Y-m'));
                $fecha  = Carbon::createFromFormat('Y-m', $raw);
                $inicio = $fecha->copy()->startOfMonth();
                $fin    = $fecha->copy()->endOfMonth();
                break;

            case 'anio':
                $anio   = (int) $request->input('anio', now()->year);
                $inicio = Carbon::createFromDate($anio, 1, 1)->startOfDay();
                $fin    = Carbon::createFromDate($anio, 12, 31)->endOfDay();
                break;

            default:
                $inicio = now()->startOfDay();
                $fin    = now()->endOfDay();
        }

        return [$inicio, $fin];
    }
}
