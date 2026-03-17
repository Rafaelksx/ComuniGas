<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jornada extends Model
{
    protected $guarded = [];

    protected $fillable = [
        'comunidad_id',
        'fecha',
        'estatus', // 'activa', 'cerrada', 'finalizada'
        'tasa_bcv'
    ];

    // La jornada le pertenece a una comunidad
    public function comunidad()
    {
        return $this->belongsTo(Comunidad::class);
    }

    // La jornada acepta MUCHOS tipos de bombonas (La tabla pivote)
    public function tiposBombonas()
    {
        return $this->belongsToMany(TipoBombona::class, 'jornada_tipo_bombona');
    }

    public function inventario()
    {
        return $this->hasMany(InventarioJornada::class);
    }

    public function lotes()
    {
        return $this->hasMany(JornadaBombona::class, 'jornada_id');
    }

}