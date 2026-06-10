<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_pimpinans', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->time('waktu_mulai');
            $table->time('waktu_selesai');
            $table->string('agenda');
            $table->string('tempat');
            $table->string('pejabat_pelaksana');
            $table->string('pendamping')->nullable();
            $table->enum('status', ['Akan Datang', 'Selesai', 'Dibatalkan'])->default('Akan Datang');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_pimpinans');
    }
};