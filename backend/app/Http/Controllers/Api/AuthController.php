<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'telefono' => 'required|string|unique:users,telefono',
            'password' => 'required|string|min:6',
            'comunidad_id' => 'required|exists:comunidades,id',
            'identificador_vivienda' => 'required|string|max:50',
        ]);

        $user = \App\Models\User::create([
            'name' => $request->name,
            'telefono' => $request->telefono,
            'email' => $request->telefono . '@comunigas.local',
            'password' => $request->password, // El modelo lo encripta automáticamente
            'rol' => 'vecino', // Forzamos a que todo el que se registre sea vecino
            'comunidad_id' => $request->comunidad_id,
            'identificador_vivienda' => $request->identificador_vivienda,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'telefono' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('telefono', $request->telefono)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'El teléfono o la contraseña son incorrectos.'
            ], 401);
        }

        // Creamos el token de acceso
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rol' => $user->rol,
                'comunidad_id' => $user->comunidad_id,
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'telefono' => 'required|string|unique:users,telefono,' . $user->id,
            'identificador_vivienda' => 'required|string|max:50',
            'comunidad_id' => 'nullable|exists:comunidades,id',
            'password' => 'nullable|string|min:6'
        ]);

        $user->name = $request->name;
        $user->telefono = $request->telefono;
        $user->identificador_vivienda = $request->identificador_vivienda;
        
        // Solo un vecino ordinario puede mudarse libremente de comunidad. Los coordinadores deben ser trasladados por el SuperAdmin.
        if ($user->rol === 'vecino' && $request->filled('comunidad_id')) {
            $user->comunidad_id = $request->comunidad_id;
        }

        if ($request->filled('password')) {
            $user->password = $request->password;
        }

        $user->save();

        return response()->json([
            'message' => 'Tus datos se actualizaron correctamente.',
            'user' => $user
        ]);
    }
}