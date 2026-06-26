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
      // Sesuaikan 'item.user.name', 'item.room.nama', dll dengan struktur database Anda
      const formatted = res.data
        .filter((item: any) => item.status === 'Menunggu') // Filter hanya yang perlu diverifikasi
        .map((item: any) => ({
          id: item.id.toString(),
          pemohon: item.user?.name || 'User',
          unit: item.user?.instansi || '-',
          agenda: item.agenda,
          tanggal: item.tanggal,
          waktu: `${item.waktu_mulai.substring(0,5)} - ${item.waktu_selesai.substring(0,5)}`,
          ruangan: item.room?.nama || '-',
          status: item.status,
          catatan: item.agenda // Atau field lain jika ada
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

// KODE YANG DI-UPDATE: Menambahkan penanganan token dan bypass ngrok untuk aksi verifikasi (Setujui/Tolak)
  const handleUpdateStatus = async (id: string, status: 'Disetujui' | 'Ditolak') => {
    try {
      const token = localStorage.getItem('token'); // Mengambil token login milik Asisten/Pimpinan

      const response = await fetch(`${baseUrl}/reservations/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Wajib agar tidak diblokir halaman warning ngrok
          ...(token && { 'Authorization': `Bearer ${token}` }) // Mengirim token jika backend diproteksi auth
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
    
    <div className="flex flex-col w-full h-full p-4 space-y-6">
      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-wide">Panel Verifikasi</h1>
        <p className="text-sm text-pink-500 font-medium">Workspace Asisten & Pimpinan</p>
      </div>

      {/* Main Grid: Menggunakan flex-1 agar mengisi ruang sisa */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        
        {/* KIRI: Daftar Permohonan */}
        <div className="w-1/3 bg-white/[0.02] rounded-2xl border border-white/5 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-bold text-slate-900 text-sm">Daftar Permohonan</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading ? (
              <p className="text-gray-500 text-xs text-center p-4">Memuat data...</p>
            ) : dataPermohonan.length === 0 ? (
              <p className="text-gray-500 text-xs text-center p-4">Tidak ada antrean.</p>
            ) : (
              dataPermohonan.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  // Tambahkan variabel untuk mempermudah pengecekan status aktif
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedItem?.id === item.id 
                      ? 'border-pink-500 bg-pink-500/10' 
                      : 'border border-slate-500 bg-pink/50 hover:bg-pink hover:border-slate-300'
                  }`}
                >
                  {/* Gunakan logika ternary untuk mengubah warna teks saat dipilih */}
                  <h4 className={`font-bold text-xs transition-colors ${
                    selectedItem?.id === item.id ? 'text-pink-900' : 'text-slate-900'
                  }`}>
                    {item.pemohon}
                  </h4>
                  
                  <p className={`text-[10px] mt-1 truncate transition-colors ${
                    selectedItem?.id === item.id ? 'text-pink-700 font-medium' : 'text-slate-500'
                  }`}>
                    {item.agenda}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KANAN: Detail Permohonan */}
        <div className="flex-1 bg-white/[0.02] rounded-2xl border border-white/5 p-6 overflow-y-auto flex flex-col justify-between">
          {selectedItem ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest bg-pink-500/10 px-2.5 py-1 rounded-md border border-pink-500/20">
                    Detail Permohonan Ruangan
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-3 tracking-wide">{selectedItem.ruangan}</h3>
                </div>
                
                {/* KODE YANG DI-UPDATE: Mengisi Grid Detail Informasi */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray/[0.02] border border-gray/5 p-3 text-pink-300 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Nama Pemohon</p>
                    <p className="text-sm font-bold text-black mt-1">{selectedItem.pemohon}</p>
                  </div>
                  <div className="bg-gray/[0.02] border border-gray/5 p-3 text-pink-300 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Unit / Instansi</p>
                    <p className="text-sm font-bold text-black mt-1">{selectedItem.unit}</p>
                  </div>
                  <div className="bg-gray/[0.02] border border-gray/5 p-3 text-pink-300 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tanggal Kegiatan</p>
                    <p className="text-sm font-bold text-black mt-1">{selectedItem.tanggal}</p>
                  </div>
                  <div className="bg-gray/[0.02] border border-gray/5 p-3 text-pink-300 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Waktu Pelaksanaan</p>
                    <p className="text-sm font-bold text-black mt-1">{selectedItem.waktu}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray/[0.01] rounded-xl border border-gray/5 text-pink-300 text-xs">
                  <p className="font-bold text-gray-500 text-[10px] uppercase tracking-wider mb-2">Agenda & Catatan Kegiatan:</p>
                  <p className="leading-relaxed text-sm text-slate-900">{selectedItem.agenda}</p>
                </div>
              </div>

              {/* CONTAINER TOMBOL: Tetap dipertahankan di bagian bawah panel detail */}
              <div className="flex gap-3 pt-4 border-t border-pink/5 text-pink-300 relative z-10">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(selectedItem.id, 'Disetujui');
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-900/20 active:scale-95"
                >
                  Terima Permohonan
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(selectedItem.id, 'Ditolak');
                  }}
                  className="px-6 py-3 bg-white/5 border border-slate-200 text-red-400 hover:bg-red-500/10 hover:border-red-500/20 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Tolak
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
              Pilih permohonan untuk melihat detail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}