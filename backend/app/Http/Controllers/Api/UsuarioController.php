<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
    private function checkSuperAdmin($user)
    {
        if (!$user || $user->rol !== 'superadmin') {
            abort(403, 'Acceso denegado.');
        }
    }

    public function index(Request $request)
    {
        $this->checkSuperAdmin($request->user());

        // Obtener todos los usuarios indicando su comunidad (Excluimos otros superadmins si hubieran)
        $usuarios = User::with('comunidad')
            ->where('rol', '!=', 'superadmin')
            ->orderBy('id', 'desc')
            ->get();
            
        return response()->json($usuarios);
    }

    public function asignarRol(Request $request, $id)
    {
        $this->checkSuperAdmin($request->user());

        $usuario = User::findOrFail($id);

        // Seguridad
        if ($usuario->rol === 'superadmin') {
            return response()->json(['message' => 'Los superadministradores son sagrados.'], 403);
        }

        $request->validate([
            'rol' => 'required|in:vecino,admin_comunidad',
            'comunidad_id' => 'required|exists:comunidades,id'
        ]);

        $usuario->rol = $request->rol;
        $usuario->comunidad_id = $request->comunidad_id;
        $usuario->save();

        return response()->json([
            'message' => 'Vecino investido exitosamente.',
            'usuario' => $usuario->load('comunidad')
        ]);
    }
}
