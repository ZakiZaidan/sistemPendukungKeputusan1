'use client';

import { useState } from 'react';
import useStore from '@/lib/store';
import { calculateVikor } from '@/lib/api';
import GuidedTour from '@/components/GuidedTour';

export default function PerhitunganPage() {
  const {
    calculated, vikorResult, isLoading,
    setVikorResult, setLoading, setError, setToast, getInputData,
  } = useStore();
  const [openSteps, setOpenSteps] = useState({});

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const result = await calculateVikor(getInputData());
      setVikorResult(result);
      setToast({ type: 'success', message: 'Perhitungan selesai!' });
    } catch (err) {
      setError(err.message);
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (i) => setOpenSteps((prev) => ({ ...prev, [i]: !prev[i] }));

  const formatNum = (n) => (typeof n === 'number' ? n.toFixed(4) : n);

  const colorNorm = (val) => {
    const v = Math.max(0, Math.min(1, val));
    let r, g, b;
    if (v <= 0.5) { r = Math.round(v * 2 * 200); g = 180; b = 80; }
    else { r = 200; g = Math.round((1 - (v - 0.5) * 2) * 180); b = 60; }
    return `rgba(${r},${g},${b},0.12)`;
  };

  const stepNumStyle = {
    width: 28, height: 28,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--gradient-primary)', color: 'white',
    borderRadius: '50%', fontSize: '0.75rem', fontWeight: 700,
  };

  return (
    <>
      <div className="page-hero">
        <h1 className="page-hero-title">Perhitungan VIKOR</h1>
        <p className="page-hero-sub">Step-by-step proses perhitungan metode VIKOR</p>
      </div>

      {!calculated ? (
        <div>
          <div className="info-box warning">
            <strong>Belum ada perhitungan.</strong> Klik tombol di bawah untuk menjalankan perhitungan.
          </div>
          <button className="btn btn-primary mt-2" onClick={handleCalculate} disabled={isLoading}>
            {isLoading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Menghitung...</> : 'Jalankan Perhitungan'}
          </button>
        </div>
      ) : vikorResult && (
        <div className="fade-in">
          {/* Step 1: Matriks Keputusan */}
          <div className="accordion">
            <div className={`accordion-header ${openSteps[1] ? 'open' : ''}`} onClick={() => toggleStep(1)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="step-num" style={stepNumStyle}>1</span>
                <span>Matriks Keputusan (fij)</span>
              </div>
              <span className="arrow">▼</span>
            </div>
            <div className={`accordion-content ${openSteps[1] ? 'open' : ''}`}>
              <p className="section-desc">Matriks keputusan berisi nilai penilaian setiap alternatif terhadap setiap kriteria.</p>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Alternatif</th>
                      {vikorResult.krit_keys.map(k => <th key={k}>{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {vikorResult.matriks.map((row) => (
                      <tr key={row.kode}>
                        <td><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{row.kode}</span> — {row.nama}</td>
                        {vikorResult.krit_keys.map(k => <td key={k} className="number">{row[k]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Step 2: Nilai Ideal */}
          <div className="accordion">
            <div className={`accordion-header ${openSteps[2] ? 'open' : ''}`} onClick={() => toggleStep(2)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="step-num" style={stepNumStyle}>2</span>
                <span>Nilai Ideal (f⁺ dan f⁻)</span>
              </div>
              <span className="arrow">▼</span>
            </div>
            <div className={`accordion-content ${openSteps[2] ? 'open' : ''}`}>
              <p className="section-desc">
                <strong>Benefit:</strong> f⁺ = MAX (terbaik), f⁻ = MIN (terburuk)<br />
                <strong>Cost:</strong> f⁺ = MIN (terbaik), f⁻ = MAX (terburuk)
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {vikorResult.krit_keys.map(k => {
                  const info = vikorResult.f_ideal[k];
                  const isCost = info.tipe === 'Cost';
                  return (
                    <span key={k} style={{
                      background: isCost ? 'rgba(236,72,153,0.08)' : 'rgba(16,185,129,0.08)',
                      color: isCost ? '#ec4899' : '#10b981',
                      padding: '4px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                    }}>
                      {k}: {info.tipe}
                    </span>
                  );
                })}
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th></th>
                      {vikorResult.krit_keys.map(k => <th key={k}>{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>f⁺ (Terbaik)</td>
                      {vikorResult.krit_keys.map(k => (
                        <td key={k} className="number" style={{ background: 'rgba(16,185,129,0.06)' }}>
                          {vikorResult.f_ideal[k].f_plus}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>f⁻ (Terburuk)</td>
                      {vikorResult.krit_keys.map(k => (
                        <td key={k} className="number" style={{ background: 'rgba(239,68,68,0.06)' }}>
                          {vikorResult.f_ideal[k].f_minus}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Step 3: Normalisasi */}
          <div className="accordion">
            <div className={`accordion-header ${openSteps[3] ? 'open' : ''}`} onClick={() => toggleStep(3)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="step-num" style={stepNumStyle}>3</span>
                <span>Normalisasi (Nij)</span>
              </div>
              <span className="arrow">▼</span>
            </div>
            <div className={`accordion-content ${openSteps[3] ? 'open' : ''}`}>
              <p className="section-desc">
                Rumus: <strong style={{ color: 'var(--accent-pink)' }}>Nij = (f⁺j − fij) / (f⁺j − f⁻j)</strong><br />
                Nilai 0 = terbaik, Nilai 1 = terburuk
              </p>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Alternatif</th>
                      {vikorResult.krit_keys.map(k => <th key={k}>{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {vikorResult.normalisasi.map((row) => (
                      <tr key={row.kode}>
                        <td><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{row.kode}</span> — {row.nama}</td>
                        {vikorResult.krit_keys.map(k => (
                          <td key={k} className="number" style={{ background: colorNorm(row[k]) }}>
                            {formatNum(row[k])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Step 4: F*ij Terbobot */}
          <div className="accordion">
            <div className={`accordion-header ${openSteps[4] ? 'open' : ''}`} onClick={() => toggleStep(4)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="step-num" style={stepNumStyle}>4</span>
                <span>Normalisasi Terbobot (F*ij)</span>
              </div>
              <span className="arrow">▼</span>
            </div>
            <div className={`accordion-content ${openSteps[4] ? 'open' : ''}`}>
              <p className="section-desc">Rumus: <strong style={{ color: 'var(--accent-pink)' }}>F*ij = Wj × Nij</strong></p>
              <div className="info-box">
                <strong>Bobot (Wj):</strong>{' '}
                {vikorResult.krit_keys.map(k => `${k}: ${vikorResult.kriteria[k].bobot.toFixed(2)}`).join(' | ')}
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Alternatif</th>
                      {vikorResult.krit_keys.map(k => <th key={k}>{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {vikorResult.f_terbobot.map((row) => (
                      <tr key={row.kode}>
                        <td><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{row.kode}</span> — {row.nama}</td>
                        {vikorResult.krit_keys.map(k => (
                          <td key={k} className="number" style={{ background: colorNorm(row[k] / 0.2) }}>
                            {formatNum(row[k])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Step 5: Si & Ri */}
          <div className="accordion">
            <div className={`accordion-header ${openSteps[5] ? 'open' : ''}`} onClick={() => toggleStep(5)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="step-num" style={stepNumStyle}>5</span>
                <span>Utility Measure (Si) & Regret Measure (Ri)</span>
              </div>
              <span className="arrow">▼</span>
            </div>
            <div className={`accordion-content ${openSteps[5] ? 'open' : ''}`}>
              <p className="section-desc">
                <strong style={{ color: '#6366f1' }}>Si = ΣF*ij</strong> (total penyimpangan) &nbsp;|&nbsp;
                <strong style={{ color: 'var(--accent-pink)' }}>Ri = MAX(F*ij)</strong> (penyimpangan terburuk)
              </p>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Alternatif</th><th>Si (Utility)</th><th>Ri (Regret)</th></tr>
                  </thead>
                  <tbody>
                    {vikorResult.sri.map((row) => (
                      <tr key={row.kode}>
                        <td><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{row.kode}</span> — {row.nama}</td>
                        <td className="number">{formatNum(row.si)}</td>
                        <td className="number">{formatNum(row.ri)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid-4 mt-2">
                <div className="metric-card">
                  <div className="metric-value" style={{ fontSize: '1.1rem' }}>{vikorResult.si_min.toFixed(4)}</div>
                  <div className="metric-label">S⁻ (Min)</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value" style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>{vikorResult.si_max.toFixed(4)}</div>
                  <div className="metric-label">S⁺ (Max)</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value" style={{ fontSize: '1.1rem' }}>{vikorResult.ri_min.toFixed(4)}</div>
                  <div className="metric-label">R⁻ (Min)</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value" style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>{vikorResult.ri_max.toFixed(4)}</div>
                  <div className="metric-label">R⁺ (Max)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6: Qi */}
          <div className="accordion">
            <div className={`accordion-header ${openSteps[6] ? 'open' : ''}`} onClick={() => toggleStep(6)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="step-num" style={stepNumStyle}>6</span>
                <span>Indeks VIKOR (Qi)</span>
              </div>
              <span className="arrow">▼</span>
            </div>
            <div className={`accordion-content ${openSteps[6] ? 'open' : ''}`}>
              <p className="section-desc">
                Rumus: <strong style={{ color: 'var(--accent-pink)' }}>Qi = v × (Si − S⁻)/(S⁺ − S⁻) + (1 − v) × (Ri − R⁻)/(R⁺ − R⁻)</strong>
                &nbsp;|&nbsp; v = {vikorResult.v}
              </p>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Ranking</th><th>Kode</th><th>Alternatif</th><th>Qi</th><th>Si</th><th>Ri</th></tr>
                  </thead>
                  <tbody>
                    {vikorResult.ranking.map((r) => (
                      <tr key={r.kode}>
                        <td className="highlight">#{r.rank}</td>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{r.kode}</td>
                        <td>{r.nama}</td>
                        <td className="number highlight">{formatNum(r.qi)}</td>
                        <td className="number">{formatNum(r.si)}</td>
                        <td className="number">{formatNum(r.ri)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Step 7: Validasi */}
          <div className="accordion">
            <div className={`accordion-header ${openSteps[7] ? 'open' : ''}`} onClick={() => toggleStep(7)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="step-num" style={stepNumStyle}>7</span>
                <span>Validasi Solusi Kompromi</span>
              </div>
              <span className="arrow">▼</span>
            </div>
            <div className={`accordion-content ${openSteps[7] ? 'open' : ''}`}>
              {vikorResult.validasi && (
                <div className="grid-2">
                  <div className="glass-card">
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Kondisi 1: Acceptable Advantage</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                      Q(A2nd) − Q(A1st) ≥ DQ = 1/(m−1)
                    </div>
                    <div style={{ fontSize: '0.9rem', marginBottom: 8 }}>{vikorResult.validasi.kondisi1_text}</div>
                    <div className={`result-badge ${vikorResult.validasi.kondisi1 ? '' : 'fail'}`}>
                      {vikorResult.validasi.kondisi1 ? '✓ TERPENUHI' : '✗ TIDAK TERPENUHI'}
                    </div>
                  </div>
                  <div className="glass-card">
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Kondisi 2: Acceptable Stability</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                      A1st harus rank 1 pada Si atau Ri
                    </div>
                    <div style={{ fontSize: '0.9rem', marginBottom: 8 }}>{vikorResult.validasi.kondisi2_text}</div>
                    <div className={`result-badge ${vikorResult.validasi.kondisi2 ? '' : 'fail'}`}>
                      {vikorResult.validasi.kondisi2 ? '✓ TERPENUHI' : '✗ TIDAK TERPENUHI'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <GuidedTour page="/perhitungan" />
    </>
  );
}
