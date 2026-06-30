# 🏛️ E-Reservasi Jakarta Timur v2.0
<p align="center">
  <img src="https://img.shields.io/badge/Status-Production-success?style=for-the-badge&logo=github" />
  <img src="https://img.shields.io/badge/Framework-Next.js%2015-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Backend-Laravel%2011-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" />
  <img src="https://img.shields.io/badge/UI-Aero%20Glass-pink?style=for-the-badge&logo=tailwindcss" />
</p>

---

### ✨ "Modernisasi Layanan & Efisiensi Fasilitas Gedung Pemerintahan"

**E-Reservasi** adalah platform manajemen penjadwalan ruang rapat terintegrasi yang dikembangkan khusus untuk lingkungan **Kantor Walikota Administrasi Jakarta Timur**. Proyek ini mengedepankan estetika **Aero Glass Light Theme** yang mewah namun tetap fungsional dan responsif.

---

## 🚀 Fitur Utama (Core Features)

*   📊 **Executive Dashboard:** Visualisasi metrik reservasi bulanan, status *real-time*, dan jadwal harian dalam satu layar.
*   🎨 **Aero Glass UI:** Antarmuka modern dengan efek transparansi kaca (*frosted glass*) dan *mesh gradients* yang memanjakan mata.
*   🌐 **Live 3D Room Preview:** Integrasi model 3D (Matterport/Sketchfab) untuk melihat tata letak ruangan sebelum melakukan pemesanan.
*   💬 **Smart Chatbot Assistant:** Asisten virtual yang siap menjawab pertanyaan umum (*fast response*) mengenai prosedur peminjaman.
*   🔐 **Multi-Role Authentication:** Sistem keamanan berjenjang untuk **Admin Kominfotik**, **Verifikator (Asisten/Pimpinan)**, dan **User Bagian**.
*   🔔 **Floating Notification:** Sistem pemberitahuan *real-time* untuk setiap perubahan status persetujuan.

---

## 🛠️ Tech Stack

### 💻 Frontend (The Visuals)
- **Framework:** Next.js 15 (App Router) ⚛️
- **Styling:** Tailwind CSS with Glassmorphism Plugin 🎨
- **State Management:** React Hooks (useState, useEffect) 🔄
- **Animations:** Tailwind Animate & Framer Motion ⚡

### 🐘 Backend (The Engine)
- **API Server:** Laravel 11 Framework
- **Security:** Laravel Sanctum (Token Based Auth) 🔒
- **Database:** PostgreSQL (Robust & Scalable) 🗄️

---

## 📁 Struktur Folder

```text
📂 e-reservasi-jaktim
├── 📂 backend        Source code API Laravel 11
│   ├── 📂 app/Models
│   ├── 📂 database/migrations
│   └── 📜 routes/api.php
└── 📂 frontend       Source code Next.js 15
    ├── 📂 src/app    (Admin, User, Verifikator Panel)
    ├── 📂 public     (Aset Lambang & Noise Textures)
    └── 📜 tailwind.config.ts
