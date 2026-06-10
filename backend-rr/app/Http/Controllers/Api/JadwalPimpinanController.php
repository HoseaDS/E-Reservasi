<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalPimpinan;
use Illuminate\Http\Request;

class JadwalPimpinanController extends Controller
{
    public function index()
    {
        $jadwal = JadwalPimpinan::orderBy('tanggal', 'asc')
            ->orderBy('waktu_mulai', 'asc')
            ->get();
            
        return response()->json(['success' => true, 'data' => $jadwal], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'waktu_mulai' => 'required',
            'waktu_selesai' => 'required',
            'agenda' => 'required|string',
            'tempat' => 'required|string',
            'pejabat_pelaksana' => 'required|string',
        ]);

        $jadwal = JadwalPimpinan::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Jadwal pimpinan berhasil ditambahkan',
            'data' => $jadwal
        ], 201);
    }

    // Method untuk mengubah status jadwal oleh verifikator
    public function updateStatus(Request $request, $id)
    {
        // Validasi input status agar sesuai dengan enum database
        $request->validate([
            'status' => 'required|in:Akan Datang,Selesai,Dibatalkan'
        ]);

        $jadwal = JadwalPimpinan::find($id);

        if (!$jadwal) {
            return response()->json([
                'success' => false, 
                'message' => 'Jadwal pimpinan tidak ditemukan'
            ], 404);
        }

        // Jalankan pembaruan status
        $jadwal->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status jadwal berhasil diubah menjadi ' . $request->status,
            'data' => $jadwal
        ], 200);
    }
}