<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // KODE YANG DI-UPDATE: Menyelaraskan registrasi dengan skema Enum database asli
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'instansi' => 'required|string',
            'role'     => 'nullable|in:Admin Kominfotik,Asisten/Pimpinan,User Bagian'
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'instansi' => $request->instansi,
            'role'     => $request->role ?? 'User Bagian', // Default hak akses jika tidak diisi
            'status'   => 'Aktif',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil didaftarkan',
            'data'    => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Cek status keaktifan user sebelum memberi izin masuk
        if ($user && $user->status === 'Nonaktif') {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dinonaktifkan oleh Admin.',
            ], 403);
        }

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau Password salah.',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success'      => true,
            'message'      => 'Login Berhasil',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role, // Mengirim data role asli untuk navigasi frontend
                'instansi' => $user->instansi
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil keluar (Logout)'
        ]);
    }
}