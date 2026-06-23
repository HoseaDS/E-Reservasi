<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http; // Tambahan untuk hit API Google
use Illuminate\Support\Str;          // Tambahan untuk generate password acak

class AuthController extends Controller
{
    // ===================================================
    // REGISTRASI MANUAL
    // ===================================================
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

    // ===================================================
    // LOGIN MANUAL
    // ===================================================
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
                'name'     => $user->name,
                'email'    => $user->email,
                'role'     => $user->role, // Mengirim data role asli untuk navigasi frontend
                'instansi' => $user->instansi
            ]
        ]);
    }

    // ===================================================
    // LOGOUT
    // ===================================================
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil keluar (Logout)'
        ]);
    }

    // ===================================================
    // FITUR GOOGLE SSO (MURNI TANPA PACKAGE)
    // ===================================================
    public function redirectToGoogle(Request $request)
    {
        // 1. UPDATE: Tangkap URL asli dari mana frontend memanggil API ini (misal 192.168.x.x)
        $origin = $request->header('origin') ?? $request->header('referer') ?? env('FRONTEND_URL', 'http://localhost:3000');
        $origin = rtrim($origin, '/');

        // 2. UPDATE: Encode URL tersebut agar aman disisipkan ke URL Google
        $state = base64_encode($origin);

        $query = http_build_query([
            'client_id'     => config('services.google.client_id'),
            'redirect_uri'  => config('services.google.redirect'),
            'response_type' => 'code',
            'scope'         => 'openid profile email',
            'prompt'        => 'select_account',
            'state'         => $state, // <-- KODE DITAMBAHKAN: Sisipkan state di sini
        ]);

        return redirect('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    public function handleGoogleCallback(Request $request)
    {
        // 1. UPDATE: Ambil kembali URL dinamis dari parameter 'state' yang dikembalikan Google
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        if ($request->has('state')) {
            $decoded = base64_decode($request->state);
            // Validasi apakah hasil decode benar-benar sebuah URL yang valid
            if (filter_var($decoded, FILTER_VALIDATE_URL)) {
                $frontendUrl = $decoded;
            }
        }
        
        // Bentuk URL akhir untuk login
        $frontendUrl = rtrim($frontendUrl, '/');
        
        $code = $request->code;

        if (!$code) {
            return redirect()->away($frontendUrl . '?error=' . urlencode('Otorisasi Google dibatalkan.'));
        }

        // 2. Tukar auth 'code' dengan 'access_token'
        $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id'     => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri'  => config('services.google.redirect'),
            'grant_type'    => 'authorization_code',
            'code'          => $code,
        ]);

        $tokenData = $tokenResponse->json();

        if (!isset($tokenData['access_token'])) {
            return redirect()->away($frontendUrl . '?error=' . urlencode('Gagal mendapatkan akses token dari Google.'));
        }

        // 3. Ambil data profil user dari Google
        $userResponse = Http::withToken($tokenData['access_token'])
            ->get('https://www.googleapis.com/oauth2/v3/userinfo');

        $googleUser = $userResponse->json();

        if (!isset($googleUser['email'])) {
            return redirect()->away($frontendUrl . '?error=' . urlencode('Gagal mengambil informasi email dari Google.'));
        }

        // 4. Cari user berdasarkan email di database
        $user = User::where('email', $googleUser['email'])->first();

        // Antisipasi jika user ditemukan namun statusnya Nonaktif
        if ($user && $user->status === 'Nonaktif') {
            return redirect()->away($frontendUrl . '?error=' . urlencode('Akun Anda telah dinonaktifkan oleh Admin.'));
        }

        if (!$user) {
            // Jika belum terdaftar, buat akun baru otomatis dengan skema database Anda
            $user = User::create([
                'name'     => $googleUser['name'],
                'email'    => $googleUser['email'],
                'password' => Hash::make(Str::random(16)), 
                'instansi' => '-',                         
                'role'     => 'User Bagian',               
                'status'   => 'Aktif',
            ]);
        }

        // 5. Buat token autentikasi (Sanctum)
        $token = $user->createToken('auth_token')->plainTextToken;

        // 6. Alihkan kembali ke frontend (yang IP-nya dinamis)
        return redirect()->away($frontendUrl . '?token=' . $token . '&role=' . urlencode($user->role) . '&name=' . urlencode($user->name));
    }
}