<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoBombona extends Model
{
    protected $table = 'tipos_bombonas';
    protected $guarded = [];

    // Un tipo de bombona puede estar en muchas jornadas
    public function jornadas()
    {
        return $this->belongsToMany(Jornada::class, 'jornada_tipo_bombona');
    }
}