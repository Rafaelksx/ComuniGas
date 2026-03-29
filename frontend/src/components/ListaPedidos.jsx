'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import axiosClient from '@/lib/axios';

import ReporteJornada from './ReporteJornada';

export default function ListaPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedComprobante, setSelectedComprobante] = useState(null);
    const [jornadaImprimir, setJornadaImprimir] = useState(null);

    const handlePrint = (jornadaId) => {
        setJornadaImprimir(jornadaId);
        // Damos un breve timeout para que React renderice el componente en el DOM antes de imprimir
        setTimeout(() => {
            window.print();
            // Despues de enviar a imprimir, limpiamos
            setTimeout(() => setJornadaImprimir(null), 1000);
        }, 150);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const userRes = await axiosClient.get('/user');
            setUser(userRes.data);

            const pedidosRes = await axiosClient.get('/pedidos');
            // Si la respuesta usa paginación de Laravel, los datos vienen en .data
            const data = pedidosRes.data?.data ?? pedidosRes.data;
            setPedidos(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cambiarEstatus = async (id, accion) => {
        try {
            await axiosClient.patch(`/pedidos/${id}/${accion}`);
            toast.success('¡Estatus actualizado correctamente!');
            // Re-fetch desde el servidor para garantizar consistencia de datos
            await fetchData();
        } catch (error) {
            toast.error('Error al actualizar el estatus.');
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
                            <div className="flex items-center gap-3">
                                {isAdmin && (
                                    <button 
                                        onClick={() => handlePrint(grupo.jornada?.id || 'sin-jornada')}
                                        className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-indigo-300 flex items-center gap-1.5 print:hidden"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                        Imprimir Reporte
                                    </button>
                                )}
                                <div className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg shadow-sm font-medium border border-gray-100">
                                    {grupo.pedidos.length} pedido(s)
                                </div>
                            </div>
                        </div>

                        {/* Renderizar área de impresión solo si es la jornada activa para imprimir */}
                        {jornadaImprimir === (grupo.jornada?.id || 'sin-jornada') && (
                            <ReporteJornada jornada={grupo.jornada} pedidos={grupo.pedidos} />
                        )}

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
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const path = pedido.pagos[0].comprobante_path;
                                                            const isUrl = path.startsWith('http');
                                                            setSelectedComprobante(isUrl ? path : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/storage/${path}`);
                                                        }}
                                                        title="Ver Imagen"
                                                        className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors border border-blue-100 mt-1 focus:ring-2 focus:ring-blue-300"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                        Capture
                                                    </button>
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

            {/* Modal para ver el comprobante */}
            {selectedComprobante && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
                    onClick={() => setSelectedComprobante(null)}
                >
                    <div 
                        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh]" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Comprobante de Pago
                            </h3>
                            <button 
                                onClick={() => setSelectedComprobante(null)} 
                                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-4 flex-1 flex items-center justify-center bg-gray-50 overflow-y-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={selectedComprobante} 
                                alt="Capture de Pago" 
                                className="max-w-full max-h-[60vh] object-contain rounded border border-gray-200 shadow-sm"
                            />
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-white">
                            <button 
                                onClick={() => setSelectedComprobante(null)} 
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-300"
                            >
                                Cerrar Ventana
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
