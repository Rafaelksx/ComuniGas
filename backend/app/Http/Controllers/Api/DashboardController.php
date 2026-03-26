<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jornada;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function resumen(Request $request)
    {
        $user = $request->user();

        // A. Obtener todas las jornadas de la comunidad para el selector del frontend
        $todasJornadas = Jornada::where('comunidad_id', $user->comunidad_id)
            ->orderBy('fecha_apertura', 'desc')
            ->get(['id', 'fecha_apertura', 'estado']);

        // B. Determinar qué jornada mostrar
        $jornadaQuery = Jornada::with('lotes')
            ->where('comunidad_id', $user->comunidad_id);

        if ($request->has('jornada_id') && $request->jornada_id != 'actual') {
            $jornadaQuery->where('id', $request->jornada_id);
        } else {
            // Si no envían ID, buscamos la que esté abierta o en proceso
            $jornadaQuery->whereIn('estado', ['abierta', 'en_proceso'])->latest();
        }

        $jornada = $jornadaQuery->first();

        $isAdmin = $user->rol === 'admin_comunidad';

        // Si no se encuentra la solicitada (o no hay activa), devolver vacíos pero con el listado (si es admin)
        if (!$jornada) {
            return response()->json([
                'jornada' => null,
                'todas_jornadas' => $isAdmin ? $todasJornadas : [],
                'stats' => [
                    'total_bs' => 0,
                    'por_tipo' => []
                ],
                'is_admin' => $isAdmin,
                'user' => [
                    'name' => $user->name,
                    'rol' => $user->rol
                ]
            ]);
        }

        // Si no es admin, NO calculamos ni exponemos las estadísticas globales
        if (!$isAdmin) {
            return response()->json([
                'jornada' => $jornada,
                'todas_jornadas' => [],
                'stats' => [], // Vacío, por seguridad
                'is_admin' => false,
                'user' => [
                    'name' => $user->name,
                    'rol' => $user->rol
                ]
            ]);
        }

        // C. Estadísticas de la jornada (Sólo Ejecutado si es Admin)
        $pedidosBase = Pedido::where('jornada_id', $jornada->id);
        
        $totalBs = (clone $pedidosBase)->sum('total_ves');
        $totalUsd = (clone $pedidosBase)->sum('total_usd');
        $totalPedidos = (clone $pedidosBase)->count();
        $vecinosAtendidos = (clone $pedidosBase)->distinct('user_id')->count('user_id');
        
        $pagosVerificados = (clone $pedidosBase)->where('estado_pago', 'verificado')->count();
        $entregasCompletadas = (clone $pedidosBase)->where('estado_fisico', 'llena_recibida')->count();

        // D. Contar las bombonas agrupadas por capacidad y marca
        $bombonas = DB::table('detalles_pedidos')
            ->join('pedidos', 'detalles_pedidos.pedido_id', '=', 'pedidos.id')
            ->join('jornada_bombonas', 'detalles_pedidos.jornada_bombona_id', '=', 'jornada_bombonas.id')
            ->where('pedidos.jornada_id', $jornada->id)
            ->select('jornada_bombonas.capacidad', 'jornada_bombonas.marca', DB::raw('SUM(detalles_pedidos.cantidad) as total_cantidad'))
            ->groupBy('jornada_bombonas.capacidad', 'jornada_bombonas.marca')
            ->get();

        $porTipo = [];
        foreach ($bombonas as $b) {
            $nombreCilindro = "{$b->capacidad} - {$b->marca}";
            $porTipo[$nombreCilindro] = $b->total_cantidad;
        }

        // E. Enviar la respuesta al Frontend
        return response()->json([
            'jornada' => $jornada,
            'todas_jornadas' => $todasJornadas,
            'is_admin' => true,
            'user' => [
                'name' => $user->name,
                'rol' => $user->rol
            ],
            'stats' => [
                'total_bs' => $totalBs,
                'total_usd' => $totalUsd,
                'total_pedidos' => $totalPedidos,
                'vecinos_atendidos' => $vecinosAtendidos,
                'pagos_verificados' => $pagosVerificados,
                'entregas_completadas' => $entregasCompletadas,
                'por_tipo' => $porTipo
            ]
        ]);
    }
}