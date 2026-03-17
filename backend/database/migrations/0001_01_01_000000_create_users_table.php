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
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Nuestro Multi-Tenant: A qué comunidad pertenece este usuario
            // Lo ponemos nullable por si el superadmin no pertenece a ninguna
            $table->foreignId('comunidad_id')->nullable()->constrained('comunidades')->nullOnDelete();

            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            // Campos específicos de ComuniGas
            $table->string('telefono')->unique(); // Para contacto rápido por WhatsApp
            $table->string('identificador_vivienda')->nullable(); // Ej: Alta Vista - Torre Sur, Apto 4A / Villa Granada - Casa 12
            $table->enum('rol', ['superadmin', 'admin_comunidad', 'vecino'])->default('vecino');

            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
