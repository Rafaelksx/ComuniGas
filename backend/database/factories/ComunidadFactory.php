<?php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ComunidadFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => 'Residencias ' . $this->faker->streetName(),
            'direccion' => $this->faker->address(),
            'activa' => true,
        ];
    }
}