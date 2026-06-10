<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    // 1. Menampilkan semua data ruangan (READ)
    public function index()
    {
        // Mengambil semua data ruangan dari database
        return response()->json(Room::all());
    }

    // 2. Menambahkan ruangan baru (CREATE)
    public function store(Request $request)
    {
        // Validasi data yang dikirim dari form Next.js
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kapasitas' => 'required|integer|min:1',
            'fasilitas' => 'nullable|array', // Diterima sebagai array dari Next.js
            'status' => 'required|in:Aktif,Nonaktif',
            'gambar_url' => 'nullable|string',
            'model3d_url' => 'nullable|string',
        ]);

        // Simpan ke database
        $room = Room::create($validated);

        return response()->json($room, 201);
    }

    // 3. Mengedit ruangan (UPDATE)
    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kapasitas' => 'required|integer|min:1',
            'fasilitas' => 'nullable|array',
            'status' => 'required|in:Aktif,Nonaktif',
            'gambar_url' => 'nullable|string',
            'model3d_url' => 'nullable|string',
        ]);

        $room->update($validated);

        return response()->json($room);
    }

    // 4. Menghapus ruangan (DELETE)
    public function destroy($id)
    {
        Room::destroy($id);
        return response()->json(['message' => 'Ruangan berhasil dihapus']);
    }
}