"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function EpicAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // State Form Registrasi
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regInstansi, setRegInstansi] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // --- STATE UNTUK TOAST NOTIFICATION ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isToastClosing, setIsToastClosing] = useState(false);

  const baseUrl = '/api';

  // ========================================================
  // Efek Penangkap Token Redirect Google SSO
  // ========================================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const roleFromUrl = params.get('role');
    const errorFromUrl = params.get('error');
    const nameFromUrl = params.get('name');

    if (errorFromUrl) {
      alert(errorFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    if (tokenFromUrl) {
      localStorage.clear();
      localStorage.setItem('token', tokenFromUrl);
      localStorage.setItem('user_role', roleFromUrl || 'User Bagian');
      localStorage.setItem('user_name', nameFromUrl || 'Google SSO User');

      window.history.replaceState({}, document.title, window.location.pathname);

      const userRole = roleFromUrl || 'User Bagian';
      if (userRole === 'Admin Kominfotik' || userRole === 'Superadmin') {
        window.location.href = '/admin';
      } else if (userRole === 'Verifikator' || userRole === 'Asisten/Pimpinan') {
        window.location.href = '/verifikator';
      } else {
        window.location.href = '/user';
      }
    }
  }, []);

  // --- LOGIKA AUTO-CLOSE TOAST ---
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        closeToast();
      }, 4000); // Toast akan hilang otomatis setelah 4 detik
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const closeToast = () => {
    setIsToastClosing(true);
    setTimeout(() => {
      setToastMessage(null);
      setIsToastClosing(false);
    }, 400); 
  };

  // --- HANDLER SUBMIT LOGIN ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await response.json(); 

      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');

        const actualToken = data.token || data.access_token || data.authorisation?.token; 
        
        if (actualToken) {
          localStorage.setItem('token', actualToken);
          localStorage.setItem('user_role', data.user.role);
          localStorage.setItem('user_name', data.user.name);
          
          if (data.user.role === 'Admin Kominfotik' || data.user.role === 'Superadmin') {
            window.location.href = '/admin';
          } else if (data.user.role === 'Verifikator' || data.user.role === 'Asisten/Pimpinan') {
            window.location.href = '/verifikator';
          } else {
            window.location.href = '/user';
          }
        } else {
          alert("Token tidak ditemukan dalam respon backend. Cek console log!");
        }
      } else {
          alert(data.message || "Gagal login. Periksa kembali email dan kata sandi Anda.");
      }
    } catch (err) {
      console.error(err);
      alert("Masalah koneksi jaringan ke API server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER SUBMIT REGISTRASI ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regInstansi) return alert("Pilih unit kerja / instansi Anda terlebih dahulu!");
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
          role: 'User Bagian'
        })
      });

      const data = await response.json();

      if(response.ok && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user_role', data.user?.role || 'User Bagian');

          if (data.user?.role === 'Admin Kominfotik' || data.user?.role === 'Superadmin') {
            window.location.href = '/admin';
          } else if (data.user?.role === 'Verifikator' || data.user?.role === 'Asisten/Pimpinan') {
            window.location.href = '/verifikator';
          } else {
            window.location.href = '/user';
          }
      } else {
          // [KODE DIUBAH]: Menggunakan Toast alih-alih Alert bawaan browser
          setToastMessage("Pembuatan akun berhasil! Silakan masuk menggunakan kredensial baru Anda.");
          setIsLogin(true);
          // Mengosongkan form registrasi
          setRegName('');
          setRegEmail('');
          setRegPassword('');
          setRegInstansi('');
      }

    } catch (err) {
      console.error(err);
      alert("Terjadi masalah jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER GOOGLE SSO ---
  const handleGoogleLogin = () => {
    window.location.href = `${baseUrl}/auth/google`;
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FDFDFD] font-sans overflow-hidden flex items-center justify-center selection:bg-pink-200 selection:text-pink-900">
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-pink-300/20 blur-[100px] animate-[spin_40s_linear_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-purple-300/20 blur-[120px] animate-[spin_50s_reverse_infinite]"></div>
        <div className="absolute top-[20%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-blue-200/20 blur-[100px] animate-[ping_15s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1100px] min-h-[650px] mx-4 rounded-[2.5rem] bg-white/60 border border-white backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col lg:flex-row animate-in fade-in zoom-in-95 duration-1000">
        
        <div className="w-full lg:w-[45%] p-10 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/60 bg-gradient-to-br from-white/40 to-transparent">
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="relative w-12 h-14 flex-shrink-0 drop-shadow-sm">
                <Image 
                  src="/lambang.png" 
                  alt="Lambang Jakarta Timur" 
                  fill 
                  sizes="144px"
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h2 className="text-slate-800 font-extrabold text-lg tracking-tight">E-Reservasi</h2>
                <p className="text-[10px] text-pink-500 font-bold tracking-widest uppercase">Pemerintah Kota</p>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight mb-6 tracking-tight">
              Akses <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-gradient-x drop-shadow-sm">
                Infrastruktur Elite.
              </span>
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-medium">
              Sistem manajemen penjadwalan ruang rapat terintegrasi untuk mendukung efisiensi birokrasi dan koordinasi antar unit kerja.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-[55%] p-8 md:p-14 relative flex flex-col justify-center bg-white/40">
          
          <div className="flex p-1 bg-white/60 rounded-xl border border-white shadow-sm w-fit mb-10 mx-auto lg:mx-0">
            <button onClick={() => setIsLogin(true)} className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${isLogin ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>
              Masuk Akun
            </button>
            <button onClick={() => setIsLogin(false)} className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${!isLogin ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>
              Registrasi Baru
            </button>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0 min-h-[420px] relative">
            
            {/* === PANEL FORM LOGIN === */}
            <div className={`transition-all duration-500 ${isLogin ? 'opacity-100 translate-x-0 z-10 scale-100' : 'opacity-0 -translate-x-10 z-0 scale-95 pointer-events-none absolute inset-0'}`}>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">Selamat Datang Kembali</h2>
              <p className="text-sm text-slate-500 mb-8 font-medium">Autentikasi kredensial Anda untuk melanjutkan ke dashboard.</p>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-pink-500 transition-colors">Alamat Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400 group-focus-within:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <input required type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-white/70 border border-white shadow-inner rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:bg-white transition-all placeholder-slate-300 font-medium" placeholder="name@instansi.go.id" />
                  </div>
                </div>
                
                <div className="space-y-2 group">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-pink-500 transition-colors">Kata Sandi</label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400 group-focus-within:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <input required type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-white/70 border border-white shadow-inner rounded-xl pl-11 pr-16 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:bg-white transition-all placeholder-slate-300 font-medium" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-[10px] font-bold tracking-widest text-slate-400 hover:text-pink-500 transition-colors uppercase">
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                
                <button type="submit" disabled={isSubmitting} className="w-full relative mt-8 h-12 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-bold text-white text-sm shadow-[0_8px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_8px_25px_rgba(236,72,153,0.4)] disabled:opacity-50 transition-all active:scale-[0.98]">
                  {isSubmitting ? 'Memproses...' : 'Akses Sistem'}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center space-x-3 relative">
                <div className="h-px bg-slate-200/60 w-full"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-transparent px-2">Atau</span>
                <div className="h-px bg-slate-200/60 w-full"></div>
              </div>

              <button 
                type="button" 
                onClick={handleGoogleLogin}
                className="w-full mt-6 h-12 rounded-xl bg-white/60 border border-white hover:bg-white/90 font-bold text-slate-600 text-sm shadow-[0_4px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.06)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Lanjutkan dengan Google
              </button>

            </div>

            {/* === PANEL FORM REGISTRASI === */}
            <div className={`transition-all duration-500 ${!isLogin ? 'opacity-100 translate-x-0 z-10 scale-100' : 'opacity-0 translate-x-10 z-0 scale-95 pointer-events-none absolute inset-0'}`}>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">Inisialisasi Akun</h2>
              <p className="text-sm text-slate-500 mb-6 font-medium">Konfigurasi profil baru Anda untuk mendapat hak akses.</p>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1 group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-pink-500 transition-colors">Nama Lengkap</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400 group-focus-within:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <input required type="text" value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full bg-white/70 border border-white shadow-inner rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:bg-white transition-all placeholder-slate-300 font-medium" placeholder="John Doe" />
                  </div>
                </div>

                <div className="space-y-1 group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-pink-500 transition-colors">Email Resmi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400 group-focus-within:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <input required type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full bg-white/70 border border-white shadow-inner rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:bg-white transition-all placeholder-slate-300 font-medium" placeholder="johndoe@jakarta.go.id" />
                  </div>
                </div>
                
                <div className="space-y-1 group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-pink-500 transition-colors">Unit Kerja</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400 group-focus-within:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                    <select required value={regInstansi} onChange={(e) => setRegInstansi(e.target.value)} className="w-full bg-white/70 border border-white shadow-inner rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:bg-white transition-all appearance-none cursor-pointer font-medium">
                      <option value="" disabled className="text-slate-400">Pilih Instansi Anda</option>
                      <option value="Badan Perencanaan Pembangunan Daerah">Badan Perencanaan Pembangunan Daerah</option>
                      <option value="Sekretariat Daerah">Sekretariat Daerah</option>
                      <option value="Dinas Kominfotik">Dinas Kominfotik</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-pink-500 transition-colors">Kata Sandi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400 group-focus-within:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <input 
                      required 
                      type="password" 
                      value={regPassword} 
                      onChange={(e) => setRegPassword(e.target.value)} 
                      className={`w-full bg-white/70 border shadow-inner rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 transition-all placeholder-slate-300 font-medium ${
                        regPassword.length > 0 && regPassword.length < 8 
                        ? 'border-red-300 focus:ring-red-500/10' 
                        : 'border-white focus:ring-pink-500/10 focus:bg-white'
                      }`} 
                      placeholder="Min. 8 Karakter" 
                    />
                  </div>
                  
                  {regPassword.length > 0 && regPassword.length < 8 && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 px-1 animate-in fade-in slide-in-from-top-1">
                      Minimal 8 karakter diperlukan!
                    </p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || (regPassword.length > 0 && regPassword.length < 8)} 
                  className="w-full relative mt-8 h-12 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-bold text-white text-sm shadow-[0_8px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_8px_25px_rgba(236,72,153,0.4)] disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? 'Menyimpan Kredensial...' : 'Daftarkan Kredensial'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================= */}
      {/* KOMPONEN TOAST NOTIFICATION               */}
      {/* ========================================= */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-[70] ${isToastClosing ? 'animate-out slide-out-to-right' : 'animate-in slide-in-from-right duration-300'}`}>
          <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-[0_10px_40px_rgba(52,211,153,0.15)] flex items-center space-x-4">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Berhasil!</h4>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{toastMessage}</p>
            </div>
            <button onClick={closeToast} className="pl-4 text-slate-400 hover:text-slate-800 transition duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}