"use client";

import React, { useState, useEffect } from 'react';

// Interface untuk data reservasi yang akan ditarik dari PostgreSQL (Laravel)
interface ReservationData {
  id: string;
  pemohon: string;
  instansi: string;
  ruangan: string;
  tanggal: string;
  waktu: string;
  agenda: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Selesai';
}

export default function EpicReservasiPage() {
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'Menunggu' | 'Disetujui' | 'Ditolak'>('Menunggu');
  const [formData, setFormData] = useState({
    user_id: '',
    room_id: '',
    tanggal: '',
    waktu_mulai: '',
    waktu_selesai: '',
    agenda: ''
  });

  const [rooms, setRooms] = useState<any[]>([]);

  const baseUrl = '/api';

  // FUNGSI 1: MENGAMBIL DATA DARI DATABASE
  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('user_role');
      
      // 1. Cek apakah belum login
      if (!token || !role) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      // 2. CEK ROLE: Jika bukan Admin/Superadmin, tendang ke habitat asalnya!
      const normalizedRole = role.toLowerCase().trim();
      const isAdmin = normalizedRole === 'admin kominfotik' || normalizedRole === 'superadmin';

      if (!isAdmin) {
        console.warn("Role tidak dikenali atau tidak diizinkan:", role); // Debugging
        
        if (normalizedRole === 'verifikator') {
          window.location.href = '/verifikator';
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
      
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (!response.ok) throw new Error('Network response was not ok');
      
      const resData = await response.json();
      const dataArray = resData.data || resData;

      if (dataArray && Array.isArray(dataArray)) {
        const formattedData = dataArray.map((item: any) => ({
          id: item.id.toString(),
          pemohon: item.user?.name || 'Tanpa Nama',
          instansi: item.user?.instansi || '-',
          ruangan: item.room?.nama || 'Ruangan Dihapus',
          tanggal: item.tanggal,
          waktu: `${item.waktu_mulai?.substring(0,5)} - ${item.waktu_selesai?.substring(0,5)}`,
          agenda: item.agenda,
          status: item.status
        }));
        setReservations(formattedData);
      }
    } catch (error) {
      console.error("Gagal menarik data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/rooms`, {
          headers: { 
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        }
      } catch (error) {
        console.error("Gagal menarik data ruangan:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/users`, {
          headers: { 
            'Accept': 'application/json', 
            'ngrok-skip-browser-warning': 'true',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data); 
        }
      } catch (error) { console.error("Gagal menarik data user:", error); }
    };

    fetchRooms();
    fetchUsers();
  }, []);
  

  // FUNGSI 2: MEMBERIKAN PERSETUJUAN / PENOLAKAN
  const handleUpdateStatus = async (id: string, newStatus: string) => {
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
        body: JSON.stringify({ status: newStatus })
      });

      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      const result = await response.json();

      if (response.ok) {
        await fetchReservations();
        alert("Status berhasil diubah!");
      } else {
        alert("Error: " + (result.message || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };

  // FUNGSI 3: MENGIRIM DATA RESERVASI BARU
  const handleSubmitNewReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      const resData = await response.json();

      if (response.ok) {
        setShowAddModal(false);
        setFormData({ user_id: '', room_id: '', tanggal: '', waktu_mulai: '', waktu_selesai: '', agenda: '' });
        fetchReservations();
        alert("Reservasi baru berhasil dibuat!");
      } else {
        alert(resData.message || 'Gagal membuat reservasi.');
      }
    } catch (error) {
      console.error("Error submitting reservation:", error);
    }
  };
  
// =========================================
  // LOGIKA PERHITUNGAN KARTU RINGKASAN
  // =========================================
  
  // Hitung jumlah data berdasarkan filter state 'reservations' secara KESELURUHAN
  const totalMenunggu = reservations.filter(res => res.status === 'Menunggu').length;
  
  // Menghapus pengecekan tanggal agar semua data sebelumnya ikut terhitung
  const totalDisetujui = reservations.filter(res => res.status === 'Disetujui').length;
  const totalDitolak = reservations.filter(res => res.status === 'Ditolak').length;
  const totalReservasi = reservations.length; // Total semua data yang ada

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ========================================= */}
      {/* HEADER SECTION                            */}
      {/* ========================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Data Reservasi</h1>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_#ec4899]"></span>
            Pantau dan kelola seluruh permohonan reservasi ruangan secara real-time.
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="relative group overflow-hidden rounded-xl p-[1px] shadow-sm hover:shadow-md transition-all">
          <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"></span>
          <div className="relative bg-white px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-300">
            <svg className="w-4 h-4 text-pink-500 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Buat Reservasi Baru</span>
          </div>
        </button>
      </div>

{/* ========================================= */}
      {/* SUMMARY CARDS (LIGHT GLASSMORPHISM)       */}
      {/* ========================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* Kartu: Menunggu Persetujuan */}
        <div className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-[2rem] hover:shadow-lg transition-all duration-500 relative overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest relative z-10">Menunggu Persetujuan</p>
          <h3 className="text-3xl font-black text-slate-800 mt-2 relative z-10">
            {isLoading ? '...' : totalMenunggu}
          </h3>
        </div>

        {/* Kartu: Total Disetujui */}
        <div className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-[2rem] hover:shadow-lg transition-all duration-500 relative overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest relative z-10">Total Disetujui</p>
          <h3 className="text-3xl font-black text-emerald-500 mt-2 relative z-10">
            {isLoading ? '...' : totalDisetujui}
          </h3>
        </div>

        {/* Kartu: Total Ditolak */}
        <div className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-[2rem] hover:shadow-lg transition-all duration-500 relative overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest relative z-10">Total Ditolak</p>
          <h3 className="text-3xl font-black text-rose-500 mt-2 relative z-10">
            {isLoading ? '...' : totalDitolak}
          </h3>
        </div>

        {/* Kartu: Total Semua Reservasi */}
        <div className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-[2rem] hover:shadow-lg transition-all duration-500 relative overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest relative z-10">Total Reservasi</p>
          <h3 className="text-3xl font-black text-blue-500 mt-2 relative z-10">
            {isLoading ? '...' : totalReservasi}
          </h3>
        </div>
        
      </div>

      {/* ========================================= */}
      {/* MAIN TABLE CARD (DATA REAL-TIME)          */}
      {/* ========================================= */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        
        {/* Tabs & Filters */}
        <div className="border-b border-slate-100 bg-white/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:px-8 md:py-6 gap-6">
            
            {/* Tabs */}
            <div className="flex space-x-8 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
              <button 
                onClick={() => setActiveTab('Menunggu')}
                className={`text-sm font-bold pb-4 px-1 whitespace-nowrap border-b-2 transition-all ${activeTab === 'Menunggu' ? 'text-pink-600 border-pink-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
              >
                Menunggu Persetujuan
              </button>
              <button 
                onClick={() => setActiveTab('Disetujui')}
                className={`text-sm font-bold pb-4 px-1 whitespace-nowrap border-b-2 transition-all ${activeTab === 'Disetujui' ? 'text-pink-600 border-pink-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
              >
                Disetujui
              </button>
              <button 
                onClick={() => setActiveTab('Ditolak')}
                className={`text-sm font-bold pb-4 px-1 whitespace-nowrap border-b-2 transition-all ${activeTab === 'Ditolak' ? 'text-pink-600 border-pink-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
              >
                Ditolak
              </button>
            </div>

            {/* Date Picker & Search */}
            <div className="flex gap-3 mb-2 md:mb-0">
              <div className="relative group">
                <input 
                  type="date" 
                  className="text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 py-2.5 px-4 w-40 outline-none transition-all shadow-sm font-medium"
                />
              </div>
              <div className="relative w-full md:w-64 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Cari pemohon, agenda..." 
                  className="pl-11 w-full text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 py-2.5 outline-none transition-all shadow-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Pemohon</th>
                <th className="px-6 py-5">Ruangan</th>
                <th className="px-6 py-5">Tanggal & Waktu</th>
                <th className="px-6 py-5">Agenda</th>
                <th className="px-6 py-5">Status</th>
                {activeTab === 'Menunggu' && <th className="px-8 py-5 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-slate-500 font-medium">Menghubungkan ke Database...</p>
                    </div>
                  </td>
                </tr>
              ) : reservations.filter((res) => res.status === activeTab).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300 border border-slate-100 shadow-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                      </div>
                      <h4 className="text-slate-700 font-bold mb-1">Belum Ada Data</h4>
                      <p className="text-sm text-slate-400 font-medium">Tidak ada data reservasi pada kategori ini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reservations
                .filter((res) => res.status === activeTab)
                .map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group/row">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-800 group-hover/row:text-pink-600 transition-colors">{res.pemohon}</p>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{res.instansi}</p>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-600">{res.ruangan}</td>
                    <td className="px-6 py-5">
                      <p className="text-slate-700 font-bold">{res.tanggal}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{res.waktu}</p>
                    </td>
                    <td className="px-6 py-5 text-slate-600 max-w-xs truncate font-medium" title={res.agenda}>
                      {res.agenda}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border shadow-sm
                        ${res.status === 'Menunggu' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                          res.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                          res.status === 'Ditolak' ? 'bg-rose-50 text-rose-600 border-rose-200' : 
                          'bg-blue-50 text-blue-600 border-blue-200'}`}>
                        {res.status}
                      </span>
                    </td>
                    {activeTab === 'Menunggu' && (
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handleUpdateStatus(res.id, 'Disetujui')}
                            className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm hover:shadow-md"
                            title="Terima Permohonan"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                          </button>

                          <button 
                            onClick={() => handleUpdateStatus(res.id, 'Ditolak')}
                            className="p-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm hover:shadow-md"
                            title="Tolak Permohonan"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 md:px-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data Tersinkronisasi</p>
          <div className="flex space-x-1">
            <button className="w-8 h-8 flex items-center justify-center text-xs bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 shadow-sm transition-all">&lt;</button>
            <button className="w-8 h-8 flex items-center justify-center text-xs bg-gradient-to-r from-pink-500 to-purple-500 border border-transparent rounded-lg text-white font-bold shadow-md">1</button>
            <button className="w-8 h-8 flex items-center justify-center text-xs bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 shadow-sm transition-all">2</button>
            <button className="w-8 h-8 flex items-center justify-center text-xs bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 shadow-sm transition-all">&gt;</button>
          </div>
        </div>
      </div>

      {/* ================= MODAL FORM TAMBAH RESERVASI ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6 tracking-tight">Buat Reservasi Baru</h2>
            
            <form onSubmit={handleSubmitNewReservation} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pemohon</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner"
                  value={formData.user_id} 
                  onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                  required
                >
                  <option value="" disabled>-- Pilih Pemohon --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.nama} ({user.instansi})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ruangan</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner"
                  value={formData.room_id} 
                  onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                  required
                >
                  <option value="" disabled>-- Pilih Ruangan --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>{room.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tanggal</label>
                <input type="date" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner"
                  value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mulai</label>
                  <input type="time" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner"
                    value={formData.waktu_mulai} onChange={(e) => setFormData({...formData, waktu_mulai: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Selesai</label>
                  <input type="time" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner"
                    value={formData.waktu_selesai} onChange={(e) => setFormData({...formData, waktu_selesai: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Agenda Kegiatan</label>
                <textarea required rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner resize-none"
                  value={formData.agenda} onChange={(e) => setFormData({...formData, agenda: e.target.value})}
                  placeholder="Rapat pembahasan..."
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition font-bold text-sm shadow-sm">
                  Batal
                </button>
                <button type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_8px_25px_rgba(236,72,153,0.4)] transition-all active:scale-95 text-sm">
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}