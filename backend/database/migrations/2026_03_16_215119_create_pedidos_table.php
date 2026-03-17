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
    Schema::create('pedidos', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->foreignId('jornada_id')->constrained('jornadas')->onDelete('cascade');
        
        // Totales calculados al momento de hacer el pedido
        $table->decimal('total_usd', 8, 2);
        $table->decimal('total_ves', 12, 2); // 12 dígitos por si la inflación sube
        
        // Ciclo de vida financiero y logístico separados
        $table->enum('estado_pago', ['pendiente', 'por_verificar', 'verificado', 'rechazado'])->default('pendiente');
        $table->enum('estado_fisico', ['pendiente_entregar_vacia', 'vacia_entregada', 'llena_recibida'])->default('pendiente_entregar_vacia');
        
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};
