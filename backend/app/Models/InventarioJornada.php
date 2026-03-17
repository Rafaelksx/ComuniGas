<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventarioJornada extends Model
{
   protected $fillable = ['jornada_id', 'capacidad_bombona', 'precio_usd', 'cupos_disponibles'];

    public function jornada()
    {
        return $this->belongsTo(Jornada::class);
    }
}
