<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    // PASTIKAN KEDUA FIELD DI BAWAH INI SUDAH TERDAFTAR:
    protected $fillable = [
        'nama',
        'kapasitas',
        'fasilitas',
        'status',
        'gambar_url',  // <--- Tambahkan ini
        'model3d_url', // <--- Tambahkan ini
    ];

    // Cast kolom fasilitas otomatis menjadi array PHP / JSON
    protected $casts = [
        'fasilitas' => 'array',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}