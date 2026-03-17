'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axios';

export default function JornadasPage() {
    const [jornadas, setJornadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    
    // Estado para el modal/formulario de nueva jornada
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        tasa_bcv_dia: '',
        fecha_apertura: '',
        fecha_cierre_pagos: '',
        lotes: [{ capacidad: '10kg', marca: 'Bolívar Gas', precio_usd: '' }]
    });

    // Cargar datos al entrar a la página
    useEffect(() => {
        const initData = async () => {
            try {
                const userRes = await axiosClient.get('/user');
                setUser(userRes.data);
                
                const jornadasRes = await axiosClient.get('/jornadas');
                setJornadas(jornadasRes.data);
            } catch (error) {
                console.error('Error cargando datos:', error);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    // Funciones para manejar los lotes dinámicos (agregar o quitar bombonas)
    const handleAddLote = () => {
        setFormData({
            ...formData,
            lotes: [...formData.lotes, { capacidad: '10kg', marca: 'Bolívar Gas', precio_usd: '' }]
        });
    };

    const handleRemoveLote = (index) => {
        const nuevosLotes = formData.lotes.filter((_, i) => i !== index);
        setFormData({ ...formData, lotes: nuevosLotes });
    };

    const handleLoteChange = (index, field, value) => {
        const nuevosLotes = [...formData.lotes];
        nuevosLotes[index][field] = value;
        setFormData({ ...formData, lotes: nuevosLotes });
    };

    // Enviar el formulario al Backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                comunidad_id: user.comunidad_id,
                // Formatear las fechas para MySQL/PostgreSQL (YYYY-MM-DD HH:mm:ss)
                fecha_apertura: formData.fecha_apertura.replace('T', ' ') + ':00',
                fecha_cierre_pagos: formData.fecha_cierre_pagos.replace('T', ' ') + ':00',
            };

            const response = await axiosClient.post('/jornadas', payload);
            
            // Agregar la nueva jornada a la lista y cerrar el formulario
            setJornadas([response.data.jornada, ...jornadas]);
            setShowForm(false);
            
            // Limpiar formulario
            setFormData({
                tasa_bcv_dia: '',
                fecha_apertura: '',
                fecha_cierre_pagos: '',
                lotes: [{ capacidad: '10kg', marca: 'Bolívar Gas', precio_usd: '' }]
            });
            alert('¡Jornada creada con éxito!');
        } catch (error) {
            console.error('Error creando jornada:', error.response?.data || error.message);
            alert('Ocurrió un error al crear la jornada. Revisa la consola.');
        }
    };

    if (loading) return <div>Cargando gestión de jornadas...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Jornadas</h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                    {showForm ? 'Cancelar' : '+ Nueva Jornada'}
                </button>
            </div>

            {/* FORMULARIO DE NUEVA JORNADA */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                    <h2 className="text-xl font-semibold border-b pb-2">Planificar Nuevo Operativo</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tasa BCV del Día (Bs)</label>
                            <input 
                                type="number" step="0.01" required
                                value={formData.tasa_bcv_dia}
                                onChange={(e) => setFormData({...formData, tasa_bcv_dia: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apertura (Inicio de recepción)</label>
                            <input 
                                type="datetime-local" required
                                value={formData.fecha_apertura}
                                onChange={(e) => setFormData({...formData, fecha_apertura: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cierre de Pagos</label>
                            <input 
                                type="datetime-local" required
                                value={formData.fecha_cierre_pagos}
                                onChange={(e) => setFormData({...formData, fecha_cierre_pagos: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* SECCIÓN DE LOTES (BOMBONAS) */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-800">Bombonas disponibles en este operativo</h3>
                            <button type="button" onClick={handleAddLote} className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                                + Agregar Lote
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.lotes.map((lote, index) => (
                                <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end">
                                    <div className="w-full md:w-1/4">
                                        <label className="block text-xs text-gray-500 mb-1">Capacidad</label>
                                        <select 
                                            value={lote.capacidad}
                                            onChange={(e) => handleLoteChange(index, 'capacidad', e.target.value)}
                                            className="w-full border border-gray-300 rounded p-2 text-sm"
                                        >
                                            <option value="10kg">10 kg</option>
                                            <option value="18kg">18 kg</option>
                                            <option value="43kg">43 kg</option>
                                        </select>
                                    </div>
                                    <div className="w-full md:w-1/4">
                                        <label className="block text-xs text-gray-500 mb-1">Marca</label>
                                        <select 
                                            value={lote.marca}
                                            onChange={(e) => handleLoteChange(index, 'marca', e.target.value)}
                                            className="w-full border border-gray-300 rounded p-2 text-sm"
                                        >
                                            <option value="Bolívar Gas">Bolívar Gas</option>
                                            <option value="PDVSA">PDVSA</option>
                                            <option value="Tigasco">Tigasco</option>
                                        </select>
                                    </div>
                                    <div className="w-full md:w-1/4">
                                        <label className="block text-xs text-gray-500 mb-1">Precio (USD)</label>
                                        <input 
                                            type="number" step="0.1" required
                                            value={lote.precio_usd}
                                            onChange={(e) => handleLoteChange(index, 'precio_usd', e.target.value)}
                                            className="w-full border border-gray-300 rounded p-2 text-sm"
                                            placeholder="Ej: 1.50"
                                        />
                                    </div>
                                    <div className="w-full md:w-1/4 pb-1">
                                        {formData.lotes.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveLote(index)} className="text-red-600 hover:text-red-800 text-sm font-semibold">
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold">
                            Guardar y Abrir Jornada
                        </button>
                    </div>
                </form>
            )}

            {/* LISTA DE JORNADAS EXISTENTES */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha / Estatus</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa BCV</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lotes (Bombonas)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {jornadas.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No hay jornadas registradas.</td>
                            </tr>
                        ) : (
                            jornadas.map((jornada) => (
                                <tr key={jornada.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {new Date(jornada.fecha_apertura).toLocaleDateString()}
                                        </div>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${jornada.estado === 'abierta' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {jornada.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {jornada.tasa_bcv_dia} Bs
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <ul className="list-disc pl-4">
                                            {jornada.lotes?.map(lote => (
                                                <li key={lote.id}>{lote.capacidad} {lote.marca} (${lote.precio_usd})</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900">Ver Detalles</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}