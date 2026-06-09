'use client';

import { useState } from 'react';
import useStore from '@/lib/store';
import { calculateVikor } from '@/lib/api';
import GuidedTour from '@/components/GuidedTour';

export default function InputPage() {
  const [activeTab, setActiveTab] = useState(0);
  const {
    alternatif, kriteria, matriks, v,
    setAlternatif, setKriteria, setMatriks, setV,
    setVikorResult, setLoading, setError, setToast,
    resetToDefault, getInputData, isLoading,
  } = useStore();

  const kritKeys = Object.keys(kriteria);
  const altKeys = Object.keys(alternatif);

  // ── Kriteria handlers ──
  const updateKriteria = (kode, field, value) => {
    const updated = { ...kriteria };
    updated[kode] = { ...updated[kode], [field]: field === 'bobot' ? parseFloat(value) || 0 : value };
    setKriteria(updated);
  };

  const totalBobot = Object.values(kriteria).reduce((sum, k) => sum + k.bobot, 0);
  const bobotValid = Math.abs(totalBobot - 1.0) < 0.001;

  // ── Alternatif handlers ──
  const updateAlternatif = (kode, nama) => {
    const updated = { ...alternatif, [kode]: nama };
    setAlternatif(updated);
  };

  // ── Matriks handlers ──
  const updateMatriks = (altKode, kritIdx, value) => {
    const updated = { ...matriks };
    updated[altKode] = [...(updated[altKode] || [])];
    updated[altKode][kritIdx] = parseInt(value) || 1;
    setMatriks(updated);
  };

  // ── Run Calculation ──
  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await calculateVikor(getInputData());
      setVikorResult(result);
      setToast({ type: 'success', message: 'Perhitungan selesai! Buka halaman Perhitungan atau Hasil.' });
    } catch (err) {
      setError(err.message);
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['Kriteria & Bobot', 'Alternatif', 'Matriks Keputusan', 'Parameter'];

  return (
    <>
      <div className="page-hero">
        <h1 className="page-hero-title">Input Data</h1>
        <p className="page-hero-sub">Kelola kriteria, alternatif, bobot, dan matriks keputusan</p>
      </div>

      {/* Tabs */}
      <div className="tabs" id="tab-kriteria">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`tab ${activeTab === i ? 'active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Kriteria */}
      {activeTab === 0 && (
        <div className="fade-in">
          <div className="info-box">
            <strong>Kriteria Penilaian:</strong> Tentukan kriteria beserta tipe (Cost/Benefit)
            dan bobotnya. Total bobot harus = 1.00.
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama Kriteria</th>
                  <th>Tipe</th>
                  <th>Bobot</th>
                </tr>
              </thead>
              <tbody>
                {kritKeys.map((k) => (
                  <tr key={k}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{k}</td>
                    <td>
                      <input
                        type="text"
                        value={kriteria[k].nama}
                        onChange={(e) => updateKriteria(k, 'nama', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        value={kriteria[k].tipe}
                        onChange={(e) => updateKriteria(k, 'tipe', e.target.value)}
                      >
                        <option value="Benefit">Benefit</option>
                        <option value="Cost">Cost</option>
                      </select>
                    </td>
                    <td className="number">
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={kriteria[k].bobot}
                        onChange={(e) => updateKriteria(k, 'bobot', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'right', padding: '10px 16px' }}>
            Total Bobot:{' '}
            <span style={{ color: bobotValid ? 'var(--success)' : 'var(--danger)', fontWeight: 700, fontSize: '1.1rem' }}>
              {totalBobot.toFixed(2)}
            </span>
            <span style={{ color: 'var(--text-dim)' }}> / 1.00</span>
          </div>
        </div>
      )}

      {/* Tab: Alternatif */}
      {activeTab === 1 && (
        <div className="fade-in">
          <div className="info-box">
            <strong>Alternatif Strategi:</strong> Daftar alternatif yang akan dievaluasi
            menggunakan metode VIKOR.
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama Alternatif</th>
                </tr>
              </thead>
              <tbody>
                {altKeys.map((k) => (
                  <tr key={k}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{k}</td>
                    <td>
                      <input
                        type="text"
                        value={alternatif[k]}
                        onChange={(e) => updateAlternatif(k, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Matriks Keputusan */}
      {activeTab === 2 && (
        <div className="fade-in">
          <div className="info-box">
            <strong>Matriks Keputusan:</strong> Nilai penilaian setiap alternatif
            terhadap setiap kriteria (skala 1-9).
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Alternatif</th>
                  {kritKeys.map((k) => (
                    <th key={k}>{k}<br /><span style={{ fontWeight: 400, fontSize: '0.65rem', textTransform: 'none' }}>({kriteria[k].nama})</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {altKeys.map((a) => (
                  <tr key={a}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{a}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: '0.82rem' }}>
                        {alternatif[a]}
                      </span>
                    </td>
                    {kritKeys.map((k, j) => (
                      <td key={k} className="number">
                        <input
                          type="number"
                          min="1"
                          max="9"
                          step="1"
                          value={matriks[a]?.[j] ?? 5}
                          onChange={(e) => updateMatriks(a, j, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Parameter */}
      {activeTab === 3 && (
        <div className="fade-in">
          <div className="info-box">
            <strong>Parameter v:</strong> Menentukan bobot antara kepentingan mayoritas (Si)
            dan kepentingan individu (Ri). Nilai v = 0.5 berarti seimbang (by consensus).
          </div>

          <div className="slider-container" style={{ padding: '20px 0' }}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={v}
              onChange={(e) => setV(parseFloat(e.target.value))}
            />
          </div>

          <div className="grid-3">
            <div className="metric-card">
              <div className="metric-value" style={{ fontSize: '1.5rem' }}>{v.toFixed(1)}</div>
              <div className="metric-label">Bobot Si (Mayoritas)</div>
            </div>
            <div className="metric-card">
              <div className="metric-value" style={{ fontSize: '1.5rem' }}>{(1 - v).toFixed(1)}</div>
              <div className="metric-label">Bobot Ri (Individual)</div>
            </div>
            <div className="metric-card">
              <div className="metric-value" style={{ fontSize: '1rem' }}>
                {v === 0.5 ? 'Seimbang (Consensus)' : v > 0.5 ? 'Lebih ke Mayoritas' : 'Lebih ke Individual'}
              </div>
              <div className="metric-label">Interpretasi</div>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ borderTop: '1px solid var(--card-border)', marginTop: 24, paddingTop: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={resetToDefault}>
            Reset ke Data Awal
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCalculate}
            disabled={isLoading}
            id="btn-calculate"
          >
            {isLoading ? (
              <><span className="spinner" style={{ width: 16, height: 16 }} /> Menghitung...</>
            ) : (
              'Jalankan Perhitungan'
            )}
          </button>
        </div>
      </div>

      <GuidedTour page="/input" />
    </>
  );
}
