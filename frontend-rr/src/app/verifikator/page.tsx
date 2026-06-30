"use client";

import React, { useState, useEffect } from 'react';

// Pastikan interface sesuai dengan struktur JSON dari Laravel
interface Permohonan {
  id: string;
  pemohon: string;
  unit: string;
  agenda: string;
  tanggal: string;
  waktu: string;
  ruangan: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  catatan: string;
}

export default function EpicVerifikatorDashboard() {
  const [dataPermohonan, setDataPermohonan] = useState<Permohonan[]>([]);
  const [selectedItem, setSelectedItem] = useState<Permohonan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = '/api';

  const fetchPermohonan = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('user_role');
      
      if (!token || !role) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      // CEK ROLE: Jika bukan Verifikator, tendang!
      if (role !== 'Verifikator' && role !== 'Asisten/Pimpinan') {
        if (role === 'Admin Kominfotik' || role === 'Superadmin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/user';
        }
        return; 
      }
      
      const response = await fetch(`${baseUrl}/reservations`, {
        headers: { 
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Gagal mengambil data');
      
      const res = await response.json();
      
      // Mapping dari data Laravel ke struktur dashboard
      const formatted = res.data
        .filter((item: any) => item.status === 'Menunggu') 
        .map((item: any) => ({
          id: item.id.toString(),
          pemohon: item.user?.name || 'User',
          unit: item.user?.instansi || '-',
          agenda: item.agenda,
          tanggal: item.tanggal,
          waktu: `${item.waktu_mulai.substring(0,5)} - ${item.waktu_selesai.substring(0,5)}`,
          ruangan: item.room?.nama || '-',
          status: item.status,
          catatan: item.agenda
        }));

      setDataPermohonan(formatted);
    } catch (e) {
      console.error("Error fetching:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermohonan();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'Disetujui' | 'Ditolak') => {
    try {
      const token = localStorage.getItem('token'); 

      const response = await fetch(`${baseUrl}/reservations/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { 'Authorization': `Bearer ${token}` }) 
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Reservasi berhasil ${status}`);
        setSelectedItem(null);
        fetchPermohonan(); // Otomatis refresh list antrean setelah disetujui/ditolak
      } else {
        alert(result.message || `Gagal memproses verifikasi.`);
      }
    } catch (e) {
      console.error("Error updating status:", e);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="flex flex-col w-full h-full space-y-4 lg:space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex-shrink-0 bg-white/60 backdrop-blur-md rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-white shadow-sm">
        <h1 className="text-xl lg:text-2xl font-extrabold text-slate-800 tracking-tight">Menunggu Verifikasi</h1>
        <p className="text-xs lg:text-sm text-pink-500 font-bold uppercase tracking-widest mt-1">Workspace Asisten & Pimpinan</p>
      </div>

      {/* MAIN CONTENT GRID (Responsive Flex) */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 overflow-hidden pb-4 lg:pb-0">
        
        {/* PANEL KIRI: DAFTAR PERMOHONAN */}
        {/* Di mobile: Tampil penuh jika tidak ada yang dipilih, sembunyi jika ada yang dipilih */}
        <div className={`w-full lg:w-80 xl:w-96 flex-col bg-white/70 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 ${selectedItem ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-5 border-b border-white/80 bg-white/40">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center justify-between">
              Antrean Permohonan
              <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full text-[10px]">{dataPermohonan.length}</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 space-y-3">
                <svg className="w-6 h-6 animate-spin text-pink-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-xs font-bold uppercase tracking-widest">Memuat Antrean...</p>
              </div>
            ) : dataPermohonan.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <svg className="w-8 h-8 mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <p className="text-xs font-bold">Semua permohonan telah diproses.</p>
              </div>
            ) : (
              dataPermohonan.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 group ${
                    selectedItem?.id === item.id 
                      ? 'border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50 shadow-sm transform lg:translate-x-1' 
                      : 'border-transparent bg-white/60 hover:bg-white hover:border-pink-100 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-extrabold text-sm truncate pr-2 ${
                      selectedItem?.id === item.id ? 'text-pink-700' : 'text-slate-800 group-hover:text-pink-600'
                    }`}>
                      {item.pemohon}
                    </h4>
                    <span className="text-[9px] font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded flex-shrink-0 uppercase tracking-wider">Menunggu</span>
                  </div>
                  
                  <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${
                    selectedItem?.id === item.id ? 'text-pink-500/70' : 'text-slate-400'
                  }`}>
                    {item.ruangan}
                  </p>
                  
                  <p className={`text-xs line-clamp-2 leading-relaxed ${
                    selectedItem?.id === item.id ? 'text-slate-700' : 'text-slate-500'
                  }`}>
                    {item.agenda}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PANEL KANAN: DETAIL PERMOHONAN */}
        {/* Di mobile: Sembunyi jika tidak ada yang dipilih, tampil jika ada */}
        <div className={`flex-1 flex-col bg-white/70 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white p-5 lg:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)] overflow-y-auto custom-scrollbar ${!selectedItem ? 'hidden lg:flex' : 'flex'}`}>
          {selectedItem ? (
            <div className="space-y-6 lg:space-y-8 flex-1 flex flex-col h-full">
              
              {/* HEADER DETAIL & TOMBOL KEMBALI MOBILE */}
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="lg:hidden flex items-center self-start text-xs font-bold text-slate-500 hover:text-pink-600 transition-colors bg-white/80 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                  Kembali ke Daftar
                </button>
                
                <div>
                  <span className="text-[10px] font-extrabold text-pink-500 uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                    Detail Permohonan
                  </span>
                  <h3 className="text-xl lg:text-3xl font-black text-slate-800 mt-4 leading-tight">{selectedItem.ruangan}</h3>
                </div>
              </div>
              
              {/* GRID INFORMASI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 flex-1 content-start">
                <div className="bg-white/80 border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Nama Pemohon
                  </p>
                  <p className="text-sm lg:text-base font-bold text-slate-800 mt-1.5">{selectedItem.pemohon}</p>
                </div>
                
                <div className="bg-white/80 border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    Instansi / Unit
                  </p>
                  <p className="text-sm lg:text-base font-bold text-slate-800 mt-1.5">{selectedItem.unit}</p>
                </div>
                
                <div className="bg-white/80 border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Tanggal Kegiatan
                  </p>
                  <p className="text-sm lg:text-base font-bold text-slate-800 mt-1.5">{selectedItem.tanggal}</p>
                </div>
                
                <div className="bg-white/80 border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Waktu Pelaksanaan
                  </p>
                  <p className="text-sm lg:text-base font-bold text-slate-800 mt-1.5">{selectedItem.waktu} WIB</p>
                </div>

                <div className="sm:col-span-2 bg-gradient-to-br from-white/90 to-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm mt-2">
                  <p className="font-extrabold text-slate-400 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Agenda & Catatan Kegiatan
                  </p>
                  <p className="leading-relaxed text-sm lg:text-base text-slate-700 font-medium whitespace-pre-line">{selectedItem.agenda}</p>
                </div>
              </div>

              {/* AREA AKSI / TOMBOL (Lengket di bawah jika tinggi konten berlebih) */}
              <div className="mt-6 pt-5 lg:pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row gap-3">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const conf = window.confirm("Tolak permohonan ini?");
                    if(conf) handleUpdateStatus(selectedItem.id, 'Ditolak');
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl text-sm font-extrabold transition-all active:scale-95 text-center order-2 sm:order-1"
                >
                  Tolak Permohonan
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const conf = window.confirm("Setujui permohonan ini?");
                    if(conf) handleUpdateStatus(selectedItem.id, 'Disetujui');
                  }}
                  className="w-full flex-1 py-3.5 relative overflow-hidden group rounded-xl text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] transition-all active:scale-95 text-center order-1 sm:order-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    Terima Permohonan
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Pilih Permohonan</p>
              <p className="text-xs mt-2 text-slate-400">Pilih salah satu antrean di panel kiri untuk melihat detail.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}