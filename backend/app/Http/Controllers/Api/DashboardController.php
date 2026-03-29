<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $service) {}

    public function resumen(Request $request)
    {
        $user    = $request->user();
        $isAdmin = $user->rol === 'admin_comunidad';

        $todasJornadas = $isAdmin
            ? $this->service->getTodasJornadas($user->comunidad_id)
            : collect();

        $jornada = $this->service->getJornada(
            $user->comunidad_id,
            $request->input('jornada_id')
        );

        $userData = ['name' => $user->name, 'rol' => $user->rol];

        if (!$jornada) {
            return response()->json([
                'jornada'        => null,
                'todas_jornadas' => $todasJornadas,
                'stats'          => ['total_bs' => 0, 'por_tipo' => []],
                'is_admin'       => $isAdmin,
                'user'           => $userData,
            ]);
        }

        // Los vecinos no ven estadísticas globales
        if (!$isAdmin) {
            return response()->json([
                'jornada'        => $jornada,
                'todas_jornadas' => [],
                'stats'          => [],
                'is_admin'       => false,
                'user'           => $userData,
            ]);
        }

        return response()->json([
            'jornada'        => $jornada,
            'todas_jornadas' => $todasJornadas,
            'is_admin'       => true,
            'user'           => $userData,
            'stats'          => $this->service->getEstadisticas($jornada->id),
        ]);
    }
}