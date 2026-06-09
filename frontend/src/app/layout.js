import './globals.css';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';

export const metadata = {
  title: 'SPK VIKOR — Strategi Pemasaran UMKM',
  description: 'Sistem Pendukung Keputusan dengan Metode VIKOR untuk Penentuan Strategi Pemasaran UMKM Nasi Bakar Mak Yuni, Kota Metro',
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
