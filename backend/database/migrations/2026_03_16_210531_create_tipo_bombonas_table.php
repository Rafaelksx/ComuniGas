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
        Schema::create('tipos_bombonas', function (Blueprint $table) {
            $table->id();
            $table->string('marca'); // Ej: PDVSA, Tigasco
            $table->string('capacidad'); // Ej: 10kg, 18kg, 43kg
            $table->decimal('precio_usd', 8, 2); // Precio base en dólares
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tipo_bombonas');
    }
};
