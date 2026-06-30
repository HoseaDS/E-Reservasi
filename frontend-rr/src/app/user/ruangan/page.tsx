"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';

// --- INTERFACES ---
interface Room {
  id: string;
  nama: string;
  kapasitas: number;
  lantai: string;
  fasilitas: string[];
  gambarUrl: string;
  model3dUrl?: string;
  status: 'Tersedia' | 'Maintenance';
}

// Helper Ikon Fasilitas
const getFacilityIcon = (name: string) => {
    switch(name) {
        case 'AC': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>;
        case 'Proyektor': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>;
        case 'WiFi': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 14.16 0M1 10.597c5.857-5.858 15.355-5.858 21.212 0"></path></svg>;
        case 'Sound System': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>;
        case 'Video Conference': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>;
        default: return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>;
    }
};

export default function UserDataRuanganPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk Modal 3D Viewer
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [active3DRoom, setActive3DRoom] = useState<Room | null>(null);

  // State untuk mendeteksi client-side (agar createPortal tidak error saat SSR Next.js)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const baseUrl = '/api'; 
  
  // KODE YANG DIHAPUS: Sebelumnya ada fetch() nyasar di sini

  useEffect(() => {
    const fetchRoomsUser = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('user_role');
      
        if (!token || !role) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }

        // CEK ROLE: Jika dia adalah Admin atau Verifikator yang mencoba masuk ke area User biasa
        if (role === 'Admin Kominfotik' || role === 'Superadmin') {
          window.location.href = '/admin';
          return;
        }
        if (role === 'Verifikator') {
          window.location.href = '/verifikator';
          return;
        }

        // KODE YANG DIPERBAIKI: Mengubah baseUrl menjadi `${baseUrl}/rooms`
        const response = await fetch(`${baseUrl}/rooms`, {
          headers: { 
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        if (!response.ok) throw new Error('Gagal menarik data ruangan');
        
        const data = await response.json();
        
        const mappedRooms: Room[] = data.map((room: any) => ({
          id: room.id.toString(), 
          nama: room.nama,
          kapasitas: room.kapasitas,
          lantai: 'Lantai Belum Diset', 
          fasilitas: room.fasilitas || [],
          gambarUrl: room.gambar_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
          model3dUrl: room.model3d_url || '',
          status: room.status === 'Aktif' ? 'Tersedia' : 'Maintenance'
        }));
        
        setRooms(mappedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomsUser();
  }, []);

  const open3DViewer = (room: Room) => {
    setActive3DRoom(room);
    setIs3DModalOpen(true);
  };

  const getClean3DUrl = (url: string) => {
    const hasParams = url.includes('?');
    return `${url}${hasParams ? '&' : '?'}autostart=1&ui_infos=0&ui_watermark=0&ui_controls=1`;
  };

  // Komponen Modal 3D yang dibebaskan (Portal)
  const render3DModal = () => {
    if (!is3DModalOpen || !active3DRoom || !mounted) return null;
    
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 md:p-10">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIs3DModalOpen(false)}></div>
        
        <div className="relative w-full h-full sm:h-[85vh] max-w-5xl bg-white border border-slate-200 sm:rounded-[2rem] shadow-[0_20px_80px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
          
          {/* Modal Header Light Theme */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex justify-between items-center gap-3 bg-slate-50/80 backdrop-blur-md relative z-20">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-extrabold text-slate-800 flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_#ec4899] flex-shrink-0"></span>
                <span className="truncate">Live 3D Layout: <span className="text-pink-600">{active3DRoom.nama}</span></span>
              </h3>
            </div>
            <button onClick={() => setIs3DModalOpen(false)} className="flex-shrink-0 text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm p-2 rounded-full transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Iframe Body */}
          <div className="flex-1 bg-slate-900 w-full h-full relative overflow-hidden">
            {!active3DRoom.model3dUrl ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-0 bg-slate-100 px-6 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <p className="font-bold text-slate-500">Model 3D belum tersedia untuk ruangan ini.</p>
              </div>
            ) : (
              <iframe 
                title={`3D View ${active3DRoom.nama}`} 
                src={getClean3DUrl(active3DRoom.model3dUrl)} 
                className="absolute inset-0 w-full h-full z-0" 
                frameBorder="0" 
                allow="autoplay; fullscreen; vr"
              ></iframe>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-between items-center relative z-20">
             <p className="text-xs font-medium text-slate-500 hidden md:block">Gunakan mouse/touch untuk memutar (Rotate) dan Zoom (Scroll).</p>
             <Link href={`/user/reservasi?room=${active3DRoom.id}`} className="w-full sm:w-auto">
               <button className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-lg hover:shadow-pink-500/30 text-white text-sm font-bold rounded-xl transition-all active:scale-95">
                 Booking Ruangan Ini
               </button>
             </Link>
          </div>

        </div>
      </div>,
      document.body
    );
  };

  const filteredRooms = rooms.filter((room) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return room.nama.toLowerCase().includes(q) || room.lantai.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Katalog Ruangan</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Jelajahi fasilitas dan lihat layout 3D dari ruangan yang tersedia.
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative group w-full md:min-w-[250px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama ruangan..." 
              className="pl-11 pr-9 w-full text-sm bg-white/80 backdrop-blur-md border border-white rounded-xl text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 py-3 outline-none transition-all shadow-[0_8px_30px_rgba(0,0,0,0.03)] font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                type="button"
                aria-label="Hapus pencarian"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GRID RUANGAN (Aero Glass Theme) */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
           <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat katalog ruangan...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300 border border-slate-100 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <h4 className="text-slate-700 font-bold mb-1">Ruangan Tidak Ditemukan</h4>
          <p className="text-sm text-slate-400 font-medium mb-6">Tidak ada ruangan yang cocok dengan pencarian "{searchQuery}".</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-pink-500 hover:text-pink-600 uppercase tracking-widest transition-colors"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-8">
          {filteredRooms.map((room) => (
            <div key={room.id} className="group bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden transition-all duration-500 flex flex-col hover:-translate-y-1">
              
              {/* Gambar / Cover */}
              <div className="relative h-44 sm:h-56 overflow-hidden bg-slate-100">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
                <img src={room.gambarUrl} alt={room.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
                
                {/* Badges di atas gambar */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-md border shadow-sm ${
                    room.status === 'Tersedia' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-rose-500/90 text-white border-rose-400'
                  }`}>
                    {room.status}
                  </span>
                </div>

                {/* Tombol 3D (Jika ada URL 3D) */}
                {room.model3dUrl && (
                  <button 
                    onClick={() => open3DViewer(room)}
                    className="absolute bottom-4 right-4 z-20 bg-white/90 hover:bg-white backdrop-blur-md text-pink-600 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-white shadow-lg transition-all hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
                    Lihat 3D
                  </button>
                )}
              </div>

              {/* Info Detail */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col bg-white/40">
                <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-1 group-hover:text-pink-600 transition-colors leading-tight">{room.nama}</h3>
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-5 sm:mb-6">
                  <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                  {room.lantai}
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="bg-white border border-slate-100 p-3 sm:p-3.5 rounded-xl shadow-sm">
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Kapasitas</p>
                    <p className="text-sm font-extrabold text-slate-700 mt-1">{room.kapasitas} Orang</p>
                  </div>
                  <div className="bg-white border border-slate-100 p-3 sm:p-3.5 rounded-xl shadow-sm">
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID Ruang</p>
                    <p className="text-sm font-extrabold text-slate-700 mt-1 truncate">{room.id}</p>
                  </div>
                </div>

                {/* Fasilitas */}
                <div className="mb-6 flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Fasilitas Tersedia</p>
                  <div className="flex flex-wrap gap-2">
                    {room.fasilitas.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 shadow-sm" title={f}>
                        {getFacilityIcon(f)}
                        <span className="text-[10px] font-bold tracking-wide">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <Link href={`/user/reservasi?room=${room.id}`} className="block w-full">
                  <button 
                    disabled={room.status !== 'Tersedia'}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      room.status === 'Tersedia' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-[0_8px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_8px_25px_rgba(236,72,153,0.4)] active:scale-95' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                    }`}
                  >
                    {room.status === 'Tersedia' ? 'Booking Ruangan Ini' : 'Tidak Tersedia'}
                  </button>
                </Link>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENDER MODAL 3D DENGAN PORTAL AGAR BEBAS DARI Z-INDEX TRAP */}
      {render3DModal()}

    </div>
  );
}