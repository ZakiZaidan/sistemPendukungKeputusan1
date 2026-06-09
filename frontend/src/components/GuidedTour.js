'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STEPS = {
  '/': [
    { element: '.hero-section', popover: { title: 'Selamat Datang! 👋', description: 'Ini adalah halaman utama SPK VIKOR untuk penentuan strategi pemasaran UMKM.', position: 'bottom' } },
    { element: '.sidebar-nav', popover: { title: 'Navigasi', description: 'Gunakan menu ini untuk berpindah antar halaman: Input Data, Perhitungan, Hasil, dll.', position: 'right' } },
    { element: '.sidebar-info', popover: { title: 'Info Data', description: 'Panel ini menampilkan jumlah alternatif, kriteria, dan parameter v yang sedang aktif.', position: 'right' } },
    { element: '#metrics-section', popover: { title: 'Ringkasan', description: 'Kartu metrik menampilkan ringkasan data: jumlah alternatif, kriteria, parameter, dan metode.', position: 'top' } },
    { element: '#steps-section', popover: { title: 'Alur Perhitungan', description: '8 tahapan metode VIKOR ditampilkan di sini. Buka halaman Perhitungan untuk melihat detail setiap tahap.', position: 'top' } },
  ],
  '/input': [
    { element: '.tabs', popover: { title: 'Tab Input Data', description: 'Berpindah antara Kriteria & Bobot, Alternatif, Matriks Keputusan, dan Parameter v.', position: 'bottom' } },
    { element: '#tab-kriteria', popover: { title: 'Kriteria & Bobot', description: 'Edit nama kriteria, tipe (Cost/Benefit), dan bobotnya. Total bobot harus = 1.00.', position: 'bottom' } },
    { element: '#btn-calculate', popover: { title: 'Jalankan Perhitungan', description: 'Setelah data siap, klik tombol ini untuk menjalankan perhitungan VIKOR.', position: 'top' } },
  ],
  '/perhitungan': [
    { element: '.step-header', popover: { title: 'Tahapan Perhitungan', description: 'Setiap tahapan VIKOR ditampilkan step-by-step. Klik untuk membuka detail.', position: 'bottom' } },
  ],
  '/hasil': [
    { element: '#rank-cards', popover: { title: 'Top 3 Ranking', description: 'Tiga alternatif terbaik berdasarkan nilai Qi terendah.', position: 'bottom' } },
    { element: '#charts-section', popover: { title: 'Visualisasi', description: 'Grafik bar, radar, dan perbandingan untuk menganalisis hasil secara visual.', position: 'top' } },
    { element: '#validation-section', popover: { title: 'Validasi Kompromi', description: 'Dua kondisi validasi (Acceptable Advantage & Stability) ditampilkan di sini.', position: 'top' } },
  ],
};

const IconHelp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default function GuidedTour({ page = '/' }) {
  const [tourSeen, setTourSeen] = useState(true);

  useEffect(() => {
    const key = `tour_seen_${page}`;
    const seen = localStorage.getItem(key);
    setTourSeen(!!seen);
  }, [page]);

  const startTour = () => {
    const steps = TOUR_STEPS[page] || [];
    if (steps.length === 0) return;

    const validSteps = steps.filter(step =>
      !step.element || document.querySelector(step.element)
    );

    if (validSteps.length === 0) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      doneBtnText: 'Selesai',
      nextBtnText: 'Berikutnya',
      prevBtnText: 'Sebelumnya',
      steps: validSteps,
      onDestroyed: () => {
        localStorage.setItem(`tour_seen_${page}`, 'true');
        setTourSeen(true);
      },
    });

    driverObj.drive();
  };

  return (
    <button
      className="btn btn-secondary btn-sm"
      onClick={startTour}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: 'var(--shadow-lg)',
      }}
      title="Panduan Penggunaan"
    >
      <IconHelp />
      <span>Panduan</span>
    </button>
  );
}

