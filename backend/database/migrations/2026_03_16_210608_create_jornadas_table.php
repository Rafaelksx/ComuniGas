<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jornadas', function (Blueprint $table) {
            $table->id();
            // Llave foránea que conecta la jornada con la comunidad
            $table->foreignId('comunidad_id')->constrained('comunidades')->onDelete('cascade');
            
            $table->decimal('tasa_bcv_dia', 8, 2); // Para congelar el precio en Bolívares
            $table->dateTime('fecha_apertura');
            $table->dateTime('fecha_cierre_pagos'); // Hasta cuándo el vecino puede reportar pago
            
            // El ciclo de vida de la jornada
            $table->enum('estado', ['abierta', 'en_proceso', 'finalizada', 'cancelada'])->default('abierta');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jornadas');
    }
};
