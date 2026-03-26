<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class VecinoController extends Controller
{
    // Lista todos los vecinos de la comunidad del Admin
    public function index(Request $request)
    {
        $user = $request->user();
        
        $vecinos = User::where('comunidad_id', $user->comunidad_id)
            ->where('rol', 'vecino')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($vecinos);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'identificador_vivienda' => 'required|string|max:50',
        ]);

        $vecino = User::where('id', $id)->where('comunidad_id', $request->user()->comunidad_id)->firstOrFail();
        $vecino->identificador_vivienda = $request->identificador_vivienda;
        $vecino->save();

        return response()->json([
            'message' => 'Vivienda actualizada correctamente.',
            'vecino' => $vecino
        ]);
    }
}