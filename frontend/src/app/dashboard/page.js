'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axios';
import Link from 'next/link';

export default function DashboardPage() {
    const [jornadas, setJornadas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJornadas = async () => {
            try {
                const response = await axiosClient.get('/jornadas');
                setJornadas(response.data);
            } catch (error) {
                console.error('Error al cargar jornadas', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJornadas();
    }, []);

    // Buscamos si hay alguna jornada activa actualmente
    const jornadaActiva = jornadas.find(j => j.estado !== 'finalizada');

    if (loading) return <div>Cargando panel de control...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>

            {/* Tarjeta de Jornada Activa */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Estado del Operativo</h2>
                
                {jornadaActiva ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                            <div>
                                <p className="text-sm text-green-600 font-bold uppercase">Jornada Abierta</p>
                                <p className="text-gray-700">Tasa BCV del día: <span className="font-bold">{jornadaActiva.tasa_bcv_dia} Bs</span></p>
                            </div>
                            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-semibold">
                                {jornadaActiva.estado.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Bombonas disponibles hoy:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {jornadaActiva.lotes?.map(lote => (
                                    <div key={lote.id} className="border p-3 rounded-lg bg-gray-50 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{lote.capacidad} - {lote.marca}</p>
                                            <p className="text-sm text-gray-500">
                                                ${lote.precio_usd} <span className="text-xs">({(lote.precio_usd * jornadaActiva.tasa_bcv_dia).toFixed(2)} Bs)</span>
                                            </p>
                                        </div>
                                        {/* Etiqueta de estatus del lote */}
                                        <span className={`text-xs px-2 py-1 rounded ${lote.estatus_lote === 'devueltas_llenas' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {lote.estatus_lote === 'devueltas_llenas' ? 'Llenas' : 'En proceso'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No hay ninguna jornada activa en este momento.</p>
                        <Link href="/dashboard/jornadas" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                            Crear Nueva Jornada
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}