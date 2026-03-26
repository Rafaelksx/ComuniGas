'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Sidebar({ user, closeSidebar }) {
    const router = useRouter();
    const pathname = usePathname(); // Para saber en qué ruta estamos

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        Cookies.remove('auth_token');
        router.push('/login');
    };

    const isCoordinador = user?.rol === 'admin_comunidad';

    // Objeto de configuración de rutas con SVGs
    const menuItems = {
        admin_comunidad: [
            { name: 'Resumen', path: '/dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> },
            { name: 'Jornadas', path: '/dashboard/jornadas', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> },
            { name: 'Revisión de Pagos', path: '/dashboard/pedidos', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
        ],
        vecino: [
            { name: 'Inicio', path: '/dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> },
            { name: 'Pedir Gas', path: '/dashboard/pedidos/nuevo', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg> },
            { name: 'Mis Pedidos', path: '/dashboard/pedidos', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg> },
        ]
    };

    const currentMenu = isCoordinador ? menuItems.admin_comunidad : menuItems.vecino;

    return (
        <aside className="w-64 bg-blue-900 text-white flex flex-col shrink-0 min-h-screen">
            <div className="p-6 border-b border-blue-800 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">ComuniGas</h2>
                    <p className="text-sm text-blue-300 mt-1 truncate">{user?.name}</p>
                    <span className={`text-xs px-2 py-1 rounded-full mt-3 inline-block font-semibold tracking-wide ${isCoordinador ? 'bg-indigo-600 text-white' : 'bg-blue-700 text-blue-100'}`}>
                        {isCoordinador ? 'COORDINADOR' : 'VECINO'}
                    </span>
                </div>
                <button 
                    onClick={closeSidebar} 
                    className="md:hidden p-1 text-blue-300 hover:text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {currentMenu.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => { if(closeSidebar) closeSidebar(); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-800 font-semibold shadow-inner text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                                }`}
                        >
                            <span className="opacity-80">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

        <div className="p-4 border-t border-blue-800">
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-300 hover:bg-red-500 hover:text-white rounded-lg transition-colors flex items-center gap-3 font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}