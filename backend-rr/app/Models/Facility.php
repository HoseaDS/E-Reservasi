<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = ['nama', 'kapasitas', 'fasilitas', 'status', 'gambar_url'];

    // Cast kolom fasilitas otomatis menjadi array PHP / JSON
    protected $casts = [
        'fasilitas' => 'array',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}