<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room; // UPDATE: Menggunakan Room, bukan Facility
use App\Models\Reservation;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CalendarController extends Controller
{
    public function getMonthStatus(Request $request)
    {
        // 1. Ambil bulan & tahun (default: saat ini)
        $month = $request->input('month', Carbon::now()->month);
        $year  = $request->input('year', Carbon::now()->year);

        // 2. Hitung total ruangan yang 'Aktif' (Sesuai Enum status di tabel rooms)
        $totalRooms = Room::where('status', 'Aktif')->count();

        // 3. Ambil semua reservasi di bulan tersebut
        // Gunakan .with('room') agar nama ruangan bisa diambil sekalian
        $reservations = Reservation::with('room')
            ->whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month)
            ->whereIn('status', ['Menunggu', 'Disetujui', 'Selesai']) // Kecuali Ditolak
            ->get();

        $bookedDays = [];
        $agendas = [];

        // 4. Pengelompokan data per tanggal
        foreach ($reservations as $res) {
            $date = $res->tanggal;
            $bookedDays[$date][] = $res->room_id;

            // Memformat data agenda untuk Frontend
            $agendas[$date][] = [
                'id' => (string) $res->id,
                'waktu' => substr($res->waktu_mulai, 0, 5) . ' - ' . substr($res->waktu_selesai, 0, 5),
                'agenda' => $res->agenda,
                'ruangan' => $res->room ? $res->room->nama : 'Ruang Tidak Tersedia',
                'status' => $res->status
            ];
        }

        $calendarStatus = [];
        $daysInMonth = Carbon::createFromDate($year, $month, 1)->daysInMonth;
        $today = Carbon::now()->format('Y-m-d');

        // 5. Looping untuk menentukan status warna dan menyisipkan agenda
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $currentDate = Carbon::createFromDate($year, $month, $i)->format('Y-m-d');
            $color = 'kosong'; // Default
            
            if (isset($bookedDays[$currentDate])) {
                $uniqueRoomsBooked = count(array_unique($bookedDays[$currentDate]));
                
                if ($totalRooms > 0 && $uniqueRoomsBooked >= $totalRooms) {
                    $color = 'penuh'; // Semua ruangan terpakai
                } else {
                    $color = 'ada_jadwal'; // Ada ruangan terpakai, tapi masih sisa
                }
            }

            // Simpan juga tanda hari ini untuk styling Frontend
            if ($currentDate === $today) {
                $isToday = true;
            } else {
                $isToday = false;
            }

            $calendarStatus[] = [
                'date'         => $currentDate,
                'color'        => $color,
                'is_today'     => $isToday,
                'booked_count' => isset($bookedDays[$currentDate]) ? count(array_unique($bookedDays[$currentDate])) : 0,
                'agendas'      => $agendas[$currentDate] ?? [] // Array kosong jika tidak ada jadwal
            ];
        }

        return response()->json([
            'success' => true,
            'month'   => (int)$month,
            'year'    => (int)$year,
            'data'    => $calendarStatus
        ], 200);
    }
}