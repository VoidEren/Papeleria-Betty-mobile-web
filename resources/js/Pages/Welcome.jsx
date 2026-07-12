import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Bienvenido" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-900 selection:bg-black selection:text-white">
                
                {/* Header Navigation */}
                <div className="absolute top-0 right-0 w-full p-6 sm:p-8 flex justify-end">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="text-sm font-medium text-gray-500 hover:text-black transition-colors duration-200"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <div className="space-x-6 flex items-center">
                            <Link
                                href={route('login')}
                                className="text-sm font-medium text-gray-500 hover:text-black transition-colors duration-200"
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                href={route('register')}
                                className="text-sm font-medium text-black bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-full transition-colors duration-200"
                            >
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex flex-col items-center text-center max-w-2xl px-6">
                    <ApplicationLogo className="w-20 h-20 mb-8 text-black" />
                    <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-gray-900 mb-6">
                        Papelería Betty
                    </h1>
                    <p className="text-lg text-gray-500 font-light max-w-md mx-auto mb-10 leading-relaxed">
                        Todo lo que necesitas para tu oficina y escuela, con la mejor calidad y servicio.
                    </p>

                    {!auth.user && (
                        <div className="flex space-x-4">
                            <Link
                                href={route('login')}
                                className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors duration-200"
                            >
                                Iniciar sesión para continuar
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer Minimalista */}
                <div className="absolute bottom-0 w-full pb-8 text-center">
                    <p className="text-xs text-gray-400 font-light">
                        &copy; {new Date().getFullYear()} Papelería Betty. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </>
    );
}
