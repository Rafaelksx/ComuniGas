'use client';

import { useState } from 'react';
import axiosClient from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function LoginPage() {
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log("Intentando login para:", telefono);

        try {
            // 1. Petición al backend
            const response = await axiosClient.post('/login', { 
                telefono: telefono, 
                password: password 
            });

            console.log("Respuesta del servidor:", response.data);

            // 2. Extraer el token (Verificamos que exista en la respuesta)
            const token = response.data.access_token;

            if (!token) {
                console.error("El backend no envió 'access_token'");
                setError('Error interno: El servidor no generó el token de acceso.');
                setLoading(false);
                return;
            }

            // 3. Guardar el token de forma segura
            // LocalStorage para las peticiones de Axios
            localStorage.setItem('auth_token', token);

            // Cookie para el Middleware de Next.js (Crucial para proteger rutas)
            Cookies.set('auth_token', token, { 
                expires: 7, 
                path: '/',
                sameSite: 'lax',
                secure: false // En localhost debe ser false si no tienes SSL/HTTPS
            });

            console.log("Token guardado correctamente. Redirigiendo...");

            // 4. Redirigir al dashboard
            router.push('/dashboard');
            
        } catch (err) {
            setLoading(false);
            console.error("Error capturado en el login:", err);
            
            if (err.response) {
                // El servidor respondió con error (401, 422, 500)
                setError(err.response.data.message || 'Credenciales incorrectas o error en el servidor.');
            } else {
                // Error de red (Backend apagado o CORS)
                setError('No se pudo conectar con el backend. ¿Está encendido el contenedor de Docker?');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-blue-600">ComuniGas</h2>
                    <p className="text-gray-500 mt-2 text-sm font-medium">Sistema de Gestión de Cilindros</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-md">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Número de Teléfono
                        </label>
                        <input 
                            type="text" 
                            required
                            autoComplete="username"
                            className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                            placeholder="Ej: 04141234567"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input 
                            type="password" 
                            required
                            autoComplete="current-password"
                            className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 rounded-xl shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Procesando...' : 'Entrar ahora'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-600 mb-4">
                        ¿No tienes cuenta? <Link href="/registro" className="text-blue-600 hover:underline font-semibold">Regístrate aquí</Link>
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        Puerto Ordaz • Guayana
                    </p>
                </div>
            </div>
        </div>
    );
}