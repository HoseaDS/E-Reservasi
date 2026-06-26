"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// --- INTERFACES ---
interface Agenda {
  id: string;
  waktu: string;
  agenda: string;
  ruangan: string;
  status: 'Disetujui' | 'Menunggu' | 'Selesai' | string;
}

//NOTE

interface DayData {
  date: string;
  color: 'kosong' | 'ada_jadwal' | 'penuh';
  is_today: boolean;
  booked_count: number;
  agendas: Agenda[];
}

export default function UserKalenderPage() {
  const today = new Date();
  
  // State untuk melacak bulan yang ditampilkan di layar
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  
  // State untuk melacak tanggal yang diklik user
  const formatToYYYYMMDD = (d: Date) => {
    const offset = d.getTimezoneOffset();
    const adjusted = new Date(d.getTime() - (offset*60*1000));
    return adjusted.toISOString().split('T')[0];
  };
  const [selectedDate, setSelectedDate] = useState<string>(formatToYYYYMMDD(today));
  
  // State Data dari API
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = '/api';

  // =========================================
  // FETCH DATA KALENDER (TRIGGER SAAT BULAN BERUBAH)
  // =========================================
  useEffect(() => {
    const fetchCalendar = async () => {
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

        const month = currentDate.getMonth() + 1; // getMonth() mulai dari 0
        const year = currentDate.getFullYear();
        
        const response = await fetch(`${baseUrl}/calendar/status?month=${month}&year=${year}`, {
          headers: { 
            'Accept': 'application/json', 
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${token}` // <--- Token disisipkan di sini
          }
        });
        
        // Proteksi jika token sudah tidak valid / kedaluwarsa dari backend
        if (response.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }

        if (response.ok) {
          const res = await response.json();
          // Antisipasi jika respon backend berupa {success: true, data: [...]} 
          // atau langsung mereturn flat array [...]
          if (res.success && res.data) {
            setCalendarData(res.data);
          } else if (Array.isArray(res)) {
            setCalendarData(res);
          }
        }
      } catch (error) {
        console.error("Gagal menarik data kalender:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendar();
  }, [currentDate, baseUrl]);

  // =========================================
  // LOGIKA NAVIGASI KALENDER
  // =========================================
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const emptyDaysCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
  const emptyDays = Array.from({ length: emptyDaysCount }, (_, i) => i);
  
  // TAMBAHAN: Hitung total hari dalam bulan ini (28, 29, 30, atau 31)
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const namaHari = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  // Ambil agenda khusus untuk hari yang di-klik
  const selectedDayData = calendarData.find(d => d.date === selectedDate);
  const jadwalHariIni = selectedDayData ? selectedDayData.agendas : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-wide">Kalender Jadwal</h1>
          <p className="text-sm text-slate-500 mt-2">
            Pantau seluruh agenda dan ketersediaan ruangan secara bulanan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
        
        {/* KOLOM KIRI: KALENDER INTERAKTIF */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-8 backdrop-blur-md flex flex-col relative overflow-hidden">
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {namaBulan[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-900 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button onClick={nextMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-900 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {namaHari.map((hari, idx) => (
              <div key={idx} className={`text-center text-xs font-bold uppercase tracking-widest ${idx === 5 || idx === 6 ? 'text-pink-400' : 'text-gray-500'}`}>
                {hari}
              </div>
            ))}
          </div>

          {/* Grid Dates */}
          <div className="grid grid-cols-7 gap-2 flex-1">
            {/* Empty Padding Days */}
            {emptyDays.map(empty => (
              <div key={`empty-${empty}`} className="min-h-[80px] p-2 rounded-xl bg-transparent"></div>
            ))}
            
            {/* Actual Days (Dibuat mandiri oleh React) */}
            {monthDays.map(day => {
              // 1. Format tanggal untuk mencocokkan dengan API dan SelectedDate
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              // 2. Cek apakah ini hari yang sedang dipilih
              const isSelected = selectedDate === dateStr;
              
              // 3. Cek apakah ini "Hari Ini" (untuk menebalkan warna font)
              const isToday = formatToYYYYMMDD(new Date()) === dateStr;

              // 4. Cari data agenda dari API untuk tanggal ini
              const dayDataFromApi = calendarData.find(d => d.date === dateStr);

              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative min-h-[80px] p-2 rounded-2xl border transition-all cursor-pointer group flex flex-col ${
                    isSelected 
                      ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.15)]' 
                      : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.05]'
                  }`}
                >
                  <span className={`text-sm font-bold ml-1 ${isToday ? 'text-pink-400' : isSelected ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>
                    {day}
                  </span>
                  
                  {/* Status Dots Indicators (Menyala jika API berhasil memuat data) */}
                  <div className="mt-auto flex gap-1 px-1 pb-1">
                    {dayDataFromApi?.color === 'penuh' && (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500" title="Full Booked"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      </>
                    )}
                    {dayDataFromApi?.color === 'ada_jadwal' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Ada Agenda"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex gap-6 mt-6 pt-6 border-t border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest justify-center">
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Ada Agenda</div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500"></div> Padat / Full Booked</div>
          </div>
        </div>

        {/* KOLOM KANAN: DETAIL AGENDA */}
        <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-[2rem] flex flex-col h-[700px] backdrop-blur-md overflow-hidden">
          
          {/* Header Sidebar */}
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
            <h3 className="font-bold text-slate-900 text-lg">Agenda Harian</h3>
            <p className="text-xs text-pink-400 mt-1 font-medium">
              {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* List Jadwal */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
            {jadwalHariIni.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <p className="text-sm">Kosong. Tidak ada jadwal.</p>
              </div>
            ) : (
              jadwalHariIni.map((jadwal) => (
                <div key={jadwal.id} className="bg-white/[0.02] border border-slate-200 p-5 rounded-2xl hover:bg-white/[0.05] transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20">
                      {jadwal.waktu}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                      jadwal.status === 'Disetujui' ? 'bg-green-500/10 text-green-400' :
                      jadwal.status === 'Selesai' ? 'bg-gray-500/10 text-slate-500' :
                      'bg-orange-500/10 text-orange-400'
                    }`}>
                      {jadwal.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">{jadwal.agenda}</h4>
                  <div className="flex items-center text-xs text-slate-500 mt-2">
                    <svg className="w-4 h-4 mr-1.5 text-gray-500 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    {jadwal.ruangan}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-white/5">
            {/* Menggunakan fitur routing Next.js Link menuju halaman form reservasi */}
            <Link href="/user/reservasi" className="block w-full">
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Buat Reservasi Baru
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}