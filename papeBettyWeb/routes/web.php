<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\ImpresionController;
use App\Http\Controllers\ReporteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $trabajosPendientes = App\Models\TrabajoImpresion::with(['user', 'impresora'])
        ->where('estado', 'pendiente')
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($t) {
            return [
                'id'             => $t->id,
                'cliente'        => $t->user?->name ?? $t->cliente_nombre ?? 'Sin cliente',
                'impresora'      => $t->impresora?->nombre,
                'tipo_contenido' => $t->tipo_contenido,
                'hojas'          => $t->hojas,
                'copias'         => $t->copias,
                'total'          => (float) $t->total,
                'archivo_nombre' => $t->archivo_nombre,
                'archivo_url'    => $t->archivo_path ? asset('storage/' . $t->archivo_path) : null,
                'fecha'          => $t->created_at->format('d/m/Y H:i'),
            ];
        });

    $ventasPendientes = App\Models\Venta::with('user')
        ->where('estado', 'pendiente')
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($v) {
            return [
                'id'      => $v->id,
                'folio'   => $v->folio,
                'cliente' => $v->user?->name ?? $v->cliente_nombre ?? 'Cliente',
                'total'   => (float) $v->total,
                'fecha'   => $v->created_at->format('d/m/Y H:i'),
            ];
        });

    return Inertia::render('Dashboard', [
        'trabajosPendientes' => $trabajosPendientes,
        'ventasPendientes'   => $ventasPendientes,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/inventario', function(){
    $productos = App\Models\Producto::all();
    return Inertia::render('Inventario', ['productos' => $productos]);
})->middleware(['auth', 'verified'])->name('inventario');

Route::get('/productos', [ProductoController::class, 'index'])->middleware(['auth', 'verified'])->name('productos');
Route::post('/productos', [ProductoController::class, 'store'])->middleware(['auth', 'verified'])->name('productos.store');
Route::post('/productos/{producto}', [ProductoController::class, 'update'])->middleware(['auth', 'verified'])->name('productos.update');
Route::delete('/productos/{producto}', [ProductoController::class, 'destroy'])->middleware(['auth', 'verified'])->name('productos.destroy');

Route::get('/area-impresion', [ImpresionController::class, 'index'])->middleware(['auth', 'verified'])->name('area-impresion');
Route::get('/area-impresion/impresoras/scan', [ImpresionController::class, 'scanPrinters'])->middleware(['auth', 'verified'])->name('impresoras.scan');
Route::post('/area-impresion/trabajos', [ImpresionController::class, 'storeTrabajo'])->middleware(['auth', 'verified'])->name('trabajos.store');
Route::post('/area-impresion/calcular', [ImpresionController::class, 'calcular'])->middleware(['auth', 'verified'])->name('trabajos.calcular');
Route::patch('/area-impresion/trabajos/{trabajo}/estado', [ImpresionController::class, 'updateEstado'])->middleware(['auth', 'verified'])->name('trabajos.estado');
Route::post('/area-impresion/trabajos/{trabajo}/pagar', [ImpresionController::class, 'marcarPagado'])->middleware(['auth', 'verified'])->name('trabajos.pagar');
Route::post('/area-impresion/impresoras', [ImpresionController::class, 'storeImpresora'])->middleware(['auth', 'verified'])->name('impresoras.store');
Route::post('/area-impresion/impresoras/{impresora}', [ImpresionController::class, 'updateImpresora'])->middleware(['auth', 'verified'])->name('impresoras.update');
Route::delete('/area-impresion/impresoras/{impresora}', [ImpresionController::class, 'destroyImpresora'])->middleware(['auth', 'verified'])->name('impresoras.destroy');

Route::get('/pagos', [PagoController::class, 'index'])->middleware(['auth', 'verified'])->name('pagos');
Route::post('/pagos', [PagoController::class, 'store'])->middleware(['auth', 'verified'])->name('pagos.store');

Route::get('/store', function(){
    $ventas = App\Models\Venta::with(['user', 'detalles', 'pagos'])
        ->whereIn('estado', ['pagada', 'pendiente'])
        ->orderBy('fecha_venta', 'desc')
        ->get()
        ->map(function($v) {
            return [
                'id'             => $v->id,
                'folio'          => $v->folio,
                'cliente'        => $v->user?->name ?? $v->cliente_nombre ?? 'Cliente general',
                'cliente_email'  => $v->user?->email ?? null,
                'estado'         => $v->estado,
                'metodo_pago'    => $v->metodo_pago,
                'total'          => (float) $v->total,
                'fecha_venta'    => $v->fecha_venta?->format('d/m/Y H:i'),
                'fecha_recogida' => $v->fecha_recogida?->format('d/m/Y H:i'),
                'productos'      => $v->detalles->map(fn($d) => [
                    'descripcion'     => $d->descripcion,
                    'cantidad'        => $d->cantidad,
                    'precio_unitario' => (float) $d->precio_unitario,
                    'subtotal'        => (float) $d->subtotal,
                ]),
            ];
        });
    return Inertia::render('Store', ['ventas' => $ventas]);
})->middleware(['auth', 'verified'])->name('store');

Route::get('/reportes', [ReporteController::class, 'index'])->middleware(['auth', 'verified'])->name('reportes');
Route::get('/reportes/datos', [ReporteController::class, 'datos'])->middleware(['auth', 'verified'])->name('reportes.datos');

Route::get('/clientes', function(){
    $clientes = App\Models\User::where('is_mobile_app', true)->get();
    return Inertia::render('Clientes', ['clientes' => $clientes]);
})->middleware(['auth','verified'])->name('clientes');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
