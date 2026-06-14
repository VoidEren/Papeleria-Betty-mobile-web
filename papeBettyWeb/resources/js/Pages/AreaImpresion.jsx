import { useState, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    PrinterIcon,
    PlusCircleIcon,
    DocumentArrowUpIcon,
    PhotoIcon,
    DocumentTextIcon,
    SparklesIcon,
    CreditCardIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ArrowPathIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    EyeIcon,
    XMarkIcon,
    BoltIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_CFG = {
    pendiente:   { label: 'Pendiente',   color: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-400' },
    en_proceso:  { label: 'En proceso',  color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-400' },
    completado:  { label: 'Completado',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
    cancelado:   { label: 'Cancelado',   color: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-400' },
};

const TIPO_CFG = {
    documento:           { label: 'Documento',          icon: DocumentTextIcon, color: 'text-blue-600',   recargo: 0 },
    documento_imagenes:  { label: 'Doc. con Imágenes',  icon: PhotoIcon,        color: 'text-violet-600', recargo: 0.5 },
    imagen_completa:     { label: 'Imagen Completa',    icon: PhotoIcon,        color: 'text-rose-600',   recargo: 1.0 },
};

/**
 * Analiza una imagen con canvas y devuelve el % de cobertura de tinta (píxeles oscuros).
 */
function analyzeImageCoverage(file) {
    return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) {
            resolve(null);
            return;
        }
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const W = Math.min(img.naturalWidth, 400);
            const H = Math.min(img.naturalHeight, 400);
            canvas.width  = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, W, H);
            const { data } = ctx.getImageData(0, 0, W, H);
            let inkPixels = 0;
            const total   = W * H;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
                if (a < 10) continue; // transparent
                // Luminancia: píxeles oscuros/coloreados = tinta
                const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                if (lum < 0.85) inkPixels++;
            }
            URL.revokeObjectURL(url);
            resolve(Math.round((inkPixels / total) * 100));
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
        img.src = url;
    });
}

function StatusBadge({ estado }) {
    const cfg = ESTADO_CFG[estado] ?? ESTADO_CFG.pendiente;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

// ─── Modal Pagar trabajo ──────────────────────────────────────────────────────

function ModalPago({ trabajo, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        metodo:          'tarjeta_debito',
        ultimos_cuatro:  '',
        banco:           '',
        referencia:      '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('trabajos.pagar', trabajo.id), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <CreditCardIcon className="w-6 h-6 text-indigo-600" />
                        <h3 className="text-lg font-bold text-gray-900">Registrar Pago</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-indigo-50 rounded-xl text-sm">
                    <div className="text-gray-500">Cliente: <span className="font-semibold text-gray-900">{trabajo.cliente}</span></div>
                    <div className="text-gray-500 mt-0.5">Total a cobrar: <span className="font-black text-emerald-600 text-lg">${Number(trabajo.total).toFixed(2)}</span></div>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Método */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Método de pago</label>
                        <select
                            value={data.metodo}
                            onChange={e => setData('metodo', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                        >
                            <option value="tarjeta_debito">Tarjeta Débito</option>
                            <option value="tarjeta_credito">Tarjeta Crédito</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>

                    {/* Tarjeta */}
                    {(data.metodo === 'tarjeta_debito' || data.metodo === 'tarjeta_credito') && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Últimos 4 dígitos <span className="font-normal text-gray-400">(se mostrarán como **** **** **** XXXX)</span>
                                </label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    placeholder="1234"
                                    value={data.ultimos_cuatro}
                                    onChange={e => setData('ultimos_cuatro', e.target.value.replace(/\D/g, ''))}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                                />
                                {errors.ultimos_cuatro && <p className="text-red-500 text-xs mt-1">{errors.ultimos_cuatro}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Banco (opcional)</label>
                                <input
                                    type="text"
                                    placeholder="BBVA, Banamex, HSBC..."
                                    value={data.banco}
                                    onChange={e => setData('banco', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                                />
                            </div>
                        </>
                    )}

                    {/* Transferencia */}
                    {data.metodo === 'transferencia' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Referencia de transferencia</label>
                            <input
                                type="text"
                                placeholder="Número de referencia"
                                value={data.referencia}
                                onChange={e => setData('referencia', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                            />
                        </div>
                    )}

                    {errors.error && (
                        <p className="text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2">{errors.error}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-60 transition"
                        >
                            {processing ? 'Procesando…' : 'Confirmar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Trabajo Card ─────────────────────────────────────────────────────────────

function TrabajoCard({ trabajo, impresoras }) {
    const [expanded, setExpanded] = useState(false);
    const [showPago, setShowPago] = useState(false);
    const tipoCfg = TIPO_CFG[trabajo.tipo_contenido] ?? TIPO_CFG.documento;
    const TipoIcon = tipoCfg.icon;

    const handleEstado = (estado) => {
        router.patch(route('trabajos.estado', trabajo.id), { estado }, { preserveScroll: true });
    };

    return (
        <>
            {showPago && <ModalPago trabajo={trabajo} onClose={() => setShowPago(false)} />}

            <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden
                ${!trabajo.pagado ? 'border-amber-200' : 'border-gray-100'}`}>

                {/* Alerta si no está pagado */}
                {!trabajo.pagado && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100">
                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-amber-700">Pendiente de pago — No se puede procesar</span>
                        <button
                            onClick={() => setShowPago(true)}
                            className="ml-auto flex items-center gap-1 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-2.5 py-1 rounded-lg transition"
                        >
                            <CreditCardIcon className="w-3.5 h-3.5" /> Cobrar
                        </button>
                    </div>
                )}

                {trabajo.pagado && (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border-b border-emerald-100">
                        <CheckCircleSolid className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-700">
                            Pagado el {trabajo.pagado_at}
                        </span>
                    </div>
                )}

                <div className="p-4">
                    <div className="flex items-start gap-3">
                        {/* Impresora icon */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow">
                            <PrinterIcon className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900 truncate">{trabajo.cliente}</span>
                                <StatusBadge estado={trabajo.estado} />
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                                <span className={`flex items-center gap-1 ${tipoCfg.color}`}>
                                    <TipoIcon className="w-3.5 h-3.5" />
                                    {tipoCfg.label}
                                </span>
                                <span>·</span>
                                <span>{trabajo.impresora}</span>
                                <span>·</span>
                                <span className={`font-semibold ${trabajo.modo_color === 'color' ? 'text-rose-500' : 'text-gray-600'}`}>
                                    {trabajo.modo_color === 'color' ? 'Color' : 'B/N'}
                                </span>
                            </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                            <div className="text-xl font-extrabold text-emerald-600">
                                ${Number(trabajo.total).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400">{trabajo.fecha}</div>
                        </div>
                    </div>

                    {/* Detalles básicos */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                            <div className="text-gray-400">Hojas</div>
                            <div className="font-bold text-gray-800">{trabajo.hojas}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                            <div className="text-gray-400">Copias</div>
                            <div className="font-bold text-gray-800">{trabajo.copias}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                            <div className="text-gray-400">Cobertura</div>
                            <div className="font-bold text-gray-800">{trabajo.cobertura_real ?? trabajo.cobertura_porcentaje}%</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-50 px-4 py-2 flex items-center gap-2">
                    {/* Archivo */}
                    {trabajo.archivo_url && (
                        <a
                            href={trabajo.archivo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
                        >
                            <EyeIcon className="w-3.5 h-3.5" /> Ver archivo
                        </a>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                        {/* Cambiar estado (solo si pagado) */}
                        {trabajo.pagado && trabajo.estado === 'en_proceso' && (
                            <button
                                onClick={() => handleEstado('completado')}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition"
                            >
                                Marcar Completado
                            </button>
                        )}
                        {trabajo.estado !== 'cancelado' && trabajo.estado !== 'completado' && (
                            <button
                                onClick={() => handleEstado('cancelado')}
                                className="text-xs font-medium text-red-500 hover:text-red-700 transition"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Formulario Nuevo Trabajo ─────────────────────────────────────────────────

function NuevoTrabajoForm({ impresoras, clientes, onClose }) {
    const fileRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [coberturaDetectada, setCoberturaDetectada] = useState(null);
    const [precioPreview, setPrecioPreview] = useState(null);
    const [calculando, setCalculando] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        impresora_id:          '',
        user_id:               '',
        cliente_nombre:        '',
        hojas:                 1,
        copias:                1,
        modo_color:            'negro',
        cobertura_porcentaje:  30,
        tipo_contenido:        'documento',
        cobertura_real:        '',
        recargo_imagen:        0,
        notas:                 '',
        archivo:               null,
    });

    // Calcular precio en tiempo real
    const calcularPrecio = useCallback(async (overrideData = {}) => {
        const d = { ...data, ...overrideData };
        if (!d.impresora_id || !d.hojas || !d.copias) return;
        setCalculando(true);
        try {
            const resp = await fetch(route('trabajos.calcular'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    impresora_id:          d.impresora_id,
                    hojas:                 Number(d.hojas),
                    copias:                Number(d.copias),
                    modo_color:            d.modo_color,
                    cobertura_porcentaje:  Number(d.cobertura_porcentaje),
                }),
            });
            if (resp.ok) {
                const json = await resp.json();
                // Calcular recargo de imagen
                const tipoCfg = TIPO_CFG[d.tipo_contenido] ?? TIPO_CFG.documento;
                const cobReal = coberturaDetectada ?? Number(d.cobertura_porcentaje);
                const factor  = tipoCfg.recargo; // 0, 0.5 o 1.0
                const recargo = factor > 0
                    ? round4(json.precio_tinta_unit * factor * (cobReal / 100))
                    : 0;
                const totalConRecargo = round2((json.precio_por_hoja + recargo) * Number(d.hojas) * Number(d.copias));
                setPrecioPreview({ ...json, recargo_unit: recargo, total_final: totalConRecargo });
            }
        } catch (_) {}
        setCalculando(false);
    }, [data, coberturaDetectada]);

    const round2 = v => Math.round(v * 100) / 100;
    const round4 = v => Math.round(v * 10000) / 10000;

    // Manejo de archivo
    const handleFile = async (file) => {
        if (!file) return;
        setData('archivo', file);

        // Preview
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreview(url);

            // Escáner de tinta
            setScanning(true);
            const cob = await analyzeImageCoverage(file);
            setScanning(false);
            if (cob !== null) {
                setCoberturaDetectada(cob);
                setData(prev => ({ ...prev, cobertura_porcentaje: cob, cobertura_real: cob }));
            }
        } else {
            setPreview(null);
            setCoberturaDetectada(null);
        }
    };

    const handleChange = (field, value) => {
        setData(field, value);
        calcularPrecio({ [field]: value });
    };

    // Calcular recargo para submit
    const getRecargo = () => {
        if (!precioPreview) return 0;
        return precioPreview.recargo_unit ?? 0;
    };

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => {
            if (v !== null && v !== '') formData.append(k, v);
        });
        formData.set('recargo_imagen', getRecargo());
        if (coberturaDetectada !== null) formData.set('cobertura_real', coberturaDetectada);

        router.post(route('trabajos.store'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };

    const tipoCfg = TIPO_CFG[data.tipo_contenido];
    const TipoIcon = tipoCfg.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-black/40 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 mb-10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <PrinterIcon className="w-6 h-6 text-indigo-600" />
                        <h3 className="text-lg font-bold text-gray-900">Nuevo Trabajo de Impresión</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Impresora */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Impresora *</label>
                            <select
                                value={data.impresora_id}
                                onChange={e => handleChange('impresora_id', e.target.value)}
                                required
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                            >
                                <option value="">Seleccionar...</option>
                                {impresoras.filter(i => i.activa).map(i => (
                                    <option key={i.id} value={i.id}>
                                        {i.nombre} ({i.tipo}) {i.tiene_color ? '🎨' : '⬛'}
                                    </option>
                                ))}
                            </select>
                            {errors.impresora_id && <p className="text-red-500 text-xs mt-1">{errors.impresora_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente</label>
                            <select
                                value={data.user_id}
                                onChange={e => handleChange('user_id', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                            >
                                <option value="">Sin cuenta (nombre libre)</option>
                                {clientes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                                ))}
                            </select>
                        </div>

                        {!data.user_id && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del cliente</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Juan Pérez"
                                    value={data.cliente_nombre}
                                    onChange={e => setData('cliente_nombre', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                                />
                            </div>
                        )}
                    </div>

                    {/* Archivo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Documento o imagen a imprimir
                        </label>
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed border-indigo-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-indigo-50 transition group"
                        >
                            {preview ? (
                                <img src={preview} alt="preview" className="max-h-32 rounded-lg object-contain shadow" />
                            ) : (
                                <DocumentArrowUpIcon className="w-10 h-10 text-indigo-300 group-hover:text-indigo-500 transition" />
                            )}
                            <div className="text-sm text-gray-500 text-center">
                                {data.archivo
                                    ? <span className="font-semibold text-indigo-600">{data.archivo.name}</span>
                                    : <>Haz clic para subir <span className="text-indigo-600 font-semibold">PDF, imagen o documento</span></>
                                }
                            </div>
                            <div className="text-xs text-gray-400">PDF, JPG, PNG, GIF, DOC, DOCX — Máx. 20MB</div>
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                            onChange={e => handleFile(e.target.files[0])}
                        />

                        {/* Escáner de tinta */}
                        {scanning && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-indigo-600">
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                Analizando cobertura de tinta...
                            </div>
                        )}
                        {coberturaDetectada !== null && !scanning && (
                            <div className="mt-2 flex items-center gap-2 text-sm bg-violet-50 border border-violet-200 rounded-xl px-3 py-2">
                                <BoltIcon className="w-4 h-4 text-violet-500" />
                                <span className="text-violet-700 font-semibold">
                                    Escáner de tinta: {coberturaDetectada}% de cobertura detectada
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Tipo de contenido */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de contenido *</label>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.entries(TIPO_CFG).map(([key, cfg]) => {
                                const Icon = cfg.icon;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleChange('tipo_contenido', key)}
                                        className={`rounded-xl border-2 p-3 flex flex-col items-center gap-1.5 text-center transition-all
                                            ${data.tipo_contenido === key
                                                ? 'border-indigo-400 bg-indigo-50'
                                                : 'border-gray-200 hover:border-indigo-200 bg-white'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 ${cfg.color}`} />
                                        <span className="text-xs font-semibold text-gray-700">{cfg.label}</span>
                                        {cfg.recargo > 0 && (
                                            <span className="text-xs text-rose-500 font-medium">
                                                +{cfg.recargo * 100}% tinta
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Parámetros */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Hojas *</label>
                            <input
                                type="number" min={1} max={9999}
                                value={data.hojas}
                                onChange={e => handleChange('hojas', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Copias *</label>
                            <input
                                type="number" min={1} max={999}
                                value={data.copias}
                                onChange={e => handleChange('copias', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Modo</label>
                            <select
                                value={data.modo_color}
                                onChange={e => handleChange('modo_color', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                            >
                                <option value="negro">B/N</option>
                                <option value="color">Color</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Cobertura %
                                {coberturaDetectada !== null && (
                                    <span className="ml-1 text-violet-500 text-xs">(auto)</span>
                                )}
                            </label>
                            <input
                                type="number" min={1} max={100}
                                value={data.cobertura_porcentaje}
                                onChange={e => { setCoberturaDetectada(null); handleChange('cobertura_porcentaje', e.target.value); }}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Notas */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Notas (opcional)</label>
                        <textarea
                            rows={2}
                            value={data.notas}
                            onChange={e => setData('notas', e.target.value)}
                            placeholder="Instrucciones especiales, papel especial, etc."
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50 resize-none"
                        />
                    </div>

                    {/* Preview de precio */}
                    {precioPreview && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2 text-sm">
                            <div className="font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                                <SparklesIcon className="w-4 h-4 text-emerald-500" />
                                Desglose de costo estimado
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                                <span>Papel por hoja:</span>
                                <span className="font-semibold text-right">${Number(precioPreview.precio_hoja_unit).toFixed(4)}</span>
                                <span>Tinta por hoja:</span>
                                <span className="font-semibold text-right">${Number(precioPreview.precio_tinta_unit).toFixed(4)}</span>
                                {precioPreview.recargo_unit > 0 && (
                                    <>
                                        <span className="text-rose-600">Recargo imagen:</span>
                                        <span className="font-semibold text-right text-rose-600">+${Number(precioPreview.recargo_unit).toFixed(4)}</span>
                                    </>
                                )}
                                <span>Total hojas:</span>
                                <span className="font-semibold text-right">{Number(data.hojas) * Number(data.copias)}</span>
                            </div>
                            <div className="border-t border-emerald-200 pt-2 flex justify-between font-black text-lg text-emerald-700">
                                <span>Total a cobrar</span>
                                <span>${Number(precioPreview.total_final ?? precioPreview.total).toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                El pago debe realizarse antes de procesar la impresión.
                            </p>
                        </div>
                    )}

                    {calculando && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            Calculando precio...
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-60 transition flex items-center justify-center gap-2">
                            <PrinterIcon className="w-4 h-4" />
                            {processing ? 'Guardando…' : 'Registrar Trabajo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Panel Impresoras ─────────────────────────────────────────────────────────

function ImpresoraCard({ imp, onEdit, onDelete }) {
    return (
        <div className={`rounded-xl border p-4 flex flex-col gap-3 transition-all ${imp.activa ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${imp.activa ? 'bg-gradient-to-br from-slate-600 to-slate-800' : 'bg-gray-300'}`}>
                    <PrinterIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{imp.nombre}</div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                        <span className="capitalize">{imp.tipo}</span>
                        <span>·</span>
                        <span className={imp.tiene_color ? 'text-rose-500 font-semibold' : ''}>{imp.tiene_color ? 'Color' : 'Solo B/N'}</span>
                        <span>·</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${imp.activa ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {imp.activa ? 'Activa' : 'Inactiva'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-400">Papel/hoja</div>
                    <div className="font-bold text-gray-800">${Number(imp.precio_hoja).toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-400">Tinta B/N</div>
                    <div className="font-bold text-gray-800">${Number(imp.precio_tinta_negro_base).toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-400">Tinta Color</div>
                    <div className={`font-bold ${imp.tiene_color ? 'text-gray-800' : 'text-gray-300'}`}>
                        {imp.tiene_color ? `$${Number(imp.precio_tinta_color_base).toFixed(2)}` : 'N/A'}
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => onEdit(imp)}
                    className="flex-1 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                    Editar
                </button>
                <button onClick={() => onDelete(imp)}
                    className="py-1.5 px-3 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition">
                    Eliminar
                </button>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AreaImpresion({ impresoras = [], trabajos = [], clientes = [] }) {
    const [showNuevoTrabajo, setShowNuevoTrabajo] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [showImpresoras, setShowImpresoras] = useState(false);
    const [showFormImpresora, setShowFormImpresora] = useState(false);
    const [editImp, setEditImp] = useState(null);
    const [scannedPrinters, setScannedPrinters] = useState([]);
    const [isScanning, setIsScanning] = useState(false);

    const { data: impData, setData: setImpData, post: postImp, processing: procImp, errors: errImp, reset: resetImp } = useForm({
        nombre: '', tipo: 'laser', tiene_color: false,
        precio_hoja: '', precio_tinta_negro_base: '', precio_tinta_color_base: '',
        activa: true, descripcion: '',
    });

    const scanPrinters = async () => {
        setIsScanning(true);
        try {
            const resp = await fetch(route('impresoras.scan'));
            if (resp.ok) {
                const data = await resp.json();
                setScannedPrinters(data || []);
            }
        } catch (e) {
            console.error('Error escaneando impresoras', e);
        }
        setIsScanning(false);
    };

    const submitImpresora = (e) => {
        e.preventDefault();
        const ruta = editImp ? route('impresoras.update', editImp.id) : route('impresoras.store');
        postImp(ruta, {
            preserveScroll: true,
            onSuccess: () => { resetImp(); setShowFormImpresora(false); setEditImp(null); },
        });
    };

    const handleEditImp = (imp) => {
        setEditImp(imp);
        setImpData({ nombre: imp.nombre, tipo: imp.tipo, tiene_color: imp.tiene_color, precio_hoja: imp.precio_hoja,
            precio_tinta_negro_base: imp.precio_tinta_negro_base, precio_tinta_color_base: imp.precio_tinta_color_base ?? '',
            activa: imp.activa, descripcion: imp.descripcion ?? '' });
        setShowFormImpresora(true);
    };

    const handleDeleteImp = (imp) => {
        if (confirm(`¿Eliminar la impresora "${imp.nombre}"? Solo es posible si no tiene trabajos.`)) {
            router.delete(route('impresoras.destroy', imp.id), { preserveScroll: true });
        }
    };

    const trabajosFiltrados = filtroEstado === 'todos' ? trabajos : trabajos.filter(t => t.estado === filtroEstado);

    const stats = {
        pendientes:  trabajos.filter(t => t.estado === 'pendiente').length,
        en_proceso:  trabajos.filter(t => t.estado === 'en_proceso').length,
        completados: trabajos.filter(t => t.estado === 'completado').length,
        sinPagar:    trabajos.filter(t => !t.pagado).length,
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-indigo-600">
                    Área de Impresión
                </h2>
            }
        >
            <Head title="Área de Impresión" />

            {showNuevoTrabajo && (
                <NuevoTrabajoForm
                    impresoras={impresoras}
                    clientes={clientes}
                    onClose={() => setShowNuevoTrabajo(false)}
                />
            )}

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Sin pagar',   val: stats.sinPagar,    color: 'text-amber-600', border: 'border-amber-100' },
                            { label: 'Pendientes',  val: stats.pendientes,  color: 'text-blue-600',  border: 'border-blue-100' },
                            { label: 'En proceso',  val: stats.en_proceso,  color: 'text-violet-600',border: 'border-violet-100' },
                            { label: 'Completados', val: stats.completados, color: 'text-emerald-600',border: 'border-emerald-100' },
                        ].map(s => (
                            <div key={s.label} className={`bg-white rounded-2xl border ${s.border} shadow-sm p-4`}>
                                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{s.label}</div>
                                <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
                            </div>
                        ))}
                    </div>

                    {/* Panel impresoras (colapsable) */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setShowImpresoras(!showImpresoras)}
                            className="w-full px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition"
                        >
                            <PrinterIcon className="w-5 h-5 text-indigo-600" />
                            <span className="font-bold text-gray-800">
                                Impresoras Registradas <span className="text-gray-400 font-normal ml-1">({impresoras.length})</span>
                            </span>
                            {showImpresoras ? <ChevronUpIcon className="w-4 h-4 text-gray-400 ml-auto" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400 ml-auto" />}
                        </button>

                        {showImpresoras && (
                            <div className="border-t border-gray-100 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                    {impresoras.map(imp => (
                                        <ImpresoraCard key={imp.id} imp={imp} onEdit={handleEditImp} onDelete={handleDeleteImp} />
                                    ))}
                                    {impresoras.length === 0 && (
                                        <div className="col-span-3 text-center py-8 text-gray-400 text-sm">
                                            No hay impresoras registradas.
                                        </div>
                                    )}
                                </div>

                                {/* Form impresora */}
                                {showFormImpresora ? (
                                    <div className="border-t border-gray-100 pt-4">
                                        <h4 className="font-bold text-gray-800 mb-4">
                                            {editImp ? 'Editar impresora' : 'Agregar nueva impresora'}
                                        </h4>
                                        <form onSubmit={submitImpresora} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                                                <div className="flex gap-2">
                                                    <input type="text" value={impData.nombre} onChange={e => setImpData('nombre', e.target.value)}
                                                        className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50" required placeholder="Ej: EPSON L3150" />
                                                    {!editImp && (
                                                        <button type="button" onClick={scanPrinters} disabled={isScanning}
                                                            className="px-3 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl text-sm font-medium hover:bg-indigo-100 transition disabled:opacity-50">
                                                            {isScanning ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <MagnifyingGlassIcon className="w-5 h-5" title="Escanear locales" />}
                                                        </button>
                                                    )}
                                                </div>
                                                {scannedPrinters.length > 0 && !editImp && (
                                                    <div className="mt-2 p-2 border border-indigo-100 bg-indigo-50 rounded-lg max-h-32 overflow-y-auto">
                                                        <div className="text-xs font-semibold text-indigo-800 mb-1">Impresoras detectadas:</div>
                                                        {scannedPrinters.map(p => (
                                                            <div key={p} onClick={() => { setImpData('nombre', p); setScannedPrinters([]); }}
                                                                className="text-sm px-2 py-1 hover:bg-indigo-100 cursor-pointer rounded transition">
                                                                {p}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {errImp.nombre && <p className="text-red-500 text-xs mt-1">{errImp.nombre}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo *</label>
                                                <select value={impData.tipo} onChange={e => setImpData('tipo', e.target.value)}
                                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50">
                                                    <option value="laser">Láser</option>
                                                    <option value="inyeccion">Inyección de tinta</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Precio papel/hoja (MXN) *</label>
                                                <input type="number" step="0.0001" min="0.01" value={impData.precio_hoja}
                                                    onChange={e => setImpData('precio_hoja', e.target.value)}
                                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50" required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tinta B/N base 100% (MXN) *</label>
                                                <input type="number" step="0.0001" min="0.01" value={impData.precio_tinta_negro_base}
                                                    onChange={e => setImpData('precio_tinta_negro_base', e.target.value)}
                                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50" required />
                                            </div>
                                            <div className="flex items-center gap-3 md:col-span-2">
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input type="checkbox" checked={impData.tiene_color} onChange={e => setImpData('tiene_color', e.target.checked)}
                                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-400" />
                                                    <span className="text-sm font-semibold text-gray-700">Imprime en color</span>
                                                </label>
                                            </div>
                                            {impData.tiene_color && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tinta color base 100% (MXN)</label>
                                                    <input type="number" step="0.0001" min="0.01" value={impData.precio_tinta_color_base}
                                                        onChange={e => setImpData('precio_tinta_color_base', e.target.value)}
                                                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50" />
                                                </div>
                                            )}
                                            {editImp && (
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                                        <input type="checkbox" checked={impData.activa} onChange={e => setImpData('activa', e.target.checked)}
                                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-400" />
                                                        <span className="text-sm font-semibold text-gray-700">Activa</span>
                                                    </label>
                                                </div>
                                            )}
                                            <div className="flex gap-3 md:col-span-2">
                                                <button type="button" onClick={() => { setShowFormImpresora(false); setEditImp(null); resetImp(); }}
                                                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                                                    Cancelar
                                                </button>
                                                <button type="submit" disabled={procImp}
                                                    className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-60 transition">
                                                    {procImp ? 'Guardando…' : editImp ? 'Actualizar' : 'Guardar Impresora'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { setEditImp(null); resetImp(); setShowFormImpresora(true); }}
                                        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
                                    >
                                        <PlusCircleIcon className="w-5 h-5" /> Agregar impresora
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Lista de trabajos */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 flex-wrap">
                            <h3 className="font-bold text-gray-800">Trabajos de Impresión</h3>
                            <div className="flex gap-2 ml-auto flex-wrap">
                                {['todos', 'pendiente', 'en_proceso', 'completado'].map(e => (
                                    <button key={e} onClick={() => setFiltroEstado(e)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize
                                            ${filtroEstado === e ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                        {e === 'todos' ? 'Todos' : e.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6">
                            {trabajosFiltrados.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {trabajosFiltrados.map(t => (
                                        <TrabajoCard key={t.id} trabajo={t} impresoras={impresoras} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <PrinterIcon className="mx-auto w-12 h-12 text-gray-200 mb-3" />
                                    <h3 className="text-sm font-semibold text-gray-600">Sin trabajos</h3>
                                    <p className="text-xs text-gray-400 mt-1">No hay trabajos de impresión en este estado.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* FAB */}
            <button
                onClick={() => setShowNuevoTrabajo(true)}
                className="fixed bottom-10 right-10 bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] hover:bg-indigo-700 hover:scale-105 transition-all outline-none focus:ring-4 focus:ring-indigo-300 z-40 group"
                title="Nuevo trabajo de impresión"
            >
                <PlusCircleIcon className="h-8 w-8 group-hover:rotate-90 transition-transform duration-300" />
            </button>
        </AuthenticatedLayout>
    );
}
