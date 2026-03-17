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
    Schema::create('pagos', function (Blueprint $table) {
        $table->id();
        $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade');
        
        // Datos del pago
        $table->string('banco_origen'); // Ej: Banesco, BDV
        $table->enum('metodo_pago', ['pago_movil', 'transferencia', 'efectivo_usd'])->default('pago_movil');
        $table->string('referencia')->nullable(); // Nullable por si es efectivo
        $table->decimal('monto_ves', 12, 2)->nullable();
        $table->decimal('monto_usd', 8, 2)->nullable(); // Por si pagan en divisas físicas
        $table->date('fecha_pago');
        
        // Archivo del capture
        $table->string('comprobante_path')->nullable(); 
        
        $table->enum('estado', ['pendiente_revision', 'aprobado', 'rechazado'])->default('pendiente_revision');
        $table->text('observacion_admin')->nullable(); // Por si el pago se rechaza, decirle al vecino por qué
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
