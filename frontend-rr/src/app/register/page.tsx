"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE UNTUK FORM REGISTRASI ---
  const [regName, setRegName] = useState('');
  const [regInstansi, setRegInstansi] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  // --- HANDLER SUBMIT REGISTRASI KE BACKEND ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!regInstansi) {
      return alert("Silakan pilih Instansi / Unit kerja Anda.");
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          instansi: regInstansi,
          role: 'User Bagian' // Default role untuk pendaftar baru
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert("Pendaftaran berhasil! Silakan masuk menggunakan akun baru Anda.");
        window.location.href = '/login'; // Otomatis pindah ke halaman login
      } else {
        alert(result.message || "Gagal mendaftarkan akun. Pastikan email belum digunakan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi masalah jaringan ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // TEMA SIHIR: Background Off-White dengan Subtle Mesh Gradient
    <div className="relative min-h-screen w-full bg-[#FDFDFD] flex items-center justify-center p-4 selection:bg-pink-200 selection:text-pink-900 font-sans overflow-hidden">
      
      {/* ========================================= */}
      {/* MAGICAL AMBIENT MESH GRADIENT             */}
      {/* ========================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-pink-300/20 blur-[100px] animate-[spin_40s_linear_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-purple-300/20 blur-[120px] animate-[spin_50s_reverse_infinite]"></div>
        <div className="absolute top-[20%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-blue-200/20 blur-[100px] animate-[ping_15s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-multiply"></div>
      </div>

      {/* Register Card - Aero Glassmorphism */}
      <div className="relative z-10 w-full max-w-lg bg-white/60 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Header */}
        <div className="text-center mb-10">
            {/* LOGO LAMBANG PEMKOT */}
            <div className="relative w-16 h-20 mx-auto mb-6 drop-shadow-sm">
              <Image 
                src="/lambang.png" 
                alt="Lambang Jakarta Timur" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Buat Akun Baru</h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">Daftarkan diri Anda untuk akses sistem E-Reservasi</p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleRegisterSubmit}>
          <div className="space-y-1.5 group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-pink-500 transition-colors">Nama Lengkap</label>
            <input 
              required
              type="text" 
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              className="w-full bg-white/70 border border-white shadow-inner rounded-xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:bg-white transition-all placeholder-slate-300 font-medium" 
              placeholder="John Doe" 
            />
          </div>

          <div className="space-y-1.5 group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-pink-500 transition-colors">Instansi / Unit</label>
            <select 
              required
              value={regInstansi}
              onChange={(e) => setRegInstansi(e.target.value)}
              className="w-full bg-white/70 border border-white shadow-inner rounded-xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:bg-white transition-all appearance-none cursor-pointer font-medium"
            >
                <option value="" disabled className="text-slate-400">Pilih Instansi...</option>
                <option value="Dinas Kominfotik">Dinas Kominfotik</option>
                <option value="Sekretariat Daerah">Sekretariat Daerah</option>
                <option value="Bappeda">Bappeda</option>
            </select>
          </div>

          <div className="space-y-1.5 group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-pink-500 transition-colors">Alamat Email</label>
            <input 
              required
              type="email" 
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="w-full bg-white/70 border border-white shadow-inner rounded-xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:bg-white transition-all placeholder-slate-300 font-medium" 
              placeholder="nama@jakarta.go.id" 
            />
          </div>

          <div className="space-y-1.5 group">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-pink-500 transition-colors">Kata Sandi</label>
            </div>
            <div className="relative">
              <input 
                required
                type={showPassword ? "text" : "password"} 
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-white/70 border border-white shadow-inner rounded-xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:bg-white transition-all pr-16 placeholder-slate-300 font-medium" 
                placeholder="••••••••" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[10px] font-bold tracking-widest text-slate-400 hover:text-pink-500 transition-colors uppercase"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-8 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_8px_25px_rgba(236,72,153,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Memproses...' : 'Daftarkan Akun'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-[#FDFDFD] text-slate-400 font-bold uppercase tracking-widest rounded-full">Atau masuk dengan</span>
            </div>
        </div>

        {/* Google SSO Button */}
        <button className="w-full flex items-center justify-center gap-3 bg-white/60 hover:bg-white/80 border border-white shadow-sm text-slate-700 font-bold py-3.5 rounded-xl transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google Workspace (SSO)
        </button>

        <div className="mt-8 text-center">
            <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                Sudah punya akun? <span className="text-pink-600">Masuk di sini</span>
            </Link>
        </div>
      </div>
    </div>
  );
}