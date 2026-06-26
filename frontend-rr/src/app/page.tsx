"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // IMPORT COMPONENT IMAGE

export default function ProfessionalLandingPage() {
  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    // TEMA SIHIR: Background Off-White
    <div className="relative min-h-screen bg-[#FDFDFD] text-slate-800 font-sans selection:bg-pink-200 selection:text-pink-900 flex flex-col">
      
      {/* ========================================= */}
      {/* MAGICAL AMBIENT MESH GRADIENT             */}
      {/* ========================================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-pink-300/20 blur-[100px] animate-[spin_40s_linear_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-purple-300/20 blur-[120px] animate-[spin_50s_reverse_infinite]"></div>
        <div className="absolute top-[20%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-blue-200/20 blur-[100px] animate-[ping_15s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-multiply"></div>
      </div>

      {/* ========================================= */}
      {/* NAVBAR AERO GLASS                         */}
      {/* ========================================= */}
      <nav className="relative z-50 w-full border-b border-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] bg-white/60 backdrop-blur-2xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* LOGO LAMBANG PEMKOT */}
            <div className="relative w-10 h-12 flex-shrink-0 drop-shadow-sm">
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
              <h1 className="font-extrabold text-lg leading-tight text-slate-800 tracking-tight">E-Reservasi</h1>
              <p className="text-[10px] text-pink-500 uppercase tracking-widest font-bold">Jakarta Timur</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-500">
            <Link href="#" className="hover:text-pink-600 transition-colors">Beranda</Link>
            <a href="#features" onClick={scrollToFeatures} className="hover:text-pink-600 transition-colors cursor-pointer">Fasilitas</a>
            <Link href="#" className="hover:text-pink-600 transition-colors">Portal Berita</Link>
            <Link href="/login" className="px-6 py-2.5 bg-white border border-slate-200 hover:border-pink-300 rounded-xl text-slate-700 hover:text-pink-600 transition-all shadow-sm hover:shadow-md">
              Masuk Sistem
            </Link>
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* HERO SECTION                              */}
      {/* ========================================= */}
      <main className="relative z-40 flex flex-col items-center justify-center px-6 pt-24 pb-32 text-center min-h-[75vh]">
        <div className="inline-flex items-center space-x-2 bg-pink-50 border border-pink-100 px-4 py-2 rounded-full mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_#ec4899]"></span>
          <span className="text-xs font-extrabold text-pink-600 uppercase tracking-widest">Sistem Terintegrasi v2.0</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tight mb-6 max-w-4xl leading-tight">
          Modernisasi Layanan <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 drop-shadow-sm">
            Fasilitas Gedung Pemerintahan
          </span>
        </h1>

        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mb-12 font-medium leading-relaxed">
          Platform digital untuk pemantauan real-time, visualisasi tata letak 3D, dan efisiensi manajemen peminjaman ruang rapat di lingkungan Kantor Walikota Administrasi Jakarta Timur.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          <Link href="/login" className="w-full sm:w-auto relative group overflow-hidden rounded-xl p-[1px] shadow-[0_8px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_8px_30px_rgba(236,72,153,0.4)] transition-all">
            <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl"></span>
            <div className="relative bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-4 rounded-xl flex items-center justify-center space-x-3 transition-all duration-300">
              <span className="text-sm font-bold text-white tracking-wide">Mulai Reservasi</span>
              <svg className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
          </Link>

          <a href="#features" onClick={scrollToFeatures} className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md rounded-xl text-sm font-bold text-slate-700 transition-all flex items-center justify-center gap-2 group cursor-pointer">
            Pelajari Fitur 
            <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          </a>
        </div>
      </main>

      {/* ========================================= */}
      {/* PROFESSIONAL FEATURES SECTION (AERO GLASS)*/}
      {/* ========================================= */}
      <section id="features" className="relative z-30 w-full bg-white/40 border-t border-white backdrop-blur-2xl py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Kemudahan dalam Satu Genggaman</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">Dirancang secara spesifik untuk meningkatkan produktivitas aparatur sipil negara melalui infrastruktur digital yang transparan dan akuntabel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CARD 1 */}
            <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 mb-6 border border-pink-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-pink-600 transition-colors">Manajemen Jadwal Pintar</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Sinkronisasi kalender otomatis antar divisi. Mencegah terjadinya tumpang tindih waktu penggunaan ruangan secara real-time.</p>
            </div>

            {/* CARD 2 */}
            <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 mb-6 border border-purple-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-purple-600 transition-colors">Integrasi Live 3D Layout</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Eksplorasi pratinjau tata letak ruangan secara virtual dengan akurasi 3D untuk menentukan kesesuaian ruang.</p>
            </div>

            {/* CARD 3 */}
            <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6 border border-blue-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">Persetujuan Berjenjang</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Terdapat panel khusus Verifikator untuk memvalidasi kelayakan permohonan. Menjaga ketertiban birokrasi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* MEGA FOOTER (LOCKED AT BOTTOM)              */}
      {/* ========================================= */}
      <footer className="relative z-40 bg-white/80 backdrop-blur-xl border-t border-slate-200 pt-20 pb-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 lg:gap-24 mb-20">
            
            {/* Kolom 1: Brand & Info */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-4 mb-6">
                {/* LOGO LAMBANG PEMKOT */}
                <div className="relative w-12 h-14 flex-shrink-0 drop-shadow-sm">
                  <Image 
                    src="/lambang.png" 
                    alt="Lambang Jakarta Timur" 
                    fill
                    sizes="144px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-pink-500 font-extrabold mb-1">Official Portal</p>
                  <h3 className="text-xl font-black text-slate-800 leading-none tracking-tight">E-Reservasi</h3>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                Sistem informasi dan pemantauan tata letak fasilitas ruang rapat di lingkungan Kantor Walikota Administrasi Jakarta Timur.
              </p>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-pink-50 transition-all cursor-pointer border border-slate-200 text-pink-500 shadow-sm hover:shadow">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-pink-50 transition-all cursor-pointer border border-slate-200 text-pink-500 shadow-sm hover:shadow">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
              </div>
            </div>

            {/* Kolom 2: Menu Utama */}
            <div>
              <h4 className="text-slate-800 font-extrabold mb-6 text-xs uppercase tracking-widest border-b-2 border-pink-500 pb-2 inline-block">Akses Sistem</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link href="/" className="hover:text-pink-600 transition flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div> Beranda Utama</Link></li>
                <li><Link href="/login" className="hover:text-pink-600 transition flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Portal Pengguna</Link></li>
                <li><Link href="/admin" className="hover:text-pink-600 transition flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Command Center</Link></li>
                <li><Link href="/verifikator" className="hover:text-pink-600 transition flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Panel Verifikator</Link></li>
              </ul>
            </div>

            {/* Kolom 3: Layanan */}
            <div>
              <h4 className="text-slate-800 font-extrabold mb-6 text-xs uppercase tracking-widest border-b-2 border-pink-500 pb-2 inline-block">Layanan Publik</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                {["Prosedur Peminjaman", "Katalog Fasilitas", "Berita Walikota", "Pusat Bantuan (FAQ)"].map((item, i) => (
                  <li key={i}><Link href="#" className="hover:text-pink-600 transition block">{item}</Link></li>
                ))}
              </ul>
            </div>

            {/* Kolom 4: Kontak */}
            <div>
              <h4 className="text-slate-800 font-extrabold mb-6 text-xs uppercase tracking-widest border-b-2 border-pink-500 pb-2 inline-block">Kantor Pusat</h4>
              <ul className="space-y-5 text-sm font-medium text-slate-500">
                <li className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 text-pink-500 border border-slate-200 shadow-sm">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                   </div>
                   <span className="leading-relaxed">Gedung Walikota Administrasi Jakarta Timur.<br/>Jl. Dr. Sumarno, Pulo Gebang.</span>
                </li>
                <li className="flex gap-3 items-center">
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 text-pink-500 border border-slate-200 shadow-sm">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                   </div>
                   <span>(021) 4800476</span>
                </li>
              </ul>
            </div>

          </div>
          
          <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <p>© 2026 Pemerintah Kota Administrasi Jakarta Timur.</p>
              <div className="flex gap-6">
                 <Link href="#" className="hover:text-pink-600 transition">Kebijakan Privasi</Link>
                 <Link href="#" className="hover:text-pink-600 transition">Syarat & Ketentuan</Link>
              </div>
          </div>
        </div>
      </footer>

    </div>
  );
}