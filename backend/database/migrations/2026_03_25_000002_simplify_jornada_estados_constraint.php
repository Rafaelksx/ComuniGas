<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // En PostgreSQL los enums crean un constraint de check
        DB::statement('ALTER TABLE jornadas DROP CONSTRAINT IF EXISTS jornadas_estado_check');
        
        // Convertir estados viejos a los nuevos para evitar datos huérfanos
        DB::table('jornadas')->whereIn('estado', ['recepcion_cilindros', 'en_planta', 'distribucion'])->update(['estado' => 'en_proceso']);

        // Ahora volvemos a aplicar un constraint actualizado
        DB::statement("ALTER TABLE jornadas ADD CONSTRAINT jornadas_estado_check CHECK (estado::text = ANY (ARRAY['abierta'::character varying, 'en_proceso'::character varying, 'finalizada'::character varying, 'cancelada'::character varying]::text[]))");
    }

    public function down(): void
    {
        // Para rollback se podría revertir, pero es destructivo
        DB::statement('ALTER TABLE jornadas DROP CONSTRAINT IF EXISTS jornadas_estado_check');
        DB::statement("ALTER TABLE jornadas ADD CONSTRAINT jornadas_estado_check CHECK (estado::text = ANY (ARRAY['abierta'::character varying, 'recepcion_cilindros'::character varying, 'en_planta'::character varying, 'finalizada'::character varying, 'cancelada'::character varying]::text[]))");
    }
};
