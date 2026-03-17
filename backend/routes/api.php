<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Ruta pública para el Login (aquí es donde Next.js enviará las credenciales)
Route::post('/login', [AuthController::class, 'login']);

// Grupo de rutas protegidas (Solo usuarios con un token válido pueden entrar)
Route::middleware('auth:sanctum')->group(function () {
    
    // Ruta para obtener los datos del usuario logueado actualmente
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Aquí iremos agregando las rutas de ComuniGas más adelante, por ejemplo:
    // Route::apiResource('jornadas', JornadaController::class);
    // Route::post('/pedidos', [PedidoController::class, 'store']);
});