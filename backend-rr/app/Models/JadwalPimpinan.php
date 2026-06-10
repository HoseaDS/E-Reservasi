<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JadwalPimpinan extends Model
{
    use HasFactory;

    protected $fillable = [
        'tanggal', 'waktu_mulai', 'waktu_selesai', 'agenda', 
        'tempat', 'pejabat_pelaksana', 'pendamping', 'status'
    ];
}