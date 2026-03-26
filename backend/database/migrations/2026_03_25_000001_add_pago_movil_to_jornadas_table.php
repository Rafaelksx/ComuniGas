<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jornadas', function (Blueprint $table) {
            $table->string('pago_movil_banco')->nullable()->after('estado');
            $table->string('pago_movil_telefono')->nullable()->after('pago_movil_banco');
            $table->string('pago_movil_cedula')->nullable()->after('pago_movil_telefono');
            $table->string('pago_movil_nombre')->nullable()->after('pago_movil_cedula');
        });
    }

    public function down(): void
    {
        Schema::table('jornadas', function (Blueprint $table) {
            $table->dropColumn(['pago_movil_banco', 'pago_movil_telefono', 'pago_movil_cedula', 'pago_movil_nombre']);
        });
    }
};
