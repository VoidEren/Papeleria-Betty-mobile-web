import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function AreaImpresion() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Area de impresion
                </h2>
            }
        >
            <Head title="AreaImpresion" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            Aqui es donde va a ir todas las impresiones pedidas en linea, ya que solo las copias se realizaran de manera presencial...
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
