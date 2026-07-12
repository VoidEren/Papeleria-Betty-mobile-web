import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Inventario({ productos }) {
    // Calculamos algunas estadísticas rápidas
    const totalProductos = productos ? productos.length : 0;
    const productosAgotados = productos ? productos.filter(p => p.stock <= 0).length : 0;
    const productosBajoStock = productos ? productos.filter(p => p.stock > 0 && p.stock <= 5).length : 0;
    const totalStock = productos ? productos.reduce((acc, p) => acc + p.stock, 0) : 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                    Control de Inventario
                </h2>
            }
        >
            <Head title="Inventario" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Tarjetas de Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                            <span className="text-gray-500 font-semibold text-sm uppercase">Total Referencias</span>
                            <span className="text-4xl font-black text-gray-800 mt-2">{totalProductos}</span>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                            <span className="text-gray-500 font-semibold text-sm uppercase">Stock Total</span>
                            <span className="text-4xl font-black text-indigo-600 mt-2">{totalStock}</span>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                            <span className="text-gray-500 font-semibold text-sm uppercase">Bajo Stock (≤5)</span>
                            <span className="text-4xl font-black text-yellow-500 mt-2">{productosBajoStock}</span>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100 bg-red-50 flex flex-col justify-between hover:shadow-md transition">
                            <span className="text-red-600 font-semibold text-sm uppercase">Agotados</span>
                            <span className="text-4xl font-black text-red-600 mt-2">{productosAgotados}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-800">Estado de Productos</h3>
                            <Link href={route('productos')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg transition">
                                Gestionar Productos
                            </Link>
                        </div>
                        
                        {productos && productos.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-gray-100 uppercase text-xs tracking-wider text-gray-500">
                                            <th className="p-4 font-bold">Producto</th>
                                            <th className="p-4 font-bold">Estado Real</th>
                                            <th className="p-4 font-bold text-center">Disponible</th>
                                            <th className="p-4 font-bold text-right">Precio Actual</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {productos.map(prod => {
                                            const isAgotado = prod.stock <= 0;
                                            const isBajo = prod.stock > 0 && prod.stock <= 5;
                                            const isBien = prod.stock > 5;
                                            
                                            // Conditional classes
                                            const statusClass = isAgotado ? 'bg-red-50 border-red-100' : 'hover:bg-gray-50 transition-colors';
                                            
                                            return (
                                                <tr key={prod.id} className={`${statusClass} group`}>
                                                    <td className="p-4 flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                                            {prod.imagen ? (
                                                                <img src={`/storage/${prod.imagen}`} alt={prod.nombre} className={`w-full h-full object-cover ${isAgotado ? 'grayscale opacity-70' : ''}`} />
                                                            ) : (
                                                                <svg className="h-full w-full p-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className={`font-black text-base capitalize ${isAgotado ? 'text-red-700' : 'text-gray-900'}`}>{prod.nombre}</div>
                                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{prod.descripcion || 'Sin descripción...'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {isAgotado && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 shadow-sm border border-red-200 animate-pulse">
                                                                <span className="w-2 h-2 rounded-full bg-red-600 block"></span>
                                                                AGOTADO
                                                            </span>
                                                        )}
                                                        {isBajo && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 shadow-sm border border-yellow-200">
                                                                <span className="w-2 h-2 rounded-full bg-yellow-600 block"></span>
                                                                BAJO STOCK
                                                            </span>
                                                        )}
                                                        {isBien && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200">
                                                                <span className="w-2 h-2 rounded-full bg-emerald-600 block"></span>
                                                                DISPONIBLE
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`text-2xl font-black ${isAgotado ? 'text-red-600' : (isBajo ? 'text-yellow-600' : 'text-gray-800')}`}>
                                                            {prod.stock}
                                                        </span>
                                                        <span className="text-xs text-gray-400 block -mt-1 font-semibold">unidades</span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="text-lg font-bold text-emerald-600">${prod.precio}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-16 text-center">
                                <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h3 className="mt-4 text-lg font-bold text-gray-900">Aún no hay productos</h3>
                                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">Comienza agregando productos en el catálogo para ver y controlar el estado del inventario aquí.</p>
                                <div className="mt-6">
                                    <Link href={route('productos')} className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow transition">
                                        Ir al Catálogo
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
