<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jornada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JornadaController extends Controller
{
    /**
     * Devuelve la lista de jornadas (Pronto la filtraremos por comunidad)
     */
    public function index()
    {
        // Traemos las jornadas con sus lotes de bombonas incluidos
        $jornadas = Jornada::with('lotes')->orderBy('created_at', 'desc')->get();
        
        return response()->json($jornadas);
    }

    /**
     * Crea una nueva Jornada y sus Lotes de Bombonas
     */
    public function store(Request $request)
    {
        // 1. Validar que vengan todos los datos correctamente
        $validated = $request->validate([
            'comunidad_id' => 'required|exists:comunidades,id',
            'tasa_bcv_dia' => 'required|numeric|min:0',
            'fecha_apertura' => 'required|date',
            'fecha_cierre_pagos' => 'required|date|after_or_equal:fecha_apertura',
            'estado' => 'nullable|in:abierta,recepcion_cilindros,en_planta,finalizada',
            
            // Validar el arreglo de lotes (Las bombonas que vendrán en el camión)
            'lotes' => 'required|array|min:1',
            'lotes.*.capacidad' => 'required|string',
            'lotes.*.marca' => 'required|string',
            'lotes.*.precio_usd' => 'required|numeric|min:0',
        ]);

        // 2. Iniciar la transacción de Base de Datos
        DB::beginTransaction();

        try {
            // A. Crear la Jornada principal
            $jornada = Jornada::create([
                'comunidad_id' => $validated['comunidad_id'],
                'tasa_bcv_dia' => $validated['tasa_bcv_dia'],
                'fecha_apertura' => $validated['fecha_apertura'],
                'fecha_cierre_pagos' => $validated['fecha_cierre_pagos'],
                'estado' => $validated['estado'] ?? 'abierta',
            ]);

            // B. Crear cada lote de bombonas asociado a esta jornada
            foreach ($validated['lotes'] as $lote) {
                $jornada->lotes()->create([
                    'capacidad' => $lote['capacidad'],
                    'marca' => $lote['marca'],
                    'precio_usd' => $lote['precio_usd'],
                    'estatus_lote' => 'recepcion_abierta', // Valor por defecto
                ]);
            }

            // Si todo salió bien, confirmamos los cambios en la BD
            DB::commit();

            // Retornamos la jornada creada con sus lotes
            return response()->json([
                'message' => 'Jornada creada exitosamente',
                'jornada' => $jornada->load('lotes')
            ], 201);

        } catch (\Exception $e) {
            // Si algo falla, deshacemos todos los cambios
            DB::rollBack();
            
            return response()->json([
                'message' => 'Error al crear la jornada',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function update(Request $request, $id)
    {
        $jornada = Jornada::findOrFail($id);

        $validated = $request->validate([
            'tasa_bcv_dia' => 'required|numeric|min:0',
            'fecha_apertura' => 'required|date',
            'fecha_cierre_pagos' => 'required|date|after_or_equal:fecha_apertura',
        ]);

        $jornada->update([
            'tasa_bcv_dia' => $validated['tasa_bcv_dia'],
            'fecha_apertura' => $validated['fecha_apertura'],
            'fecha_cierre_pagos' => $validated['fecha_cierre_pagos'],
        ]);

        return response()->json([
            'message' => 'Jornada actualizada exitosamente',
            'jornada' => $jornada->load('lotes')
        ]);
    }

    public function destroy($id)
    {
        $jornada = Jornada::findOrFail($id);

        // Verificar si tiene pedidos asociados
        $tienePedidos = \App\Models\Pedido::where('jornada_id', $id)->exists();
        
        if ($tienePedidos) {
            return response()->json([
                'message' => 'No se puede eliminar la jornada porque contiene pedidos. Puedes optar por cancelarla.'
            ], 403);
        }

        // Si no tiene pedidos, borrar lotes y jornada
        $jornada->lotes()->delete();
        $jornada->delete();

        return response()->json([
            'message' => 'Jornada eliminada exitosamente'
        ]);
    }

    public function updateEstatus(Request $request, $id)
    {
        $jornada = Jornada::findOrFail($id);
        
        $validated = $request->validate([
            'estado' => 'required|in:abierta,recepcion_cilindros,en_planta,distribucion,finalizada,cancelada',
        ]);

        $jornada->update([
            'estado' => $validated['estado']
        ]);

        return response()->json([
            'message' => 'Estatus actualizado',
            'jornada' => $jornada->load('lotes')
        ]);
    }
}