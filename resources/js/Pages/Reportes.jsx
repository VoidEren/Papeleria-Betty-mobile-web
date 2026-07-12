import { useState, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    DocumentArrowDownIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    DocumentChartBarIcon,
    UserGroupIcon,
    PrinterIcon,
    DocumentDuplicateIcon,
    ShoppingBagIcon,
    CalendarDaysIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n ?? 0);

const TIPOS = {
    copia:     { label: 'Copias',      color: 'blue',   icon: DocumentDuplicateIcon },
    impresion: { label: 'Impresiones', color: 'purple', icon: PrinterIcon },
    articulo:  { label: 'Artículos',   color: 'green',  icon: ShoppingBagIcon },
};

// ─── Generador de PDF (jsPDF) ────────────────────────────────────────────────

async function generarPDF(ventas, resumen, filtros, periodoLabel) {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const W = doc.internal.pageSize.getWidth();
    const gray   = [100, 100, 100];
    const dark   = [30,  30,  30];
    const accent = [79,  70, 229];   // indigo

    // ── Encabezado ──────────────────────────────────────────────────────────
    doc.setFillColor(...accent);
    doc.rect(0, 0, W, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('Papelería Betty', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Reporte General de Ventas', 14, 19);
    doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 14, 24);

    // periodo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(periodoLabel, W - 14, 14, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
        `${filtros.periodoObj?.inicio} — ${filtros.periodoObj?.fin}`,
        W - 14, 20,
        { align: 'right' }
    );

    let y = 34;

    // ── Cliente ─────────────────────────────────────────────────────────────
    const clienteLabel = filtros.clienteNombre || 'Todos los clientes';
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.text('Cliente:', 14, y);
    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    doc.text(clienteLabel, 35, y);
    doc.setFont('helvetica', 'normal');
    y += 8;

    // ── Resumen ─────────────────────────────────────────────────────────────
    const summaryData = [
        ['Copias',      fmt(resumen.total_copias)],
        ['Impresiones', fmt(resumen.total_impresiones)],
        ['Artículos varios', fmt(resumen.total_articulos)],
    ];

    autoTable(doc, {
        startY: y,
        head: [['Categoría', 'Subtotal']],
        body: summaryData,
        foot: [['GRAN TOTAL', fmt(resumen.gran_total)]],
        theme: 'grid',
        headStyles:  { fillColor: accent, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        footStyles:  { fillColor: [240, 240, 255], textColor: dark, fontStyle: 'bold', fontSize: 10 },
        bodyStyles:  { fontSize: 9 },
        columnStyles: { 1: { halign: 'right' } },
        margin: { left: 14, right: 14 },
        tableWidth: 100,
    });

    y = doc.lastAutoTable.finalY + 10;

    // ── Detalle por tipo ─────────────────────────────────────────────────────
    const tipos = ['copia', 'impresion', 'articulo'];
    const tipoHeaders = {
        copia:     'COPIAS',
        impresion: 'IMPRESIONES',
        articulo:  'ARTÍCULOS VARIOS',
    };
    const tipoColors = {
        copia:     [219, 234, 254],
        impresion: [237, 233, 254],
        articulo:  [220, 252, 231],
    };

    // Aplanar todos los detalles con info de venta
    const allDetalles = ventas.flatMap((v) =>
        v.detalles.map((d) => ({
            ...d,
            folio:   v.folio,
            fecha:   v.fecha,
            cliente: v.cliente,
        }))
    );

    for (const tipo of tipos) {
        const filas = allDetalles.filter((d) => d.tipo === tipo);
        if (!filas.length) continue;

        if (y > 220) { doc.addPage(); y = 14; }

        doc.setFillColor(...tipoColors[tipo]);
        doc.roundedRect(14, y, W - 28, 7, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...accent);
        doc.text(tipoHeaders[tipo], 18, y + 5);
        y += 10;

        autoTable(doc, {
            startY: y,
            head: [['Folio', 'Fecha', 'Cliente', 'Descripción', 'Cant.', 'P.Unit.', 'Subtotal']],
            body: filas.map((d) => [
                d.folio ?? '—',
                d.fecha,
                d.cliente,
                d.descripcion,
                d.cantidad,
                fmt(d.precio_unitario),
                fmt(d.subtotal),
            ]),
            foot: [[
                '', '', '', 'Subtotal ' + tipoHeaders[tipo], '', '',
                fmt(filas.reduce((s, d) => s + d.subtotal, 0)),
            ]],
            theme: 'striped',
            headStyles:  { fillColor: [51, 51, 51], textColor: 255, fontSize: 8 },
            footStyles:  { fontStyle: 'bold', fontSize: 8 },
            bodyStyles:  { fontSize: 7.5 },
            columnStyles: {
                4: { halign: 'right' },
                5: { halign: 'right' },
                6: { halign: 'right' },
            },
            margin: { left: 14, right: 14 },
        });

        y = doc.lastAutoTable.finalY + 8;
    }

    // ── Pie de página ────────────────────────────────────────────────────────
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        doc.text(`Página ${i} de ${pages}  |  Papelería Betty`, W / 2, 277, { align: 'center' });
    }

    doc.save(`reporte_${filtros.periodo}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Componente principal ───────────────────────────────────────────────────

export default function Reportes({ clientes = [] }) {

    // ── Filtros ──
    const [busqueda, setBusqueda]         = useState('');
    const [clienteId, setClienteId]       = useState('todos');
    const [periodo, setPeriodo]           = useState('mes');
    const [fecha, setFecha]               = useState(new Date().toISOString().slice(0, 10));
    const [semana, setSemana]             = useState(() => {
        const d = new Date();
        const w = getISOWeek(d);
        return `${d.getFullYear()}-W${String(w).padStart(2, '0')}`;
    });
    const [mes, setMes]                   = useState(new Date().toISOString().slice(0, 7));
    const [anio, setAnio]                 = useState(String(new Date().getFullYear()));

    // ── Resultados ──
    const [cargando, setCargando]         = useState(false);
    const [ventas, setVentas]             = useState(null);
    const [resumen, setResumen]           = useState(null);
    const [periodoObj, setPeriodoObj]     = useState(null);
    const [error, setError]               = useState('');

    // Clientes filtrados por búsqueda
    const clientesFiltrados = clientes.filter((c) =>
        c.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    const clienteNombre = clienteId === 'todos'
        ? 'Todos los clientes'
        : clientes.find((c) => c.id === Number(clienteId))?.name ?? '';

    // ── Generar reporte ──
    const generar = useCallback(async () => {
        setCargando(true);
        setError('');
        setVentas(null);
        setResumen(null);

        const params = { periodo, cliente_id: clienteId };
        if (periodo === 'dia')    params.fecha  = fecha;
        if (periodo === 'semana') params.semana = semana;
        if (periodo === 'mes')    params.mes    = mes;
        if (periodo === 'anio')   params.anio   = anio;

        try {
            const { data } = await axios.get('/reportes/datos', { params });
            setVentas(data.ventas);
            setResumen(data.resumen);
            setPeriodoObj(data.periodo);
        } catch (e) {
            setError('Error al obtener los datos. Intenta de nuevo.');
        } finally {
            setCargando(false);
        }
    }, [periodo, clienteId, fecha, semana, mes, anio]);

    // ── Descargar PDF ──
    const descargarPDF = async () => {
        if (!ventas) return;
        const periodoLabel = {
            dia:    'Por día',
            semana: 'Por semana',
            mes:    'Por mes',
            anio:   'Por año',
        }[periodo];

        await generarPDF(ventas, resumen, { periodo, clienteNombre, periodoObj }, periodoLabel);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <DocumentChartBarIcon className="w-7 h-7 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        Reportes Generales
                    </h2>
                </div>
            }
        >
            <Head title="Reportes Generales" />

            <div className="py-8 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* ────── PANEL IZQUIERDO: Filtros ────── */}
                        <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">

                            {/* Buscar cliente */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <UserGroupIcon className="w-4 h-4 text-indigo-500" />
                                    Cliente
                                </h3>

                                {/* Barra de búsqueda */}
                                <div className="relative mb-3">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        id="busqueda-cliente"
                                        type="text"
                                        placeholder="Buscar cliente..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition"
                                    />
                                </div>

                                {/* Lista de clientes */}
                                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                                    {/* Opción "Todos" */}
                                    <button
                                        id="cliente-todos"
                                        onClick={() => setClienteId('todos')}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                                            clienteId === 'todos'
                                                ? 'bg-indigo-100 text-indigo-700 font-semibold'
                                                : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        👥 Todos los clientes
                                    </button>

                                    {clientesFiltrados.length === 0 && busqueda && (
                                        <p className="text-xs text-gray-400 px-3 py-2">Sin resultados</p>
                                    )}

                                    {clientesFiltrados.map((c) => (
                                        <button
                                            key={c.id}
                                            id={`cliente-${c.id}`}
                                            onClick={() => setClienteId(String(c.id))}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                                                clienteId === String(c.id)
                                                    ? 'bg-indigo-100 text-indigo-700 font-semibold'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            <span className="font-medium">{c.name}</span>
                                            <span className="block text-xs text-gray-400">{c.email}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filtro de periodo */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <FunnelIcon className="w-4 h-4 text-indigo-500" />
                                    Periodo
                                </h3>

                                {/* Tabs de periodo */}
                                <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-xl mb-4">
                                    {['dia', 'semana', 'mes', 'anio'].map((p) => (
                                        <button
                                            key={p}
                                            id={`periodo-${p}`}
                                            onClick={() => setPeriodo(p)}
                                            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                                periodo === p
                                                    ? 'bg-white text-indigo-700 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            {{ dia: 'Día', semana: 'Sem.', mes: 'Mes', anio: 'Año' }[p]}
                                        </button>
                                    ))}
                                </div>

                                {/* Selector dinámico */}
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                                        <CalendarDaysIcon className="w-3.5 h-3.5" />
                                        {periodo === 'dia'    && 'Selecciona una fecha'}
                                        {periodo === 'semana' && 'Selecciona la semana'}
                                        {periodo === 'mes'    && 'Selecciona el mes'}
                                        {periodo === 'anio'   && 'Selecciona el año'}
                                    </label>

                                    {periodo === 'dia' && (
                                        <input
                                            id="picker-dia"
                                            type="date"
                                            value={fecha}
                                            onChange={(e) => setFecha(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                                        />
                                    )}

                                    {periodo === 'semana' && (
                                        <input
                                            id="picker-semana"
                                            type="week"
                                            value={semana}
                                            onChange={(e) => setSemana(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                                        />
                                    )}

                                    {periodo === 'mes' && (
                                        <input
                                            id="picker-mes"
                                            type="month"
                                            value={mes}
                                            onChange={(e) => setMes(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                                        />
                                    )}

                                    {periodo === 'anio' && (
                                        <select
                                            id="picker-anio"
                                            value={anio}
                                            onChange={(e) => setAnio(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                                        >
                                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <button
                                    id="btn-generar"
                                    onClick={generar}
                                    disabled={cargando}
                                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {cargando ? (
                                        <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Cargando...</>
                                    ) : (
                                        <><DocumentChartBarIcon className="w-4 h-4" /> Generar Reporte</>
                                    )}
                                </button>
                            </div>
                        </aside>

                        {/* ────── PANEL DERECHO: Resultados ────── */}
                        <div className="flex-1 space-y-5">

                            {/* Estado inicial */}
                            {!ventas && !cargando && !error && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                                        <DocumentChartBarIcon className="w-10 h-10 text-indigo-300" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Sin reporte generado</h3>
                                    <p className="text-sm text-gray-400">
                                        Selecciona un cliente y periodo, luego presiona <span className="font-semibold text-indigo-600">Generar Reporte</span>.
                                    </p>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Resultados */}
                            {ventas && resumen && (
                                <>
                                    {/* Cabecera con botón PDF */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{clienteNombre}</h3>
                                            <p className="text-sm text-gray-500">
                                                {periodoObj?.inicio} — {periodoObj?.fin}
                                                &nbsp;·&nbsp;
                                                <span className="text-indigo-600 font-medium">{resumen.num_ventas} venta(s)</span>
                                            </p>
                                        </div>

                                        <button
                                            id="btn-pdf"
                                            onClick={descargarPDF}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                                        >
                                            <DocumentArrowDownIcon className="w-5 h-5" />
                                            Descargar PDF
                                        </button>
                                    </div>

                                    {/* Tarjetas de resumen */}
                                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Copias',      val: resumen.total_copias,      color: 'blue',   icon: DocumentDuplicateIcon },
                                            { label: 'Impresiones', val: resumen.total_impresiones, color: 'purple', icon: PrinterIcon },
                                            { label: 'Artículos',   val: resumen.total_articulos,   color: 'green',  icon: ShoppingBagIcon },
                                            { label: 'TOTAL',       val: resumen.gran_total,        color: 'indigo', icon: DocumentChartBarIcon },
                                        ].map(({ label, val, color, icon: Icon }) => (
                                            <div
                                                key={label}
                                                className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4`}
                                            >
                                                <div className={`w-11 h-11 rounded-xl bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                                                    <Icon className={`w-6 h-6 text-${color}-600`} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                                                    <p className={`text-lg font-bold text-${color}-700`}>{fmt(val)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Sin ventas */}
                                    {ventas.length === 0 && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                            <p className="text-gray-400 text-sm">No hay ventas en este periodo.</p>
                                        </div>
                                    )}

                                    {/* Tabla de ventas agrupadas por tipo */}
                                    {['copia', 'impresion', 'articulo'].map((tipo) => {
                                        const { label, color, icon: Icon } = TIPOS[tipo];
                                        const detalles = ventas.flatMap((v) =>
                                            v.detalles
                                                .filter((d) => d.tipo === tipo)
                                                .map((d) => ({ ...d, folio: v.folio, fecha: v.fecha, cliente: v.cliente }))
                                        );
                                        if (!detalles.length) return null;

                                        const subtotal = detalles.reduce((s, d) => s + d.subtotal, 0);

                                        return (
                                            <div key={tipo} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                                {/* Header de sección */}
                                                <div className={`px-5 py-3 bg-${color}-50 border-b border-${color}-100 flex items-center gap-2`}>
                                                    <Icon className={`w-5 h-5 text-${color}-600`} />
                                                    <span className={`font-semibold text-${color}-700 text-sm`}>{label}</span>
                                                    <span className="ml-auto text-sm font-bold text-gray-700">{fmt(subtotal)}</span>
                                                </div>

                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full text-sm">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                {['Folio', 'Fecha', 'Cliente', 'Descripción', 'Cant.', 'P. Unit.', 'Subtotal'].map((h) => (
                                                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                                                        {h}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50">
                                                            {detalles.map((d, i) => (
                                                                <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                                                                    <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{d.folio ?? '—'}</td>
                                                                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{d.fecha}</td>
                                                                    <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">{d.cliente}</td>
                                                                    <td className="px-4 py-3 text-gray-700">{d.descripcion}</td>
                                                                    <td className="px-4 py-3 text-right text-gray-700">{d.cantidad}</td>
                                                                    <td className="px-4 py-3 text-right text-gray-700">{fmt(d.precio_unitario)}</td>
                                                                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(d.subtotal)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot className={`bg-${color}-50`}>
                                                            <tr>
                                                                <td colSpan={6} className={`px-4 py-2 text-right text-xs font-bold text-${color}-700 uppercase`}>Subtotal {label}</td>
                                                                <td className={`px-4 py-2 text-right text-sm font-bold text-${color}-700`}>{fmt(subtotal)}</td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Helper: número de semana ISO
function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}
