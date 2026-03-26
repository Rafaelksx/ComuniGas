'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axios';
import Link from 'next/link';

export default function DashboardPage() {
    const [isAdmin, setIsAdmin] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [userName, setUserName] = useState('');
    const [stats, setStats] = useState({
        total_bs: 0, total_usd: 0, total_pedidos: 0, vecinos_atendidos: 0,
        pagos_verificados: 0, entregas_completadas: 0, por_tipo: {}
    });
    const [jornada, setJornada] = useState(null);
    const [todasJornadas, setTodasJornadas] = useState([]);
    const [selectedJornadaId, setSelectedJornadaId] = useState('actual');
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            setCargando(true);
            try {
                const res = await axiosClient.get(`/dashboard/resumen?jornada_id=${selectedJornadaId}`);
                setStats(res.data.stats || {});
                setJornada(res.data.jornada);
                setTodasJornadas(res.data.todas_jornadas || []);
                setIsAdmin(res.data.is_admin ?? true);
                if (res.data.user) {
                    setUserName(res.data.user.name);
                    setIsSuperAdmin(res.data.user.rol === 'superadmin');
                }
            } catch (e) {
                console.error("Error al cargar resumen");
            } finally {
                setCargando(false);
            }
        };
        fetchDashboard();
    }, [selectedJornadaId]);

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'abierta': return 'bg-green-100 text-green-800 border-green-200';
            case 'en_proceso': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'finalizada': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelada': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (cargando) {
        return <div className="text-center py-20"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
    }

    if (isSuperAdmin) {
        return (
            <div className="space-y-8 max-w-5xl mx-auto pb-10">
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">👔 Super Administrador</h1>
                        <p className="text-yellow-100 text-lg sm:text-xl max-w-2xl">
                            Bienvenido, {userName}. Desde este panel tienes control sobre todas las operaciones, comunidades y nombramiento de coordinadores a nivel nacional.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <Link href="/dashboard/comunidades" className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition group text-center block">
                        <svg className="w-16 h-16 mx-auto mb-4 text-indigo-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Comunidades</h3>
                        <p className="text-gray-500">Crea nuevos sectores para expandir el alcance de ComuniGas.</p>
                    </Link>
                    <Link href="/dashboard/usuarios" className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition group text-center block">
                        <svg className="w-16 h-16 mx-auto mb-4 text-yellow-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Asignar Coordinadores</h3>
                        <p className="text-gray-500">Nombra nuevos voceros o reasígnalos de urbanización en el sistema.</p>
                    </Link>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="space-y-8 max-w-5xl mx-auto pb-10">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">¡Hola{userName ? `, ${userName.split(' ')[0]}` : ''}!</h1>
                        <p className="text-blue-100 text-lg sm:text-xl max-w-2xl">
                            Estás en el panel de vecinos de ComuniGas. Desde aquí puedes gestionar tus pedidos y consultar los operativos activos en tu comunidad.
                        </p>
                    </div>
                    {/* Elemento decorativo */}
                    <div className="absolute -right-10 -bottom-10 opacity-10">
                        <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" /></svg>
                    </div>
                </div>

                {!jornada ? (
                    <div className="bg-yellow-50 text-yellow-800 p-8 rounded-3xl border border-yellow-200 shadow-sm text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h2 className="text-2xl font-bold mb-2">No hay operativos activos</h2>
                        <p className="text-yellow-700 font-medium">Tu comunidad no tiene ninguna jornada de gas abierta en este momento. Te avisaremos cuando inicie la próxima.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-8 sm:p-12 text-center">
                            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6 border ${getEstadoColor(jornada.estado)}`}>
                                Jornada {jornada.estado.replace('_', ' ')}
                            </span>
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Operativo del {new Date(jornada.fecha_apertura).toLocaleDateString()}</h2>
                            <p className="text-gray-600 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
                                {jornada.estado === 'abierta'
                                    ? `¡El operativo está recibiendo pedidos! La tasa del día referencial es de ${jornada.tasa_bcv_dia} Bs/USD.`
                                    : 'El operativo actual está procesando despachos. Si realizaste un pedido, pronto se te contactará para la entrega.'}
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                {jornada.estado === 'abierta' && (
                                    <Link href="/dashboard/pedidos" className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all focus:ring-4 focus:ring-blue-500/30">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                        Pedir Gas Ahora
                                    </Link>
                                )}
                                <Link href="/dashboard/pedidos" className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 px-8 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-4 focus:ring-gray-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                    Ver Mis Pedidos
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10">
            {/* Header y Selector de Jornada Rediseñado */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-8 sm:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-white mb-2">Resumen Operativo</h1>
                        <p className="text-blue-100 text-sm">Monitorea el progreso de las jornadas de gas de tu comunidad</p>
                    </div>

                    <div className="relative inline-block w-full md:w-auto">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <span className="text-blue-600">📅</span>
                        </div>
                        <select
                            value={selectedJornadaId}
                            onChange={(e) => setSelectedJornadaId(e.target.value)}
                            className="block w-full md:w-80 pl-10 pr-10 py-3 text-base font-medium text-gray-800 bg-white border-2 border-transparent rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all cursor-pointer appearance-none"
                        >
                            <option value="actual">-- Última Jornada Activa --</option>
                            {todasJornadas.map(j => (
                                <option key={j.id} value={j.id}>
                                    Operativo: {new Date(j.fecha_apertura).toLocaleDateString()} ({j.estado.replace('_', ' ').toUpperCase()})
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {jornada && (
                    <div className="bg-gray-50 flex items-center justify-center md:justify-start px-6 py-3 border-t border-gray-200 gap-3">
                        <span className="text-sm text-gray-600 font-medium">Estado actual:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border tracking-wider ${getEstadoColor(jornada.estado)}`}>
                            {jornada.estado.replace('_', ' ')}
                        </span>
                    </div>
                )}
            </div>

            {!jornada ? (
                <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl border border-yellow-200 shadow-sm text-center">
                    <p className="text-lg font-medium">No se encontraron datos para esta selección.</p>
                    <p className="text-sm mt-2 opacity-80">Asegúrate de tener una jornada planificada.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Tarjetas de Métricas Principales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Recaudación */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center border-l-4 border-l-blue-500 hover:shadow-md transition">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recaudado (Total)</span>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-gray-900">{(parseFloat(stats.total_bs) || 0).toFixed(2)}</span>
                                <span className="text-sm font-medium text-gray-500">Bs</span>
                            </div>
                            <span className="text-xs text-green-600 font-medium mt-1">~ {(parseFloat(stats.total_usd) || 0).toFixed(2)} USD</span>
                        </div>

                        {/* Pedidos */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center border-l-4 border-l-indigo-500 hover:shadow-md transition">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pedidos Recibidos</span>
                            <span className="text-3xl font-extrabold text-gray-900 mt-2">{stats.total_pedidos}</span>
                        </div>

                        {/* Vecinos Atendidos */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center border-l-4 border-l-purple-500 hover:shadow-md transition">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Familias Atendidas</span>
                            <span className="text-3xl font-extrabold text-gray-900 mt-2">{stats.vecinos_atendidos}</span>
                        </div>

                        {/* Progreso de la Jornada */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center border-l-4 border-l-green-500 hover:shadow-md transition">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Progreso Global</span>
                            <div className="mt-2 flex items-end gap-2">
                                <span className="text-3xl font-extrabold text-gray-900">
                                    {stats.total_pedidos > 0 ? Math.round((stats.entregas_completadas / stats.total_pedidos) * 100) : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${stats.total_pedidos > 0 ? (stats.entregas_completadas / stats.total_pedidos) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Estado de Pagos y Entregas */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-1">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-bold text-gray-800">Control de Progreso</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-600">Pagos Aprobados</span>
                                        <span className="text-sm font-bold text-gray-900">{stats.pagos_verificados} / {stats.total_pedidos}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.total_pedidos > 0 ? (stats.pagos_verificados / stats.total_pedidos) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-600">Cilindros Entregados</span>
                                        <span className="text-sm font-bold text-gray-900">{stats.entregas_completadas} / {stats.total_pedidos}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.total_pedidos > 0 ? (stats.entregas_completadas / stats.total_pedidos) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resumen de Bombonas solicitadas */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Inventario para el camión</h3>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">
                                    Total: {Object.values(stats.por_tipo || {}).reduce((a, b) => a + Number(b), 0)} cilindros
                                </span>
                            </div>
                            <div className="p-6">
                                {Object.keys(stats.por_tipo || {}).length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">Aún no hay cilindros solicitados en esta jornada.</p>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {Object.entries(stats.por_tipo).map(([tipoMarca, cant]) => (
                                            <div key={tipoMarca} className="flex flex-col bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition">
                                                <span className="text-2xl font-black text-gray-800">{cant}</span>
                                                <span className="text-xs font-semibold text-gray-500 mt-1 uppercase leading-tight">{tipoMarca}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}