<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\JornadaBombona;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PedidoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdminComunidad()) {
            $pedidos = Pedido::with(['user', 'jornada', 'detalles.lote', 'pagos'])
                ->whereHas('user', function ($query) use ($user) {
                    $query->where('comunidad_id', $user->comunidad_id);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $pedidos = Pedido::with(['jornada', 'detalles.lote', 'pagos'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($pedidos);
    }

    public function store(Request $request)
    {
        $request->validate([
            'jornada_id' => 'required|exists:jornadas,id',
            'lote_id' => 'required|exists:jornada_bombonas,id',
            'referencia_pago' => 'required|string',
            'monto_bs' => 'required|numeric',
        ]);

        $lote = JornadaBombona::findOrFail($request->lote_id);

        DB::beginTransaction();

        try {
            // 1. Crear el Pedido (Factura Principal)
            $pedido = Pedido::create([
                'user_id' => $request->user()->id,
                'jornada_id' => $request->jornada_id,
                'total_usd' => $lote->precio_usd,
                'total_ves' => $request->monto_bs,
                'estado_pago' => 'por_verificar',
                'estado_fisico' => 'pendiente_entregar_vacia',
            ]);

            // 2. Crear el Detalle (Usando precio_unitario_usd)
            $pedido->detalles()->create([
                'jornada_bombona_id' => $lote->id,
                'cantidad' => 1,
                'precio_unitario_usd' => $lote->precio_usd,
            ]);

            // 3. Registrar el Pago (Usando referencia y monto_ves)
            $pedido->pagos()->create([
                'metodo_pago' => 'pago_movil',
                'referencia' => $request->referencia_pago,
                'monto_ves' => $request->monto_bs,
                'fecha_pago' => now(),
                'estado' => 'pendiente_revision'
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

    public function verificarPago(Request $request, $id)
    {
        $pedido = Pedido::findOrFail($id);
        $pedido->estado_pago = 'verificado';
        // También actualizamos el pago asociado
        if($pedido->pagos()->exists()){
            $pedido->pagos()->update(['estado' => 'aprobado']);
        }
        $pedido->save();

        return response()->json(['message' => 'Pago verificado exitosamente.']);
    }

    public function entregar(Request $request, $id)
    {
        $pedido = Pedido::findOrFail($id);
        $pedido->estado_fisico = 'llena_recibida';
        $pedido->save();

        return response()->json(['message' => 'Bombona marcada como entregada.']);
    }
    
    public function rechazarPago(Request $request, $id)
    {
        $pedido = Pedido::findOrFail($id);
        $pedido->estado_pago = 'rechazado';
        
        if($pedido->pagos()->exists()){
            $pedido->pagos()->update(['estado' => 'rechazado']);
        }
        $pedido->save();

        return response()->json(['message' => 'Pago rechazado. El vecino debe verificar su referencia.']);
    }

    public function recibirVacia(Request $request, $id)
    {
        $pedido = Pedido::findOrFail($id);
        $pedido->estado_fisico = 'vacia_entregada'; // Cambiamos el estado físico
        $pedido->save();

        return response()->json(['message' => 'Cilindro vacío recibido por el coordinador.']);
    }
}