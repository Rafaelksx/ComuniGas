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
        Schema::create('jornada_tipo_bombona', function (Blueprint $table) {
            $table->id();
            // Conexión a la jornada
            $table->foreignId('jornada_id')->constrained('jornadas')->onDelete('cascade');
            // Conexión a la bombona permitida
            $table->foreignId('tipo_bombona_id')->constrained('tipos_bombonas')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jornada_tipo_bombona');
    }
};
