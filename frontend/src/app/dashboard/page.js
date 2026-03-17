'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/lib/axios';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Intentamos obtener los datos del usuario usando el token guardado
        axiosClient.get('/user')
            .then(response => {
                setUser(response.data);
            })
            .catch(() => {
                // Si el token es inválido o no existe, al login de vuelta
                localStorage.removeItem('auth_token');
                router.push('/login');
            });
    }, [router]);

    if (!user) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
                <button 
                    onClick={() => {
                        localStorage.removeItem('auth_token');
                        router.push('/login');
                    }}
                    className="text-red-500 font-medium"
                >
                    Cerrar Sesión
                </button>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold">Bienvenido, {user.name}</h2>
                <p className="text-gray-600">Rol: <span className="capitalize">{user.rol}</span></p>
                <p className="text-gray-600">Vivienda: {user.identificador_vivienda || 'No asignada'}</p>
            </div>

            {/* Aquí es donde luego pondremos los botones de "Hacer Pedido" o "Gestionar Jornada" */}
        </div>
    );
}