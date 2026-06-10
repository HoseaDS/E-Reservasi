<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
    Schema::create('rooms', function (Blueprint $table) {
        $table->id();
        $table->string('nama');
        $table->integer('kapasitas');
        $table->json('fasilitas')->nullable(); // Disimpan dalam bentuk array JSON (meja, monitor, dll)
        $table->enum('status', ['Aktif', 'Nonaktif'])->default('Aktif');
        $table->string('gambar_url')->nullable();
        $table->string('model3d_url')->nullable(); // TAMBAHKAN BARIS INI
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
