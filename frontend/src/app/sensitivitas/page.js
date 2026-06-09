'use client';

import { useState } from 'react';
import useStore from '@/lib/store';
import { runSensitivity, calculateVikor } from '@/lib/api';
import LineChart from '@/components/charts/LineChart';
import GuidedTour from '@/components/GuidedTour';

export default function SensitivitasPage() {
  const {
    calculated, setVikorResult, setLoading, setError, setToast, getInputData, isLoading,
  } = useStore();

  const [selectedV, setSelectedV] = useState([0.3, 0.4, 0.5, 0.6, 0.7]);
  const [results, setResults] = useState(null);

  const allVOptions = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

  const toggleV = (vVal) => {
    setSelectedV((prev) =>
      prev.includes(vVal) ? prev.filter(v => v !== vVal) : [...prev, vVal].sort()
    );
  };

  const handleRun = async () => {
    if (selectedV.length === 0) return;
    setLoading(true);
    try {
      // Also run base calculation if needed
      if (!calculated) {
        const base = await calculateVikor(getInputData());
        setVikorResult(base);
      }
      const data = {
        ...getInputData(),
        v_values: selectedV,
      };
      const res = await runSensitivity(data);
      setResults(res);
    } catch (err) {
      setError(err.message);
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareRankingLineData = () => {
    if (!results) return null;
    const altKeys = results.alt_keys;
    const vSorted = selectedV.sort((a, b) => a - b);

    return altKeys.map(a => ({
      label: `${a} – ${results.alternatif[a]}`,
      values: vSorted.map(vVal => {
        const r = results.results[String(vVal)];
        const found = r.ranking.find(x => x.kode === a);
        return found ? found.rank : altKeys.length;
      }),
    }));
  };

  const prepareQiLineData = () => {
    if (!results) return null;
    const altKeys = results.alt_keys;
    const vSorted = selectedV.sort((a, b) => a - b);

    return altKeys.map(a => ({
      label: a,
      values: vSorted.map(vVal => {
        const r = results.results[String(vVal)];
        const found = r.ranking.find(x => x.kode === a);
        return found ? found.qi : 0;
      }),
    }));
  };

  const vSorted = [...selectedV].sort((a, b) => a - b);

  return (
    <>
      <div className="page-hero">
        <h1 className="page-hero-title">Analisis Sensitivitas</h1>
        <p className="page-hero-sub">Variasi parameter v untuk menguji stabilitas ranking</p>
      </div>

      <div className="info-box">
        <strong>Analisis Sensitivitas</strong> dilakukan dengan memvariasikan parameter v
        dari 0.1 hingga 0.9. Parameter v mengontrol keseimbangan antara
        <strong> kepentingan mayoritas</strong> (Si) dan <strong>kepentingan individu terburuk</strong> (Ri).
        Jika ranking stabil terhadap perubahan v, maka keputusan dianggap <strong>robust</strong>.
      </div>

      {/* Config */}
      <div className="glass-card">
        <div className="section-title" style={{ fontSize: '1.1rem', marginBottom: 12 }}>Konfigurasi Analisis</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>
              Pilih nilai v untuk dianalisis:
            </div>
            <div className="multiselect">
              {allVOptions.map((vVal) => (
                <button
                  key={vVal}
                  className={`chip ${selectedV.includes(vVal) ? 'active' : ''}`}
                  onClick={() => toggleV(vVal)}
                >
                  {vVal.toFixed(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="metric-card" style={{ minWidth: 80, padding: '14px 20px' }}>
            <div className="metric-value" style={{ fontSize: '1.5rem' }}>{selectedV.length}</div>
            <div className="metric-label">Variasi v</div>
          </div>
        </div>
        <button
          className="btn btn-primary mt-2"
          onClick={handleRun}
          disabled={isLoading || selectedV.length === 0}
        >
          {isLoading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Menganalisis...</> : 'Jalankan Analisis'}
        </button>
      </div>

      {results && (
        <div className="fade-in">
          {/* Ranking comparison table */}
          <div className="glass-card no-hover" style={{ padding: '16px 24px' }}>
            <div className="section-title" style={{ fontSize: '1.1rem' }}>Perbandingan Ranking</div>
            <div className="section-desc">Ranking alternatif untuk setiap nilai v</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Alternatif</th>
                  {vSorted.map(vVal => <th key={vVal}>v = {vVal}</th>)}
                </tr>
              </thead>
              <tbody>
                {results.alt_keys.map((a) => (
                  <tr key={a}>
                    <td><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{a}</span> — {results.alternatif[a]}</td>
                    {vSorted.map(vVal => {
                      const r = results.results[String(vVal)];
                      const found = r.ranking.find(x => x.kode === a);
                      return <td key={vVal} className="number">{found?.rank || '-'}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Qi values table */}
          <div className="glass-card no-hover mt-3" style={{ padding: '16px 24px' }}>
            <div className="section-title" style={{ fontSize: '1.1rem' }}>Nilai Qi per Variasi v</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Alternatif</th>
                  {vSorted.map(vVal => <th key={vVal}>v = {vVal}</th>)}
                </tr>
              </thead>
              <tbody>
                {results.alt_keys.map((a) => (
                  <tr key={a}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{a}</td>
                    {vSorted.map(vVal => {
                      const r = results.results[String(vVal)];
                      const found = r.ranking.find(x => x.kode === a);
                      return <td key={vVal} className="number">{found?.qi.toFixed(4) || '-'}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Line Charts */}
          <div style={{ height: 24 }} />
          <LineChart
            data={prepareRankingLineData()}
            xValues={vSorted}
            title="Grafik Perubahan Ranking"
            xLabel="Parameter v"
            yLabel="Ranking"
            invertY={true}
            yFormat={(d) => Math.round(d).toString()}
            height={460}
          />

          <LineChart
            data={prepareQiLineData()}
            xValues={vSorted}
            title="Grafik Nilai Qi"
            xLabel="Parameter v"
            yLabel="Nilai Qi"
            yFormat={(d) => d.toFixed(4)}
            height={420}
          />

          {/* Validasi per v */}
          <div className="glass-card no-hover mt-3" style={{ padding: '16px 24px' }}>
            <div className="section-title" style={{ fontSize: '1.1rem' }}>Validasi Kompromi per Nilai v</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>v</th><th>Rank 1</th><th>Q (Rank 1)</th><th>Kondisi 1</th><th>Kondisi 2</th><th>Valid</th></tr>
              </thead>
              <tbody>
                {vSorted.map(vVal => {
                  const r = results.results[String(vVal)];
                  const val = r.validasi;
                  return (
                    <tr key={vVal}>
                      <td style={{ fontWeight: 600 }}>{vVal}</td>
                      <td>{val.a1st} — {val.a1st_nama}</td>
                      <td className="number">{val.q1st.toFixed(4)}</td>
                      <td style={{ color: val.kondisi1 ? 'var(--success)' : 'var(--danger)' }}>{val.kondisi1 ? '✓' : '✗'}</td>
                      <td style={{ color: val.kondisi2 ? 'var(--success)' : 'var(--danger)' }}>{val.kondisi2 ? '✓' : '✗'}</td>
                      <td style={{ fontWeight: 600, color: val.valid ? 'var(--success)' : 'var(--danger)' }}>
                        {val.valid ? '✓ SAH' : '✗ Tidak Sah'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Stability Conclusion */}
          {(() => {
            const firstRanks = vSorted.map(vVal => results.results[String(vVal)].ranking[0].kode);
            const isStable = new Set(firstRanks).size === 1;
            const stableAlt = firstRanks[0];
            return (
              <div className="glass-card text-center mt-3">
                <div className="section-title" style={{ fontSize: '1.15rem', marginBottom: 12 }}>
                  Kesimpulan Analisis Sensitivitas
                </div>
                {isStable ? (
                  <>
                    <div className="result-badge" style={{ fontSize: '0.9rem', padding: '12px 20px' }}>
                      Ranking STABIL — {stableAlt} ({results.alternatif[stableAlt]}) konsisten di peringkat 1 untuk semua variasi v
                    </div>
                    <div style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Keputusan bersifat <strong style={{ color: 'var(--success)' }}>robust</strong> dan tidak sensitif terhadap perubahan parameter kompromi.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="result-badge fail" style={{ fontSize: '0.9rem', padding: '12px 20px' }}>
                      Ranking BERUBAH — Peringkat 1 tidak konsisten antar variasi v
                    </div>
                    <div style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Rank 1: {vSorted.map((vVal, i) => `v=${vVal}: ${firstRanks[i]}`).join(', ')}
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <GuidedTour page="/sensitivitas" />
    </>
  );
}
