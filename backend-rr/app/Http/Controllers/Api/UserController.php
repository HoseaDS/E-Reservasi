<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource (GET /api/users).
     */
    public function index()
    {        
        try {
            $users = User::orderBy('name', 'asc')->get();

            // Transformasi data agar sesuai dengan interface TypeScript di Next.js
            $formattedUsers = $users->map(function ($user) {
                return [
                    'id' => (string) $user->id,
                    'nama' => $user->name, // Mengubah 'name' menjadi 'nama' sesuai frontend
                    'email' => $user->email,
                    'role' => $user->role,
                    'instansi' => $user->instansi,
                    'status' => $user->status,
                ];
            });

            return response()->json($formattedUsers, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil data user', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage (POST /api/users).
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6',
                'role' => ['required', Rule::in(['Admin Kominfotik', 'Asisten/Pimpinan', 'User Bagian'])],
                'instansi' => 'required|string|max:255',
                'status' => ['required', Rule::in(['Aktif', 'Nonaktif'])],
            ]);

            $user = User::create([
                'name' => $validated['nama'],
                'email' => $validated['email'],
                'password' => Hash::make($request->password), // Enkripsi password bcrypt
                'role' => $validated['role'],
                'instansi' => $validated['instansi'],
                'status' => $validated['status'],
            ]);

            return response()->json([
                'message' => 'User baru berhasil ditambahkan!',
                'user' => [
                'id' => (string) $user->id,
                'nama' => $user->name,
                'email' => $user->email,
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menambahkan user', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Update the specified resource in storage (PUT /api/users/{id}).
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
                'role' => ['required', Rule::in(['Admin Kominfotik', 'Asisten/Pimpinan', 'User Bagian'])],
                'instansi' => 'required|string|max:255',
                'status' => ['required', Rule::in(['Aktif', 'Nonaktif'])],
            ]);

            $user->update([
                'name' => $validated['nama'],
                'email' => $validated['email'],
                'role' => $validated['role'],
                'instansi' => $validated['instansi'],
                'status' => $validated['status'],
            ]);

            // Jika ada pengisian password baru saat edit
            if ($request->filled('password')) {
                $request->validate(['password' => 'string|min:6']);
                $user->password = Hash::make($request->password);
                $user->save();
            }

            return response()->json(['message' => 'Data user berhasil diperbarui!'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memperbarui data user', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Remove the specified resource from storage (DELETE /api/users/{id}).
     */
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();

            return response()->json(['message' => 'User berhasil dihapus dari sistem!'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus user', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Fitur Tambahan: Toggle status secara cepat tanpa edit form (PATCH /api/users/{id}/toggle-status).
     */
    public function toggleStatus($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->status = ($user->status === 'Aktif') ? 'Nonaktif' : 'Aktif';
            $user->save();

            return response()->json([
                'message' => 'Status user berhasil diubah menjadi ' . $user->status,
                'status' => $user->status
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengubah status user', 'error' => $e->getMessage()], 400);
        }
    }

    // Fungsi untuk menampilkan dashboard user yang sedang login (GET /api/user)
    public function dashboard(Request $request)
    {
        try {
            // Mengambil data user yang sedang login (membutuhkan middleware auth:sanctum)
            $user = $request->user(); 

            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            // Menarik data reservasi (Jadwal) milik user tersebut
            $jadwal = $user->reservations()
                ->orderBy('created_at', 'asc') // Sesuaikan field sorting dengan tabel kamu
                ->take(5)
                ->get()
                ->map(function($res) {
                    return [
                        'id' => (string) $res->id,
                        'waktu' => $res->waktu_mulai . ' - ' . $res->waktu_selesai, // Update dengan nama kolom tabel aslimu
                        'agenda' => $res->agenda,
                        'ruangan' => $res->ruang->nama_ruangan ?? 'Ruang Belum Diset',
                        'status' => $res->status // Misal: 'Berlangsung', 'Akan Datang', 'Selesai'
                    ];
                });

            // Simulasi Metrik (Dihitung dari relasi database)
            $metrics = [
                ['label' => 'Total Reservasi', 'value' => $user->reservations()->count(), 'sub' => 'Keseluruhan'],
                ['label' => 'Menunggu', 'value' => $user->reservations()->where('status', 'Menunggu')->count(), 'sub' => 'Persetujuan'],
                ['label' => 'Digunakan', 'value' => $user->reservations()->where('status', 'Berlangsung')->count(), 'sub' => 'Hari Ini'],
            ];

            // Opsional: Jika tabel Notifikasi belum ada, kirim data kosong/dummy dari backend untuk sementara
            $notifikasi = [];

            return response()->json([
                'user' => [
                    'nama' => $user->name,
                    'instansi' => $user->instansi
                ],
                'metrics' => $metrics,
                'jadwal' => $jadwal,
                'notifikasi' => $notifikasi
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memuat dashboard', 'error' => $e->getMessage()], 500);
        }
    }

    // Method untuk Update Profil User yang sedang Login
    public function updateProfile(Request $request)
    {
        // Mengambil data user yang sedang login berdasarkan token Sanctum
        $user = $request->user();

        // Validasi input (Password bersifat opsional, hanya jika ingin diubah)
        $request->validate([
            'name' => 'required|string|max:255',
            'password' => 'nullable|string|min:8',
        ]);

        // Update Nama
        $user->name = $request->name;

        // Cek jika user mengisi form ubah password
        if ($request->filled('password')) {
            $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil dan sandi berhasil diperbarui',
            'data'    => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'instansi' => $user->instansi
            ]
        ], 200);
    }
}