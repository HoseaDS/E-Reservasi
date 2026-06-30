"use client";

import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  nama: string;
  email: string;
  role: 'Admin Kominfotik' | 'Asisten/Pimpinan' | 'User Bagian';
  instansi: string;
  status: 'Aktif' | 'Nonaktif';
}

export default function EpicUserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'User Bagian',
    instansi: '',
    status: 'Aktif'
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isToastClosing, setIsToastClosing] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  const baseUrl = '/api';
  const API_URL = `${baseUrl}/users`;

  // =========================================
  // 1. READ - Ambil Semua Data User (Protected)
  // =========================================
  const fetchUsers = async () => {
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
      setUsers(data);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const closeToast = () => {
    setIsToastClosing(true);
    setTimeout(() => {
      setSuccessMessage(null);
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

  // =========================================
  // 2. CREATE & UPDATE - Simpan Data Form
  // =========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';

      const payload: any = { ...formData };
      if (editingId && !payload.password) {
        delete payload.password;
      }

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

      if (!response.ok) {
         const errorBody = await response.text();
         console.error("ALASAN GAGAL DARI LARAVEL:", errorBody);
         throw new Error('Gagal menyimpan data user');
      }

      setSuccessMessage(editingId ? 'Data user berhasil diperbarui!' : 'User baru berhasil ditambahkan!');
      setShowModal(false);
      
      setTimeout(() => {
        closeToast();
      }, 3000);

      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert('Terjadi kesalahan saat menyimpan data.');
    }
  };

  // =========================================
  // 3. DELETE - Hapus Pengguna
  // =========================================
  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
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

      if (!response.ok) throw new Error('Gagal menghapus data');

      setUsers(users.filter(u => u.id !== deleteConfirmId));
      
      setDeleteConfirmId(null);
      setSuccessMessage('Data pengguna berhasil dihapus!');
      
      setTimeout(() => {
        closeToast();
      }, 3000);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Gagal menghapus pengguna. Periksa koneksi backend.');
    }
  };

  // =========================================
  // 4. PATCH - Ubah Status
  // =========================================
  const handleToggleStatus = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/user/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { 
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) throw new Error('Gagal mengubah status');

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === id
            ? { ...user, status: user.status === 'Aktif' ? 'Nonaktif' : 'Aktif' }
            : user
        )
      );
    } catch (error) {
      console.error("Error toggling status:", error);
      alert('Gagal mengubah status pengguna.');
    }
  };

  const handleEditClick = (user: User) => {
    setEditingId(user.id);
    setFormData({
      nama: user.nama,
      email: user.email,
      password: '', 
      role: user.role,
      instansi: user.instansi,
      status: user.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nama: '',
      email: '',
      password: '',
      role: 'User Bagian',
      instansi: '',
      status: 'Aktif'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ========================================= */}
      {/* HEADER SECTION                            */}
      {/* ========================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Manajemen Pengguna</h1>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_#ec4899] flex-shrink-0"></span>
            Sistem Pengaturan Akses Internal Perkantoran
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="relative group overflow-hidden rounded-xl p-[1px] shadow-sm hover:shadow-md transition-all w-full md:w-auto"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"></span>
          <div className="relative bg-white px-6 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300">
            <svg className="w-4 h-4 text-pink-500 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Tambah Pengguna</span>
          </div>
        </button>
      </div>

      {/* ========================================= */}
      {/* MAIN CONTENT CARD                         */}
      {/* ========================================= */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] border border-white overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">

        {/* ===== MOBILE: CARD LIST (< md) ===== */}
        <div className="md:hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 font-medium">Memuat data pengguna dari database...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 px-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300 border border-slate-100 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <h4 className="text-slate-700 font-bold mb-1">Belum Ada Data</h4>
              <p className="text-sm text-slate-400 font-medium">Sistem siap menerima pendaftaran akun baru.</p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{user.nama}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">{user.email}</p>
                    <p className="text-xs text-slate-600 mt-1 font-bold">{user.instansi}</p>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(user.id)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border shadow-sm transition-all cursor-pointer ${
                      user.status === 'Aktif'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white'
                      : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-500 hover:text-white'
                    }`}
                  >
                    {user.status}
                  </button>
                </div>

                <span className={`inline-block px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border shadow-sm ${
                  user.role === 'Admin Kominfotik' ? 'bg-pink-50 text-pink-600 border-pink-200' :
                  user.role === 'Asisten/Pimpinan' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-purple-50 text-purple-600 border-purple-200'
                }`}>
                  {user.role}
                </span>

                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(user)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteClick(user.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ===== DESKTOP: TABLE (>= md) ===== */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Nama Pegawai / Akun</th>
                <th className="px-6 py-5">Unit Kerja / Instansi</th>
                <th className="px-6 py-5">Hak Akses (Role)</th>
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
                      <p className="text-sm text-slate-500 font-medium">Memuat data pengguna dari database...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300 border border-slate-100 shadow-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      </div>
                      <h4 className="text-slate-700 font-bold mb-1">Belum Ada Data</h4>
                      <p className="text-sm text-slate-400 font-medium">Sistem siap menerima pendaftaran akun baru.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group/row">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-800 group-hover/row:text-pink-600 transition-colors">{user.nama}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{user.email}</p>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-600">{user.instansi}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border shadow-sm ${
                        user.role === 'Admin Kominfotik' ? 'bg-pink-50 text-pink-600 border-pink-200' :
                        user.role === 'Asisten/Pimpinan' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-purple-50 text-purple-600 border-purple-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => handleToggleStatus(user.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border shadow-sm transition-all cursor-pointer ${
                          user.status === 'Aktif' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white' 
                          : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-500 hover:text-white'
                        }`}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="p-2 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg hover:bg-white hover:text-pink-600 transition-all shadow-sm hover:shadow-md"
                          title="Edit Pengguna"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(user.id)}
                          className="p-2 bg-rose-50 text-rose-500 border border-rose-200 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm hover:shadow-md"
                          title="Hapus Pengguna"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* MODAL FORM TAMBAH / EDIT                  */}
      {/* ========================================= */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white border border-slate-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6 tracking-tight">{editingId ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                <input 
                  type="text" required value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Official</label>
                <input 
                  type="email" required value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner"
                  placeholder="name@jakarta.go.id"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {editingId ? 'Password Baru (Opsional)' : 'Password Akun'}
                </label>
                <input 
                  type="password" 
                  required={!editingId} 
                  minLength={editingId ? undefined : 6}
                  placeholder={editingId ? "Kosongkan jika tidak diubah..." : "Minimal 6 karakter..."}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 transition-all shadow-inner ${
                    !editingId && formData.password.length > 0 && formData.password.length < 6 
                      ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-pink-500/10 focus:border-pink-400'
                  }`}
                />
                {!editingId && (
                  <p className={`text-[10px] mt-1.5 font-bold tracking-wide transition-colors duration-300 ${
                    formData.password.length > 0 && formData.password.length < 6 ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    * Harus mengandung minimal 6 karakter
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Unit Kerja / Instansi</label>
                <input 
                  type="text" required value={formData.instansi}
                  onChange={(e) => setFormData({...formData, instansi: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner"
                  placeholder="Misal: Suku Dinas Kominfotik"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Hak Akses Sistem</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 transition-all shadow-inner appearance-none cursor-pointer"
                >
                  <option value="User Bagian">User Bagian (Pemohon)</option>
                  <option value="Asisten/Pimpinan">Asisten / Pimpinan (Verifikator)</option>
                  <option value="Admin Kominfotik">Admin Kominfotik (Superadmin)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button 
                  type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition font-bold text-sm shadow-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={!editingId && formData.password.length < 6} 
                  className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-sm ${
                    !editingId && formData.password.length < 6
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_8px_25px_rgba(236,72,153,0.4)]' 
                  }`}
                >
                  {editingId ? 'Simpan Perubahan' : 'Daftarkan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL KONFIRMASI HAPUS                    */}
      {/* ========================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm ${isModalClosing ? 'animate-out fade-out' : 'animate-in fade-in'}`} onClick={closeDeleteModal}></div>
          <div className={`relative bg-white border border-rose-100 rounded-[2rem] sm:rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-sm w-full text-center ${isModalClosing ? 'animate-out zoom-out-95' : 'animate-in zoom-in-95'}`}>
            <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">Hapus Pengguna?</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium">Data pengguna yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?</p>
            <div className="flex justify-center space-x-3">
              <button onClick={closeDeleteModal} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition font-bold text-sm shadow-sm">Batal</button>
              <button onClick={confirmDelete} className="px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition font-bold text-sm shadow-lg shadow-rose-500/30">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* TOAST NOTIFICATION                        */}
      {/* ========================================= */}
      {successMessage && (
        <div className={`fixed top-4 sm:top-6 right-4 sm:right-6 left-4 sm:left-auto z-[70] ${isToastClosing ? 'animate-out slide-out-to-right' : 'animate-in slide-in-from-right duration-300'}`}>
          <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-[0_10px_40px_rgba(52,211,153,0.15)] flex items-center space-x-4 sm:max-w-sm">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Berhasil!</h4>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{successMessage}</p>
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