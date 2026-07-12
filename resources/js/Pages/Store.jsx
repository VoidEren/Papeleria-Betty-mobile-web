import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    ShoppingCartIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CalendarDaysIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const METODO_CONFIG = {
    tarjeta_debito:  { label: 'Débito',        color: 'bg-blue-100 text-blue-700' },
    tarjeta_credito: { label: 'Crédito',        color: 'bg-violet-100 text-violet-700' },
    transferencia:   { label: 'Transferencia',  color: 'bg-teal-100 text-teal-700' },
    efectivo:        { label: 'Efectivo',        color: 'bg-amber-100 text-amber-700' },
};

const ESTADO_CONFIG = {
    pagada: {
        label: 'Pagado',
        icon: CheckCircleIcon,
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-400',
    },
    pendiente: {
        label: 'Pendiente',
        icon: ClockIcon,
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        dot: 'bg-amber-400',
    },
    cancelada: {
        label: 'Cancelado',
        icon: XCircleIcon,
        color: 'bg-red-100 text-red-700 border-red-200',
        dot: 'bg-red-400',
    },
};

function StatusBadge({ estado }) {
    const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.pendiente;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function MetodoBadge({ metodo }) {
    const cfg = METODO_CONFIG[metodo];
    if (!cfg) return null;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
            {cfg.label}
        </span>
    );
}

function VentaCard({ venta }) {
    const [expanded, setExpanded] = useState(false);

    const initials = (venta.cliente || 'C')
        .split(' ')
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? '')
        .join('');

    const recogidaProxima = venta.fecha_recogida
        ? new Date(venta.fecha_recogida) > new Date()
        : false;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            {/* Card Header */}
            <div className="p-4 border-b border-gray-50">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shadow">
                        {initials || '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 truncate">{venta.cliente}</span>
                            <StatusBadge estado={venta.estado} />
                            {venta.metodo_pago && <MetodoBadge metodo={venta.metodo_pago} />}
                        </div>
                        {venta.cliente_email && (
                            <div className="text-xs text-gray-400 mt-0.5 truncate">{venta.cliente_email}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-0.5">
                            Folio: <span className="font-mono font-medium text-gray-600">{venta.folio || '—'}</span>
                        </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                        <div className="text-xl font-extrabold text-emerald-600">
                            ${Number(venta.total).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">MXN</div>
                    </div>
                </div>
            </div>

            {/* Dates row */}
            <div className="px-4 py-3 bg-gray-50 grid grid-cols-2 gap-3 text-sm">
                <div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                        <CalendarDaysIcon className="w-3.5 h-3.5" />
                        Fecha de pago
                    </div>
                    <div className="font-semibold text-gray-800">
                        {venta.fecha_venta || '—'}
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-1.5 text-xs mb-1">
                        <ClockIcon className={`w-3.5 h-3.5 ${recogidaProxima ? 'text-amber-500' : 'text-gray-400'}`} />
                        <span className={recogidaProxima ? 'text-amber-600 font-semibold' : 'text-gray-400'}>
                            Pasa a recoger
                        </span>
                    </div>
                    <div className={`font-semibold ${recogidaProxima ? 'text-amber-700' : 'text-gray-800'}`}>
                        {venta.fecha_recogida ?? (
                            <span className="text-gray-400 font-normal italic">Sin definir</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Productos toggle */}
            {venta.productos && venta.productos.length > 0 && (
                <>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                        <span className="flex items-center gap-1.5">
                            <ShoppingCartIcon className="w-4 h-4" />
                            {expanded ? 'Ocultar productos' : `Ver ${venta.productos.length} producto${venta.productos.length !== 1 ? 's' : ''}`}
                        </span>
                        {expanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                    </button>

                    {expanded && (
                        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
                            {venta.productos.map((prod, idx) => (
                                <div key={idx} className="flex items-start justify-between text-sm gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-gray-800 leading-tight">{prod.descripcion}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {prod.cantidad} × ${Number(prod.precio_unitario).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="font-semibold text-gray-900 whitespace-nowrap">
                                        ${Number(prod.subtotal).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm text-gray-900">
                                <span>Total pedido</span>
                                <span className="text-emerald-600">${Number(venta.total).toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Store({ ventas = [] }) {
    const [search, setSearch] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');

    const ventasFiltradas = ventas.filter(v => {
        const matchSearch = search === '' ||
            v.cliente?.toLowerCase().includes(search.toLowerCase()) ||
            v.folio?.toLowerCase().includes(search.toLowerCase()) ||
            v.cliente_email?.toLowerCase().includes(search.toLowerCase());

        const matchEstado = filtroEstado === 'todos' || v.estado === filtroEstado;
        return matchSearch && matchEstado;
    });

    const totalGeneral = ventasFiltradas.reduce((s, v) => s + Number(v.total), 0);
    const pendientes   = ventas.filter(v => v.estado === 'pendiente').length;
    const pagadas      = ventas.filter(v => v.estado === 'pagada').length;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    Pedidos de Clientes
                </h2>
            }
        >
            <Head title="Store — Pedidos" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Stats bar */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Total pedidos</div>
                            <div className="text-3xl font-black text-gray-900">{ventas.length}</div>
                        </div>
                        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
                            <div className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">Pendientes</div>
                            <div className="text-3xl font-black text-amber-600">{pendientes}</div>
                        </div>
                        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4">
                            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-1">Cobrados</div>
                            <div className="text-3xl font-black text-emerald-600">{pagadas}</div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por cliente, folio o correo..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
                            />
                        </div>

                        {/* Estado filter */}
                        <div className="flex gap-2">
                            {[
                                { val: 'todos',    label: 'Todos' },
                                { val: 'pendiente', label: 'Pendientes' },
                                { val: 'pagada',    label: 'Pagados' },
                            ].map(opt => (
                                <button
                                    key={opt.val}
                                    onClick={() => setFiltroEstado(opt.val)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                        filtroEstado === opt.val
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Total filtrado */}
                    {ventasFiltradas.length > 0 && (
                        <div className="flex items-center justify-between px-1">
                            <span className="text-sm text-gray-500">
                                Mostrando <strong>{ventasFiltradas.length}</strong> pedido{ventasFiltradas.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-sm font-bold text-gray-700">
                                Total: <span className="text-emerald-600">${totalGeneral.toFixed(2)}</span>
                            </span>
                        </div>
                    )}

                    {/* Grid de ventas */}
                    {ventasFiltradas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {ventasFiltradas.map(venta => (
                                <VentaCard key={venta.id} venta={venta} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                            <ShoppingCartIcon className="mx-auto w-14 h-14 text-gray-200 mb-4" />
                            <h3 className="text-base font-semibold text-gray-700">Sin pedidos</h3>
                            <p className="text-sm text-gray-400 mt-1">
                                {search ? 'No se encontraron resultados para tu búsqueda.' : 'Aún no hay pedidos registrados.'}
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
