<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JornadaBombona extends Model
{
    use HasFactory;

    // Permitimos que estos campos se guarden desde el controlador
    protected $fillable = [
        'jornada_id',
        'capacidad',
        'marca',
        'precio_usd',
        'estatus_lote'
    ];

    // Relación inversa: Un lote de bombonas pertenece a una jornada
    public function jornada()
    {
        return $this->belongsTo(Jornada::class);
    }
}