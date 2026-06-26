import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Biarkan kosong jika tidak ada konfigurasi spesifik Next.js
  allowedDevOrigins: [
  '127.0.0.1',
  '192.168.1.20',
  '*.ngrok-free.dev',
  '172.27.72.253'
],

  async rewrites() {
    return [
      {
        // Setiap kali Frontend memanggil /api/..., 
        // Next.js akan meneruskannya ke URL backend yang ada di .env
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`, 
      },
    ];
  },
  
};

export default nextConfig;