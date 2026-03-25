'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/lib/axios';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Cargando sistema...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Componente extraído */}
            <Sidebar user={user} />

            {/* Contenido Principal */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}