<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    // 1. Nombre exacto de la tabla
    protected $table = 'pedidos'; 

    // 2. Permitir asignación masiva (dejamos todo abierto excepto el ID)
    protected $guarded = ['id']; 

    // 3. Casts: Convertir tipos de datos automáticamente
    protected $casts = [
        'total_usd' => 'decimal:2',
        'total_ves' => 'decimal:2',
    ];

    // 4. Relaciones
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
    
    public function pagos() 
    { 
        return $this->hasMany(Pago::class); 
    }
}