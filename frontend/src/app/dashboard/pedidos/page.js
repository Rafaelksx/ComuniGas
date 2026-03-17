'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axios';

export default function PedidosPage() {
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
            await axiosClient.patch(`/pedidos/${id}/${accion}`);
            // Actualizar la lista localmente
            setPedidos(pedidos.map(p => {
                if (p.id === id) {
                    return { ...p, estatus: accion === 'verificar' ? 'pagado' : 'entregado' };
                }
                return p;
            }));
        } catch (error) {
            alert('Error al actualizar el estatus');
        }
    };

    if (loading) return <div>Cargando pedidos...</div>;

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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estatus</th>
                            {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pedidos.map(pedido => (
                            <tr key={pedido.id}>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {new Date(pedido.jornada?.fecha_apertura).toLocaleDateString()}
                                </td>
                                {isAdmin && (
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                        {pedido.user?.name} <br/>
                                        <span className="text-xs text-gray-500">Casa: {pedido.user?.identificador_vivienda}</span>
                                    </td>
                                )}
                                <td className="px-6 py-4 text-sm text-gray-900 font-mono">#{pedido.referencia_pago}</td>
                                <td className="px-6 py-4 text-sm font-bold text-green-600">{pedido.monto_bs}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                        ${pedido.estatus === 'pendiente_verificacion' ? 'bg-yellow-100 text-yellow-800' : ''}
                                        ${pedido.estatus === 'pagado' ? 'bg-blue-100 text-blue-800' : ''}
                                        ${pedido.estatus === 'entregado' ? 'bg-green-100 text-green-800' : ''}
                                    `}>
                                        {pedido.estatus.replace('_', ' ')}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td className="px-6 py-4 text-sm space-x-2">
                                        {pedido.estatus === 'pendiente_verificacion' && (
                                            <button onClick={() => cambiarEstatus(pedido.id, 'verificar')} className="text-blue-600 hover:underline">Verificar Pago</button>
                                        )}
                                        {pedido.estatus === 'pagado' && (
                                            <button onClick={() => cambiarEstatus(pedido.id, 'entregado')} className="text-green-600 hover:underline">Entregar Cilindro</button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}