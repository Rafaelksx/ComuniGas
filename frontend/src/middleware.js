import { NextResponse } from 'next/server';

export function middleware(request) {
    // Obtenemos el token de las cookies (Nota: para que funcione en Middleware, 
    // lo ideal es guardarlo en Cookies, no solo en LocalStorage)
    const token = request.cookies.get('auth_token')?.value;

    const { pathname } = request.nextUrl;

    // 1. Si el usuario intenta ir al dashboard sin token -> Al login
    if (pathname.startsWith('/dashboard') && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Si el usuario ya está logueado e intenta ir al login -> Al dashboard
    if (pathname.startsWith('/login') && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Configuramos qué rutas debe vigilar el middleware
export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};