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
    Schema::create('detalles_pedidos', function (Blueprint $table) {
        $table->id();
        $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade');
        $table->foreignId('tipo_bombona_id')->constrained('tipos_bombonas')->onDelete('restrict');
        
        $table->integer('cantidad');
        // GUARDAMOS EL PRECIO AQUÍ: Es vital por si el precio global cambia en el futuro, no altere facturas viejas.
        $table->decimal('precio_unitario_usd', 8, 2); 
        
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_pedidos');
    }
};
