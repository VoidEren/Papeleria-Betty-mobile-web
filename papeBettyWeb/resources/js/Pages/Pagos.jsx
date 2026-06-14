import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    CreditCardIcon,
    BanknotesIcon,
    BuildingLibraryIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ShoppingBagIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TABS = [
    {
        key: 'debito',
        label: 'Tarjeta Débito',
        icon: CreditCardIcon,
        gradient: 'from-blue-500 to-cyan-500',
        bgLight: 'bg-blue-50',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-700',
        accentText: 'text-blue-600',
        chipBg: 'from-blue-600 to-cyan-500',
    },
    {
        key: 'credito',
        label: 'Tarjeta Crédito',
        icon: CreditCardIcon,
        gradient: 'from-violet-500 to-purple-600',
        bgLight: 'bg-violet-50',
        border: 'border-violet-200',
        badge: 'bg-violet-100 text-violet-700',
        accentText: 'text-violet-600',
        chipBg: 'from-violet-600 to-purple-600',
    },
    {
        key: 'transferencia',
        label: 'Transferencia',
        icon: BuildingLibraryIcon,
        gradient: 'from-emerald-500 to-teal-500',
        bgLight: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-700',
        accentText: 'text-emerald-600',
        chipBg: 'from-emerald-600 to-teal-500',
    },
];

function CreditChip({ numero, banco, chipBg }) {
    return (
        <div className={`relative w-full h-40 rounded-2xl bg-gradient-to-br ${chipBg} shadow-xl p-5 overflow-hidden text-white`}>
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -right-2 w-36 h-36 rounded-full bg-white/10" />

            {/* Bank name */}
            <div className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-4">{banco || 'Banco'}</div>

            {/* Chip icon */}
            <div className="w-9 h-7 rounded-md bg-yellow-300/80 mb-4 flex items-center justify-center">
                <div className="w-6 h-4 rounded-sm bg-yellow-400/60 border border-yellow-500/30" />
            </div>

            {/* Card number */}
            <div className="font-mono text-lg tracking-widest font-bold">
                {numero || '**** **** **** ****'}
            </div>
        </div>
    );
}

function PagoCard({ pago, tab }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`rounded-2xl border ${tab.border} bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}>
            {/* Header */}
            <div className={`p-4 ${tab.bgLight}`}>
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tab.gradient} flex items-center justify-center text-white font-bold text-lg shadow`}>
                        {(pago.cliente || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{pago.cliente}</div>
                        {pago.cliente_email && (
                            <div className="text-xs text-gray-500 truncate">{pago.cliente_email}</div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className={`text-xs font-semibold ${tab.badge} px-2 py-0.5 rounded-full`}>
                            {pago.metodo_label}
                        </div>
                        <div className="text-sm font-bold text-gray-900 mt-1">
                            ${Number(pago.monto).toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Tarjeta visual (solo para tarjetas) */}
                {pago.tarjeta && (
                    <CreditChip numero={pago.tarjeta} banco={pago.banco} chipBg={tab.chipBg} />
                )}

                {/* Transferencia info */}
                {pago.metodo === 'transferencia' && (
                    <div className="mt-2 rounded-xl bg-white/70 border border-emerald-100 p-3 space-y-1 text-sm">
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
                )}
            </div>

            {/* Info footer */}
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                    <span className="font-medium text-gray-600">Folio:</span> {pago.folio || '—'}
                    {pago.fecha_pago && <span className="ml-3">{pago.fecha_pago}</span>}
                </div>
                {pago.productos && pago.productos.length > 0 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className={`flex items-center gap-1 text-xs font-semibold ${tab.accentText} hover:opacity-70 transition`}
                    >
                        <ShoppingBagIcon className="w-4 h-4" />
                        {expanded ? 'Ocultar' : `Ver (${pago.productos.length})`}
                        {expanded ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
                    </button>
                )}
            </div>

            {/* Productos expandibles */}
            {expanded && pago.productos && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2">
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

function EmptyState({ tab }) {
    const Icon = tab.icon;
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tab.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-700">Sin pagos registrados</h3>
            <p className="text-sm text-gray-400 mt-1">
                No hay pagos con {tab.label.toLowerCase()} aún.
            </p>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Pagos({ tarjetaDebito = [], tarjetaCredito = [], transferencia = [] }) {
    const [activeTab, setActiveTab] = useState('debito');

    const dataMap = {
        debito: tarjetaDebito,
        credito: tarjetaCredito,
        transferencia: transferencia,
    };

    const totales = {
        debito:        tarjetaDebito.reduce((s, p) => s + Number(p.monto), 0),
        credito:       tarjetaCredito.reduce((s, p) => s + Number(p.monto), 0),
        transferencia: transferencia.reduce((s, p) => s + Number(p.monto), 0),
    };

    const activeTabDef = TABS.find(t => t.key === activeTab);
    const activePagos  = dataMap[activeTab] || [];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                    Registro de Pagos
                </h2>
            }
        >
            <Head title="Pagos" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Resumen total */}
                    <div className="grid grid-cols-3 gap-4">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const count = dataMap[tab.key]?.length ?? 0;
                            const total = totales[tab.key];
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`rounded-2xl p-4 text-left transition-all duration-200 border-2
                                        ${activeTab === tab.key
                                            ? `border-transparent bg-gradient-to-br ${tab.gradient} text-white shadow-lg scale-105`
                                            : 'border-gray-200 bg-white text-gray-700 hover:scale-102 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon className={`w-5 h-5 ${activeTab === tab.key ? 'text-white' : tab.accentText}`} />
                                        <span className={`text-xs font-semibold uppercase tracking-wider ${activeTab === tab.key ? 'text-white/80' : 'text-gray-500'}`}>
                                            {tab.label}
                                        </span>
                                    </div>
                                    <div className={`text-2xl font-black ${activeTab === tab.key ? 'text-white' : 'text-gray-900'}`}>
                                        ${total.toFixed(2)}
                                    </div>
                                    <div className={`text-xs mt-1 ${activeTab === tab.key ? 'text-white/70' : 'text-gray-400'}`}>
                                        {count} pago{count !== 1 ? 's' : ''}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Contenido del tab activo */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Tab header */}
                        <div className={`px-6 py-4 bg-gradient-to-r ${activeTabDef.gradient} flex items-center gap-3`}>
                            <activeTabDef.icon className="w-6 h-6 text-white" />
                            <h3 className="text-lg font-bold text-white">{activeTabDef.label}</h3>
                            <span className="ml-auto bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
                                {activePagos.length} registro{activePagos.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Cards grid */}
                        <div className="p-6">
                            {activePagos.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {activePagos.map(pago => (
                                        <PagoCard key={pago.id} pago={pago} tab={activeTabDef} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState tab={activeTabDef} />
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
