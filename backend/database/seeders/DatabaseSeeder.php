<?php

namespace Database\Seeders;

use App\Models\Comunidad;
use App\Models\Jornada;
use App\Models\TipoBombona;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear el Catálogo Maestro de Bombonas (Fijo, no aleatorio)
        $catalogo = [
            ['marca' => 'PDVSA Gas Comunal', 'capacidad' => '10kg', 'precio_usd' => 1.00],
            ['marca' => 'PDVSA Gas Comunal', 'capacidad' => '18kg', 'precio_usd' => 2.00],
            ['marca' => 'PDVSA Gas Comunal', 'capacidad' => '43kg', 'precio_usd' => 5.00],
            ['marca' => 'Bolívar Gas', 'capacidad' => '10kg', 'precio_usd' => 1.50],
            ['marca' => 'Tigasco', 'capacidad' => '10kg', 'precio_usd' => 2.50],
        ];

        foreach ($catalogo as $item) {
            TipoBombona::firstOrCreate(
                ['marca' => $item['marca'], 'capacidad' => $item['capacidad']],
                ['precio_usd' => $item['precio_usd']]
            );
        }

        // 2. Crear al Superadmin (Tú)
        User::firstOrCreate(
            ['email' => 'superadmin@comunigas.com'],
            [
                'name' => 'Super Administrador',
                'telefono' => '04241234567',
                'password' => bcrypt('12345678'),
                'rol' => 'superadmin',
                'comunidad_id' => null,
            ]
        );

        // 3. Crear una Comunidad de Prueba
        $comunidad = Comunidad::firstOrCreate(
            ['nombre' => 'Residencias Alta Vista Sur'],
            [
                'direccion' => 'Carrera Nekuima, Torre A',
                'activa' => true,
            ]
        );

        // 4. Crear al Coordinador de esa comunidad
        User::firstOrCreate(
            ['email' => 'admin@altavista.com'],
            [
                'name' => 'Carlos Coordinador',
                'telefono' => '04141234567',
                'password' => bcrypt('12345678'),
                'rol' => 'admin_comunidad',
                'identificador_vivienda' => 'Torre A - P.B.',
                'comunidad_id' => $comunidad->id,
            ]
        );

        // 5. Crear 10 Vecinos aleatorios para esa comunidad
        User::factory(10)->create([
            'comunidad_id' => $comunidad->id,
            'rol' => 'vecino',
        ]);

        // 6. Crear una Jornada Activa para esa comunidad
        $jornada = Jornada::create([
            'comunidad_id' => $comunidad->id,
            'tasa_bcv_dia' => 36.55,
            'fecha_apertura' => now(),
            'fecha_cierre_pagos' => now()->addDays(2), // Cierra en 2 días
            'estado' => 'abierta',
        ]);

        // 7. Asignarle qué bombonas se aceptan en esta jornada (Ej: Solo PDVSA de 10 y 18)
        // Buscamos los IDs correspondientes en la BD
        $bombonasPermitidas = TipoBombona::where('marca', 'PDVSA Gas Comunal')
            ->whereIn('capacidad', ['10kg', '18kg'])
            ->pluck('id');
            
        // Magia de la tabla pivote: vinculamos la jornada con esas bombonas
        $jornada->tiposBombonas()->sync($bombonasPermitidas);
    }
}