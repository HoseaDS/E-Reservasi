<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    // Menentukan kolom mana saja yang diizinkan untuk diisi datanya
    protected $fillable = [
        'user_id',
        'pesan',
        'unread',
    ];

    // Relasi: Sebuah notifikasi dimiliki oleh satu User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}