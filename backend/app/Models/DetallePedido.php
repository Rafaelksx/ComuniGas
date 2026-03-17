<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetallePedido extends Model
{
    use HasFactory;

    protected $fillable = [
        'pedido_id',
        'jornada_bombona_id',
        'cantidad',
        'precio_unitario'
    ];

    // Este detalle pertenece a una factura/pedido general
    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
    }

    // Este detalle apunta a un lote de bombona específico (Ej: 10kg Bolívar Gas)
    public function lote()
    {
        return $this->belongsTo(JornadaBombona::class, 'jornada_bombona_id');
    }
}