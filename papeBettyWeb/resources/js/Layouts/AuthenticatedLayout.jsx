import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [open, setOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-100">

            {/* --- SIDEBAR --- */}
            <aside
                className={`bg-white border-r transition-all duration-300
                ${open ? 'w-64' : 'w-20'} flex flex-col`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b">
                    <Link href="/">
                        <ApplicationLogo className="h-10 w-auto text-gray-800" />
                    </Link>

                    <button
                        onClick={() => setOpen(!open)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        {open ? '<' : '>'}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    <NavLink
                        href={route('dashboard')}
                        active={route().current('dashboard')}
                        className="block"
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        href={route('inventario')}
                        active={route().current('inventario')}
                        className="block"
                    >
                        Inventario
                    </NavLink>

                    <NavLink
                        href={route('productos')}
                        active={route().current('productos')}
                        className="block"
                    >
                        Productos
                    </NavLink>

                    <NavLink
                        href={route('area-impresion')}
                        active={route().current('area-impresion')}
                        className="block"
                    >
                        Area Impresion
                    </NavLink>

                    <NavLink
                        href={route('pagos')}
                        active={route().current('pagos')}
                        className="block"
                    >
                        Pagos
                    </NavLink>
                </nav>

                {/* User Dropdown */}
                <div className="p-4 border-t mt-auto">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100">
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
