"use client";

import React, { useState, useEffect } from 'react';

interface JadwalPimpinan {
  id: string;
  tanggal: string;
  waktu: string;
  agenda: string;
  tempat: string;
  pejabatPelaksana: string;
  pendamping: string;
  status: 'Akan Datang' | 'Selesai' | 'Dibatalkan';
}

// Tambahkan Interface untuk Ruangan
interface Room {
  id: number;
  nama: string;
}

export default function EpicKelolaJadwalPage() {
  const [jadwal, setJadwal] = useState<JadwalPimpinan[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]); // State untuk menyimpan data ruangan
  const [isLoading, setIsLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: '',
    waktu_mulai: '',
    waktu_selesai: '',
    agenda: '',
    tempat: '', // Akan diisi dari value dropdown
    pejabat_pelaksana: '',
    pendamping: '',
  });

  const baseUrl = '/api';

  const fetchJadwal = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('user_role');
      
      if (!token || !role) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (role !== 'Verifikator' && role !== 'Asisten/Pimpinan') {
        if (role === 'Admin Kominfotik' || role === 'Superadmin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/user';
        }
        return; 
      }

      const res = await fetch(`${baseUrl}/jadwal`, {
        headers: { 
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (res.ok) {
        const json = await res.json();
        const formattedData = json.data.map((item: any) => ({
          id: item.id.toString(),
          tanggal: item.tanggal,
          waktu: `${item.waktu_mulai.substring(0,5)} - ${item.waktu_selesai.substring(0,5)}`,
          agenda: item.agenda,
          tempat: item.tempat,
          pejabatPelaksana: item.pejabat_pelaksana,
          pendamping: item.pendamping || '-',
          status: item.status
        }));
        setJadwal(formattedData);
      }
    } catch (error) {
      console.error("Gagal menarik data jadwal", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi baru untuk menarik data ruangan
const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. UBAH ENDPOINT: Sesuaikan dengan nama route di routes/api.php Anda
      // Jika di Laravel namanya '/ruangan', pastikan di sini juga '/ruangan'
      const response = await fetch(`${baseUrl}/rooms`, { 
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      const result = await response.json();
      
      // 2. DEBUGGING: Lihat struktur data di Console Inspect Element
      console.log("CEK API RUANGAN:", result); 

      if (response.ok) {
        // 3. ANTISIPASI STRUKTUR JSON: 
        // Jika Laravel mengembalikan { success: true, data: [...] } gunakan result.data
        // Jika Laravel mengembalikan langsung array [...] gunakan result
        const roomData = result.data ? result.data : result;
        setRooms(roomData || []);
      }
    } catch (error) {
      console.error("Gagal menarik data ruangan:", error);
    }
  };

  useEffect(() => {
    fetchJadwal();
    fetchRooms(); // Panggil fungsi fetchRooms saat halaman dimuat
  }, [baseUrl]);

  const handleUpdateStatus = async (id: string, newStatus: 'Akan Datang' | 'Selesai' | 'Dibatalkan') => {
    const konfirmasi = window.confirm(`Apakah Anda yakin ingin mengubah status jadwal ini menjadi "${newStatus}"?`);
    if (!konfirmasi) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/jadwal/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`Status jadwal berhasil diperbarui menjadi: ${newStatus}`);
        fetchJadwal(); 
      } else {
        alert("Gagal memperbarui status jadwal.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // Handler yang bisa memproses input maupun select dropdown
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/jadwal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("Jadwal Pimpinan berhasil ditambahkan!");
        setShowAddModal(false);
        setFormData({ tanggal: '', waktu_mulai: '', waktu_selesai: '', agenda: '', tempat: '', pejabat_pelaksana: '', pendamping: '' });
        fetchJadwal();
      } else {
        alert("Gagal menambahkan jadwal.");
      }
    } catch (error) {
      console.error("Error submitting jadwal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-wide">Kelola Jadwal Pimpinan</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
            Atur agenda kegiatan Pimpinan secara real-time.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="relative group overflow-hidden rounded-xl p-[1px]"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500"></span>
          <div className="relative bg-white hover:bg-transparent px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-500">
            <svg className="w-4 h-4 text-pink-400 group-hover:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span className="text-sm font-bold text-pink-400 group-hover:text-slate-900 transition-colors">Tambah Jadwal Baru</span>
          </div>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white/[0.02] rounded-[2rem] border border-white/5 overflow-hidden shadow-[0_0_40px_rgba(236,72,153,0.05)] backdrop-blur-md">
        
        {/* Filter Bar */}
        <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 group-focus-within:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder="Cari agenda atau tempat..." 
              className="pl-11 w-full text-sm bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-gray-600 focus:ring-1 focus:ring-pink-500 focus:border-pink-500 py-3 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm text-left border-separate border-spacing-y-2">
            <thead className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Waktu Pelaksanaan</th>
                <th className="px-6 py-4">Agenda & Tempat</th>
                <th className="px-6 py-4">Pejabat & Pendamping</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi Pembaruan</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">Menghubungkan ke Database...</td>
                </tr>
              ) : jadwal.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center bg-white/[0.01] rounded-2xl border border-white/5 border-dashed text-gray-500">
                    Belum ada jadwal pimpinan yang terdaftar.
                  </td>
                </tr>
              ) : (
                jadwal.map((item) => (
                  <tr key={item.id} className="bg-white/[0.02] hover:bg-white/[0.06] transition-colors rounded-2xl group/row">
                    <td className="px-6 py-4 rounded-l-2xl">
                      <p className="font-bold text-slate-900">{item.tanggal}</p>
                      <p className="text-[11px] text-pink-400 font-medium mt-0.5">{item.waktu}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 group-hover/row:text-pink-400 transition-colors">{item.agenda}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                        {item.tempat}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-500 font-medium">{item.pejabatPelaksana}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Pendamping: {item.pendamping}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border
                        ${item.status === 'Akan Datang' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                          item.status === 'Selesai' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center rounded-r-2xl">
                      {item.status === 'Akan Datang' ? (
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handleUpdateStatus(item.id, 'Selesai')}
                            className="p-2 bg-green-500/10 text-green-500 border border-transparent hover:border-green-500/30 hover:bg-green-500/20 rounded-xl transition-all" 
                            title="Tandai Selesai"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(item.id, 'Dibatalkan')}
                            className="p-2 bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/30 hover:bg-red-500/20 rounded-xl transition-all" 
                            title="Batalkan Agenda"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Tidak ada aksi</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH JADWAL BARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white border border-slate-200 rounded-[2rem] p-8 shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Tambah Jadwal Pimpinan</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Kegiatan / Agenda</label>
                  <input required type="text" name="agenda" value={formData.agenda} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-pink-500 outline-none" placeholder="Contoh: Rapat Paripurna" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal</label>
                  <input required type="date" name="tanggal" value={formData.tanggal} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-pink-500 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Mulai</label>
                    <input required type="time" name="waktu_mulai" value={formData.waktu_mulai} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-pink-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Selesai</label>
                    <input required type="time" name="waktu_selesai" value={formData.waktu_selesai} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-pink-500 outline-none" />
                  </div>
                </div>

                {/* AREA YANG DIUBAH MENJADI DROPDOWN */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tempat Pelaksanaan</label>
                  <select 
                    required 
                    name="tempat" 
                    value={formData.tempat} 
                    onChange={handleInputChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-pink-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled hidden>-- Pilih Ruangan / Tempat --</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.nama}>{room.nama}</option>
                    ))}
                    <option value="Luar Kantor">Luar Gedung Kantor / Instansi Eksternal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pejabat Pelaksana</label>
                  <input required type="text" name="pejabat_pelaksana" value={formData.pejabat_pelaksana} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-pink-500 outline-none" placeholder="Bpk. Walikota" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pendamping (Opsional)</label>
                  <input type="text" name="pendamping" value={formData.pendamping} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-pink-500 outline-none" placeholder="Contoh: Ajudan / Sekda" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-bold transition-all shadow-sm">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-pink-500/30 hover:-translate-y-0.5 transition-transform disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}