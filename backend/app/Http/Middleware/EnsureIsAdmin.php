<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAdmin
{
    /**
     * Permite el acceso solo si el usuario autenticado tiene
     * rol de 'admin_comunidad' o 'superadmin'.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->rol, ['admin_comunidad', 'superadmin'])) {
            return response()->json([
                'message' => 'No tienes permiso para realizar esta acción.'
            ], 403);
        }

        return $next($request);
    }
}
