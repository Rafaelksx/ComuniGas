<?php

namespace Tests\Feature;

use App\Models\Comunidad;
use App\Models\Jornada;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JornadaControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_jornadas_of_their_community()
    {
        $comunidadA = Comunidad::factory()->create();
        $comunidadB = Comunidad::factory()->create();

        $user = User::factory()->create([
            'comunidad_id' => $comunidadA->id,
            'rol' => 'admin_comunidad'
        ]);

        $jornadaA = Jornada::factory()->create(['comunidad_id' => $comunidadA->id]);
        $jornadaB = Jornada::factory()->create(['comunidad_id' => $comunidadB->id]);

        $response = $this->actingAs($user)->getJson('/api/jornadas');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['id' => $jornadaA->id]);
        $response->assertJsonMissing(['id' => $jornadaB->id]);
    }

    public function test_admin_cannot_update_jornada_of_another_community()
    {
        $comunidadA = Comunidad::factory()->create();
        $comunidadB = Comunidad::factory()->create();

        $userA = User::factory()->create([
            'comunidad_id' => $comunidadA->id,
            'rol' => 'admin_comunidad'
        ]);

        $jornadaB = Jornada::factory()->create(['comunidad_id' => $comunidadB->id]);

        $response = $this->actingAs($userA)->putJson("/api/jornadas/{$jornadaB->id}", [
            'tasa_bcv_dia' => 45.0,
            'fecha_apertura' => now()->toDateString(),
            'fecha_cierre_pagos' => now()->addDays(2)->toDateString(),
        ]);

        // Se espera un 404 porque el firstOrFail() con la restricción de comunidad_id no lo encontrará
        $response->assertStatus(404);
    }
}
