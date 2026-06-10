<?php

namespace App\Exports;

use App\Models\Reservation;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ReservationsExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return Reservation::with(['user', 'facility'])
            ->where('status', 'disetujui')
            ->get()
            ->map(function($res) {
                return [
                    'Peminjam' => $res->user->name,
                    'Ruangan'  => $res->facility->name,
                    'Mulai'    => $res->start_time,
                    'Selesai'  => $res->end_time,
                    'Tujuan'   => $res->purpose,
                ];
            });
    }

    public function headings(): array {
        return ["Nama Peminjam", "Nama Ruangan", "Waktu Mulai", "Waktu Selesai", "Keperluan"];
    }
}