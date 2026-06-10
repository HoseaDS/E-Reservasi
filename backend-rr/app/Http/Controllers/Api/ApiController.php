<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Room;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ApiController extends Controller
{
    // 1. GET /api/dashboard/metrics
    public function getMetrics()
    {
        $totalRuangan = Room::count();
        $ruanganAktif = Room::where('status', 'Aktif')->count();
        
        return response()->json([
            'totalRuangan' => $totalRuangan,
            'ruanganAktif' => $ruanganAktif,
            'ruanganNonaktif' => $totalRuangan - $ruanganAktif,
            'totalReservasi' => Reservation::count(),
            'menungguPersetujuan' => Reservation::where('status', 'Menunggu')->count(),
            'tingkatPenggunaan' => '75%' // Logika statis/bisa disesuaikan rumus utilitas Anda
        ]);
    }

    // 2. GET /api/dashboard/latest-reservations
    public function getLatestReservations()
    {
        $reservations = Reservation::with(['user', 'room'])->latest()->limit(5)->get();

        $formatted = $reservations->map(function ($item) {
            return [
                'id' => (string) $item->id,
                'tanggal' => Carbon::parse($item->tanggal)->format('d M Y'),
                'pemohon' => $item->user->name ?? 'Tidak Diketahui',
                'ruangan' => $item->room->nama ?? 'Ruangan Dihapus',
                'waktu' => Carbon::parse($item->waktu_mulai)->format('H:i') . ' - ' . Carbon::parse($item->waktu_selesai)->format('H:i'),
                'status' => $item->status
            ];
        });

        return response()->json($formatted);
    }

    // 3. GET /api/reservations
    public function getReservations()
    {
        $reservations = Reservation::with(['user', 'room'])->get();

        $formatted = $reservations->map(function ($item) {
            return [
                'id' => (string) $item->id,
                'pemohon' => $item->user->name ?? '',
                'instansi' => $item->user->instansi ?? '',
                'ruangan' => $item->room->nama ?? '',
                'tanggal' => Carbon::parse($item->tanggal)->format('d/m/Y'),
                'waktu' => Carbon::parse($item->waktu_mulai)->format('H:i') . ' - ' . Carbon::parse($item->waktu_selesai)->format('H:i'),
                'agenda' => $item->agenda,
                'status' => $item->status
            ];
        });

        return response()->json($formatted);
    }

    // 4. GET /api/rooms
    public function getRooms()
    {
        $rooms = Room::all()->map(function ($item) {
            return [
                'id' => (string) $item->id,
                'nama' => $item->nama,
                'kapasitas' => $item->kapasitas,
                'fasilitas' => $item->fasilitas ?? [],
                'status' => $item->status,
                'gambarUrl' => $item->gambar_url ?? '/placeholder-room.jpg'
            ];
        });

        return response()->json($rooms);
    }

    // 5. GET /api/users
    public function getUsers()
    {
        $users = User::all()->map(function ($item) {
            return [
                'id' => (string) $item->id,
                'nama' => $item->name,
                'email' => $item->email,
                'role' => $item->role,
                'instansi' => $item->instansi ?? '-',
                'status' => $item->status
            ];
        });

        return response()->json($users);
    }
}