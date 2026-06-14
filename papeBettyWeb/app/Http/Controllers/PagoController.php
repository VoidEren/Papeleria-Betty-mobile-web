<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\User;
use App\Models\Venta;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PagoController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // PÁGINA PRINCIPAL — Agrupa clientes por método de pago
    // ─────────────────────────────────────────────────────────────────────────

    public function index()
    {
        $pagos = Pago::with(['venta.detalles', 'user'])
            ->orderBy('fecha_pago', 'desc')
            ->get()
            ->map(fn($p) => $this->formatPago($p));

        $tarjetaDebito  = $pagos->where('metodo', 'tarjeta_debito')->values();
        $tarjetaCredito = $pagos->where('metodo', 'tarjeta_credito')->values();
        $transferencia  = $pagos->where('metodo', 'transferencia')->values();

        return Inertia::render('Pagos', [
            'tarjetaDebito'  => $tarjetaDebito,
            'tarjetaCredito' => $tarjetaCredito,
            'transferencia'  => $transferencia,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REGISTRAR un pago para una venta
    // ─────────────────────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $data = $request->validate([
            'venta_id'      => 'required|exists:ventas,id',
            'metodo'        => 'required|in:tarjeta_debito,tarjeta_credito,transferencia',
            'ultimos_cuatro'=> 'nullable|string|size:4|regex:/^\d{4}$/',
            'banco'         => 'nullable|string|max:100',
            'referencia'    => 'nullable|string|max:255',
            'banco_origen'  => 'nullable|string|max:100',
            'monto'         => 'required|numeric|min:0.01',
        ]);

        $venta = Venta::findOrFail($data['venta_id']);

        $pago = Pago::create([
            'venta_id'       => $venta->id,
            'user_id'        => $venta->user_id,
            'metodo'         => $data['metodo'],
            'ultimos_cuatro' => $data['ultimos_cuatro'] ?? null,
            'banco'          => $data['banco'] ?? null,
            'referencia'     => $data['referencia'] ?? null,
            'banco_origen'   => $data['banco_origen'] ?? null,
            'monto'          => $data['monto'],
        ]);

        // Actualizar metodo_pago en la venta para referencia rápida
        $venta->update(['metodo_pago' => $data['metodo']]);

        return back()->with('success', 'Pago registrado correctamente.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper — formatear para el frontend
    // ─────────────────────────────────────────────────────────────────────────

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
