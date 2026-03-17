<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\JornadaBombona;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PedidoController extends Controller
{
    // Trae los pedidos dependiendo de quién pregunte
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdminComunidad()) {
            // El admin ve todos los pedidos, con sus detalles, pagos y datos del vecino
            $pedidos = Pedido::with(['user', 'jornada', 'detalles.lote', 'pagos'])
                ->whereHas('user', function ($query) use ($user) {
                    $query->where('comunidad_id', $user->comunidad_id);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // El vecino solo ve sus propios pedidos
            $pedidos = Pedido::with(['jornada', 'detalles.lote', 'pagos'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($pedidos);
    }

    // El vecino registra un nuevo pedido
    public function store(Request $request)
    {
        $request->validate([
            'jornada_id' => 'required|exists:jornadas,id',
            'lote_id' => 'required|exists:jornada_bombonas,id',
            'referencia_pago' => 'required|string|unique:pagos,referencia_pago',
            'monto_bs' => 'required|numeric',
        ]);

        // Buscamos el lote para saber el precio exacto
        $lote = JornadaBombona::findOrFail($request->lote_id);

        DB::beginTransaction();

        try {
            // 1. Crear la "Factura" principal (Pedido)
            $pedido = Pedido::create([
                'user_id' => $request->user()->id,
                'jornada_id' => $request->jornada_id,
                'total_usd' => $lote->precio_usd,
                'total_ves' => $request->monto_bs,
                'estado_pago' => 'por_verificar',
                'estado_fisico' => 'pendiente_entregar_vacia',
            ]);

            // 2. Crear el detalle del pedido (Qué bombona exacta pidió)
            $pedido->detalles()->create([
                'jornada_bombona_id' => $lote->id,
                'cantidad' => 1,
                'precio_unitario' => $lote->precio_usd,
            ]);

            // 3. Registrar el pago (El capture/referencia del banco)
            $pedido->pagos()->create([
                'referencia_pago' => $request->referencia_pago,
                'monto_bs' => $request->monto_bs,
                'fecha_pago' => now(),
            ]);

            DB::commit();

            return response()->json(['message' => 'Pedido registrado, en espera de verificación.'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar el pedido.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // El Admin marca el pago como verificado al revisar su banco
    public function verificarPago(Request $request, $id)
    {
        $pedido = Pedido::findOrFail($id);
        $pedido->estado_pago = 'verificado';
        $pedido->save();

        return response()->json(['message' => 'Pago verificado exitosamente.']);
    }

    // El Admin le entrega la bombona llena al vecino
    public function entregar(Request $request, $id)
    {
        $pedido = Pedido::findOrFail($id);
        $pedido->estado_fisico = 'llena_recibida';
        $pedido->save();

        return response()->json(['message' => 'Bombona marcada como entregada.']);
    }
}