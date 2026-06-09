'use client';

import GuidedTour from '@/components/GuidedTour';

/* ── SVG Icons ── */
const IconLayers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
);
const IconTarget = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconSliders = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);
const IconCpu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function BerandaPage() {
  const metrics = [
    { value: '8', label: 'Alternatif', icon: <IconLayers /> },
    { value: '7', label: 'Kriteria', icon: <IconTarget /> },
    { value: '0.5', label: 'Parameter v', icon: <IconSliders /> },
    { value: 'VIKOR', label: 'Metode', icon: <IconCpu /> },
  ];

  const steps = [
    { num: 1, title: 'Input Data', desc: 'Masukkan alternatif, kriteria, bobot, dan matriks keputusan' },
    { num: 2, title: 'Nilai Ideal', desc: 'Tentukan f⁺ (terbaik) dan f⁻ (terburuk) untuk setiap kriteria' },
    { num: 3, title: 'Normalisasi', desc: 'Hitung Nij = (f⁺j − fij) / (f⁺j − f⁻j)' },
    { num: 4, title: 'Pembobotan', desc: 'Hitung F*ij = Wj × Nij' },
    { num: 5, title: 'Si & Ri', desc: 'Si = ΣF*ij (utility), Ri = MAX(F*ij) (regret)' },
    { num: 6, title: 'Indeks Qi', desc: 'Qi = v·(Si−S⁻)/(S⁺−S⁻) + (1−v)·(Ri−R⁻)/(R⁺−R⁻)' },
    { num: 7, title: 'Ranking', desc: 'Urutkan alternatif berdasarkan nilai Qi terkecil' },
    { num: 8, title: 'Validasi', desc: 'Cek Acceptable Advantage & Acceptable Stability' },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <div className="home-hero">
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Sistem Pendukung Keputusan
          </div>
          <h1 className="home-hero-title">Metode VIKOR</h1>
          <p className="home-hero-subtitle">
            Penentuan Strategi Pemasaran UMKM menggunakan pendekatan kompromi multi-kriteria
          </p>
          <p className="home-hero-case">
            Studi Kasus: UMKM Nasi Bakar Mak Yuni, Kota Metro
          </p>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="grid-4" id="metrics-section">
        {metrics.map((m, i) => (
          <div className="metric-card" key={i}>
            <div className="metric-icon">{m.icon}</div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── Info Cards ── */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="glass-card">
          <div className="card-tag">Metode</div>
          <h2 className="card-heading">Apa itu VIKOR?</h2>
          <p className="card-body">
            <strong style={{ color: 'var(--primary)' }}>VIKOR</strong>{' '}
            (<em>VIšekriterijumsko KOmpromisno Rangiranje</em>) adalah metode
            pengambilan keputusan multi-kriteria yang menghasilkan{' '}
            <strong>solusi kompromi</strong> — alternatif paling dekat ke kondisi
            ideal dari seluruh kriteria secara seimbang.
          </p>
          <p className="card-body" style={{ marginTop: 10 }}>
            Alternatif dengan nilai <strong style={{ color: 'var(--primary)' }}>Qi terkecil</strong>{' '}
            adalah yang terbaik.
          </p>
        </div>

        <div className="glass-card">
          <div className="card-tag card-tag--green">Studi Kasus</div>
          <h2 className="card-heading">UMKM Nasi Bakar Mak Yuni</h2>
          <p className="card-body">
            Sistem ini membantu <strong>UMKM Nasi Bakar Mak Yuni</strong> di Kota Metro
            menentukan <strong>strategi pemasaran terbaik</strong> dari 8 alternatif
            berdasarkan 7 kriteria penilaian.
          </p>
          <div className="card-criteria-list">
            {['Biaya Promosi', 'Jangkauan Pasar', 'Kemudahan', 'Potensi Penjualan', 'Risiko', 'Keterukuran', 'Keberlanjutan'].map((c) => (
              <span key={c} className="criteria-chip">{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── VIKOR Steps ── */}
      <div className="steps-section" id="steps-section">
        <div className="steps-header">
          <div className="card-tag">Alur Perhitungan</div>
          <h2 className="card-heading">Tahapan Metode VIKOR</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
            8 langkah berurutan untuk menghasilkan ranking kompromi
          </p>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <div className="step-item" key={step.num}>
              <div className="step-num-badge">{step.num}</div>
              <div className="step-item-content">
                <div className="step-item-title">{step.title}</div>
                <div className="step-item-desc">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="footer">
        <div>Sistem Pendukung Keputusan — Metode VIKOR</div>
        <div>Penentuan Strategi Pemasaran UMKM Nasi Bakar Mak Yuni, Kota Metro</div>
      </div>

      <GuidedTour page="/" />

      <style jsx>{`
        /* Hero */
        .home-hero {
          background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdfa 100%);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          padding: 48px 40px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }
        .home-hero::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--gradient-primary);
        }
        .home-hero-content {
          max-width: 600px;
        }
        .home-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(79, 110, 247, 0.08);
          border: 1px solid rgba(79, 110, 247, 0.18);
          color: var(--primary);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 20px;
          letter-spacing: 0.3px;
          margin-bottom: 16px;
        }
        .home-hero-title {
          font-size: 2.4rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin-bottom: 12px;
        }
        .home-hero-subtitle {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 8px;
        }
        .home-hero-case {
          font-size: 0.82rem;
          color: var(--text-dim);
          font-style: italic;
        }

        /* Metric icon */
        .metric-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: var(--primary-glow);
          border-radius: 9px;
          margin: 0 auto 10px;
          color: var(--primary);
        }

        /* Card elements */
        .card-tag {
          display: inline-block;
          background: var(--primary-glow);
          color: var(--primary);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 6px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .card-tag--green {
          background: rgba(16, 185, 129, 0.08);
          color: var(--success);
        }
        .card-heading {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.015em;
          margin-bottom: 10px;
        }
        .card-body {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.7;
        }
        .card-criteria-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 14px;
        }
        .criteria-chip {
          background: var(--bg-subtle);
          border: 1px solid var(--card-border);
          border-radius: 6px;
          padding: 3px 9px;
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Steps */
        .steps-section {
          background: var(--bg-white);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          padding: 28px 28px 24px;
          margin-top: 20px;
          box-shadow: var(--shadow-xs);
        }
        .steps-header {
          margin-bottom: 24px;
        }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .steps-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .steps-grid { grid-template-columns: 1fr; }
        }
        .step-item {
          display: flex;
          gap: 12px;
          padding: 14px;
          background: var(--bg-subtle);
          border-radius: 10px;
          border: 1px solid var(--card-border);
        }
        .step-num-badge {
          width: 26px;
          height: 26px;
          flex-shrink: 0;
          border-radius: 7px;
          background: var(--gradient-primary);
          color: white;
          font-size: 0.78rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .step-item-content {
          flex: 1;
        }
        .step-item-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .step-item-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
      `}</style>
    </>
  );
}
