<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jornada_bombonas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jornada_id')->constrained('jornadas')->onDelete('cascade');
            
            // Características físicas
            $table->string('capacidad'); // Ej: '10kg', '18kg', '43kg'
            $table->string('marca');     // Ej: 'Bolívar Gas', 'PDVSA', 'Tigasco'
            
            // El precio fijado para esta jornada
            $table->decimal('precio_usd', 8, 2); 
            
            // ¡LA MAGIA PARA LAS ENTREGAS PARCIALES ESTÁ AQUÍ!
            // Controla dónde está este lote en específico.
            $table->enum('estatus_lote', [
                'recepcion_abierta', // Los vecinos están pagando y entregando vacías
                'en_planta',         // El camión se las llevó a llenar
                'devueltas_llenas'   // ¡Llegó el camión con estas! Listas para entregar al vecino
            ])->default('recepcion_abierta');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jornada_bombonas');
    }
};