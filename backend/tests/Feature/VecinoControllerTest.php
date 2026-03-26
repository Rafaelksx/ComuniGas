<?php

namespace Tests\Feature;

use App\Models\Comunidad;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VecinoControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_update_vecino_vivienda_from_another_community()
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
            'rol' => 'vecino',
            'identificador_vivienda' => 'Casa 1'
        ]);

        // El Admin A intenta actualizar la vivienda del Vecino B
        $response = $this->actingAs($adminA)->putJson("/api/vecinos/{$vecinoB->id}", [
            'identificador_vivienda' => 'Casa Modificada'
        ]);

        // Se espera un 404 porque el vecino no pertenece a la comunidad del Admin A
        $response->assertStatus(404);
    }
}
