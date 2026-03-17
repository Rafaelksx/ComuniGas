'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axios';

export default function VecinosPage() {
    const [vecinos, setVecinos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVecinos = async () => {
            try {
                const response = await axiosClient.get('/vecinos');
                setVecinos(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchVecinos();
    }, []);

    const editarVivienda = async (id, viviendaActual) => {
        const nuevaVivienda = prompt('Ingrese el nuevo identificador de vivienda (Ej: Manzana 4, Casa 12):', viviendaActual);
        if (nuevaVivienda && nuevaVivienda !== viviendaActual) {
            try {
                await axiosClient.put(`/vecinos/${id}`, { identificador_vivienda: nuevaVivienda });
                setVecinos(vecinos.map(v => v.id === id ? { ...v, identificador_vivienda: nuevaVivienda } : v));
            } catch (error) {
                alert('Error al actualizar la vivienda');
            }
        }
    };

    if (loading) return <div>Cargando censo...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Censo de Vecinos</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vivienda</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {vecinos.map(vecino => (
                            <tr key={vecino.id}>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{vecino.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{vecino.telefono}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{vecino.identificador_vivienda}</td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    <button 
                                        onClick={() => editarVivienda(vecino.id, vecino.identificador_vivienda)} 
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Editar Casa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}