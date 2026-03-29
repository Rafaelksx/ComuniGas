<?php

namespace App\Services;

use App\Models\Jornada;
use App\Models\Pedido;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Devuelve todas las jornadas de una comunidad para el selector del frontend.
     */
    public function getTodasJornadas(int $comunidadId): \Illuminate\Database\Eloquent\Collection
    {
        return Jornada::where('comunidad_id', $comunidadId)
            ->orderBy('fecha_apertura', 'desc')
            ->get(['id', 'fecha_apertura', 'estado']);
    }

    /**
     * Devuelve la jornada activa o la solicitada por ID.
     */
    public function getJornada(int $comunidadId, ?string $jornadaId): ?Jornada
    {
        $query = Jornada::with('lotes')->where('comunidad_id', $comunidadId);

        if ($jornadaId && $jornadaId !== 'actual') {
            $query->where('id', $jornadaId);
        } else {
            $query->whereIn('estado', ['abierta', 'en_proceso'])->latest();
        }

        return $query->first();
    }

    /**
     * Calcula todas las estadísticas de una jornada para el dashboard del admin.
     */
    public function getEstadisticas(int $jornadaId): array
    {
        $base = Pedido::where('jornada_id', $jornadaId);

        $totalBs             = (clone $base)->sum('total_ves');
        $totalUsd            = (clone $base)->sum('total_usd');
        $totalPedidos        = (clone $base)->count();
        $vecinosAtendidos    = (clone $base)->distinct('user_id')->count('user_id');
        $pagosVerificados    = (clone $base)->where('estado_pago', 'verificado')->count();
        $entregasCompletadas = (clone $base)->where('estado_fisico', 'llena_recibida')->count();

        $bombonas = DB::table('detalles_pedidos')
            ->join('pedidos', 'detalles_pedidos.pedido_id', '=', 'pedidos.id')
            ->join('jornada_bombonas', 'detalles_pedidos.jornada_bombona_id', '=', 'jornada_bombonas.id')
            ->where('pedidos.jornada_id', $jornadaId)
            ->select(
                'jornada_bombonas.capacidad',
                'jornada_bombonas.marca',
                DB::raw('SUM(detalles_pedidos.cantidad) as total_cantidad')
            )
            ->groupBy('jornada_bombonas.capacidad', 'jornada_bombonas.marca')
            ->get();

        $porTipo = [];
        foreach ($bombonas as $b) {
            $porTipo["{$b->capacidad} - {$b->marca}"] = $b->total_cantidad;
        }

        return [
            'total_bs'             => $totalBs,
            'total_usd'            => $totalUsd,
            'total_pedidos'        => $totalPedidos,
            'vecinos_atendidos'    => $vecinosAtendidos,
            'pagos_verificados'    => $pagosVerificados,
            'entregas_completadas' => $entregasCompletadas,
            'por_tipo'             => $porTipo,
        ];
    }
}
