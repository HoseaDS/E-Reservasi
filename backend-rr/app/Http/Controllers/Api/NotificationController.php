<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NotificationController extends Controller
{
    // Fungsi untuk menarik data notifikasi milik user yang sedang login
    public function index(Request $request)
    {
        $user = $request->user();

        // Mengambil 10 notifikasi terbaru milik user
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Masing-masing data di-map agar formatnya sesuai dengan interface Frontend (Next.js)
        $formattedData = $notifications->map(function ($notif) {
            return [
                'id'     => $notif->id,
                'pesan'  => $notif->pesan,
                // Mengubah timestamp menjadi format "2 jam yang lalu" atau tanggal terbaca
                'waktu'  => Carbon::parse($notif->created_at)->diffForHumans(), 
                'unread' => (bool) $notif->unread,
            ];
    });

        return response()->json([
            'success' => true,
            'data'    => $formattedData
        ], 200);
    }

    // Fungsi untuk menandai semua notifikasi milik user tersebut sudah dibaca
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        Notification::where('user_id', $user->id)
            ->where('unread', true)
            ->update(['unread' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi telah ditandai dibaca.'
        ], 200);
    }
}