"use client";

import React, { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface VerifikatorLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: number;
  pesan: string;
  waktu: string;
  unread: boolean;
}

// --- SUB-KOMPONEN JAM (DIISOLASI SUPAYA TIDAK MEMBUAT SELURUH PAGE RE-RENDER TIAP DETIK) ---
const DigitalClock = memo(function DigitalClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return <span className="text-[10px] lg:text-xs font-bold text-slate-400 tracking-widest uppercase animate-pulse">SINKRONISASI...</span>;
  }

  return (
    <span className="text-[10px] lg:text-xs font-bold text-slate-500 tracking-wider lg:tracking-widest uppercase flex items-center">
      <span className="hidden sm:inline">
        {time.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric' })}
        <span className="text-slate-300 mx-1.5 lg:mx-2 text-base lg:text-lg leading-none mb-1">|</span>
      </span>
      <span className="text-slate-800 font-black">
        {time.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit' })}
      </span>
      <span className="ml-1 text-pink-500 hidden sm:inline">WIB</span>
    </span>
  );
});

export default function VerifikatorLayout({ children }: VerifikatorLayoutProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State baru untuk responsive sidebar
  const pathname = usePathname();

  // Profil State
  const [userName, setUserName] = useState<string>('Memuat...');
  const [userRole, setUserRole] = useState<string>('Memuat...');
  const [userInitial, setUserInitial] = useState<string>('..');

  // State Notifikasi Dinamis
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const baseUrl = '/api';

  // Tutup sidebar secara otomatis di mobile saat rute halaman berubah
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Ambil data user dari localStorage
    const storedName = localStorage.getItem('user_name') || 'Bambang W.';
    const storedRole = localStorage.getItem('user_role') || 'Verifikator';
    
    setUserName(storedName);
    setUserRole(storedRole);
    setUserInitial(storedName.substring(0, 2).toUpperCase());

    fetchNotifications();
  }, []);

  // --- LOGIKA FETCH NOTIFIKASI ---
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${baseUrl}/notifications`, {
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const notifData: Notification[] = data.data || [];
        setNotifications(notifData);
        setUnreadCount(notifData.filter(n => n.unread).length);
      }
    } catch (error) {
      console.error("Gagal menarik notifikasi:", error);
    }
  };

  // --- LOGIKA TANDAI SEMUA DIBACA ---
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${baseUrl}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      setUnreadCount(0);
      setIsNotifDropdownOpen(false);
    } catch (error) {
      console.error("Gagal update status notifikasi:", error);
    }
  };

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    const konfirmasi = window.confirm("Apakah Anda yakin ingin keluar dari sistem?");
    if (!konfirmasi) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${baseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
    } catch (error) {
      console.error("Gagal reach API Logout", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_role');
      localStorage.removeItem('role'); 
      window.location.href = '/login';
    }
  };

  return (
    <div className="relative flex h-screen bg-[#FDFDFD] text-slate-800 font-sans overflow-hidden selection:bg-pink-200 selection:text-pink-900">
      
      {/* Background Ornamen Efek Glassmorphism */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-pink-300/20 blur-[100px] animate-[spin_40s_linear_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-purple-300/20 blur-[120px] animate-[spin_50s_reverse_infinite]"></div>
        <div className="absolute top-[20%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-blue-200/20 blur-[100px] animate-[ping_15s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-multiply"></div>
      </div>

      {/* Backdrop Overlay Saat Sidebar Mobile Aktif */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR DENGAN TRANSFORMASI RESPONSIF LAYAR MOBILE */}
      <aside className={`fixed lg:relative z-50 h-full w-72 bg-white/90 lg:bg-white/60 backdrop-blur-3xl border-r border-slate-100 lg:border-white/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="p-6 lg:p-8 flex items-center space-x-4 border-b border-slate-100 lg:border-white/60 relative">
            <div className="relative w-11 h-12 flex-shrink-0 drop-shadow-sm">
              <Image src="/lambang.png" alt="Lambang Jakarta Timur" fill sizes="144px" className="object-contain" priority />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight text-slate-800 tracking-tight">E-Reservasi</h1>
              <p className="text-[10px] text-pink-500 uppercase tracking-widest font-bold">Verifikator Panel</p>
            </div>
            {/* Tombol Tutup Sidebar untuk Tampilan Smartphone */}
            <button onClick={() => setIsSidebarOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 lg:hidden text-slate-400 hover:text-slate-800 p-2 focus:outline-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <nav className="mt-8 flex flex-col space-y-2 px-4 lg:px-6 relative z-10">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-2">Menu Verifikator</div>
            
            <Link href="/verifikator" className={`px-4 py-3 flex items-center space-x-3 transition-all duration-300 border-l-4 ${isActive('/verifikator') ? 'bg-gradient-to-r from-pink-500/10 to-transparent border-pink-500 rounded-r-2xl text-pink-600 font-bold shadow-[inset_4px_0_0_#ec4899]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50 rounded-2xl group'}`}>
              <svg className={`w-5 h-5 ${!isActive('/verifikator') && 'group-hover:text-pink-500 transition-colors'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              <span>Dashboard</span>
            </Link>

            <Link href="/verifikator/jadwal" className={`px-4 py-3 flex items-center space-x-3 transition-all duration-300 border-l-4 ${isActive('/verifikator/jadwal') ? 'bg-gradient-to-r from-pink-500/10 to-transparent border-pink-500 rounded-r-2xl text-pink-600 font-bold shadow-[inset_4px_0_0_#ec4899]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50 rounded-2xl group'}`}>
              <svg className={`w-5 h-5 ${!isActive('/verifikator/jadwal') && 'group-hover:text-pink-500 transition-colors'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span>Kelola Jadwal</span>
            </Link>

            <Link href="/verifikator/reservasi" className={`px-4 py-3 flex items-center space-x-3 transition-all duration-300 border-l-4 ${isActive('/verifikator/reservasi') ? 'bg-gradient-to-r from-pink-500/10 to-transparent border-pink-500 rounded-r-2xl text-pink-600 font-bold shadow-[inset_4px_0_0_#ec4899]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50 rounded-2xl group'}`}>
              <svg className={`w-5 h-5 ${!isActive('/verifikator/reservasi') && 'group-hover:text-pink-500 transition-colors'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <span>Verifikasi Reservasi</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 lg:p-6 border-t border-slate-100 lg:border-white/60 bg-white/50 lg:bg-transparent">
          <button onClick={() => { setIsProfileModalOpen(true); setIsSidebarOpen(false); }} className="w-full flex items-center space-x-3 p-3 rounded-2xl bg-white/60 hover:bg-white/90 border border-white shadow-sm transition-all text-left group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex-shrink-0 flex items-center justify-center text-pink-600 font-bold shadow-inner">
              {userInitial}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-extrabold text-slate-700 truncate group-hover:text-slate-900 transition-colors">{userName}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">{userRole}</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-pink-500 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="relative z-20 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER DENGAN PENYESUAIAN TINGGI DAN HAMBURGER ICON */}
        <header className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-10 bg-white/70 lg:bg-white/50 backdrop-blur-2xl border-b border-white/60 flex-shrink-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Tombol Hamburger Menu khusus Mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-pink-600 transition-colors rounded-lg hover:bg-white/50 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h2 className="text-lg lg:text-xl font-extrabold text-slate-800 tracking-tight hidden sm:block">Panel Verifikasi</h2>
            <div className="h-5 w-[2px] bg-slate-200 rounded-full hidden md:block"></div>
            <span className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/80 px-2.5 lg:px-3 py-1 rounded-full border border-white hidden md:block">Pusat Persetujuan</span>
          </div>
          
          <div className="flex items-center space-x-3 lg:space-x-6 relative">
            
            {/* NOTIFICATION TRIGGER */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full border shadow-sm flex items-center justify-center transition-all relative group ${isNotifDropdownOpen ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-white/80 border-white text-slate-400 hover:text-pink-600 hover:shadow-md'}`}
              >
                <svg className={`w-4 h-4 lg:w-5 lg:h-5 ${!isNotifDropdownOpen && unreadCount > 0 ? 'animate-wiggle' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-2 lg:w-2.5 h-2 lg:h-2.5 bg-pink-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {/* FLOATING NOTIFICATION BOX - RESPONSIVE WIDTH */}
              {isNotifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifDropdownOpen(false)}></div>
                  <div className="absolute right-[-40px] sm:right-0 mt-4 w-[calc(100vw-32px)] max-w-sm sm:w-80 bg-white/95 backdrop-blur-3xl border border-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifikasi Terbaru</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] text-pink-600 font-bold bg-pink-100 px-2 py-0.5 rounded-full border border-pink-200">{unreadCount} Baru</span>
                      )}
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[60vh] sm:max-h-72 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs font-medium">Belum ada notifikasi.</div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className={`p-4 hover:bg-slate-50 transition-colors text-left ${notif.unread ? 'bg-pink-50/30' : ''}`}>
                            <div className="flex items-start gap-3">
                              {notif.unread && <span className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 flex-shrink-0 shadow-sm"></span>}
                              <div>
                                <p className={`text-xs leading-relaxed ${notif.unread ? 'text-slate-800 font-bold' : 'text-slate-600 font-medium'}`}>{notif.pesan}</p>
                                <p className="text-[9px] text-slate-400 mt-1.5 font-bold uppercase tracking-wide">{notif.waktu}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <div className="p-3 border-t border-slate-100 text-center bg-slate-50/80">
                        <button onClick={markAllAsRead} className="text-[10px] font-bold text-pink-500 hover:text-pink-600 uppercase tracking-widest transition-colors">Tandai semua dibaca</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* KAPSUL WAKTU MEWAH TERISOLASI */}
            <div className="flex items-center space-x-2 lg:space-x-3 bg-white/90 lg:bg-white/80 backdrop-blur-md px-3 lg:px-5 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl border border-white shadow-[0_4px_15px_rgba(0,0,0,0.03)]">
              <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-pink-50 flex items-center justify-center">
                <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-pink-500 animate-[spin_4s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <DigitalClock />
            </div>
          </div>
        </header>

        {/* AREA KONTEN UTAMA DENGAN PADDING DINAMIS */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-10 relative">
          {children}
        </div>
      </main>

      {/* MODAL PENGATURAN - RESPONSIVE DI HP */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsProfileModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl border border-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-6 lg:px-8 py-5 flex justify-between items-center border-b border-slate-100 bg-white/80">
              <h3 className="text-base lg:text-lg font-extrabold text-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-pink-600 border border-pink-100 shadow-sm">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                </div>
                Pengaturan Verifikator
              </h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-800 transition-colors bg-white hover:bg-slate-50 p-2 rounded-full border border-slate-200 shadow-sm">
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 lg:p-8 space-y-4">
               <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 shadow-inner">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Nama Verifikator</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{userName}</p>
               </div>
            </div>

            <div className="p-4 lg:p-6 border-t border-slate-100 bg-slate-50/80 flex flex-col-reverse sm:flex-row justify-between items-center gap-3 rounded-b-3xl">
              <button onClick={handleLogout} className="w-full sm:w-auto flex items-center justify-center space-x-2 text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all text-sm font-bold border border-transparent hover:border-red-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                <span>Keluar Sesi</span>
              </button>
              
              <button onClick={() => setIsProfileModalOpen(false)} className="w-full sm:w-auto relative overflow-hidden rounded-xl group px-8 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_8px_25px_rgba(236,72,153,0.4)] transition-all active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500"></div>
                <span className="relative">Tutup</span>
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}