<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\JadwalPimpinanController;
use App\Http\Controllers\Api\AuthController;

// ===================================================
// RUTE API PUBLIK (Bisa diakses tanpa login)
// ===================================================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/rooms', [RoomController::class, 'index']); // Membolehkan katalog ruangan diakses publik

// ===================================================
// RUTE API TERPROTEKSI (Wajib membawa Token Bearer Sanctum)
// ===================================================
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);

    // Endpoint Dashboard & Admin Panel Metrics
    Route::get('/dashboard/metrics', [ApiController::class, 'getMetrics']);
    Route::get('/dashboard/latest-reservations', [ApiController::class, 'getLatestReservations']);

    // Ruangan (Manipulasi data internal wajib login)
    Route::apiResource('rooms', RoomController::class)->except(['index']);

    // Reservasi Ruangan Internal
    Route::apiResource('reservations', ReservationController::class);
    Route::put('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);

    // Rute API Manajemen User
    Route::get('/user', [UserController::class, 'dashboard']);
    Route::patch('/user/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::apiResource('users', UserController::class);

    // Rute API Kalender Status Bulanan
    Route::get('/calendar/status', [CalendarController::class, 'getMonthStatus']);

    // Rute API Jadwal Internal Pimpinan
    Route::apiResource('jadwal', JadwalPimpinanController::class);
    Route::put('/jadwal/{id}/status', [JadwalPimpinanController::class, 'updateStatus']);
});