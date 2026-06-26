export interface Reservation {
  id: string;
  tanggal: string;
  pemohon: string;
  ruangan: string;
  waktu: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Selesai';
}

export interface StatCard {
  title: string;
  value: string | number;
  subValue: string;
  color?: string;
}