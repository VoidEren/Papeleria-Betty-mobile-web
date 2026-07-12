import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    BuildingLibraryIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ShoppingBagIcon,
    ClipboardIcon,
} from '@heroicons/react/24/outline';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function AccountCard({ banco, titular, cuenta, clabe, tarjeta, gradient }) {
    const [copied, setCopied] = useState(false);

    const copyClabe = () => {
        navigator.clipboard.writeText(clabe.replace(/\s/g, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-xl w-full`}>
            {/* Background elements */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-6 h-28 w-28 rounded-full bg-white/10" />

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <BuildingLibraryIcon className="w-7 h-7 opacity-90" />
                    <span className="text-base font-extrabold uppercase tracking-widest">{banco}</span>
                </div>
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-md font-semibold text-white/95 uppercase tracking-wider">
                    Cuenta Oficial
                </span>
            </div>

            <div className="space-y-3">
                <div>
                    <span className="text-[10px] uppercase tracking-wider text-white/70 block">Titular</span>
                    <span className="text-base font-semibold">{titular}</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/10">
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-white/70 block">Número de Tarjeta</span>
                        <span className="text-sm font-mono font-bold tracking-wider">{tarjeta}</span>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-white/70 block">Número de Cuenta</span>
                        <span className="text-sm font-mono font-bold">{cuenta}</span>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-white/70 block">CLABE Interbancaria</span>
                        <span className="text-sm font-mono font-bold tracking-wider">{clabe}</span>
                    </div>
                </div>
            </div>

            {/* Copy button */}
            <button
                onClick={copyClabe}
                className="mt-5 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-98 transition text-xs font-semibold"
            >
                <ClipboardIcon className="w-4 h-4" />
                {copied ? '¡CLABE Copiada al Portapapeles!' : 'Copiar CLABE'}
            </button>
        </div>
    );
}

function PagoCard({ pago }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-emerald-50/50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow">
                        {(pago.cliente || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{pago.cliente}</div>
                        {pago.cliente_email && (
                            <div className="text-xs text-gray-500 truncate">{pago.cliente_email}</div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            Transferencia
                        </div>
                        <div className="text-sm font-bold text-gray-900 mt-1">
                            ${Number(pago.monto).toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Transferencia info */}
                <div className="mt-2 rounded-xl bg-white border border-emerald-100/50 p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Destino</span>
                        <span className="font-bold text-indigo-700">{pago.banco || 'BBVA Bancomer'}</span>
                    </div>
                    {pago.banco_origen && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Banco origen</span>
                            <span className="font-semibold text-gray-800">{pago.banco_origen}</span>
                        </div>
                    )}
                    {pago.referencia && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Referencia</span>
                            <span className="font-mono font-semibold text-gray-800">{pago.referencia}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Info footer */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-50">
                <div className="text-xs text-gray-400">
                    <span className="font-medium text-gray-600">Folio:</span> {pago.folio || '—'}
                    {pago.fecha_pago && <span className="ml-3">{pago.fecha_pago}</span>}
                </div>
                {pago.productos && pago.productos.length > 0 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:opacity-70 transition"
                    >
                        <ShoppingBagIcon className="w-4 h-4" />
                        {expanded ? 'Ocultar' : `Ver (${pago.productos.length})`}
                        {expanded ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
                    </button>
                )}
            </div>

            {/* Productos expandibles */}
            {expanded && pago.productos && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50 space-y-2">
                    {pago.productos.map((prod, idx) => (
                        <div key={idx} className="flex items-start justify-between text-sm">
                            <div className="flex-1 min-w-0">
                                <div className="text-gray-800 truncate">{prod.descripcion}</div>
                                <div className="text-xs text-gray-400">
                                    {prod.cantidad} × ${Number(prod.precio_unitario).toFixed(2)}
                                </div>
                            </div>
                            <div className="font-semibold text-gray-900 ml-4">
                                ${Number(prod.subtotal).toFixed(2)}
                            </div>
                        </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm text-gray-900">
                        <span>Total</span>
                        <span>${Number(pago.monto).toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-4 shadow-lg">
                <BuildingLibraryIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-700">Sin transferencias</h3>
            <p className="text-sm text-gray-400 mt-1">
                No hay pagos recibidos mediante transferencia bancaria que coincidan con la vista.
            </p>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Pagos({ transferencias = [] }) {
    const [isMobile, setIsMobile] = useState(false);

    // Detectar si el usuario está en móvil para aplicar el filtro dinámico
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // En móviles: Solo ver pagos dirigidos a partir de compras de esta web (folio empieza con WEB-)
    // En escritorio: Ver todos los pagos
    const activePagos = isMobile
        ? transferencias.filter(p => p.folio && p.folio.startsWith('WEB-'))
        : transferencias;

    const totalRecibido = activePagos.reduce((sum, p) => sum + Number(p.monto), 0);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                    Registro de Pagos (Transferencias)
                </h2>
            }
        >
            <Head title="Pagos" />

            <div className="py-6 space-y-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
                
                {/* Section: Official Accounts */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Cuenta Receptora Oficial</h3>
                    <div className="flex">
                        <AccountCard
                            banco="BBVA Bancomer"
                            titular="Carlos David Moreno Escorza"
                            cuenta="129 247 3135"
                            clabe="012 180 01292473135 1"
                            tarjeta="4152 3144 7373 8048"
                            gradient="from-indigo-600 to-blue-500"
                        />
                    </div>
                </div>

                {/* Section: Summary Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h4 className="text-lg font-black text-gray-800">Resumen de Ingresos</h4>
                        <p className="text-sm text-gray-400">
                            {isMobile 
                                ? 'Ingresos acumulados a partir de esta web' 
                                : 'Total acumulado por transferencias bancarias'}
                        </p>
                    </div>
                    <div className="flex gap-8">
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
                            <p className="text-3xl font-black text-emerald-600">${totalRecibido.toFixed(2)}</p>
                        </div>
                        <div className="border-l border-gray-150 pl-8">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Operaciones</span>
                            <p className="text-3xl font-black text-gray-800">{activePagos.length}</p>
                        </div>
                    </div>
                </div>

                {/* Section: Payments List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                            {isMobile ? 'Transferencias desde Web' : 'Historial de Transferencias'}
                        </h3>
                        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                            {activePagos.length} Pago{activePagos.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {activePagos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {activePagos.map(pago => (
                                <PagoCard key={pago.id} pago={pago} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
