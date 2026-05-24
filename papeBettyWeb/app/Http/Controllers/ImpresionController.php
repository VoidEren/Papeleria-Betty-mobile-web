<?php

namespace App\Http\Controllers;

use App\Models\DetalleVenta;
use App\Models\Impresora;
use App\Models\TrabajoImpresion;
use App\Models\User;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ImpresionController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // PÁGINA PRINCIPAL
    // ─────────────────────────────────────────────────────────────────────────

    public function index()
    {
        $impresoras = Impresora::orderBy('nombre')->get();
        $trabajos   = TrabajoImpresion::with(['impresora', 'user'])
                        ->orderBy('created_at', 'desc')
                        ->limit(50)
                        ->get()
                        ->map(fn($t) => $this->formatTrabajo($t));
        $clientes   = User::orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('AreaImpresion', [
            'impresoras' => $impresoras,
            'trabajos'   => $trabajos,
            'clientes'   => $clientes,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // API: preview de costo en tiempo real (sin guardar)
    // ─────────────────────────────────────────────────────────────────────────

    public function calcular(Request $request)
    {
        $request->validate([
            'impresora_id'       => 'required|exists:impresoras,id',
            'hojas'              => 'required|integer|min:1|max:9999',
            'copias'             => 'required|integer|min:1|max:999',
            'modo_color'         => 'required|in:negro,color',
            'cobertura_porcentaje' => 'required|integer|min:1|max:100',
        ]);

        $impresora   = Impresora::findOrFail($request->impresora_id);
        $hojas       = (int) $request->hojas;
        $copias      = (int) $request->copias;
        $cobertura   = (int) $request->cobertura_porcentaje;
        $modo        = $request->modo_color;

        $tintagHoja  = $impresora->calcularTintaPorHoja($cobertura, $modo);
        $papelHoja   = (float) $impresora->precio_hoja;
        $costoHoja   = round($papelHoja + $tintagHoja, 4);
        $total       = round($costoHoja * $hojas * $copias, 2);

        return response()->json([
            'precio_hoja_unit'  => $papelHoja,
            'precio_tinta_unit' => $tintagHoja,
            'precio_por_hoja'   => $costoHoja,
            'total_hojas'       => $hojas * $copias,
            'total'             => $total,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREAR trabajo de impresión + venta automática
    // ─────────────────────────────────────────────────────────────────────────

    public function storeTrabajo(Request $request)
    {
        $data = $request->validate([
            'impresora_id'         => 'required|exists:impresoras,id',
            'user_id'              => 'nullable|exists:users,id',
            'cliente_nombre'       => 'nullable|string|max:255',
            'hojas'                => 'required|integer|min:1|max:9999',
            'copias'               => 'required|integer|min:1|max:999',
            'modo_color'           => 'required|in:negro,color',
            'cobertura_porcentaje' => 'required|integer|min:1|max:100',
            'notas'                => 'nullable|string',
        ]);

        $impresora  = Impresora::findOrFail($data['impresora_id']);
        $hojas      = (int) $data['hojas'];
        $copias     = (int) $data['copias'];
        $cobertura  = (int) $data['cobertura_porcentaje'];
        $modo       = $data['modo_color'];

        $tintaUnit  = $impresora->calcularTintaPorHoja($cobertura, $modo);
        $papelUnit  = (float) $impresora->precio_hoja;
        $costoHoja  = round($papelUnit + $tintaUnit, 4);
        $total      = round($costoHoja * $hojas * $copias, 2);

        // ── Crear Venta ─────────────────────────────────────────────────────
        $clienteNombre = $data['cliente_nombre'] ?? null;
        if (!empty($data['user_id'])) {
            $clienteNombre = User::find($data['user_id'])?->name ?? $clienteNombre;
        }

        $folio = 'IMP-' . strtoupper(substr(uniqid(), -6));

        $venta = Venta::create([
            'user_id'        => $data['user_id'] ?? null,
            'cliente_nombre' => $clienteNombre,
            'folio'          => $folio,
            'estado'         => 'pagada',
            'subtotal'       => $total,
            'total'          => $total,
            'fecha_venta'    => Carbon::now(),
        ]);

        // ── Crear DetalleVenta ───────────────────────────────────────────────
        $modoLabel   = $modo === 'color' ? 'color' : 'B/N';
        $descripcion = sprintf(
            'Impresión %s – %s – %d%% cobertura – %d hoja(s) × %d copia(s)',
            strtoupper($impresora->tipo),
            $modoLabel,
            $cobertura,
            $hojas,
            $copias
        );

        DetalleVenta::create([
            'venta_id'        => $venta->id,
            'tipo'            => 'impresion',
            'descripcion'     => $descripcion,
            'cantidad'        => $hojas * $copias,
            'precio_unitario' => $costoHoja,
            'subtotal'        => $total,
        ]);

        // ── Crear TrabajoImpresion ───────────────────────────────────────────
        TrabajoImpresion::create([
            'impresora_id'         => $impresora->id,
            'venta_id'             => $venta->id,
            'user_id'              => $data['user_id'] ?? null,
            'cliente_nombre'       => $clienteNombre,
            'hojas'                => $hojas,
            'copias'               => $copias,
            'modo_color'           => $modo,
            'cobertura_porcentaje' => $cobertura,
            'precio_hoja_unit'     => $papelUnit,
            'precio_tinta_unit'    => $tintaUnit,
            'precio_por_hoja'      => $costoHoja,
            'total'                => $total,
            'estado'               => 'pendiente',
            'notas'                => $data['notas'] ?? null,
        ]);

        return redirect()->route('area-impresion')
            ->with('success', "Trabajo registrado — Folio: $folio — Total: $$total");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ESTADO del trabajo
    // ─────────────────────────────────────────────────────────────────────────

    public function updateEstado(Request $request, TrabajoImpresion $trabajo)
    {
        $request->validate(['estado' => 'required|in:pendiente,en_proceso,completado,cancelado']);
        $trabajo->update(['estado' => $request->estado]);

        // Si se cancela, también cancelar la venta asociada
        if ($request->estado === 'cancelado' && $trabajo->venta_id) {
            Venta::where('id', $trabajo->venta_id)->update(['estado' => 'cancelada']);
        }

        return back()->with('success', 'Estado actualizado.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CRUD IMPRESORAS
    // ─────────────────────────────────────────────────────────────────────────

    public function storeImpresora(Request $request)
    {
        $data = $request->validate([
            'nombre'                  => 'required|string|max:255',
            'tipo'                    => 'required|in:laser,inyeccion',
            'tiene_color'             => 'required|boolean',
            'precio_hoja'             => 'required|numeric|min:0.01',
            'precio_tinta_negro_base' => 'required|numeric|min:0.01',
            'precio_tinta_color_base' => 'nullable|numeric|min:0.01',
            'descripcion'             => 'nullable|string',
        ]);

        Impresora::create($data);
        return back()->with('success', 'Impresora agregada correctamente.');
    }

    public function updateImpresora(Request $request, Impresora $impresora)
    {
        $data = $request->validate([
            'nombre'                  => 'required|string|max:255',
            'tipo'                    => 'required|in:laser,inyeccion',
            'tiene_color'             => 'required|boolean',
            'precio_hoja'             => 'required|numeric|min:0.01',
            'precio_tinta_negro_base' => 'required|numeric|min:0.01',
            'precio_tinta_color_base' => 'nullable|numeric|min:0.01',
            'activa'                  => 'required|boolean',
            'descripcion'             => 'nullable|string',
        ]);

        $impresora->update($data);
        return back()->with('success', 'Impresora actualizada correctamente.');
    }

    public function destroyImpresora(Impresora $impresora)
    {
        if ($impresora->trabajos()->exists()) {
            return back()->withErrors(['error' => 'No se puede eliminar: tiene trabajos registrados.']);
        }
        $impresora->delete();
        return back()->with('success', 'Impresora eliminada.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────────────────

    private function formatTrabajo(TrabajoImpresion $t): array
    {
        return [
            'id'                   => $t->id,
            'impresora'            => $t->impresora?->nombre,
            'tipo_impresora'       => $t->impresora?->tipo,
            'cliente'              => $t->user?->name ?? $t->cliente_nombre ?? 'Sin cliente',
            'hojas'                => $t->hojas,
            'copias'               => $t->copias,
            'modo_color'           => $t->modo_color,
            'cobertura_porcentaje' => $t->cobertura_porcentaje,
            'precio_hoja_unit'     => (float) $t->precio_hoja_unit,
            'precio_tinta_unit'    => (float) $t->precio_tinta_unit,
            'precio_por_hoja'      => (float) $t->precio_por_hoja,
            'total'                => (float) $t->total,
            'estado'               => $t->estado,
            'notas'                => $t->notas,
            'fecha'                => $t->created_at->format('d/m/Y H:i'),
        ];
    }
}
