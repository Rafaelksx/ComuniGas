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
    
    // Actualizar perfil propio
    Route::put('/user', [AuthController::class, 'updateProfile']);

    Route::get('/dashboard/resumen', [DashboardController::class, 'resumen']);
    
    // 2. Rutas de Jornadas
    Route::apiResource('jornadas', JornadaController::class);
    // Rutas específicas para logística de Jornadas
    Route::patch('/jornadas/{id}/estatus', [JornadaController::class, 'updateEstatus']);
    Route::patch('/lotes/{id}/estatus', [JornadaController::class, 'updateLote']);

    // 3. Rutas de Pedidos
    // El vecino puede ver sus pedidos y crear uno nuevo
    Route::get('pedidos', [PedidoController::class, 'index']);
    Route::post('pedidos', [PedidoController::class, 'store']);

    // Las acciones de gestión solo las puede hacer el Coordinador o SuperAdmin
    Route::middleware(\App\Http\Middleware\EnsureIsAdmin::class)->group(function () {
        Route::patch('/pedidos/{id}/verificar',    [PedidoController::class, 'verificarPago']);
        Route::patch('/pedidos/{id}/rechazar',     [PedidoController::class, 'rechazarPago']);
        Route::patch('/pedidos/{id}/recibir-vacia',[PedidoController::class, 'recibirVacia']);
        Route::patch('/pedidos/{id}/entregar',     [PedidoController::class, 'entregar']);
    });

    // 4. Rutas del Censo (Vecinos)
    Route::apiResource('vecinos', VecinoController::class)->only(['index', 'update']);

    // 5. Rutas exclusivas del Super Administrador (Protección de roles delegada al Controlador)
    Route::get('/superadmin/comunidades', [\App\Http\Controllers\Api\ComunidadController::class, 'index']);
    Route::post('/superadmin/comunidades', [\App\Http\Controllers\Api\ComunidadController::class, 'store']);
    Route::put('/superadmin/comunidades/{id}', [\App\Http\Controllers\Api\ComunidadController::class, 'update']);
    Route::delete('/superadmin/comunidades/{id}', [\App\Http\Controllers\Api\ComunidadController::class, 'destroy']);

    Route::get('/superadmin/usuarios', [\App\Http\Controllers\Api\UsuarioController::class, 'index']);
    Route::patch('/superadmin/usuarios/{id}/rol', [\App\Http\Controllers\Api\UsuarioController::class, 'asignarRol']);
});