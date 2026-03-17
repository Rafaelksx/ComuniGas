<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'jornada_id',
        'total_usd',
        'total_ves',
        'estado_pago',
        'estado_fisico'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jornada()
    {
        return $this->belongsTo(Jornada::class);
    }
    
    public function detalles()
    {
        return $this->hasMany(DetallePedido::class);
    }
    
    // Si tienes el modelo de Pago:
    public function pagos()
    {
        return $this->hasMany(Pago::class);
    }
}