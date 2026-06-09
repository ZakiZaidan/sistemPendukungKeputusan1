'use client';

import useStore from '@/lib/store';
import { calculateVikor, exportExcel } from '@/lib/api';
import BarChart from '@/components/charts/BarChart';
import RadarChart from '@/components/charts/RadarChart';
import GroupedBarChart from '@/components/charts/GroupedBarChart';
import GuidedTour from '@/components/GuidedTour';

/* ── SVG Icons ── */
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconTrophy = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
  </svg>
);

export default function HasilPage() {
  const {
    calculated, vikorResult, isLoading,
    setVikorResult, setLoading, setError, setToast, getInputData,
  } = useStore();

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const result = await calculateVikor(getInputData());
      setVikorResult(result);
    } catch (err) {
      setError(err.message);
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportExcel(getInputData());
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Hasil_VIKOR.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      setToast({ type: 'success', message: 'Excel berhasil diunduh!' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  if (!calculated || !vikorResult) {
    return (
      <>
        <div className="page-hero">
          <h1 className="page-hero-title">Hasil &amp; Ranking</h1>
          <p className="page-hero-sub">Ranking final, visualisasi, dan rekomendasi</p>
        </div>
        <div className="info-box warning">
          <strong>Belum ada perhitungan.</strong> Klik tombol di bawah untuk menjalankan perhitungan.
        </div>
        <button className="btn btn-primary mt-2" onClick={handleCalculate} disabled={isLoading}>
          {isLoading ? 'Menghitung...' : 'Jalankan Perhitungan'}
        </button>
      </>
    );
  }

  const ranking = vikorResult.ranking;
  const top3 = ranking.slice(0, 3);
  const val = vikorResult.validasi;
  const best = ranking[0];

  const barData = ranking.map(r => ({ kode: r.kode, qi: r.qi }));
  const radarData = ranking.map(r => ({ kode: r.kode, si: r.si, ri: r.ri }));
  const groupedData = ranking.map(r => ({ kode: r.kode, si: r.si, ri: r.ri, qi: r.qi }));

  return (
    <>
      {/* Page Header */}
      <div className="page-hero">
        <h1 className="page-hero-title">Hasil &amp; Ranking</h1>
        <p className="page-hero-sub">Ranking final, visualisasi, dan rekomendasi</p>
      </div>

      {/* Top 3 Cards */}
      <div className="grid-3" id="rank-cards">
        {top3.map((r, i) => (
          <div className={`rank-card ${i === 0 ? 'rank-1' : ''}`} key={r.kode}>
            {i === 0 && (
              <div className="rank-trophy">
                <IconTrophy />
              </div>
            )}
            <div className="rank-number">#{r.rank}</div>
            <div className="rank-name">{r.kode} — {r.nama}</div>
            <div className="rank-qi">Q = {r.qi.toFixed(4)}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 20 }} />

      {/* Full Ranking Table */}
      <div className="section-label">Ranking Lengkap</div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Ranking</th><th>Kode</th><th>Alternatif</th><th>Qi</th><th>Si</th><th>Ri</th></tr>
          </thead>
          <tbody>
            {ranking.map((r) => (
              <tr key={r.kode}>
                <td className="highlight">#{r.rank}</td>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{r.kode}</td>
                <td>{r.nama}</td>
                <td className="number highlight">{r.qi.toFixed(4)}</td>
                <td className="number">{r.si.toFixed(4)}</td>
                <td className="number">{r.ri.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ height: 24 }} />

      {/* Charts */}
      <div className="grid-2" id="charts-section">
        <BarChart data={barData} title="Indeks Qi per Alternatif" />
        <RadarChart data={radarData} title="Radar Si vs Ri" />
      </div>
      <GroupedBarChart data={groupedData} title="Perbandingan Si, Ri, dan Qi" />

      <div style={{ height: 24 }} />

      {/* Validation */}
      <div className="validation-card" id="validation-section">
        <div className="section-label">Kesimpulan Validasi</div>
        <div className={`result-badge ${val.valid ? '' : 'fail'}`} style={{ fontSize: '0.95rem', padding: '12px 20px' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {val.valid ? <IconCheck /> : <IconX />}
          </span>
          <span>
            {val.valid
              ? `${val.a1st} — ${val.a1st_nama} adalah SOLUSI KOMPROMI TERBAIK yang sah.`
              : 'Solusi kompromi tidak valid. Perlu analisis tambahan.'
            }
          </span>
        </div>
        <div className="validation-conditions">
          <span className={val.kondisi1 ? 'cond-ok' : 'cond-fail'}>
            {val.kondisi1 ? <IconCheck /> : <IconX />}
            Acceptable Advantage
          </span>
          <span className={val.kondisi2 ? 'cond-ok' : 'cond-fail'}>
            {val.kondisi2 ? <IconCheck /> : <IconX />}
            Acceptable Stability
          </span>
        </div>
      </div>

      {/* Recommendation */}
      <div className="glass-card">
        <div className="section-label">Rekomendasi</div>
        <p style={{ marginTop: 10, lineHeight: 1.8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Berdasarkan hasil perhitungan metode VIKOR dengan parameter v = {vikorResult.v},
          alternatif <strong style={{ color: 'var(--primary)' }}>{best.kode} — {best.nama}</strong>{' '}
          mendapatkan nilai Qi terendah yaitu{' '}
          <strong style={{ color: 'var(--success)' }}>{best.qi.toFixed(4)}</strong>,
          yang berarti alternatif ini memiliki penyimpangan paling kecil dari solusi ideal.
        </p>
        <p style={{ marginTop: 10, lineHeight: 1.8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {val.valid
            ? `Kedua kondisi validasi terpenuhi, sehingga ${best.kode} dapat dinyatakan sebagai solusi kompromi yang sah dan direkomendasikan sebagai strategi pemasaran utama.`
            : 'Namun, validasi solusi kompromi belum sepenuhnya terpenuhi. Disarankan untuk melakukan analisis lebih lanjut.'
          }
        </p>
      </div>

      {/* Export */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div className="section-label">Export Hasil</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Unduh seluruh hasil perhitungan dalam format Excel
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleExport} style={{ flexShrink: 0 }}>
          <IconDownload />
          Download Excel
        </button>
      </div>

      <div className="footer">
        <div>Sistem Pendukung Keputusan — Metode VIKOR</div>
        <div>Penentuan Strategi Pemasaran UMKM Nasi Bakar Mak Yuni, Kota Metro</div>
      </div>

      <GuidedTour page="/hasil" />

      <style jsx>{`
        .page-hero {
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--card-border);
        }
        .page-hero-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.025em;
        }
        .page-hero-sub {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .section-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--text-dim);
          margin-bottom: 10px;
        }
        .rank-trophy {
          color: #f59e0b;
          display: flex;
          justify-content: center;
          margin-bottom: 6px;
        }
        .validation-card {
          background: var(--bg-white);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 16px;
          box-shadow: var(--shadow-xs);
        }
        .validation-conditions {
          display: flex;
          gap: 12px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .cond-ok, .cond-fail {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 7px;
        }
        .cond-ok {
          background: var(--success-bg);
          color: var(--success);
          border: 1px solid var(--success-border);
        }
        .cond-fail {
          background: var(--danger-bg);
          color: var(--danger);
          border: 1px solid var(--danger-border);
        }
      `}</style>
    </>
  );
}
