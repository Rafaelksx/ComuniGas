<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\JornadaBombona;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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
            'jornada_id'       => 'required|exists:jornadas,id',
            'items'            => 'required|array|min:1',
            'items.*.lote_id'  => 'required|exists:jornada_bombonas,id',
            'items.*.cantidad' => 'required|integer|min:1|max:10',
            'referencia_pago'  => 'required|string|max:50',
            'banco_origen'     => 'required|string|max:100',
            'telefono_pago'    => 'required|string|max:20',
            'monto_bs_vecino'  => 'nullable|numeric',
            'comprobante'      => 'nullable|image|max:5120',
        ]);

        $jornada = \App\Models\Jornada::findOrFail($request->jornada_id);

        // Calcular totales en el backend
        $totalUsd = 0;
        $totalVes = 0;
        $lotesData = [];

        foreach ($request->items as $item) {
            $lote = JornadaBombona::findOrFail($item['lote_id']);
            $cantidad = (int) $item['cantidad'];
            $subtotalUsd = $lote->precio_usd * $cantidad;
            $subtotalVes = round($subtotalUsd * $jornada->tasa_bcv_dia, 2);
            $totalUsd += $subtotalUsd;
            $totalVes += $subtotalVes;
            $lotesData[] = [
                'lote'     => $lote,
                'cantidad' => $cantidad,
            ];
        }

        DB::beginTransaction();

        try {
            // 1. Guardar comprobante si viene
            $comprobantePath = null;
            if ($request->hasFile('comprobante')) {
                if (env('CLOUDINARY_URL')) {
                    // Sube a Cloudinary si está configurado para producción
                    $comprobantePath = cloudinary()->upload($request->file('comprobante')->getRealPath(), [
                        'folder' => 'comunigas_comprobantes'
                    ])->getSecurePath();
                } else {
                    // Guarda localmente
                    $comprobantePath = $request->file('comprobante')
                        ->store('comprobantes', 'public');
                }
            }

            // 2. Crear el Pedido
            $pedido = Pedido::create([
                'user_id'       => $request->user()->id,
                'jornada_id'    => $request->jornada_id,
                'total_usd'     => round($totalUsd, 2),
                'total_ves'     => round($totalVes, 2),
                'estado_pago'   => 'por_verificar',
                'estado_fisico' => 'pendiente_entregar_vacia',
            ]);

            // 3. Crear los Detalles (uno por tipo de cilindro)
            foreach ($lotesData as $item) {
                $pedido->detalles()->create([
                    'jornada_bombona_id'  => $item['lote']->id,
                    'cantidad'            => $item['cantidad'],
                    'precio_unitario_usd' => $item['lote']->precio_usd,
                ]);
            }

            // 4. Registrar el Pago
            $pedido->pagos()->create([
                'metodo_pago'      => 'pago_movil',
                'banco_origen'     => $request->banco_origen,
                'referencia'       => $request->referencia_pago,
                'monto_ves'        => $request->monto_bs_vecino ?? round($totalVes, 2),
                'fecha_pago'       => now(),
                'estado'           => 'pendiente_revision',
                'comprobante_path' => $comprobantePath,
            ]);

            DB::commit();

            return response()->json(['message' => 'Pedido registrado, en espera de verificación.'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar el pedido.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function verificarPago(Request $request, $id)
    {
        $pedido = Pedido::findOrFail($id);
        $pedido->estado_pago = 'verificado';
        if ($pedido->pagos()->exists()) {
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
        if ($pedido->pagos()->exists()) {
            $pedido->pagos()->update(['estado' => 'rechazado']);
        }
        $pedido->save();

        return response()->json(['message' => 'Pago rechazado. El vecino debe verificar su referencia.']);
    }

    public function recibirVacia(Request $request, $id)
    {
        $pedido = Pedido::findOrFail($id);
        $pedido->estado_fisico = 'vacia_entregada';
        $pedido->save();

        return response()->json(['message' => 'Cilindro vacío recibido por el coordinador.']);
    }
}