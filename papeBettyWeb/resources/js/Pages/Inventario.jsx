import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Inventario() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Inventario
                </h2>
            }
        >
            <Head title="Inventario" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            Este es el inventario que es donde va a ir la cantidad de productos que se tiene 
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
