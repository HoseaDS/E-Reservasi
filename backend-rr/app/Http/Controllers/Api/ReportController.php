<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReservationsExport; // Kita akan buat ini setelah ini

class ReportController extends Controller
{
    // 1. Export ke PDF
    public function exportPdf(Request $request)
    {
        $reservations = Reservation::with(['user', 'facility'])
            ->where('status', 'disetujui')
            ->get();

        // Mengarahkan ke file view blade untuk desain PDF-nya
        $pdf = Pdf::loadView('reports.reservations', compact('reservations'));
        
        return $pdf->download('laporan-reservasi.pdf');
    }

    // 2. Export ke Excel
    public function exportExcel()
    {
        return Excel::download(new ReservationsExport, 'laporan-reservasi.xlsx');
    }
}