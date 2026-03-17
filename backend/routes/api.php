<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JornadaController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\VecinoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas Públicas
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

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

    // 2. Rutas de Jornadas
    Route::apiResource('jornadas', JornadaController::class);
    // Rutas específicas para logística de Jornadas
    Route::patch('/jornadas/{id}/estatus', [JornadaController::class, 'updateEstatus']);
    Route::patch('/lotes/{id}/estatus', [JornadaController::class, 'updateLote']);

    // 3. Rutas de Pedidos
    Route::apiResource('pedidos', PedidoController::class)->except(['update', 'destroy']);
    // Rutas específicas para el flujo del pedido
    Route::patch('/pedidos/{id}/verificar', [PedidoController::class, 'verificarPago']);
    Route::patch('/pedidos/{id}/entregar', [PedidoController::class, 'entregar']);

    // 4. Rutas del Censo (Vecinos)
    Route::apiResource('vecinos', VecinoController::class)->only(['index', 'update']);

});