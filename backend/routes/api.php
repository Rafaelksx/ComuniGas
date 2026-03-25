<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JornadaController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\VecinoController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Comunidad;

/*
|--------------------------------------------------------------------------
| Rutas Públicas
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Ruta para obtener las comunidades en el select del formulario
Route::get('/comunidades', function () {
    return response()->json(Comunidad::select('id', 'nombre', 'direccion')->get());
});

/*
|--------------------------------------------------------------------------
| Rutas Protegidas (Requieren Token de Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // 1. Datos del usuario logueado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/dashboard/resumen', [DashboardController::class, 'resumen']);
    
    // 2. Rutas de Jornadas
    Route::apiResource('jornadas', JornadaController::class);
    // Rutas específicas para logística de Jornadas
    Route::patch('/jornadas/{id}/estatus', [JornadaController::class, 'updateEstatus']);
    Route::patch('/lotes/{id}/estatus', [JornadaController::class, 'updateLote']);

    // 3. Rutas de Pedidos
    Route::apiResource('pedidos', PedidoController::class)->except(['update', 'destroy']);
    // Rutas específicas para el flujo del pedido
    Route::patch('/pedidos/{id}/verificar', [PedidoController::class, 'verificarPago']);
    Route::patch('/pedidos/{id}/rechazar', [PedidoController::class, 'rechazarPago']); // NUEVA
    Route::patch('/pedidos/{id}/recibir-vacia', [PedidoController::class, 'recibirVacia']); // NUEVA
    Route::patch('/pedidos/{id}/entregar', [PedidoController::class, 'entregar']);

    // 4. Rutas del Censo (Vecinos)
    Route::apiResource('vecinos', VecinoController::class)->only(['index', 'update']);

});