import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import { useState } from 'react';

export default function Productos({ productos }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [previewProd, setPreviewProd] = useState(null);
    const [buying, setBuying] = useState(false);
    const [buyBanco, setBuyBanco] = useState('BBVA (Carlos David)');
    const [buyReferencia, setBuyReferencia] = useState('');
    const [buyBancoOrigen, setBuyBancoOrigen] = useState('');
    const [buyError, setBuyError] = useState('');
    const [isSubmittingBuy, setIsSubmittingBuy] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors, progress } = useForm({
        nombre: '',
        descripcion: '',
        precio: '',
        imagen: null,
        stock: 0,
    });

    const submit = (e) => {
        e.preventDefault();

        const submitRoute = editMode 
            ? route('productos.update', currentId) 
            : route('productos.store');

        post(submitRoute, {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
            },
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            reset();
            clearErrors();
            setEditMode(false);
            setCurrentId(null);
        }, 200); // small delay to allow modal close animation
    };

    const editProduct = (e, prod) => {
        e.stopPropagation();
        setEditMode(true);
        setCurrentId(prod.id);
        setData({
            nombre: prod.nombre,
            descripcion: prod.descripcion || '',
            precio: prod.precio,
            imagen: null,
            stock: prod.stock || 0,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const deleteProduct = (e, id) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de que deseas eliminar este producto de forma permanente?')) {
            router.delete(route('productos.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const openCreateModal = () => {
        setEditMode(false);
        setCurrentId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openPreview = (prod) => {
        setPreviewProd(prod);
    };

    const closePreview = () => {
        setPreviewProd(null);
        setBuying(false);
        setBuyReferencia('');
        setBuyBancoOrigen('');
        setBuyError('');
        setIsSubmittingBuy(false);
    };

    const handleBuySubmit = (e) => {
        e.preventDefault();
        if (!buyReferencia) {
            setBuyError('La referencia de transferencia es obligatoria.');
            return;
        }
        setIsSubmittingBuy(true);
        router.post(route('productos.comprar'), {
            producto_id: previewProd.id,
            banco: buyBanco,
            referencia: buyReferencia,
            banco_origen: buyBancoOrigen,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                closePreview();
            },
            onError: () => {
                setBuyError('Error al registrar la compra. Inténtalo de nuevo.');
                setIsSubmittingBuy(false);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Catálogo de Productos
                </h2>
            }
        >
            <Head title="Productos" />

            <div className="py-12 relative min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 pb-20">
                    <div className="overflow-hidden bg-transparent sm:bg-white sm:shadow-sm sm:rounded-lg">
                        <div className="p-4 sm:p-6 text-gray-900 border-gray-200">
                            <h3 className="text-2xl font-black text-gray-800 mb-6 border-b-2 border-indigo-100 pb-2">Productos en Existencia</h3>
                            
                            {productos && productos.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {productos.map((prod) => (
                                        <div 
                                            key={prod.id} 
                                            onClick={() => openPreview(prod)}
                                            className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md bg-white flex flex-col justify-between transition-all hover:-translate-y-1 overflow-hidden relative group cursor-pointer"
                                        >
                                            
                                            {/* Action Buttons (Edit / Delete) */}
                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                                <button onClick={(e) => editProduct(e, prod)} className="bg-white p-2 rounded-full shadow hover:bg-indigo-50 hover:text-indigo-600 transition text-gray-600" title="Editar Producto">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={(e) => deleteProduct(e, prod.id)} className="bg-white p-2 rounded-full shadow hover:bg-red-50 hover:text-red-600 transition text-gray-600" title="Eliminar Producto">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>

                                            {/* Product Image */}
                                            <div className="h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden border-b relative">
                                                {prod.imagen ? (
                                                    <img src={'/storage/' + prod.imagen} alt={prod.nombre} className="object-cover w-full h-full" />
                                                ) : (
                                                    <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </div>

                                            <div className="p-4 flex flex-col flex-grow">
                                                {/* truncate class to ensure 1 line max, replacing with ellipsis (...) */}
                                                <h4 className="font-bold text-lg text-indigo-700 capitalize truncate" title={prod.nombre}>{prod.nombre}</h4>
                                                
                                                <p className="text-sm text-gray-500 mt-2 truncate flex-grow" title={prod.descripcion}>
                                                    {prod.descripcion || 'Sin descripción'}
                                                </p>
                                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">MXN</span>
                                                    <span className="text-xl font-extrabold text-emerald-600">${prod.precio}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay productos locales.</h3>
                                    <p className="mt-1 text-sm text-gray-500">Empieza registrando uno al dar clic en el botón flotante con el ícono "+".</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para Crear / Editar */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                        <h2 className="text-xl font-black text-gray-900">
                            {editMode ? 'Actualizar Producto' : 'Registrar Nuevo Producto'}
                        </h2>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="nombre" value="Nombre del Producto" />
                            <TextInput
                                id="nombre"
                                type="text"
                                name="nombre"
                                value={data.nombre}
                                className="mt-1 block w-full bg-gray-50 border border-gray-300 text-gray-900 shadow-sm"
                                isFocused={!editMode}
                                onChange={(e) => setData('nombre', e.target.value)}
                                required
                            />
                            <InputError message={errors.nombre} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="descripcion" value="Descripción (Opcional)" />
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={data.descripcion}
                                className="mt-1 block w-full bg-gray-50 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows="3"
                                onChange={(e) => setData('descripcion', e.target.value)}
                            ></textarea>
                            <InputError message={errors.descripcion} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <InputLabel htmlFor="precio" value="Precio" />
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <TextInput
                                        id="precio"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        name="precio"
                                        value={data.precio}
                                        className="block w-full pl-7 bg-gray-50 border-gray-300 shadow-sm"
                                        placeholder="0.00"
                                        onChange={(e) => setData('precio', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.precio} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="stock" value="Stock Disponible" />
                                <TextInput
                                    id="stock"
                                    type="number"
                                    min="0"
                                    name="stock"
                                    value={data.stock}
                                    className="mt-1 block w-full bg-gray-50 border-gray-300 shadow-sm"
                                    placeholder="0"
                                    onChange={(e) => setData('stock', e.target.value)}
                                    required
                                />
                                <InputError message={errors.stock} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="imagen" value="Fotografía (Máx 2MB)" />
                                <input
                                    id="imagen"
                                    type="file"
                                    name="imagen"
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    onChange={(e) => setData('imagen', e.target.files[0])}
                                    accept="image/*"
                                />
                                <InputError message={errors.imagen} className="mt-2" />
                                {progress && (
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white hover:bg-gray-100 rounded-lg transition-colors focus:ring-4 focus:ring-gray-200"
                                onClick={closeModal}
                            >
                                Cancelar
                            </button>
                            <PrimaryButton className="px-6 py-2.5 rounded-lg shadow-md" disabled={processing}>
                                {editMode ? 'Actualizar Cambios' : 'Guardar Producto'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal para Vista Previa */}
            <Modal show={!!previewProd} onClose={closePreview}>
                {previewProd && (
                    <div className="bg-white rounded-lg overflow-hidden">
                        {buying ? (
                            <form onSubmit={handleBuySubmit} className="p-8 space-y-5">
                                <h3 className="text-xl font-bold text-gray-900">Comprar por Transferencia</h3>
                                <p className="text-xs text-gray-500">
                                    Transfiere el monto exacto a la siguiente cuenta oficial y registra la referencia de tu pago.
                                </p>
                                
                                <div className="p-4 bg-indigo-50 rounded-xl text-xs space-y-1.5 border border-indigo-100">
                                    <p className="font-bold text-indigo-800 text-sm">BBVA Bancomer</p>
                                    <p className="text-gray-600">Titular: <span className="font-semibold text-gray-800">Carlos David Moreno Escorza</span></p>
                                    <p className="text-gray-600 font-mono">Cuenta: <span className="font-bold text-gray-800">129 247 3135</span></p>
                                    <p className="text-gray-600 font-mono">CLABE: <span className="font-bold text-gray-800">012 180 01292473135 1</span></p>
                                    <p className="text-gray-600 font-mono">Tarjeta: <span className="font-bold text-gray-800">4152 3144 7373 8048</span></p>
                                    <p className="text-emerald-700 font-black text-sm pt-2 border-t border-indigo-100 mt-2">
                                        Monto a Transferir: ${Number(previewProd.precio).toFixed(2)}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Cuenta de destino</label>
                                        <select
                                            value={buyBanco}
                                            onChange={e => setBuyBanco(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-300 outline-none bg-gray-50 font-medium"
                                        >
                                            <option value="BBVA (Carlos David)">BBVA (Carlos David)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Referencia de Transferencia</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ingresa el número de referencia"
                                            value={buyReferencia}
                                            onChange={e => setBuyReferencia(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-emerald-300 outline-none bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Banco emisor / origen (opcional)</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Santander, Banamex, HSBC..."
                                            value={buyBancoOrigen}
                                            onChange={e => setBuyBancoOrigen(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-300 outline-none bg-gray-50"
                                        />
                                    </div>

                                    {buyError && (
                                        <p className="text-red-600 text-xs bg-red-50 rounded-xl px-3 py-2">{buyError}</p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setBuying(false)}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 text-sm transition"
                                    >
                                        Atrás
                                    </button>
                                    <PrimaryButton
                                        type="submit"
                                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 flex justify-center items-center text-sm font-bold"
                                        disabled={isSubmittingBuy}
                                    >
                                        {isSubmittingBuy ? 'Procesando...' : 'Confirmar Pago'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        ) : (
                            <>
                                {previewProd.imagen ? (
                                    <img src={'/storage/' + previewProd.imagen} alt={previewProd.nombre} className="w-full max-h-72 object-cover bg-gray-100" />
                                ) : (
                                    <div className="w-full h-64 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                                        <svg className="h-24 w-24 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="p-8">
                                    <h2 className="text-3xl font-black text-gray-900 mb-4 capitalize">{previewProd.nombre}</h2>
                                    <p className="text-gray-600 text-base leading-relaxed mb-8 whitespace-pre-wrap">
                                        {previewProd.descripcion || 'Este producto no contiene una descripción elaborada.'}
                                    </p>
                                    
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Precio de venta</span>
                                        <span className="text-4xl font-extrabold text-emerald-600">${previewProd.precio}</span>
                                    </div>

                                    <div className="mt-8 flex justify-between gap-3">
                                        <PrimaryButton className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700" onClick={() => setBuying(true)}>
                                            Comprar por Transferencia
                                        </PrimaryButton>
                                        <button 
                                            type="button"
                                            className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition text-sm" 
                                            onClick={closePreview}
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
            
            <button
                onClick={openCreateModal}
                className="fixed bottom-10 right-10 bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] hover:bg-indigo-700 hover:scale-105 transition-all outline-none focus:ring-4 focus:ring-indigo-300 z-50 group"
                title="Añadir nuevo producto"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>

        </AuthenticatedLayout>
    );
}
