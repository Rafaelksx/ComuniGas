'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axios';

export default function DashboardPage() {
    const [stats, setStats] = useState({ total_bs: 0, por_tipo: {} });
    const [jornada, setJornada] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axiosClient.get('/dashboard/resumen');
                setStats(res.data.stats);
                setJornada(res.data.jornada);
            } catch (e) { console.error("Error al cargar resumen"); }
        };
        fetchDashboard();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Resumen del Operativo</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tarjeta de Recaudación */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                    <p className="text-sm text-gray-500 font-medium">Total Recaudado (Bs)</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.total_bs.toFixed(2)}</p>
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
        </div>
    );
}