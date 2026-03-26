<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comunidad;
use Illuminate\Http\Request;

class ComunidadController extends Controller
{
    private function checkSuperAdmin($user)
    {
        if (!$user || $user->rol !== 'superadmin') {
            abort(403, 'Acceso denegado. Se requiere nivel Dios.');
        }
    }

    public function index(Request $request)
    {
        $this->checkSuperAdmin($request->user());
        
        // Carga la lista con la cantidad de usuarios y de jornadas por comunidad
        $comunidades = Comunidad::withCount(['usuarios', 'jornadas'])
            ->orderBy('id', 'desc')
            ->get();
            
        return response()->json($comunidades);
    }

    public function store(Request $request)
    {
        $this->checkSuperAdmin($request->user());

        $request->validate([
            'nombre' => 'required|string|max:255|unique:comunidades,nombre'
        ]);

        $comunidad = Comunidad::create([
            'nombre' => $request->nombre
        ]);

        return response()->json($comunidad, 201);
    }

    public function update(Request $request, $id)
    {
        $this->checkSuperAdmin($request->user());

        $comunidad = Comunidad::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:255|unique:comunidades,nombre,' . $id
        ]);

        $comunidad->update([
            'nombre' => $request->nombre
        ]);

        return response()->json($comunidad);
    }

    public function destroy(Request $request, $id)
    {
        $this->checkSuperAdmin($request->user());

        $comunidad = Comunidad::findOrFail($id);

        if ($comunidad->usuarios()->count() > 0 || $comunidad->jornadas()->count() > 0) {
            return response()->json([
                'message' => 'Intento fallido: La comunidad tiene vecinos o jornadas activas vinculadas.'
            ], 400);
        }

        $comunidad->delete();

        return response()->json(['message' => 'Comunidad fulminada exitosamente.']);
    }
}
