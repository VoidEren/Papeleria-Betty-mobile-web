<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Producto;
use Illuminate\Support\Facades\Storage;

class ProductoController extends Controller
{
    public function index()
    {
        // Obtain all products and pass them to the view
        $productos = Producto::orderBy('created_at', 'desc')->get();
        return Inertia::render('Productos', [
            'productos' => $productos
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:productos,nombre',
            'descripcion' => 'nullable|string',
            'precio' => ['required', 'numeric', 'min:0.01', 'regex:/^\d+(\.\d{1,2})?$/'],
            'imagen' => 'nullable|image|max:2048',
            'stock' => 'required|integer|min:0'
        ], [
            'nombre.unique' => 'El producto ya existe.'
        ]);

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('productos', 'public');
            $validated['imagen'] = $path;
        }

        Producto::create($validated);

        return redirect()->route('productos')->with('success', 'Producto guardado correctamente.');
    }

    public function update(Request $request, Producto $producto)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:productos,nombre,' . $producto->id,
            'descripcion' => 'nullable|string',
            'precio' => ['required', 'numeric', 'min:0.01', 'regex:/^\d+(\.\d{1,2})?$/'],
            'imagen' => 'nullable|image|max:2048',
            'stock' => 'required|integer|min:0'
        ], [
            'nombre.unique' => 'El producto ya existe.'
        ]);

        if ($request->hasFile('imagen')) {
             if ($producto->imagen && Storage::disk('public')->exists($producto->imagen)) {
                 Storage::disk('public')->delete($producto->imagen);
             }
             $path = $request->file('imagen')->store('productos', 'public');
             $validated['imagen'] = $path;
        }

        $producto->update($validated);

        return redirect()->route('productos')->with('success', 'Producto actualizado correctamente.');
    }

    public function destroy(Producto $producto)
    {
        if ($producto->imagen && Storage::disk('public')->exists($producto->imagen)) {
            Storage::disk('public')->delete($producto->imagen);
        }
        
        $producto->delete();

        return redirect()->route('productos')->with('success', 'Producto eliminado correctamente.');
    }
}
