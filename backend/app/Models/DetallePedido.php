<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetallePedido extends Model
{
    // Vital aquí, porque Laravel intentaría buscar "detalle_pedidos"
    protected $table = 'detalles_pedidos'; 
    
    protected $guarded = ['id'];

    protected $casts = [
        'precio_unitario_usd' => 'decimal:2',
        'cantidad' => 'integer',
    ];

    public function pedido() 
    { 
        return $this->belongsTo(Pedido::class); 
    }
    
    public function tipoBombona() 
    { 
        return $this->belongsTo(TipoBombona::class, 'tipo_bombona_id'); 
    }
}