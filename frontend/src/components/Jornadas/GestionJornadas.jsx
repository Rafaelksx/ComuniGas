'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axios';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';

export default function GestionJornadas() {
    const [jornadas, setJornadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Estado para el modal/formulario de nueva jornada
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        tasa_bcv_dia: '',
        fecha_apertura: '',
        fecha_cierre_pagos: '',
        pago_movil_banco: '',
        pago_movil_telefono: '',
        pago_movil_cedula: '',
        pago_movil_nombre: '',
        lotes: [{ capacidad: '10kg', marca: 'Bolívar Gas', precio_usd: '' }]
    });

    const [confirmConfig, setConfirmConfig] = useState(null);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                tasa_bcv_dia: formData.tasa_bcv_dia,
                fecha_apertura: formData.fecha_apertura.replace('T', ' ') + ':00',
                fecha_cierre_pagos: formData.fecha_cierre_pagos.replace('T', ' ') + ':00',
                pago_movil_banco: formData.pago_movil_banco || null,
                pago_movil_telefono: formData.pago_movil_telefono || null,
                pago_movil_cedula: formData.pago_movil_cedula || null,
                pago_movil_nombre: formData.pago_movil_nombre || null,
            };

            if (editId) {
                // Editar
                const response = await axiosClient.put(`/jornadas/${editId}`, payload);
                setJornadas(jornadas.map(j => j.id === editId ? response.data.jornada : j));
                toast.success('¡Jornada actualizada con éxito!');
            } else {
                // Crear
                payload.comunidad_id = user.comunidad_id;
                payload.lotes = formData.lotes;
                const response = await axiosClient.post('/jornadas', payload);
                setJornadas([response.data.jornada, ...jornadas]);
                toast.success('¡Jornada creada con éxito!');
            }

            setShowForm(false);
            setEditId(null);
            setFormData({
                tasa_bcv_dia: '',
                fecha_apertura: '',
                fecha_cierre_pagos: '',
                pago_movil_banco: '',
                pago_movil_telefono: '',
                pago_movil_cedula: '',
                pago_movil_nombre: '',
                lotes: [{ capacidad: '10kg', marca: 'Bolívar Gas', precio_usd: '' }]
            });
        } catch (error) {
            console.error('Error guardando jornada:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Ocurrió un error al guardar la jornada.');
        }
    };

    const handleEdit = (jornada) => {
        setEditId(jornada.id);
        const formatD = (d) => d ? d.replace(' ', 'T').substring(0, 16) : '';
        setFormData({
            tasa_bcv_dia: jornada.tasa_bcv_dia,
            fecha_apertura: formatD(jornada.fecha_apertura),
            fecha_cierre_pagos: formatD(jornada.fecha_cierre_pagos),
            pago_movil_banco: jornada.pago_movil_banco || '',
            pago_movil_telefono: jornada.pago_movil_telefono || '',
            pago_movil_cedula: jornada.pago_movil_cedula || '',
            pago_movil_nombre: jornada.pago_movil_nombre || '',
            lotes: jornada.lotes || []
        });
        setShowForm(true);
    };

    const handleDelete = (id) => {
        setConfirmConfig({
            title: 'Eliminar Jornada',
            message: '¿Seguro que deseas eliminar esta jornada? Esta acción no se puede deshacer.',
            isDestructive: true,
            confirmText: 'Eliminar',
            action: async () => {
                try {
                    await axiosClient.delete(`/jornadas/${id}`);
                    setJornadas(prev => prev.filter(j => j.id !== id));
                    toast.success('Jornada eliminada.');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Error al eliminar la jornada.');
                } finally {
                    setConfirmConfig(null);
                }
            }
        });
    };

    const handleCancelJornada = (id) => {
        setConfirmConfig({
            title: 'Cancelar Jornada',
            message: '¿Seguro que deseas cancelar esta jornada? Los pedidos registrados se mantendrán para futuras referencias.',
            isDestructive: true,
            confirmText: 'Sí, cancelar',
            action: async () => {
                try {
                    const res = await axiosClient.patch(`/jornadas/${id}/estatus`, { estado: 'cancelada' });
                    setJornadas(prev => prev.map(j => j.id === id ? res.data.jornada : j));
                    toast.success('Jornada cancelada.');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Error al cancelar la jornada.');
                } finally {
                    setConfirmConfig(null);
                }
            }
        });
    };

    const handleAvanzarEtapa = (jornada) => {
        const flujo = {
            'abierta': 'en_proceso',
            'en_proceso': 'finalizada'
        };
        const mensajes = {
            'abierta': '¿Cerrar recepción de pagos y pasar a En Proceso?\n\n(Los vecinos ya no podrán hacer pedidos, y podrás empezar a controlar qué cilindros han sido despachados)',
            'en_proceso': '¿Finalizar el operativo completamente?\n\n(Asegúrate de haber despachado todos los cilindros primero)'
        };

        const siguienteEstado = flujo[jornada.estado];
        if (!siguienteEstado) return;

        setConfirmConfig({
            title: 'Avanzar Etapa',
            message: mensajes[jornada.estado],
            isDestructive: false,
            confirmText: 'Continuar',
            action: async () => {
                try {
                    const res = await axiosClient.patch(`/jornadas/${jornada.id}/estatus`, { estado: siguienteEstado });
                    setJornadas(prev => prev.map(j => j.id === jornada.id ? res.data.jornada : j));
                    toast.success(`Jornada avanzada a: ${siguienteEstado.replace('_', ' ')}`);
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Error al actualizar el estado.');
                } finally {
                    setConfirmConfig(null);
                }
            }
        });
    };

    if (loading) return <div className="p-8">Cargando gestión de jornadas...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Jornadas</h1>
                <button
                    onClick={() => {
                        if (showForm) setEditId(null);
                        setShowForm(!showForm);
                        if (!showForm && editId === null) {
                            setFormData({ tasa_bcv_dia: '', fecha_apertura: '', fecha_cierre_pagos: '', lotes: [{ capacidad: '10kg', marca: 'Bolívar Gas', precio_usd: '' }]});
                        }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                    {showForm ? 'Cancelar' : '+ Nueva Jornada'}
                </button>
            </div>

    {/* FORMULARIO */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                        {editId ? 'Editar Operativo' : 'Planificar Nuevo Operativo'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tasa BCV del Día (Bs)</label>
                            <input
                                type="number" step="0.01" required
                                value={formData.tasa_bcv_dia}
                                onChange={(e) => setFormData({ ...formData, tasa_bcv_dia: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apertura (Inicio de recepción)</label>
                            <input
                                type="datetime-local" required
                                value={formData.fecha_apertura}
                                onChange={(e) => setFormData({ ...formData, fecha_apertura: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cierre de Pagos</label>
                            <input
                                type="datetime-local" required
                                value={formData.fecha_cierre_pagos}
                                onChange={(e) => setFormData({ ...formData, fecha_cierre_pagos: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            />
                        </div>
                    </div>

                    {/* LOTES */}
                    {!editId && (
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
                                                className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900"
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
                                                className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900"
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
                                                className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 placeholder-gray-400"
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
                    )}

                    {/* DATOS DE PAGO MÓVIL */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg> 
                            Datos de Pago Móvil (para los vecinos)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Banco receptor</label>
                                <input type="text" placeholder="Ej: Banco de Venezuela"
                                    value={formData.pago_movil_banco}
                                    onChange={(e) => setFormData({ ...formData, pago_movil_banco: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono receptor</label>
                                <input type="tel" placeholder="Ej: 04141234567"
                                    value={formData.pago_movil_telefono}
                                    onChange={(e) => setFormData({ ...formData, pago_movil_telefono: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula del titular</label>
                                <input type="text" placeholder="Ej: V-12345678"
                                    value={formData.pago_movil_cedula}
                                    onChange={(e) => setFormData({ ...formData, pago_movil_cedula: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del titular</label>
                                <input type="text" placeholder="Ej: María González"
                                    value={formData.pago_movil_nombre}
                                    onChange={(e) => setFormData({ ...formData, pago_movil_nombre: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold">
                            {editId ? 'Guardar Cambios' : 'Guardar y Abrir Jornada'}
                        </button>
                    </div>
                </form>
            )}

            {/* TABLA DE JORNADAS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
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
                                    <td className="px-6 py-4 text-sm font-medium space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleEdit(jornada)} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded">
                                            Editar
                                        </button>
                                        
                                        {jornada.estado === 'abierta' && (
                                            <button onClick={() => handleAvanzarEtapa(jornada)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded">
                                                Cerrar Recepción
                                            </button>
                                        )}
                                        {jornada.estado === 'en_proceso' && (
                                            <button onClick={() => handleAvanzarEtapa(jornada)} className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded">
                                                Finalizar Jornada
                                            </button>
                                        )}

                                        {jornada.estado !== 'cancelada' && jornada.estado !== 'finalizada' && (
                                            <button onClick={() => handleCancelJornada(jornada.id)} className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 px-2 py-1 rounded">
                                                Cancelar
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(jornada.id)} className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            <ConfirmModal 
                isOpen={!!confirmConfig}
                title={confirmConfig?.title}
                message={confirmConfig?.message}
                isDestructive={confirmConfig?.isDestructive}
                confirmText={confirmConfig?.confirmText}
                cancelText="Cerrar ventana"
                onConfirm={confirmConfig?.action}
                onCancel={() => setConfirmConfig(null)}
            />
        </div>
    );
}