import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

import {
    HomeIcon,
    CubeIcon,
    ClipboardDocumentListIcon,
    PrinterIcon,
    CreditCardIcon,
    UserCircleIcon,
    ShoppingCartIcon,
    DocumentCheckIcon,
    ChatBubbleBottomCenterIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [open, setOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-100">

            {/* --- SIDEBAR --- */}
            <aside
                className={`bg-white border-r overflow-y-auto overflow-x-hidden h-screen sticky top-0 z-40
                transition-all duration-500 ease-in-out
                ${open ? 'w-64' : 'w-20'} flex flex-col`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b">
                    <Link href="/">
                        <ApplicationLogo className="h-10 w-auto text-gray-800" />
                    </Link>

                    {/* Botón abrir/cerrar con animación de giro */}
                    <button
                        onClick={() => setOpen(!open)}
                        className={`text-gray-500 hover:text-gray-700 text-xl px-1
                            transition-transform duration-300
                            ${open ? 'rotate-0' : 'rotate-180'}
                        `}
                    >
                        {open ? '<' : '>'}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-3">
                    
                    {/* Dashboard */}
                    <NavLink
                        href={route('dashboard')}
                        active={route().current('dashboard')}
                        className="flex items-center gap-3 w-full whitespace-nowrap relative"
                    >
                        <HomeIcon className="w-6 h-6" />

                        <span
                            className={`transition-all duration-300 
                            ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 absolute'}
                        `}>
                            Dashboard
                        </span>
                    </NavLink>

                    {/* Inventario */}
                    <NavLink
                        href={route('inventario')}
                        active={route().current('inventario')}
                        className="flex items-center gap-3 w-full whitespace-nowrap relative"
                    >
                        <CubeIcon className="w-6 h-6" />
                        <span
                            className={`transition-all duration-300 
                            ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 absolute'}
                        `}>
                            Inventario
                        </span>
                    </NavLink>

                    {/* Productos */}
                    <NavLink
                        href={route('productos')}
                        active={route().current('productos')}
                        className="flex items-center gap-3 w-full whitespace-nowrap relative"
                    >
                        <ClipboardDocumentListIcon className="w-6 h-6" />
                        <span
                            className={`transition-all duration-300 
                            ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 absolute'}
                        `}>
                            Productos
                        </span>
                    </NavLink>

                    {/* Área Impresión */}
                    <NavLink
                        href={route('area-impresion')}
                        active={route().current('area-impresion')}
                        className="flex items-center gap-3 w-full whitespace-nowrap relative"
                    >
                        <PrinterIcon className="w-6 h-6" />
                        <span
                            className={`transition-all duration-300 
                            ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 absolute'}
                        `}>
                            Área Impresión
                        </span>
                    </NavLink>

                    {/* Pagos */}
                    <NavLink
                        href={route('pagos')}
                        active={route().current('pagos')}
                        className="flex items-center gap-3 w-full whitespace-nowrap relative"
                    >
                        <CreditCardIcon className="w-6 h-6" />
                        <span
                            className={`transition-all duration-300 
                            ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 absolute'}
                        `}>
                            Pagos
                        </span>
                    </NavLink>

                    {/* Store */}
                    <NavLink
                        href={route('store')}
                        active={route().current('store')}
                        className="flex items-center gap-3 w-full whitespace-nowrap relative"
                    >
                        <ShoppingCartIcon className="w-6 h-6" />
                        <span
                            className={`transition-all duration-300 
                            ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 absolute'}
                        `}>
                            Store
                        </span>
                    </NavLink>

                    {/* Reportes Generales */}
                    <NavLink
                        href={route('reportes')}
                        active={route().current('reportes')}
                        className="flex items-center gap-3 w-full whitespace-nowrap relative"
                    >
                        <DocumentCheckIcon className="w-6 h-6" />
                        <span
                            className={`transition-all duration-300 
                            ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 absolute'}
                        `}>
                            Reportes Generales
                        </span>
                    </NavLink>

                    {/* Gestión de Clientes */}
                    <NavLink
                        href={route('clientes')}
                        active={route().current('clientes')}
                        className="flex items-center gap-3 w-full whitespace-nowrap relative"
                    >
                        <ChatBubbleBottomCenterIcon className="w-6 h-6" />
                        <span
                            className={`transition-all duration-300 
                            ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 absolute'}
                        `}>
                            Gestión de Clientes
                        </span>
                    </NavLink>

                </nav>

                {/* User Section */}
                <div className="relative p-4 border-t mt-auto">

                    {/* Popup menu (aparece arriba del usuario) */}
                    {userMenuOpen && (
                        <>
                            {/* Overlay para cerrar al hacer click fuera */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setUserMenuOpen(false)}
                            />

                            <div
                                className={`absolute z-50 bottom-full mb-2 ${open ? 'left-4 right-4' : 'left-2'} 
                                    bg-white rounded-xl shadow-xl border border-gray-200 
                                    overflow-hidden animate-in fade-in slide-in-from-bottom-2`}
                                style={{
                                    minWidth: open ? 'auto' : '220px',
                                    animation: 'slideUp 0.2s ease-out'
                                }}
                            >
                                {/* Header del popup con info del usuario */}
                                <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Opciones del menú */}
                                <div className="py-1">
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                    >
                                        <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
                                        <span>Settings</span>
                                    </Link>

                                    <div className="mx-3 border-t border-gray-100" />

                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-400" />
                                        <span>Cerrar sesión</span>
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Botón del usuario (trigger) */}
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 
                            transition-all duration-200 group
                            ${userMenuOpen 
                                ? 'bg-indigo-50 ring-1 ring-indigo-200' 
                                : 'hover:bg-gray-50'
                            }`}
                    >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Nombre + chevron (solo con sidebar abierto) */}
                        <div
                            className={`flex-1 min-w-0 flex items-center justify-between transition-all duration-300
                            ${open ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}
                        >
                            <div className="text-left min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
                            </div>
                            <ChevronUpIcon 
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-1
                                    ${userMenuOpen ? 'rotate-180' : 'rotate-0'}
                                `} 
                            />
                        </div>
                    </button>
                </div>

            </aside>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col">

                {header && (
                    <header className="bg-white shadow sticky top-0 z-30">
                        <div className="px-6 py-4">
                            {header}
                        </div>
                    </header>
                )}

                <main className="p-6 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}