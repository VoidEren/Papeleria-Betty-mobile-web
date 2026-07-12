<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\User;
use App\Models\Venta;
use App\Models\Producto;
use App\Models\DetalleVenta;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class PagoController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // PÁGINA PRINCIPAL — Agrupa clientes por método de pago
    // ─────────────────────────────────────────────────────────────────────────

    public function index()
    {
        $pagos = Pago::with(['venta.detalles', 'user'])
            ->where('metodo', 'transferencia')
            ->orderBy('fecha_pago', 'desc')
            ->get()
            ->map(fn($p) => $this->formatPago($p));

        return Inertia::render('Pagos', [
            'transferencias' => $pagos,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REGISTRAR un pago para una venta
    // ─────────────────────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $data = $request->validate([
            'venta_id'     => 'required|exists:ventas,id',
            'metodo'       => 'required|in:transferencia',
            'banco'        => 'required|string|max:100',          // Cuenta destino: BBVA o Banco Azteca
            'referencia'   => 'required|string|max:255',          // Referencia requerida
            'banco_origen' => 'nullable|string|max:100',         // Banco del cliente (opcional)
            'monto'        => 'required|numeric|min:0.01',
        ]);

        $venta = Venta::findOrFail($data['venta_id']);

        $pago = Pago::create([
            'venta_id'       => $venta->id,
            'user_id'        => $venta->user_id,
            'metodo'         => $data['metodo'],
            'ultimos_cuatro' => null,
            'banco'          => $data['banco'],
            'referencia'     => $data['referencia'],
            'banco_origen'   => $data['banco_origen'] ?? null,
            'monto'          => $data['monto'],
        ]);

        // Actualizar metodo_pago en la venta para referencia rápida
        $venta->update(['metodo_pago' => $data['metodo']]);

        return back()->with('success', 'Pago registrado correctamente.');
    }


    public function comprarProducto(Request $request)
    {
        $data = $request->validate([
            'producto_id'   => 'required|exists:productos,id',
            'banco'         => 'required|string|max:100', // BBVA (Cuenta/Tarjeta)
            'referencia'    => 'required|string|max:255',
            'banco_origen'  => 'nullable|string|max:100',
        ]);

        $producto = Producto::findOrFail($data['producto_id']);
        $user = auth()->user();

        // 1. Crear la Venta (estado pendiente de confirmación de transferencia)
        $folio = 'WEB-' . strtoupper(substr(uniqid(), -6));
        $venta = Venta::create([
            'user_id'        => $user->id,
            'cliente_nombre' => $user->name,
            'folio'          => $folio,
            'estado'         => 'pendiente', // pendiente hasta que el admin la verifique
            'subtotal'       => $producto->precio,
            'total'          => $producto->precio,
            'notas'          => 'Compra desde Web', // Flag para identificar ventas desde esta web
            'fecha_venta'    => Carbon::now(),
        ]);

        // 2. Crear el DetalleVenta (tipo articulo)
        DetalleVenta::create([
            'venta_id'        => $venta->id,
            'tipo'            => 'articulo',
            'descripcion'     => 'Compra de: ' . $producto->nombre,
            'cantidad'        => 1,
            'precio_unitario' => $producto->precio,
            'subtotal'        => $producto->precio,
        ]);

        // 3. Registrar el Pago en estado de transferencia
        Pago::create([
            'venta_id'       => $venta->id,
            'user_id'        => $user->id,
            'metodo'         => 'transferencia',
            'ultimos_cuatro' => null,
            'banco'          => $data['banco'],
            'referencia'     => $data['referencia'],
            'banco_origen'   => $data['banco_origen'] ?? null,
            'monto'          => $producto->precio,
        ]);

        return back()->with('success', '¡Compra registrada! Tu transferencia por $' . number_format($producto->precio, 2) . ' (Folio: ' . $folio . ') está siendo verificada.');
    }

    private function formatPago(Pago $p): array
    {
        $ultimos = $p->ultimos_cuatro;
        $tarjetaCensurada = $ultimos
            ? '**** **** **** ' . $ultimos
            : null;

        return [
            'id'              => $p->id,
            'metodo'          => $p->metodo,
            'metodo_label'    => match ($p->metodo) {
                'tarjeta_debito'  => 'Tarjeta Débito',
                'tarjeta_credito' => 'Tarjeta Crédito',
                'transferencia'   => 'Transferencia',
                default           => $p->metodo,
            },
            'cliente'         => $p->user?->name ?? $p->venta?->cliente_nombre ?? 'Cliente general',
            'cliente_email'   => $p->user?->email ?? null,
            'tarjeta'         => $tarjetaCensurada,
            'banco'           => $p->banco,
            'referencia'      => $p->referencia,
            'banco_origen'    => $p->banco_origen,
            'monto'           => (float) $p->monto,
            'fecha_pago'      => $p->fecha_pago?->format('d/m/Y H:i'),
            'folio'           => $p->venta?->folio,
            'productos'       => $p->venta?->detalles->map(fn($d) => [
                'descripcion'     => $d->descripcion,
                'cantidad'        => $d->cantidad,
                'precio_unitario' => (float) $d->precio_unitario,
                'subtotal'        => (float) $d->subtotal,
            ]) ?? [],
        ];
    }
}
