<?php

namespace App\Http\Controllers;

use App\Models\DetalleVenta;
use App\Models\Impresora;
use App\Models\Pago;
use App\Models\TrabajoImpresion;
use App\Models\User;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
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
            'tipo_contenido'       => 'required|in:documento,documento_imagenes,imagen_completa',
            'cobertura_real'       => 'nullable|integer|min:1|max:100',
            'recargo_imagen'       => 'nullable|numeric|min:0',
            'notas'                => 'nullable|string',
            'archivo'              => 'nullable|file|max:20480|mimes:pdf,jpg,jpeg,png,gif,doc,docx',
        ]);

        $impresora  = Impresora::findOrFail($data['impresora_id']);
        $hojas      = (int) $data['hojas'];
        $copias     = (int) $data['copias'];
        $cobertura  = (int) $data['cobertura_porcentaje'];
        $modo       = $data['modo_color'];

        $tintaUnit    = $impresora->calcularTintaPorHoja($cobertura, $modo);
        $papelUnit    = (float) $impresora->precio_hoja;
        $recargo      = (float) ($data['recargo_imagen'] ?? 0);
        $costoHoja    = round($papelUnit + $tintaUnit + $recargo, 4);
        $total        = round($costoHoja * $hojas * $copias, 2);

        // ── Manejar archivo subido ───────────────────────────────────────────
        $archivoPath   = null;
        $archivoNombre = null;
        if ($request->hasFile('archivo')) {
            $file          = $request->file('archivo');
            $archivoNombre = $file->getClientOriginalName();
            $archivoPath   = $file->store('impresiones', 'public');
        }

        // ── Crear Venta (estado pendiente hasta que se pague) ────────────────
        $clienteNombre = $data['cliente_nombre'] ?? null;
        if (!empty($data['user_id'])) {
            $clienteNombre = User::find($data['user_id'])?->name ?? $clienteNombre;
        }

        $folio = 'IMP-' . strtoupper(substr(uniqid(), -6));

        $venta = Venta::create([
            'user_id'        => $data['user_id'] ?? null,
            'cliente_nombre' => $clienteNombre,
            'folio'          => $folio,
            'estado'         => 'pendiente',  // pendiente hasta que se realice el pago
            'subtotal'       => $total,
            'total'          => $total,
            'fecha_venta'    => Carbon::now(),
        ]);

        // ── Crear DetalleVenta ───────────────────────────────────────────────
        $modoLabel    = $modo === 'color' ? 'color' : 'B/N';
        $tipoLabel    = match ($data['tipo_contenido']) {
            'documento'          => 'Documento',
            'documento_imagenes' => 'Doc. con Imágenes',
            'imagen_completa'    => 'Imagen Completa',
            default              => 'Documento',
        };
        $descripcion  = sprintf(
            'Impresión %s – %s – %s – %d%% cobertura – %d hoja(s) × %d copia(s)',
            strtoupper($impresora->tipo),
            $modoLabel,
            $tipoLabel,
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
            'archivo_path'         => $archivoPath,
            'archivo_nombre'       => $archivoNombre,
            'tipo_contenido'       => $data['tipo_contenido'],
            'cobertura_real'       => $data['cobertura_real'] ?? null,
            'recargo_imagen'       => $recargo,
            'pagado'               => false,
        ]);

        return redirect()->route('area-impresion')
            ->with('success', "Trabajo registrado — Folio: $folio — Total: $$total — Pendiente de pago.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ESTADO del trabajo
    // ─────────────────────────────────────────────────────────────────────────

    public function updateEstado(Request $request, TrabajoImpresion $trabajo)
    {
        $request->validate(['estado' => 'required|in:pendiente,en_proceso,completado,cancelado']);

        // Verificar pago obligatorio antes de pasar a en_proceso o completado
        if (in_array($request->estado, ['en_proceso', 'completado']) && !$trabajo->pagado) {
            return back()->withErrors(['error' => 'No se puede procesar: el trabajo aún no ha sido pagado.']);
        }

        $trabajo->update(['estado' => $request->estado]);

        // Si se cancela, también cancelar la venta asociada
        if ($request->estado === 'cancelado' && $trabajo->venta_id) {
            Venta::where('id', $trabajo->venta_id)->update(['estado' => 'cancelada']);
        }

        return back()->with('success', 'Estado actualizado.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MARCAR trabajo como pagado
    // ─────────────────────────────────────────────────────────────────────────

    public function marcarPagado(Request $request, TrabajoImpresion $trabajo)
    {
        $data = $request->validate([
            'metodo'         => 'required|in:tarjeta_debito,tarjeta_credito,transferencia',
            'ultimos_cuatro' => 'nullable|string|size:4|regex:/^\d{4}$/',
            'banco'          => 'nullable|string|max:100',
            'referencia'     => 'nullable|string|max:255',
        ]);

        if ($trabajo->pagado) {
            return back()->withErrors(['error' => 'Este trabajo ya fue pagado.']);
        }

        // Registrar pago
        Pago::create([
            'venta_id'       => $trabajo->venta_id,
            'user_id'        => $trabajo->user_id,
            'metodo'         => $data['metodo'],
            'ultimos_cuatro' => $data['ultimos_cuatro'] ?? null,
            'banco'          => $data['banco'] ?? null,
            'referencia'     => $data['referencia'] ?? null,
            'monto'          => $trabajo->total,
        ]);

        // Marcar trabajo como pagado
        $trabajo->update([
            'pagado'    => true,
            'pagado_at' => Carbon::now(),
            'estado'    => 'en_proceso',
        ]);

        // Actualizar venta a pagada
        if ($trabajo->venta_id) {
            Venta::where('id', $trabajo->venta_id)->update([
                'estado'      => 'pagada',
                'metodo_pago' => $data['metodo'],
            ]);
        }

        return back()->with('success', 'Pago registrado. El trabajo puede comenzar a procesarse.');
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

        if (is_null($data['precio_tinta_color_base'])) {
            $data['precio_tinta_color_base'] = 0.00;
        }

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

        if (is_null($data['precio_tinta_color_base'])) {
            $data['precio_tinta_color_base'] = 0.00;
        }

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

    public function scanPrinters()
    {
        $printers = [];

        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            // Windows: Ejecutar comando PowerShell para listar impresoras
            $output = shell_exec('powershell -Command "Get-Printer | Select-Object Name | ConvertTo-Json"');
            if ($output) {
                $data = json_decode($output, true);
                if (is_array($data)) {
                    // ConvertTo-Json devuelve un solo objeto si hay 1 impresora, o un array si hay varias
                    if (isset($data['Name'])) {
                        $printers[] = $data['Name'];
                    } else {
                        foreach ($data as $printer) {
                            if (isset($printer['Name'])) {
                                $printers[] = $printer['Name'];
                            }
                        }
                    }
                }
            }
        } else {
            // Linux / macOS: Usar lpstat -a para obtener las impresoras registradas en CUPS
            $output = shell_exec('lpstat -a 2>/dev/null');
            if ($output) {
                $lines = explode("\n", trim($output));
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (!empty($line)) {
                        $parts = preg_split('/\s+/', $line);
                        if (isset($parts[0]) && !empty($parts[0])) {
                            // Reemplazar guiones bajos por espacios para una visualización más amigable si se prefiere,
                            // o simplemente mantener el nombre técnico de CUPS.
                            $printers[] = str_replace('_', ' ', $parts[0]);
                        }
                    }
                }
            }
        }

        return response()->json($printers);
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
            'cobertura_real'       => $t->cobertura_real,
            'tipo_contenido'       => $t->tipo_contenido ?? 'documento',
            'precio_hoja_unit'     => (float) $t->precio_hoja_unit,
            'precio_tinta_unit'    => (float) $t->precio_tinta_unit,
            'precio_por_hoja'      => (float) $t->precio_por_hoja,
            'recargo_imagen'       => (float) $t->recargo_imagen,
            'total'                => (float) $t->total,
            'estado'               => $t->estado,
            'pagado'               => (bool) $t->pagado,
            'pagado_at'            => $t->pagado_at?->format('d/m/Y H:i'),
            'notas'                => $t->notas,
            'archivo_nombre'       => $t->archivo_nombre,
            'archivo_url'          => $t->archivo_path ? asset('storage/' . $t->archivo_path) : null,
            'fecha'                => $t->created_at->format('d/m/Y H:i'),
        ];
    }
}
