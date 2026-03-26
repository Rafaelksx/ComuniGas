'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axios';
import { toast } from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function ComunidadesPage() {
    const [comunidades, setComunidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newNombre, setNewNombre] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState(null);

    useEffect(() => {
        fetchComunidades();
    }, []);

    const fetchComunidades = async () => {
        try {
            const res = await axiosClient.get('/superadmin/comunidades');
            setComunidades(res.data);
        } catch (error) {
            console.error('Error cargando comunidades', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axiosClient.put(`/superadmin/comunidades/${editingId}`, { nombre: newNombre });
            } else {
                await axiosClient.post('/superadmin/comunidades', { nombre: newNombre });
            }
            setIsModalOpen(false);
            setNewNombre('');
            setEditingId(null);
            fetchComunidades();
            toast.success(editingId ? 'Urbanización actualizada.' : 'Urbanización registrada.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al guardar. Verifica que el nombre no esté repetido.');
        }
    };

    const handleDelete = (id) => {
        setConfirmConfig({
            title: 'Eliminar Comunidad',
            message: '¿Seguro de que deseas eliminar esta comunidad permanentemente? Perderás su registro.',
            isDestructive: true,
            confirmText: 'Eliminar',
            action: async () => {
                try {
                    await axiosClient.delete(`/superadmin/comunidades/${id}`);
                    fetchComunidades();
                    toast.success('Comunidad borrada permanentemente.');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Error al eliminar.');
                } finally {
                    setConfirmConfig(null);
                }
            }
        });
    };

    const openEdit = (comunidad) => {
        setEditingId(comunidad.id);
        setNewNombre(comunidad.nombre);
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setEditingId(null);
        setNewNombre('');
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        Gestor de Comunidades
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Administra los sectores que usan la plataforma</p>
                </div>
                <button 
                    onClick={openCreate}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-semibold shadow-sm flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Nueva Comunidad
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre del Sector</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Vecinos</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Jornadas Históricas</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {comunidades.map(comunidad => (
                                <tr key={comunidad.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">#{comunidad.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{comunidad.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                                        <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-bold">{comunidad.usuarios_count}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                                        <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs font-bold">{comunidad.jornadas_count}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => openEdit(comunidad)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        </button>
                                        {(comunidad.usuarios_count === 0 && comunidad.jornadas_count === 0) ? (
                                            <button onClick={() => handleDelete(comunidad.id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic px-2">En uso</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {comunidades.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Ninguna comunidad registrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                        <form onSubmit={handleSave}>
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Editar Comunidad' : 'Registrar Nueva Comunidad'}</h3>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Sector / Urbanización</label>
                                <input 
                                    type="text" 
                                    value={newNombre}
                                    onChange={(e) => setNewNombre(e.target.value)}
                                    className="w-full border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-gray-50"
                                    placeholder="Ej. Urbanización Las Margaritas"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-lg transition">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition">
                                    {editingId ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={!!confirmConfig}
                title={confirmConfig?.title}
                message={confirmConfig?.message}
                isDestructive={confirmConfig?.isDestructive}
                confirmText={confirmConfig?.confirmText}
                cancelText="Cancelar"
                onConfirm={confirmConfig?.action}
                onCancel={() => setConfirmConfig(null)}
            />
        </div>
    );
}
