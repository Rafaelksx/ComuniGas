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

        // 1. Buscar si hay una jornada abierta en la comunidad de este usuario
        $jornada = Jornada::with('lotes')
            ->where('comunidad_id', $user->comunidad_id)
            ->where('estado', 'abierta')
            ->latest()
            ->first();

        // Si no hay jornada, devolvemos todo en cero
        if (!$jornada) {
            return response()->json([
                'jornada' => null,
                'stats' => [
                    'total_bs' => 0,
                    'por_tipo' => []
                ]
            ]);
        }

        // 2. Sumar todo el dinero (Bolívares) de los pedidos de esta jornada
        $totalBs = Pedido::where('jornada_id', $jornada->id)
            ->sum('total_ves');

        // 3. Contar las bombonas agrupadas por capacidad (10kg, 18kg, etc.)
        // Usamos DB::table para hacer un "Join" rápido y sumar las cantidades
        $bombonas = DB::table('detalles_pedidos')
            ->join('pedidos', 'detalles_pedidos.pedido_id', '=', 'pedidos.id')
            ->join('jornada_bombonas', 'detalles_pedidos.jornada_bombona_id', '=', 'jornada_bombonas.id')
            ->where('pedidos.jornada_id', $jornada->id)
            ->select('jornada_bombonas.capacidad', DB::raw('SUM(detalles_pedidos.cantidad) as total_cantidad'))
            ->groupBy('jornada_bombonas.capacidad')
            ->get();

        // Convertir el resultado a un formato fácil para React: {"10kg": 5, "18kg": 2}
        $porTipo = [];
        foreach ($bombonas as $b) {
            $porTipo[$b->capacidad] = $b->total_cantidad;
        }

        // 4. Enviar la respuesta al Frontend
        return response()->json([
            'jornada' => $jornada,
            'stats' => [
                'total_bs' => $totalBs,
                'por_tipo' => $porTipo
            ]
        ]);
    }
}