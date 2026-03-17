'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosClient from '@/lib/axios';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar si hay token y traer los datos del usuario
        const fetchUser = async () => {
            try {
                const response = await axiosClient.get('/user');
                setUser(response.data);
            } catch (error) {
                console.error('Error de autenticación:', error);
                localStorage.removeItem('auth_token');
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        router.push('/login');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Cargando tu sesión...</div>;
    }

    // Menú dinámico dependiendo del rol
    const isAdmin = user?.rol === 'admin_comunidad';

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar (Menú Lateral) */}
            <aside className="w-64 bg-blue-900 text-white flex flex-col">
                <div className="p-6 border-b border-blue-800">
                    <h2 className="text-2xl font-bold">ComuniGas</h2>
                    <p className="text-sm text-blue-300 mt-1">{user?.name}</p>
                    <span className="text-xs bg-blue-700 px-2 py-1 rounded-full mt-2 inline-block">
                        {isAdmin ? 'Coordinador' : 'Vecino'}
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-blue-800 transition">
                        Inicio
                    </Link>
                    
                    {isAdmin ? (
                        <>
                            <Link href="/dashboard/jornadas" className="block px-4 py-2 rounded hover:bg-blue-800 transition">
                                Gestión de Jornadas
                            </Link>
                            <Link href="/dashboard/pedidos" className="block px-4 py-2 rounded hover:bg-blue-800 transition">
                                Revisión de Pagos
                            </Link>
                            <Link href="/dashboard/vecinos" className="block px-4 py-2 rounded hover:bg-blue-800 transition">
                                Censo de Vecinos
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard/pedidos/nuevo" className="block px-4 py-2 rounded hover:bg-blue-800 transition">
                                Solicitar Gas
                            </Link>
                            <Link href="/dashboard/pedidos" className="block px-4 py-2 rounded hover:bg-blue-800 transition">
                                Mis Pedidos
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-blue-800">
                    <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-300 hover:bg-blue-800 rounded transition"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}