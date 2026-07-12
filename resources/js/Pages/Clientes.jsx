import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { UserIcon, ShoppingBagIcon, Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Clientes({ clientes = [] }) {
    const [selectedClient, setSelectedClient] = useState(null);
    const [modalType, setModalType] = useState(''); // 'pedidos' or 'gestionar'

    const openModal = (client, type) => {
        setSelectedClient(client);
        setModalType(type);
    };

    const closeModal = () => {
        setSelectedClient(null);
        setModalType('');
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Gestión de Clientes (App Móvil)
                </h2>
            }
        >
            <Head title="Clientes App Móvil" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Header Section */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-medium text-gray-800">Usuarios Registrados</h3>
                            <p className="text-sm text-gray-500">Visualiza y gestiona los clientes que usan la aplicación móvil.</p>
                        </div>
                        <div className="px-4 py-2 bg-white rounded-full shadow-sm text-sm font-semibold text-blue-600 border border-blue-100">
                            Total: {clientes.length}
                        </div>
                    </div>

                    {/* Table / List Section */}
                    <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-white/40">
                        {clientes.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200/50">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Registro
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-transparent divide-y divide-gray-100">
                                    {clientes.map((cliente) => (
                                        <tr key={cliente.id} className="hover:bg-blue-50/30 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-lg shadow-inner">
                                                        {cliente.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{cliente.name}</div>
                                                        <div className="text-sm text-gray-500">{cliente.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(cliente.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-500">App Móvil</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    <button 
                                                        onClick={() => openModal(cliente, 'pedidos')}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-105"
                                                    >
                                                        <ShoppingBagIcon className="w-4 h-4 mr-1.5" />
                                                        Ver Pedidos
                                                    </button>
                                                    <button 
                                                        onClick={() => openModal(cliente, 'gestionar')}
                                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-105"
                                                    >
                                                        <Cog6ToothIcon className="w-4 h-4 mr-1.5 text-gray-500" />
                                                        Gestionar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center">
                                <UserIcon className="mx-auto h-12 w-12 text-gray-300" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Sin clientes móviles</h3>
                                <p className="mt-1 text-sm text-gray-500">Aún no hay usuarios registrados desde la aplicación móvil.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Placeholder Modal */}
            {selectedClient && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={closeModal}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${modalType === 'pedidos' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                                        {modalType === 'pedidos' ? (
                                            <ShoppingBagIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                                        ) : (
                                            <Cog6ToothIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />
                                        )}
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            {modalType === 'pedidos' ? `Pedidos de ${selectedClient.name}` : `Gestionar a ${selectedClient.name}`}
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {modalType === 'pedidos' 
                                                    ? 'Actualmente no hay una base de datos de pedidos conectada. Esta interfaz servirá para listar el historial de compras del cliente desde la app.'
                                                    : 'Aquí podrás cambiar el estado de la cuenta, enviar notificaciones o restablecer la contraseña del cliente.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button 
                                    type="button" 
                                    className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                    onClick={closeModal}
                                >
                                    Entendido
                                </button>
                                <button 
                                    type="button" 
                                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                    onClick={closeModal}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}