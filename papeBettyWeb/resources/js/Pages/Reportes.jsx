import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Reportes() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Reportes
                </h2>
            }
        >
            <Head title="Reportes" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            Aqui va a ir todos los reportes de Reportes avanzados: más de 2,000 reportes incluidos (ventas por artículo, rendimiento de empleados, ganancias por periodo, productos lentos o rentables).
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
