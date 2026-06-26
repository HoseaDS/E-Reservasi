"use client";

import React, { useState, useEffect } from 'react';

interface Room {
  id: string;
  nama: string;
  kapasitas: number;
  fasilitas: string[];
  status: 'Aktif' | 'Nonaktif';
  gambarUrl: string;
  model3dUrl: string;
}

export default function EpicManajemenRuanganPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isToastClosing, setIsToastClosing] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    kapasitas: 0,
    fasilitas: '', 
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
    gambarUrl: '',
    model3dUrl: ''
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({ gambarUrl: '', model3dUrl: '' });

  const baseUrl = '/api';
  const API_URL = `${baseUrl}/rooms`;

// =========================================
  // 1. READ - Ambil Semua Data Ruangan
  // =========================================
  const fetchRooms = async () => {
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

      const response = await fetch(API_URL, {
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

      if (!response.ok) throw new Error('Gagal mengambil data dari server');
      
      const data = await response.json();
      
      const mappedRooms = data.map((room: any) => ({
        id: room.id,
        nama: room.nama,
        kapasitas: room.kapasitas,
        fasilitas: room.fasilitas,
        status: room.status,
        gambarUrl: room.gambar_url || '',  
        model3dUrl: room.model3d_url || '' 
      }));
      
      setRooms(mappedRooms); 

    } catch (error) {
      console.error(error);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(); 
  }, []);

  const closeToast = () => {
    setIsToastClosing(true);
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
      setIsToastClosing(false);
    }, 400); 
  };

  const closeDeleteModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setDeleteConfirmId(null);
      setIsModalClosing(false);
    }, 300);
  };

  useEffect(() => {
    // Auto-close untuk pesan sukses atau error
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        closeToast();
      }, 4000); // Tampil selama 4 detik
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // =========================================
  // 2. CREATE & UPDATE - Simpan Data Form
  // =========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFieldErrors({ gambarUrl: '', model3dUrl: '' }); // Reset error form
    let hasError = false;

    if (formData.gambarUrl.length > 255) {
      setFieldErrors(prev => ({ ...prev, gambarUrl: 'URL Gambar terlalu panjang! Maksimal 255 karakter.' }));
      hasError = true;
    }
    if (formData.model3dUrl.length > 255) {
      setFieldErrors(prev => ({ ...prev, model3dUrl: 'URL Model 3D terlalu panjang! Maksimal 255 karakter.' }));
      hasError = true;
    }
    
    if (hasError) return;

    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        nama: formData.nama,
        kapasitas: Number(formData.kapasitas),
        fasilitas: formData.fasilitas.split(',').map(item => item.trim()).filter(Boolean),
        status: formData.status,
        gambar_url: formData.gambarUrl, 
        model3d_url: formData.model3dUrl  
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { 'Authorization': `Bearer ${token}` }) 
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        // Jangan gunakan 'throw new Error' di sini agar Next.js tidak crash
        const errorData = await response.json().catch(() => null);
        const serverMsg = errorData?.message || errorData?.error || `Terjadi kesalahan internal (Status: ${response.status}).`;
        setErrorMessage(`Gagal menyimpan: ${serverMsg}`);
        return; // Hentikan fungsi
      }

      setSuccessMessage(editingId ? 'Data ruangan berhasil diperbarui!' : 'Ruangan baru berhasil ditambahkan!');
      setShowModal(false);
      resetForm();
      fetchRooms();
    } catch (error) {
      console.error("Error saving room:", error);
      setErrorMessage('Terjadi kesalahan jaringan saat menyimpan data.');
    }
  };

  // =========================================
  // 3. DELETE - Hapus Ruangan
  // =========================================
  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${deleteConfirmId}`, {
        method: 'DELETE',
        headers: { 
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { 'Authorization': `Bearer ${token}` }) 
        }
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (!response.ok) throw new Error('Gagal menghapus ruangan');

      setSuccessMessage('Data ruangan berhasil dihapus!');
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      setErrorMessage('Gagal menghapus ruangan.');
    } finally {
      closeDeleteModal();
    }
  };

  const handleEditClick = (room: Room) => {
    setEditingId(room.id);
    setFormData({
      nama: room.nama,
      kapasitas: room.kapasitas,
      fasilitas: room.fasilitas.join(', '),
      status: room.status,
      gambarUrl: room.gambarUrl || '',
      model3dUrl: room.model3dUrl || '' 
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ nama: '', kapasitas: 0, fasilitas: '', status: 'Aktif', gambarUrl: '', model3dUrl: '' });
    setFieldErrors({ gambarUrl: '', model3dUrl: '' }); // <--- Tambahkan ini
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Ruangan</h1>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_#ec4899]"></span>
            Kelola data master ruangan, kapasitas, dan fasilitas yang tersedia.
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="relative group overflow-hidden rounded-xl p-[1px] shadow-sm hover:shadow-md transition-all"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"></span>
          <div className="relative bg-white px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-300">
            <svg className="w-4 h-4 text-pink-500 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Tambah Ruangan Baru</span>
          </div>
        </button>
      </div>

      {/* MAIN TABLE CARD */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Ruangan</th>
                <th className="px-6 py-5">Kapasitas</th>
                <th className="px-6 py-5">Fasilitas</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-slate-500 font-medium">Memuat Data Master Ruangan...</p>
                    </div>
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300 border border-slate-100 shadow-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      </div>
                      <h4 className="text-slate-700 font-bold mb-1">Belum Ada Data Ruangan</h4>
                      <p className="text-sm text-slate-400 font-medium mb-6">Sistem siap untuk penambahan data master ruangan.</p>
                      <button 
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-[0_8px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_8px_25px_rgba(236,72,153,0.4)] transition-all active:scale-95"
                      >
                        Tambah Ruangan Pertama
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50 transition-colors group/row">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-14 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden flex-shrink-0 group-hover/row:border-pink-300 transition-colors shadow-sm">
                          {room.gambarUrl ? (
                            <img src={room.gambarUrl} alt={room.nama} className="w-full h-full object-cover opacity-90 group-hover/row:opacity-100 transition-opacity" />
                          ) : (
                             <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                             </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-800 group-hover/row:text-pink-600 transition-colors text-base">{room.nama}</span>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-slate-600 font-bold">{room.kapasitas} <span className="text-slate-400 font-medium text-xs">Orang</span></td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {room.fasilitas?.map((fasilitas, idx) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md bg-white text-slate-500 text-[10px] font-bold border border-slate-200 shadow-sm uppercase tracking-wider">
                            {fasilitas}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border shadow-sm
                        ${room.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleEditClick(room)} className="p-2 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg hover:bg-white hover:text-pink-600 transition-all shadow-sm hover:shadow-md">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onClick={() => handleDeleteClick(room.id)} className="p-2 bg-rose-50 text-rose-500 border border-rose-200 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm hover:shadow-md">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM AERO GLASS */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-xl font-extrabold text-slate-800 mb-5 tracking-tight">{editingId ? 'Edit Data Ruangan' : 'Tambah Ruangan'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1 group">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Ruangan</label>
                <input type="text" required value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner" placeholder="Meeting Room A" />
              </div>
              
              <div className="space-y-1 group">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kapasitas (Orang)</label>
                <input type="number" required min="1" value={formData.kapasitas === 0 ? '' : formData.kapasitas} onChange={(e) => setFormData({...formData, kapasitas: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner" placeholder="Jumlah orang"/>
              </div>
              
              <div className="space-y-1 group">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fasilitas (Pisah koma)</label>
                <input type="text" required value={formData.fasilitas} onChange={(e) => setFormData({...formData, fasilitas: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner" placeholder="AC, Proyektor" />
              </div>
              
              <div className="space-y-1 group">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL Gambar</label>
                <input type="text" value={formData.gambarUrl} onChange={(e) => setFormData({...formData, gambarUrl: e.target.value})} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner ${fieldErrors.gambarUrl ? 'border-red-500' : ''}`} placeholder="https://..." />
              </div>

              <div className="space-y-1 group">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Model 3D / Matterport</label>
                <input type="text" value={formData.model3dUrl} onChange={(e) => setFormData({...formData, model3dUrl: e.target.value})} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner ${fieldErrors.model3dUrl ? 'border-red-500' : ''}`} placeholder="https://..." />
              </div>
              
              <div className="space-y-1 group">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as 'Aktif' | 'Nonaktif'})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner cursor-pointer">
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition font-bold text-xs shadow-sm">Batal</button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 text-xs">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm ${isModalClosing ? 'animate-out fade-out' : 'animate-in fade-in'}`} onClick={closeDeleteModal}></div>
          <div className={`relative bg-white border border-rose-100 rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-sm w-full text-center ${isModalClosing ? 'animate-out zoom-out-95' : 'animate-in zoom-in-95'}`}>
            <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">Hapus Ruangan?</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium">Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex justify-center space-x-3">
              <button onClick={closeDeleteModal} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition font-bold text-sm shadow-sm">Batal</button>
              <button onClick={executeDelete} className="px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition font-bold text-sm shadow-lg shadow-rose-500/30">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
      
      {/* TOAST NOTIFICATION */}
      {successMessage && (
        <div className={`fixed top-6 right-6 z-[70] ${isToastClosing ? 'animate-out slide-out-to-right' : 'animate-in slide-in-from-right duration-300'}`}>
          <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-[0_10px_40px_rgba(52,211,153,0.15)] flex items-center space-x-4">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Berhasil!</h4>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{successMessage}</p>
            </div>
            <button onClick={closeToast} className="pl-4 text-slate-400 hover:text-slate-800 transition duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      )}

      {/* ================= POP-UP ERROR (TOAST MERAH) ================= */}
      {errorMessage && (
        <div className={`fixed top-6 right-6 z-[70] ${isToastClosing ? 'animate-toast-slide-out' : 'animate-toast-slide'}`}>
          <div className="bg-[#0A0A0A] border border-red-500/30 rounded-2xl p-4 shadow-[0_0_40px_rgba(239,68,68,0.15)] flex items-center space-x-4 max-w-sm">
            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Terjadi Kesalahan!</h4>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
            <button onClick={closeToast} className="pl-4 text-gray-500 hover:text-white transition duration-300">
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