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
            await axiosClient.patch(`/pedidos/${id}/${accion}`);
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

    const pedidosPorJornada = pedidos.reduce((acc, pedido) => {
        const jId = pedido.jornada_id || 'sin-jornada';
        if (!acc[jId]) {
            acc[jId] = { jornada: pedido.jornada, pedidos: [] };
        }
        acc[jId].pedidos.push(pedido);
        return acc;
    }, {});

    const jornadasAgrupadas = Object.values(pedidosPorJornada).sort((a, b) => {
        if (!a.jornada || !b.jornada) return 0;
        return new Date(b.jornada.fecha_apertura) - new Date(a.jornada.fecha_apertura);
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">
                {isAdmin ? 'Revisión de Pagos y Entregas' : 'Mis Pedidos'}
            </h1>

            {pedidos.length === 0 ? (
                <div className="bg-white p-8 text-center text-gray-500 rounded-xl shadow-sm border border-gray-200">
                    No hay pedidos registrados aún.
                </div>
            ) : (
                jornadasAgrupadas.map((grupo) => (
                    <div key={grupo.jornada?.id || 'old'} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-blue-900">
                                    Operativo del {grupo.jornada ? new Date(grupo.jornada.fecha_apertura).toLocaleDateString() : 'Desconocido'}
                                </h2>
                                <span className="text-sm text-blue-700 uppercase font-semibold">
                                    {grupo.jornada?.estado.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded shadow-sm">
                                {grupo.pedidos.length} pedido(s)
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vecino</th>}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referencia</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto (Bs)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estatus Pago</th>
                                        {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones Entregas</th>}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {grupo.pedidos.map(pedido => (
                                        <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                                            {isAdmin && (
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium border-l-4 border-l-transparent hover:border-l-blue-500">
                                                    {pedido.user?.name} <br />
                                                    <span className="text-xs text-gray-500 font-mono">Casa: {pedido.user?.identificador_vivienda}</span>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-sm font-mono flex flex-col items-start gap-1">
                                                <div className="text-gray-900 font-bold mb-1">
                                                    #{pedido.pagos && pedido.pagos[0] ? pedido.pagos[0].referencia : 'N/A'}
                                                </div>
                                                {isAdmin && pedido.pagos && pedido.pagos[0] && pedido.pagos[0].comprobante_path && (
                                                    <a 
                                                        href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/storage/${pedido.pagos[0].comprobante_path}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        title="Ver Imagen"
                                                        className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors border border-blue-100"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                        Capture
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-green-600">
                                                {pedido.total_ves} Bs
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                        ${pedido.estado_pago === 'por_verificar' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : ''}
                                                        ${pedido.estado_pago === 'verificado' ? 'bg-green-100 text-green-800 border border-green-200' : ''}
                                                        ${pedido.estado_pago === 'rechazado' ? 'bg-red-100 text-red-800 border border-red-200' : ''}
                                                    `}>
                                                    {pedido.estado_pago.replace('_', ' ')}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 text-sm flex flex-col sm:flex-row flex-wrap gap-2">
                                                    {/* PASO 1: APROBAR O RECHAZAR PAGO */}
                                                    {pedido.estado_pago === 'por_verificar' && (
                                                        <>
                                                            <button onClick={() => cambiarEstatus(pedido.id, 'verificar')} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 font-semibold transition border border-blue-200 text-xs flex items-center gap-1">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                                Aprobar Pago
                                                            </button>
                                                            <button onClick={() => cambiarEstatus(pedido.id, 'rechazar')} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-100 font-semibold transition border border-red-200 text-xs flex items-center gap-1">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                                Rechazar
                                                            </button>
                                                        </>
                                                    )}
        
                                                    {/* PASO 2: RECIBIR BOMBONA VACÍA */}
                                                    {pedido.estado_pago === 'verificado' && pedido.estado_fisico === 'pendiente_entregar_vacia' && (
                                                        <button onClick={() => cambiarEstatus(pedido.id, 'recibir-vacia')} className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-md hover:bg-orange-200 font-semibold transition border border-orange-200 text-xs flex items-center justify-center">
                                                            Paso 2: Recibir Vacía
                                                        </button>
                                                    )}
        
                                                    {/* PASO 3: ENTREGAR BOMBONA LLENA */}
                                                    {pedido.estado_pago === 'verificado' && pedido.estado_fisico === 'vacia_entregada' && (
                                                        <button onClick={() => cambiarEstatus(pedido.id, 'entregar')} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-200 font-semibold transition border border-green-200 text-xs flex items-center justify-center">
                                                            Paso 3: Entregar Llena
                                                        </button>
                                                    )}

                                                    {/* PASO 4: Completado */}
                                                    {pedido.estado_pago === 'verificado' && pedido.estado_fisico === 'llena_recibida' && (
                                                        <span className="text-gray-400 font-semibold italic text-xs py-1.5 flex items-center gap-1">
                                                            Entregada 
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
