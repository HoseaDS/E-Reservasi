<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Facility;

class FacilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $facilities = [
            [
                'name' => 'Meeting Room',
                'capacity' => 20,
                // Ini mengambil link embed langsung agar siap ditampilkan di iframe Next.js nanti
                'model_3d_url' => 'https://sketchfab.com/models/0bedb56a494f4d0cb1443af6d496c4f2/embed',
                'status' => 'aktif',
            ],
            [
                'name' => 'Meeting Room (2nd)',
                'capacity' => 15,
                // Menggunakan ID model yang sama sementara, karena dari teks Anda belum ada ID berbeda
                'model_3d_url' => 'https://sketchfab.com/models/0bedb56a494f4d0cb1443af6d496c4f2/embed',
                'status' => 'aktif',
            ],
            [
                'name' => 'Meeting Room (3rd)',
                'capacity' => 10,
                'model_3d_url' => 'https://sketchfab.com/models/0bedb56a494f4d0cb1443af6d496c4f2/embed',
                'status' => 'aktif',
            ],
             [
                'name' => 'Meeting Room (4th)',
                'capacity' => 10,
                'model_3d_url' => 'https://sketchfab.com/models/0bedb56a494f4d0cb1443af6d496c4f2/embed',
                'status' => 'aktif',
            ],
            [
                'name' => 'Boss Room',
                'capacity' => 5,
                'model_3d_url' => 'https://sketchfab.com/models/0bedb56a494f4d0cb1443af6d496c4f2/embed',
                'status' => 'aktif',
            ],
        ];

        foreach ($facilities as $facility) {
            Facility::create($facility);
        }
    }
}