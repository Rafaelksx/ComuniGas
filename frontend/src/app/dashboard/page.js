'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axios';

export default function DashboardPage() {
    const [stats, setStats] = useState({ total_bs: 0, por_tipo: {} });
    const [jornada, setJornada] = useState(null);
    const [todasJornadas, setTodasJornadas] = useState([]);
    const [selectedJornadaId, setSelectedJornadaId] = useState('actual');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axiosClient.get(`/dashboard/resumen?jornada_id=${selectedJornadaId}`);
                setStats(res.data.stats);
                setJornada(res.data.jornada);
                setTodasJornadas(res.data.todas_jornadas || []);
            } catch (e) { console.error("Error al cargar resumen"); }
        };
        fetchDashboard();
    }, [selectedJornadaId]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    Resumen del Operativo
                </h1>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Ver jornada:</label>
                    <select 
                        value={selectedJornadaId}
                        onChange={(e) => setSelectedJornadaId(e.target.value)}
                        className="bg-transparent text-sm font-bold text-blue-600 focus:outline-none cursor-pointer"
                    >
                        <option value="actual">Última / En Curso</option>
                        {todasJornadas.map(j => (
                            <option key={j.id} value={j.id}>
                                {new Date(j.fecha_apertura).toLocaleDateString()} - {j.estado.replace('_', ' ').toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {!jornada ? (
                <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl border border-yellow-200">
                    Selecciona una jornada o asegúrate de que exista una planificada.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tarjeta de Recaudación */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                    <p className="text-sm text-gray-500 font-medium">Total Recaudado (Bs)</p>
                    <p className="text-3xl font-bold text-blue-600">{(parseFloat(stats.total_bs) || 0).toFixed(2)}</p>
                </div>

                {/* Resumen de Bombonas a Pedir */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold mb-4 text-gray-700">Cilindros solicitados para el camión:</h3>
                    <div className="flex gap-4">
                        {Object.entries(stats.por_tipo).map(([tipo, cant]) => (
                            <div key={tipo} className="bg-gray-50 px-4 py-2 rounded-lg border">
                                <span className="block text-xs text-gray-500 uppercase">{tipo}</span>
                                <span className="text-xl font-bold text-gray-800">{cant}</span>
                            </div>
                        ))}
                    </div>
                </div>
                </div>
            )}
        </div>
    );
}