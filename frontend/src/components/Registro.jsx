'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import axiosClient from '@/lib/axios';
import Cookies from 'js-cookie';

export default function Registro() {
    const router = useRouter();
    const [comunidades, setComunidades] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        telefono: '',
        password: '',
        comunidad_id: '',
        identificador_vivienda: ''
    });

    useEffect(() => {
        // Cargar las comunidades para el select
        axiosClient.get('/comunidades')
            .then(res => setComunidades(res.data))
            .catch(err => console.error("Error cargando comunidades:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosClient.post('/register', formData);
            
            // Guardar el token en localStorage y cookie (para middleware)
            const token = res.data.access_token;
            localStorage.setItem('auth_token', token);
            Cookies.set('auth_token', token, { 
                expires: 7, 
                path: '/',
                sameSite: 'lax',
                secure: false 
            });

            router.push('/dashboard');
            
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al registrar. Verifica los datos.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Únete a ComuniGas
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    O <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">inicia sesión si ya tienes cuenta</Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input 
                                type="text" required 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono (Ej: 04141234567)</label>
                            <input 
                                type="text" required 
                                value={formData.telefono}
                                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Comunidad</label>
                            <select 
                                required
                                value={formData.comunidad_id}
                                onChange={(e) => setFormData({...formData, comunidad_id: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">Selecciona tu comunidad...</option>
                                {comunidades.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre} ({c.direccion})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nro. de Casa / Manzana</label>
                            <input 
                                type="text" required placeholder="Ej: M1-C15"
                                value={formData.identificador_vivienda}
                                onChange={(e) => setFormData({...formData, identificador_vivienda: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input 
                                type="password" required minLength="6"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" 
                            />
                        </div>

                        <div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-all"
                            >
                                {loading ? 'Registrando...' : 'Crear Cuenta'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
