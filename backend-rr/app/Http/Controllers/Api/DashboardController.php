<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function getMetrics()
    {
        return response()->json([
            'totalReservations' => Reservation::count(),
            'pendingCount' => Reservation::where('status', 'menunggu')->count(),
            'todayBookings' => Reservation::whereDate('start_time', Carbon::today())->count(),
        ]);
    }

    public function getLatestReservations()
    {
        // Menggunakan with() agar tidak terjadi N+1 query (lebih cepat)
        return Reservation::with(['user:id,name', 'facility:id,name'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($res) {
                return [
                    'id' => $res->id,
                    'pemohon' => $res->user->name ?? 'User',
                    'ruangan' => $res->facility->name ?? 'Ruangan',
                    'waktu' => Carbon::parse($res->start_time)->format('H:i') . ' - ' . 
                               Carbon::parse($res->end_time)->format('H:i'),
                    'tanggal' => Carbon::parse($res->start_time)->format('d M Y'),
                    'status' => $res->status
                ];
            });
    }

    /** ini tempat untuk memasukkan datasheet google dan juga API yang dapat di berikan untuk test server ini dan juga sekalian untuk test hukmal     */
    
}