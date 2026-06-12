import './globals.css';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';

export const metadata = {
  title: 'SPK VIKOR — Strategi Pemasaran',
  description: 'Sistem Pendukung Keputusan dengan Metode VIKOR untuk Penentuan Strategi Pemasaran - Kelompok 1 SPK',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content fade-in">
            {children}
          </main>
        </div>
        <Toast />
      </body>
    </html>
  );
}
