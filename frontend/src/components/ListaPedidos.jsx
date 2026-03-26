'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axios';

export default function ListaPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await axiosClient.get('/user');
                setUser(userRes.data);

                const pedidosRes = await axiosClient.get('/pedidos');
                setPedidos(pedidosRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const cambiarEstatus = async (id, accion) => {
        try {
            // "accion" puede ser 'verificar', 'rechazar', 'recibir-vacia' o 'entregar'
            await axiosClient.patch(`/pedidos/${id}/${accion}`);

            // Actualizar la lista localmente
            setPedidos(pedidos.map(p => {
                if (p.id === id) {
                    return {
                        ...p,
                        estado_pago: accion === 'verificar' ? 'verificado' : (accion === 'rechazar' ? 'rechazado' : p.estado_pago),
                        estado_fisico: accion === 'recibir-vacia' ? 'vacia_entregada' : (accion === 'entregar' ? 'llena_recibida' : p.estado_fisico)
                    };
                }
                return p;
            }));
            alert('¡Estatus actualizado correctamente!');
        } catch (error) {
            alert('Error al actualizar el estatus. Revisa la consola.');
            console.error(error);
        }
    };

    if (loading) return <div className="p-8">Cargando lista de pedidos...</div>;

    const isAdmin = user?.rol === 'admin_comunidad';

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">
                {isAdmin ? 'Revisión de Pagos y Entregas' : 'Mis Pedidos'}
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jornada</th>
                            {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vecino</th>}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referencia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto (Bs)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estatus Pago</th>
                            {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pedidos.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? "6" : "4"} className="px-6 py-4 text-center text-gray-500">
                                    No hay pedidos registrados aún.
                                </td>
                            </tr>
                        ) : (
                            pedidos.map(pedido => (
                                <tr key={pedido.id}>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {new Date(pedido.jornada?.fecha_apertura).toLocaleDateString()}
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                            {pedido.user?.name} <br />
                                            <span className="text-xs text-gray-500">Casa: {pedido.user?.identificador_vivienda}</span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                                        #{pedido.pagos && pedido.pagos[0] ? pedido.pagos[0].referencia : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-600">
                                        {pedido.total_ves} Bs
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                ${pedido.estado_pago === 'por_verificar' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                ${pedido.estado_pago === 'verificado' ? 'bg-green-100 text-green-800' : ''}
                                            `}>
                                            {pedido.estado_pago.replace('_', ' ')}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 text-sm flex flex-wrap gap-2">
                                            {/* PASO 1: APROBAR O RECHAZAR PAGO */}
                                            {pedido.estado_pago === 'por_verificar' && (
                                                <>
                                                    <button onClick={() => cambiarEstatus(pedido.id, 'verificar')} className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 font-semibold transition">
                                                        Aprobar Pago
                                                    </button>
                                                    <button onClick={() => cambiarEstatus(pedido.id, 'rechazar')} className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 font-semibold transition">
                                                        Rechazar
                                                    </button>
                                                </>
                                            )}

                                            {/* PASO 2: RECIBIR BOMBONA VACÍA (Solo si el pago ya se verificó) */}
                                            {pedido.estado_pago === 'verificado' && pedido.estado_fisico === 'pendiente_entregar_vacia' && (
                                                <button onClick={() => cambiarEstatus(pedido.id, 'recibir-vacia')} className="bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 font-semibold transition">
                                                    Recibir Vacía
                                                </button>
                                            )}

                                            {/* PASO 3: ENTREGAR BOMBONA LLENA (Solo si ya entregó la vacía) */}
                                            {pedido.estado_pago === 'verificado' && pedido.estado_fisico === 'vacia_entregada' && (
                                                <button onClick={() => cambiarEstatus(pedido.id, 'entregar')} className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 font-semibold transition">
                                                    Entregar Llena
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
