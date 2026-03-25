'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Sidebar({ user }) {
    const router = useRouter();
    const pathname = usePathname(); // Para saber en qué ruta estamos

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        Cookies.remove('auth_token');
        router.push('/login');
    };

    const isCoordinador = user?.rol === 'admin_comunidad';

    // Objeto de configuración de rutas
    const menuItems = {
        admin_comunidad: [
            { name: 'Resumen', icon: '', path: '/dashboard' },
            { name: 'Jornadas', icon: '', path: '/dashboard/jornadas' },
            { name: 'Revisión de Pagos', icon: '', path: '/dashboard/pedidos' },
            { name: 'Censo', icon: '', path: '/dashboard/vecinos' },
        ],
        vecino: [
            { name: 'Inicio', icon: '', path: '/dashboard' },
            { name: 'Pedir Gas', icon: '', path: '/dashboard/pedidos/nuevo' },
            { name: 'Mis Pedidos', icon: '', path: '/dashboard/pedidos' },
        ]
    };

    const currentMenu = isCoordinador ? menuItems.admin_comunidad : menuItems.vecino;

    return (
        <aside className="w-64 bg-blue-900 text-white flex flex-col">
            <div className="p-6 border-b border-blue-800">
                <h2 className="text-2xl font-bold">ComuniGas</h2>
                <p className="text-sm text-blue-300 mt-1">{user?.name}</p>
                <span className="text-xs bg-blue-700 px-2 py-1 rounded-full mt-2 inline-block">
                    {isCoordinador ? 'Coordinador' : 'Vecino'}
                </span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {currentMenu.map((item) => {
                    const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/dashboard');
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-2 rounded transition ${isActive ? 'bg-blue-800 font-semibold border-l-4 border-blue-400' : 'hover:bg-blue-800 border-l-4 border-transparent'
                                }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-blue-800">
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-300 hover:bg-blue-800 rounded transition flex items-center gap-3"
                >
                    <span>🚪</span> Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}