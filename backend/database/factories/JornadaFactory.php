<?php

namespace Database\Factories;

use App\Models\Comunidad;
use App\Models\Jornada;
use Illuminate\Database\Eloquent\Factories\Factory;

class JornadaFactory extends Factory
{
    protected $model = Jornada::class;

    public function definition()
    {
        return [
            'comunidad_id' => Comunidad::factory(),
            'tasa_bcv_dia' => $this->faker->randomFloat(2, 35, 45),
            'fecha_apertura' => $this->faker->dateTimeBetween('-1 week', '+1 week'),
            'fecha_cierre_pagos' => clone $this->faker->dateTimeBetween('-1 week', '+1 week'),
            'estado' => $this->faker->randomElement(['abierta', 'en_proceso', 'finalizada', 'cancelada']),
            'pago_movil_banco' => $this->faker->company,
            'pago_movil_telefono' => $this->faker->phoneNumber,
            'pago_movil_cedula' => $this->faker->numerify('V-########'),
            'pago_movil_nombre' => $this->faker->name,
        ];
    }
}
