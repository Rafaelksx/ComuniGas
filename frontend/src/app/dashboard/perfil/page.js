'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axios';
import { toast } from 'react-hot-toast';

export default function PerfilPage() {
    const [user, setUser] = useState(null);
    const [comunidades, setComunidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        telefono: '',
        identificador_vivienda: '',
        comunidad_id: '',
        password: ''
    });

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const [usrRes, comRes] = await Promise.all([
                    axiosClient.get('/user'),
                    axiosClient.get('/comunidades')
                ]);
                
                const u = usrRes.data;
                setUser(u);
                setFormData({
                    name: u.name || '',
                    telefono: u.telefono || '',
                    identificador_vivienda: u.identificador_vivienda || '',
                    comunidad_id: u.comunidad_id || '',
                    password: ''
                });
                setComunidades(comRes.data);
            } catch (error) {
                console.error('Error cargando perfil', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const dataToSubmit = { ...formData };
            if (!dataToSubmit.password) delete dataToSubmit.password;
            
            const res = await axiosClient.put('/user', dataToSubmit);
            toast.success(res.data.message || 'Perfil actualizado exitosamente.');
            setUser(res.data.user);
            setFormData(prev => ({ ...prev, password: '' })); // Limpia el campo por seguridad visual
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al actualizar el perfil.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando perfil...</div>;

    const isVecino = user?.rol === 'vecino';

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
                    <p className="text-gray-500 text-sm mt-1">Configuración de tu cuenta y residencia</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 sm:p-8 space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                            <input 
                                type="text" name="name" value={formData.name} onChange={handleChange} required
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Número de Teléfono</label>
                            <input 
                                type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Identificador de Vivienda</label>
                            <input 
                                type="text" name="identificador_vivienda" value={formData.identificador_vivienda} onChange={handleChange} required
                                placeholder="Ej: Manzana 4, Casa 12"
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex justify-between">
                                Comunidad o Sector
                                {!isVecino && <span className="text-xs text-orange-500 font-normal mt-0.5">Solo reasignable por SuperAdmin</span>}
                            </label>
                            <select 
                                name="comunidad_id" 
                                value={formData.comunidad_id} 
                                onChange={handleChange}
                                disabled={!isVecino}
                                className={`w-full border border-gray-300 rounded-xl p-3 shadow-sm bg-white text-gray-900 ${!isVecino ? 'opacity-70 cursor-not-allowed bg-gray-50' : 'focus:ring-2 focus:ring-blue-500'}`}
                            >
                                <option value="">-- Selecciona una comunidad --</option>
                                {comunidades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Cambiar Contraseña (Opcional)</label>
                        <p className="text-xs text-gray-500 mb-3">Déjalo en blanco si deseas conservar tu contraseña actual.</p>
                        <input 
                            type="password" name="password" value={formData.password} onChange={handleChange} minLength={6}
                            placeholder="Nueva contraseña secreta..."
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 shadow-sm md:w-1/2"
                        />
                    </div>

                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {submitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}
