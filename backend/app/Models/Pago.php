<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    protected $table = 'pagos';
    
    protected $guarded = ['id'];

    // Convertimos la fecha a un objeto Carbon para poder formatearla fácil luego (ej: $pago->fecha_pago->format('d/m/Y'))
    protected $casts = [
        'fecha_pago' => 'date',
        'monto_ves' => 'decimal:2',
        'monto_usd' => 'decimal:2',
    ];

    public function pedido() 
    { 
        return $this->belongsTo(Pedido::class); 
    }
}