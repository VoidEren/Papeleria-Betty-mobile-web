import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    BellAlertIcon,
    DocumentArrowDownIcon,
    MapPinIcon,
    PhoneIcon,
    PrinterIcon,
    ShoppingCartIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard({ trabajosPendientes = [], ventasPendientes = [] }) {
    // Combinar notificaciones para un timeline
    const notificaciones = [
        ...trabajosPendientes.map(t => ({
            id: `t-${t.id}`,
            tipo: 'impresion',
            titulo: 'Petición de impresión',
            descripcion: `El cliente ${t.cliente} ha solicitado ${t.hojas * t.copias} hojas.`,
            fecha: t.fecha,
            icono: PrinterIcon,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
        })),
        ...ventasPendientes.map(v => ({
            id: `v-${v.id}`,
            tipo: 'venta',
            titulo: 'Nuevo pedido pendiente',
            descripcion: `El cliente ${v.cliente} tiene un pedido por $${v.total.toFixed(2)}.`,
            fecha: v.fecha,
            icono: ShoppingCartIcon,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
        }))
    ].sort((a, b) => {
        // Simple sort por id si fecha falla, idealmente parsear la fecha real
        return b.id.localeCompare(a.id);
    });

    const documentos = trabajosPendientes.filter(t => t.archivo_url);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Resumen Superior */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                <PrinterIcon className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div>
                                <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Impresiones Pendientes</div>
                                <div className="text-3xl font-black text-gray-900">{trabajosPendientes.length}</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                <ShoppingCartIcon className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Pedidos Pendientes</div>
                                <div className="text-3xl font-black text-gray-900">{ventasPendientes.length}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Columna Izquierda (Notificaciones y Actividad) */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Bandeja de Documentos */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 flex items-center gap-3">
                                    <DocumentArrowDownIcon className="w-6 h-6 text-white" />
                                    <h3 className="text-lg font-bold text-white">Bandeja de Documentos</h3>
                                    <span className="ml-auto bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                        {documentos.length} recibidos
                                    </span>
                                </div>
                                <div className="p-0">
                                    {documentos.length > 0 ? (
                                        <div className="divide-y divide-gray-50">
                                            {documentos.map(doc => (
                                                <div key={doc.id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between group">
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-gray-900 truncate">{doc.cliente}</span>
                                                            <span className="text-xs text-gray-400">{doc.fecha}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 truncate">{doc.archivo_nombre}</div>
                                                        <div className="text-xs text-indigo-500 font-medium mt-0.5 capitalize">
                                                            {doc.tipo_contenido.replace('_', ' ')} · {doc.hojas * doc.copias} hojas
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={doc.archivo_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm hover:bg-indigo-600 hover:text-white transition-colors"
                                                    >
                                                        <ArrowDownTrayIcon className="w-4 h-4" />
                                                        Descargar
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-gray-400">
                                            <DocumentArrowDownIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="text-sm font-medium">No hay documentos pendientes por descargar.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notificaciones / Actividad Reciente */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <BellAlertIcon className="w-6 h-6 text-gray-800" />
                                    <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
                                </div>

                                {notificaciones.length > 0 ? (
                                    <div className="space-y-4">
                                        {notificaciones.slice(0, 10).map((notif) => {
                                            const Icon = notif.icono;
                                            return (
                                                <div key={notif.id} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.bg}`}>
                                                        <Icon className={`w-5 h-5 ${notif.color}`} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="font-semibold text-gray-900">{notif.titulo}</span>
                                                            <span className="text-xs text-gray-400">• {notif.fecha}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600">{notif.descripcion}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-400 text-sm">
                                        No hay actividad reciente.
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Columna Derecha (Info de la Papelería) */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-b border-gray-100 text-center">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3">
                                        <MapPinIcon className="w-8 h-8 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Información de la Sucursal</h3>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Contacto */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                            <PhoneIcon className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Atención a Clientes</div>
                                            <a href="tel:+525512345678" className="text-lg font-bold text-gray-800 hover:text-indigo-600 transition">
                                                +52 55 1234 5678
                                            </a>
                                        </div>
                                    </div>

                                    <hr className="border-gray-100" />

                                    {/* Mapa Placeholder */}
                                    <div>
                                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <MapPinIcon className="w-4 h-4" /> Ubicación
                                        </div>
                                        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm h-48 bg-gray-100">
                                            {/* Iframe genérico de Google Maps apuntando a la CDMX como ejemplo */}
                                            <iframe
                                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120401.44686411516!2d-99.21327140889045!3d19.43194098971761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce0026db097507%3A0x54061076265ee841!2sCiudad%20de%20M%C3%A9xico%2C%20CDMX!5e0!3m2!1ses-419!2smx!4v1718320000000!5m2!1ses-419!2smx"
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen=""
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            ></iframe>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                            Av. Principal #123, Ciudad de México, CDMX
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
