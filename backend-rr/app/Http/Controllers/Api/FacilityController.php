<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\Request;

class FacilityController extends Controller
{
    public function index()
    {
        // Mengambil semua data ruangan yang aktif
        $facilities = Facility::where('status', 'aktif')->get();
        
        return response()->json([
            'success' => true,
            'data'    => $facilities
        ], 200);
    }

    public function show($id)
    {
        $facility = Facility::find($id);
        if (!$facility) {
            return response()->json(['message' => 'Ruangan tidak ditemukan'], 404);
        }
        return response()->json(['success' => true, 'data' => $facility], 200);
    }
}