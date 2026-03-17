<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jornada extends Model
{
    use HasFactory;

    // Actualizado para coincidir con tu migración 2026_03_16_210608_create_jornadas_table.php
    protected $fillable = [
        'comunidad_id',
        'tasa_bcv_dia',
        'fecha_apertura',
        'fecha_cierre_pagos',
        'estado'
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

    // El control de lotes reales del camión (las que definimos para los precios y marca)
    public function lotes()
    {
        return $this->hasMany(JornadaBombona::class, 'jornada_id');
    }
}