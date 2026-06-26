"use client";

import React, { useState, useEffect } from 'react';

// --- INTERFACES ---
interface Permohonan {
  id: string;
  pemohon: string;
  unit: string;
  agenda: string;
  tanggal: string;
  waktu: string;
  ruangan: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak' | string;
  model3dUrl: string;
}

export default function VerifikasiReservasiPage() {
  const [dataPermohonan, setDataPermohonan] = useState<Permohonan[]>([]);
  const [selectedItem, setSelectedItem] = useState<Permohonan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const baseUrl = '/api';

  // =========================================
  // 1. FETCH DATA ANTREAN RESERVASI
  // =========================================
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
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) throw new Error('Gagal mengambil data');
      
      const res = await response.json();
      
      // MAPPING DATA: Ambil hanya yang butuh persetujuan
      const formatted = res.data
        .filter((item: any) => item.status === 'Menunggu') 
        .map((item: any) => ({
          id: item.id.toString(),
          pemohon: item.user?.name || 'Pengguna Sistem',
          unit: item.user?.instansi || 'Instansi Tidak Diketahui',
          agenda: item.agenda,
          tanggal: item.tanggal,
          waktu: `${item.waktu_mulai.substring(0,5)} - ${item.waktu_selesai.substring(0,5)}`,
          ruangan: item.room?.nama || 'Ruang Dihapus',
          status: item.status,
          model3dUrl: item.room?.model3d_url || ''
        }));

      setDataPermohonan(formatted);
      
      // Auto-select item pertama jika ada data dan belum ada yang dipilih
      if (formatted.length > 0 && !selectedItem) {
        setSelectedItem(formatted[0]);
      } else if (formatted.length === 0) {
        setSelectedItem(null);
      }
    } catch (e) {
      console.error("Error fetching permohonan:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermohonan();
  }, [baseUrl]);

  // =========================================
  // 2. FUNGSI UPDATE STATUS (SETUJUI / TOLAK)
  // =========================================
  const handleUpdateStatus = async (id: string, status: 'Disetujui' | 'Ditolak') => {
    setIsProcessing(true);
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

      if (response.ok) {
        alert(`Sukses! Permohonan telah ${status}.`);
        setSelectedItem(null);
        fetchPermohonan(); // Refresh daftar otomatis
      } else {
        const res = await response.json();
        alert(res.message || 'Gagal memproses verifikasi.');
      }
    } catch (e) {
      console.error("Error updating status:", e);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper membersihkan URL Sketchfab/Matterport agar optimal
  const getClean3DUrl = (url: string) => {
    const hasParams = url.includes('?');
    return `${url}${hasParams ? '&' : '?'}autostart=1&ui_infos=0&ui_watermark=0&ui_controls=1`;
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-wide">Verifikasi Reservasi</h1>
        <p className="text-sm text-pink-500 font-medium mt-1">Workspace Asisten & Pimpinan</p>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden min-h-[600px]">
        
        {/* KIRI: List Antrean */}
        <div className="lg:w-1/3 bg-white/60 border border-slate-200 rounded-[2rem] flex flex-col backdrop-blur-md overflow-hidden h-[400px] lg:h-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-bold text-slate-900 text-sm">Daftar Permohonan</h3>
              <span className="bg-pink-500 text-slate-900 text-[10px] font-bold px-2 py-1 rounded-md">
                {dataPermohonan.length} Antrean
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {isLoading ? (
                  <p className="text-center text-gray-500 text-xs py-10">Memuat data sinkronisasi...</p>
                ) : dataPermohonan.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-gray-500 h-full space-y-3">
                    <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p className="text-xs">Tidak ada antrean baru.</p>
                  </div>
                ) : (
                  dataPermohonan.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)} 
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedItem?.id === item.id 
                            ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.1)]' 
                            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                        }`}
                      >
                          <div className="flex justify-between mb-2">
                              <h4 className="font-bold text-slate-900 text-xs">{item.pemohon}</h4>
                              <span className="text-[8px] font-bold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 uppercase tracking-widest">{item.status}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{item.agenda}</p>
                      </div>
                  ))
                )}
            </div>
        </div>

        {/* KANAN: Detail View */}
        <div className="flex-1 bg-white/60 border border-slate-200 rounded-[2rem] backdrop-blur-md flex flex-col overflow-hidden h-[600px] lg:h-auto">
            {selectedItem ? (
              <>
                <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="font-bold text-slate-900">Detail Permohonan</h3>
                    <span className="text-[10px] font-mono text-gray-500 bg-black/40 px-3 py-1 rounded-full border border-white/5">ID: {selectedItem.id}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                    
                    {/* Grid Informasi Inti */}
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        {[
                            {label: 'Pemohon', val: selectedItem.pemohon},
                            {label: 'Instansi / Unit', val: selectedItem.unit},
                            {label: 'Tanggal', val: selectedItem.tanggal},
                            {label: 'Waktu', val: selectedItem.waktu},
                            {label: 'Ruangan', val: selectedItem.ruangan}
                        ].map((info, i) => (
                            <div key={i} className={`bg-white/[0.02] p-4 rounded-xl border border-white/5 ${i === 4 ? 'col-span-2' : ''}`}>
                                <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">{info.label}</span>
                                <span className="text-slate-900 text-sm font-medium">{info.val}</span>
                            </div>
                        ))}
                    </div>

                    {/* Deskripsi Lengkap Agenda & Catatan */}
                    <div className="bg-white/[0.01] p-5 rounded-xl border border-white/5 text-gray-300 text-xs leading-relaxed">
                        <span className="text-pink-400 block text-[10px] uppercase font-bold tracking-wider mb-2">Deskripsi Agenda & Catatan:</span>
                        {selectedItem.agenda}
                    </div>

                    {/* 3D Layout Dinamis dengan Shadow Overlay */}
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-4">Layout Ruangan</h4>
                        <div className="w-full aspect-video rounded-2xl border border-slate-200 overflow-hidden bg-black relative">
                            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent z-10 pointer-events-none"></div>
                            
                            {selectedItem.model3dUrl ? (
                              <iframe 
                                  title={`3D Room Layout ${selectedItem.ruangan}`} 
                                  src={getClean3DUrl(selectedItem.model3dUrl)} 
                                  className="w-full h-full relative z-0" 
                                  frameBorder="0"
                                  allow="autoplay; fullscreen; vr"
                              ></iframe>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                                <svg className="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                <p className="text-xs">Model 3D tidak dilampirkan oleh Admin</p>
                              </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-6 border-t border-slate-200 bg-white/[0.02] flex justify-end gap-3">
                    <button 
                      onClick={() => handleUpdateStatus(selectedItem.id, 'Ditolak')}
                      disabled={isProcessing}
                      className="px-6 py-2.5 font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10 disabled:opacity-50 rounded-xl text-sm transition-all"
                    >
                      X Tolak
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedItem.id, 'Disetujui')}
                      disabled={isProcessing}
                      className="px-6 py-2.5 font-bold text-slate-900 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20 disabled:opacity-50 text-sm hover:scale-[1.02] transition-transform"
                    >
                      {isProcessing ? 'Memproses...' : 'Setujui Permohonan'}
                    </button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
                Pilih salah satu permohonan di sebelah kiri.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}