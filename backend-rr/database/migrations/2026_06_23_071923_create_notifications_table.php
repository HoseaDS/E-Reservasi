<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke tabel users (siapa yang menerima notifikasi)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Isi pesan notifikasi
            $table->text('pesan');
            
            // Status apakah sudah dibaca atau belum (default: true / belum dibaca)
            $table->boolean('unread')->default(true);
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
};