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
    ChatBubbleBottomCenterIcon
} from '@heroicons/react/24/outline';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [open, setOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-100">

            {/* --- SIDEBAR --- */}
            <aside
                className={`bg-white border-r overflow-hidden
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
                <div className="p-4 border-t mt-auto">
                    {open ? (
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-2">
                                    <UserCircleIcon className="w-7 h-7 text-gray-500" />
                                    {user.name}
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Perfil
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                >
                                    Cerrar sesión
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    ) : (
                        <div className="flex justify-center">
                            <UserCircleIcon className="w-10 h-10 text-gray-500" />
                        </div>
                    )}
                </div>

            </aside>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col">

                {header && (
                    <header className="bg-white shadow">
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