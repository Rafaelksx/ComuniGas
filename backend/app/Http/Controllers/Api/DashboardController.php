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

        // Si no se encuentra la solicitada (o no hay activa), devolver vacíos pero con el listado
        if (!$jornada) {
            return response()->json([
                'jornada' => null,
                'todas_jornadas' => $todasJornadas,
                'stats' => [
                    'total_bs' => 0,
                    'por_tipo' => []
                ]
            ]);
        }

        // C. Sumar todo el dinero (Bolívares) de los pedidos de esta jornada
        $totalBs = Pedido::where('jornada_id', $jornada->id)
            ->sum('total_ves');

        // D. Contar las bombonas agrupadas por capacidad
        $bombonas = DB::table('detalles_pedidos')
            ->join('pedidos', 'detalles_pedidos.pedido_id', '=', 'pedidos.id')
            ->join('jornada_bombonas', 'detalles_pedidos.jornada_bombona_id', '=', 'jornada_bombonas.id')
            ->where('pedidos.jornada_id', $jornada->id)
            ->select('jornada_bombonas.capacidad', DB::raw('SUM(detalles_pedidos.cantidad) as total_cantidad'))
            ->groupBy('jornada_bombonas.capacidad')
            ->get();

        $porTipo = [];
        foreach ($bombonas as $b) {
            $porTipo[$b->capacidad] = $b->total_cantidad;
        }

        // E. Enviar la respuesta al Frontend
        return response()->json([
            'jornada' => $jornada,
            'todas_jornadas' => $todasJornadas,
            'stats' => [
                'total_bs' => $totalBs,
                'por_tipo' => $porTipo
            ]
        ]);
    }
}