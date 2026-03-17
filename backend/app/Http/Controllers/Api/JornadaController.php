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
    
    // Aquí luego agregaremos show(), update(), destroy()...
}