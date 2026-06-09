/**
 * constants.js — Default data & color palette for SPK VIKOR
 */

export const DEFAULT_ALTERNATIF = {
  A1: 'Promosi melalui Media Sosial',
  A2: 'Diskon atau Promo Bundling',
  A3: 'Kerja Sama Pesan Antar Online',
  A4: 'Peningkatan Kualitas Pelayanan',
  A5: 'Program Kode Referral',
  A6: 'Program Loyalitas Pelanggan',
  A7: 'Promosi Marketplace/Aggregator',
  A8: 'Kolaborasi Influencer Mikro Lokal',
};

export const DEFAULT_KRITERIA = {
  C1: { nama: 'Biaya Promosi', tipe: 'Cost', bobot: 0.15 },
  C2: { nama: 'Jangkauan Pasar', tipe: 'Benefit', bobot: 0.20 },
  C3: { nama: 'Kemudahan Implementasi', tipe: 'Benefit', bobot: 0.15 },
  C4: { nama: 'Potensi Peningkatan Penjualan', tipe: 'Benefit', bobot: 0.20 },
  C5: { nama: 'Tingkat Risiko', tipe: 'Cost', bobot: 0.10 },
  C6: { nama: 'Keterukuran Hasil Promosi', tipe: 'Benefit', bobot: 0.10 },
  C7: { nama: 'Keberlanjutan Strategi', tipe: 'Benefit', bobot: 0.10 },
};

export const DEFAULT_MATRIKS = {
  A1: [2, 8, 9, 8, 3, 9, 8],
  A2: [3, 6, 8, 7, 4, 6, 6],
  A3: [4, 7, 7, 8, 5, 7, 7],
  A4: [1, 7, 8, 7, 2, 5, 8],
  A5: [2, 6, 7, 7, 3, 6, 7],
  A6: [3, 7, 8, 8, 3, 7, 9],
  A7: [5, 9, 7, 9, 5, 8, 7],
  A8: [4, 7, 8, 8, 4, 7, 7],
};

export const CHART_COLORS = [
  '#4f6ef7', '#ef4444', '#10b981', '#f59e0b', '#06b6d4',
  '#7c3aed', '#ec4899', '#0ea5e9', '#f43f5e', '#6b7280',
];

export const NAV_ITEMS = [
  { path: '/', label: 'Beranda' },
  { path: '/input', label: 'Input Data' },
  { path: '/perhitungan', label: 'Perhitungan' },
  { path: '/hasil', label: 'Hasil & Ranking' },
  { path: '/sensitivitas', label: 'Analisis Sensitivitas' },
  { path: '/riwayat', label: 'Riwayat' },
];
