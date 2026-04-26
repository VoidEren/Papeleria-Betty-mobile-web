<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductoController;
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
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/inventario', function(){
    $productos = App\Models\Producto::all();
    return Inertia::render('Inventario', ['productos' => $productos]);
})->middleware(['auth', 'verified'])->name('inventario');

Route::get('/productos', [ProductoController::class, 'index'])->middleware(['auth', 'verified'])->name('productos');
Route::post('/productos', [ProductoController::class, 'store'])->middleware(['auth', 'verified'])->name('productos.store');
Route::post('/productos/{producto}', [ProductoController::class, 'update'])->middleware(['auth', 'verified'])->name('productos.update');
Route::delete('/productos/{producto}', [ProductoController::class, 'destroy'])->middleware(['auth', 'verified'])->name('productos.destroy');

Route::get('/area-impresion', function(){
    return Inertia::render('AreaImpresion');
})->middleware(['auth', 'verified'])->name('area-impresion');

Route::get('/pagos', function(){
    return Inertia::render('Pagos');
})->middleware(['auth', 'verified'])->name('pagos');

Route::get('/store', function(){
    return Inertia::render('Store');
})->middleware(['auth', 'verified'])->name('store');

Route::get('/reportes', function(){
    return Inertia::render('Reportes');
})->middleware(['auth', 'verified'])->name('reportes');

Route::get('/clientes', function(){
    return Inertia::render('Clientes');
})->middleware(['auth','verified'])->name('clientes');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
