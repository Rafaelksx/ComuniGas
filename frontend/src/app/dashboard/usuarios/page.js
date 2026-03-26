'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axios';
import { toast } from 'react-hot-toast';

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [comunidades, setComunidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [edits, setEdits] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usRes, comRes] = await Promise.all([
                axiosClient.get('/superadmin/usuarios'),
                axiosClient.get('/comunidades')
            ]);
            setUsuarios(usRes.data);
            setComunidades(comRes.data);
            
            // Inicializar estados temporales
            const tempEdits = {};
            usRes.data.forEach(u => {
                tempEdits[u.id] = { rol: u.rol, comunidad_id: u.comunidad_id || (comRes.data.length > 0 ? comRes.data[0].id : '') };
            });
            setEdits(tempEdits);
        } catch (error) {
            console.error('Error cargando datos maestros', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (userId, field, value) => {
        setEdits(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value
            }
        }));
    };

    const handleGuardar = async (userId) => {
        const data = edits[userId];
        try {
            await axiosClient.patch(`/superadmin/usuarios/${userId}/rol`, data);
            toast.success('¡Nombramiento oficializado exitosamente!');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error de conexión. Intente de nuevo.');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando base de datos de usuarios...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Censo Nacional (Usuarios y Coordinadores)</h1>
                    <p className="text-gray-500 text-sm mt-1">Nombra nuevos voceros o reasígnalos de urbanización en el sistema</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vecino</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider bg-yellow-50">Investidura Actual</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-800 uppercase tracking-wider bg-indigo-50">Asignar Cargo (Rol)</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-800 uppercase tracking-wider bg-indigo-50">Comunidad Cargo</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-indigo-800 uppercase tracking-wider bg-indigo-50">Aprobar</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usuarios.map(u => {
                                const localEdit = edits[u.id] || { rol: 'vecino', comunidad_id: '' };
                                const isDirty = localEdit.rol !== u.rol || String(localEdit.comunidad_id) !== String(u.comunidad_id);

                                return (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{u.name}</div>
                                            <div className="text-xs text-gray-500 font-mono mt-0.5">Casa: {u.identificador_vivienda}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-800">{u.email}</div>
                                            {u.telefono && <div className="text-xs text-gray-500 mt-0.5">{u.telefono}</div>}
                                        </td>
                                        <td className="px-6 py-4 bg-yellow-50/30">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${u.rol === 'admin_comunidad' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                {u.rol === 'admin_comunidad' ? 'Coordinador' : 'Vecino'}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-2 truncate max-w-[120px]" title={u.comunidad?.nombre}>
                                                {u.comunidad?.nombre || 'Sin Sector'}
                                            </p>
                                        </td>
                                        
                                        {/* ZONA DE EDICIÓN */}
                                        <td className="px-6 py-4 bg-indigo-50/10">
                                            <select 
                                                value={localEdit.rol}
                                                onChange={(e) => handleEditChange(u.id, 'rol', e.target.value)}
                                                className="block w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-white text-gray-900"
                                            >
                                                <option value="vecino">Vecino Nativo</option>
                                                <option value="admin_comunidad">Ascender a Coordinador</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 bg-indigo-50/10">
                                            <select 
                                                value={localEdit.comunidad_id}
                                                onChange={(e) => handleEditChange(u.id, 'comunidad_id', e.target.value)}
                                                className="block w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-white text-gray-900"
                                            >
                                                {comunidades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 bg-indigo-50/10 text-center">
                                            <button 
                                                onClick={() => handleGuardar(u.id)}
                                                disabled={!isDirty}
                                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm
                                                    ${isDirty 
                                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white scale-100 opacity-100' 
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed scale-95 opacity-50'
                                                    }
                                                `}
                                            >
                                                Confirmar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
