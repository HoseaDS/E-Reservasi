<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index()
    {
        // Daftar pertanyaan dan jawaban statis untuk Chatbot
        $faqs = [
            [
                'id' => 1,
                'question' => 'Bagaimana cara melakukan reservasi ruangan?',
                'answer' => 'Silakan Login terlebih dahulu, masuk ke menu "Reservasi Ruangan", pilih ruangan yang tersedia pada tanggal yang Anda inginkan, lalu isi detail keperluan kegiatan.'
            ],
            [
                'id' => 2,
                'question' => 'Berapa lama proses persetujuan (approval) reservasi saya?',
                'answer' => 'Proses persetujuan oleh Admin atau Pimpinan biasanya memakan waktu maksimal 1x24 jam hari kerja.'
            ],
            [
                'id' => 3,
                'question' => 'Bagaimana jika jadwal yang saya inginkan sudah berwarna merah?',
                'answer' => 'Warna merah pada kalender berarti ruangan tersebut sudah penuh (Full Booked) di hari itu. Silakan cari tanggal lain atau pilih ruangan yang berbeda.'
            ],
            [
                'id' => 4,
                'question' => 'Apakah saya bisa membatalkan reservasi?',
                'answer' => 'Bisa, selama status reservasi Anda masih "Menunggu". Jika sudah "Disetujui", Anda harus menghubungi Admin Kominfotik secara langsung.'
            ],
            [
                'id' => 5,
                'question' => 'Bagaimana cara melihat Blueprint atau bentuk 3D ruangan?',
                'answer' => 'Saat Anda berada di halaman pemilihan ruangan, klik tombol "Lihat 3D". Sistem akan memunculkan denah ruangan interaktif yang bisa Anda putar dan zoom.'
            ]
        ];

        return response()->json([
            'success' => true,
            'message' => 'Data FAQ Chatbot berhasil diambil',
            'data'    => $faqs
        ], 200);
    }
}