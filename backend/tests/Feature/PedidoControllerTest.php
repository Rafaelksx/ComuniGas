<?php

namespace Tests\Feature;

use App\Models\Comunidad;
use App\Models\Jornada;
use App\Models\Pedido;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PedidoControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_verify_pedido_from_another_community()
    {
        $comunidadA = Comunidad::factory()->create();
        $comunidadB = Comunidad::factory()->create();

        // Admin de la comunidad A
        $adminA = User::factory()->create([
            'comunidad_id' => $comunidadA->id,
            'rol' => 'admin_comunidad'
        ]);

        // Vecino de la comunidad B
        $vecinoB = User::factory()->create([
            'comunidad_id' => $comunidadB->id,
            'rol' => 'vecino'
        ]);

        $jornadaB = Jornada::factory()->create(['comunidad_id' => $comunidadB->id]);

        // Pedido hecho por el vecino de la comunidad B (No factory yet, save directly)
        $pedido = Pedido::create([
            'user_id' => $vecinoB->id,
            'jornada_id' => $jornadaB->id,
            'total_usd' => 10,
            'total_ves' => 450,
            'estado_pago' => 'por_verificar',
            'estado_fisico' => 'pendiente_entregar_vacia',
        ]);

        // El Admin A intenta verificar un pago de la comunidad B
        $response = $this->actingAs($adminA)->patchJson("/api/pedidos/{$pedido->id}/verificar");

        // Se espera un 404 porque el pedido no pertenece a alguien de la comunidad del Admin A
        $response->assertStatus(404);
    }
}
