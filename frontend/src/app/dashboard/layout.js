'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/lib/axios';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
            {/* Overlay para móviles */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/60 z-30 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Responsive */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar user={user} closeSidebar={() => setIsSidebarOpen(false)} />
            </div>

            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Navbar móvil */}
                <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden shrink-0 z-20 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <h1 className="text-xl font-bold text-blue-900 tracking-tight">ComuniGas</h1>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}