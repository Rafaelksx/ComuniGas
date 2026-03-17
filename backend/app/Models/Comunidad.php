<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comunidad extends Model
{
    protected $table = 'comunidades'; // Buenas prácticas: definir el nombre exacto de la tabla
    protected $guarded = []; // Permite asignación masiva de todos los campos

    // Una comunidad tiene muchos usuarios
    public function usuarios()
    {
        return $this->hasMany(User::class);
    }

    // Una comunidad tiene muchas jornadas a lo largo del tiempo
    public function jornadas()
    {
        return $this->hasMany(Jornada::class);
    }
}