'use client';

import { useState, useEffect } from 'react';
import useStore from '@/lib/store';
import { getSessions, getSessionDetail, deleteSession, getRiwayat } from '@/lib/api';
import GuidedTour from '@/components/GuidedTour';

export default function RiwayatPage() {
  const { supabaseConnected, loadSession, setToast } = useStore();
  const [activeTab, setActiveTab] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [expandedRiwayat, setExpandedRiwayat] = useState({});

  useEffect(() => {
    if (supabaseConnected) {
      fetchSessions();
      fetchRiwayat();
    }
  }, [supabaseConnected]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await getSessions();
      setSessions(data.sessions || []);
    } catch { setSessions([]); }
    finally { setLoadingSessions(false); }
  };

  const fetchRiwayat = async () => {
    setLoadingRiwayat(true);
    try {
      const data = await getRiwayat();
      setRiwayat(data.riwayat || []);
    } catch { setRiwayat([]); }
    finally { setLoadingRiwayat(false); }
  };

  const handleLoadSession = async (id) => {
    try {
      const detail = await getSessionDetail(id);
      loadSession(detail);
      setToast({ type: 'success', message: `Sesi '${detail.nama}' berhasil dimuat! Buka halaman Input Data.` });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id);
      setToast({ type: 'success', message: 'Sesi berhasil dihapus.' });
      fetchSessions();
      fetchRiwayat();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const formatTs = (ts) => {
    try {
      const dt = new Date(ts);
      return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return ts; }
  };

  return (
    <>
      <div className="page-hero">
        <h1 className="page-hero-title">Riwayat Perhitungan</h1>
        <p className="page-hero-sub">Semua hasil perhitungan yang tersimpan di Supabase</p>
      </div>

      {!supabaseConnected ? (
        <>
          <div className="info-box warning">
            <strong>Database tidak terhubung.</strong> Pastikan backend FastAPI berjalan dan credentials Supabase terisi dengan benar.
          </div>
          <div className="glass-card">
            <div className="section-title" style={{ fontSize: '1.1rem' }}>Cara Setup</div>
            <p style={{ marginTop: 12, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 2 }}>
              1. Buka <strong style={{ color: 'var(--primary)' }}>supabase.com</strong> dan login ke project Anda<br />
              2. Masuk ke <strong>Settings → API</strong><br />
              3. Salin <strong>Project URL</strong> dan <strong>anon public key</strong><br />
              4. Isi file <code>backend/.env</code> dengan credentials tersebut<br />
              5. Restart backend FastAPI
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="tabs">
            {['Sesi Tersimpan', 'Riwayat Perhitungan'].map((tab, i) => (
              <button key={tab} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
                {tab}
              </button>
            ))}
          </div>

          {/* Sesi */}
          {activeTab === 0 && (
            <div className="fade-in">
              {loadingSessions ? (
                <div className="loading-overlay"><span className="spinner" /> Memuat sesi...</div>
              ) : sessions.length === 0 ? (
                <div className="info-box">Belum ada sesi yang tersimpan. Gunakan tombol &quot;Simpan Sesi&quot; di sidebar.</div>
              ) : (
                <>
                  <div className="glass-card no-hover" style={{ padding: '14px 24px' }}>
                    <div className="section-title" style={{ fontSize: '1.1rem' }}>{sessions.length} Sesi Tersimpan</div>
                  </div>
                  {sessions.map((s) => (
                    <div key={s.id} className="glass-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.nama}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {formatTs(s.created_at)} &nbsp;|&nbsp; v = {s.v}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleLoadSession(s.id)}>
                          Muat
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSession(s.id)}>
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Riwayat */}
          {activeTab === 1 && (
            <div className="fade-in">
              {loadingRiwayat ? (
                <div className="loading-overlay"><span className="spinner" /> Memuat riwayat...</div>
              ) : riwayat.length === 0 ? (
                <div className="info-box">Belum ada riwayat perhitungan. Jalankan perhitungan dan simpan sesi terlebih dahulu.</div>
              ) : (
                <>
                  <div className="glass-card no-hover" style={{ padding: '14px 24px' }}>
                    <div className="section-title" style={{ fontSize: '1.1rem' }}>{riwayat.length} Riwayat Terbaru</div>
                  </div>
                  {riwayat.map((r) => {
                    const sesiNama = r.sessions?.nama || '—';
                    const sesiV = r.sessions?.v || '—';
                    const ranking = r.ranking || [];
                    const rank1 = ranking[0] || {};
                    const validasi = r.validasi || {};
                    const isExpanded = expandedRiwayat[r.id];

                    return (
                      <div key={r.id} className="accordion">
                        <div
                          className={`accordion-header ${isExpanded ? 'open' : ''}`}
                          onClick={() => setExpandedRiwayat(prev => ({ ...prev, [r.id]: !prev[r.id] }))}
                        >
                          <span>{formatTs(r.calculated_at)} — Sesi: {sesiNama}</span>
                          <span className="arrow">▼</span>
                        </div>
                        <div className={`accordion-content ${isExpanded ? 'open' : ''}`}>
                          <div className="grid-3" style={{ marginBottom: 16 }}>
                            <div className="metric-card">
                              <div className="metric-value" style={{ fontSize: '1.1rem' }}>{rank1.kode || '—'}</div>
                              <div className="metric-label">Peringkat 1</div>
                            </div>
                            <div className="metric-card">
                              <div className="metric-value" style={{ fontSize: '1.1rem' }}>{rank1.qi?.toFixed(4) || '—'}</div>
                              <div className="metric-label">Nilai Qi Terbaik</div>
                            </div>
                            <div className="metric-card">
                              <div className="metric-value" style={{
                                fontSize: '1rem',
                                color: validasi.valid ? 'var(--success)' : 'var(--danger)',
                              }}>
                                {validasi.valid ? 'SAH' : 'Tidak Sah'}
                              </div>
                              <div className="metric-label">Validasi Kompromi</div>
                            </div>
                          </div>
                          {ranking.length > 0 && (
                            <div className="data-table-wrapper">
                              <table className="data-table">
                                <thead>
                                  <tr><th>Rank</th><th>Kode</th><th>Nama</th><th>Qi</th><th>Si</th><th>Ri</th></tr>
                                </thead>
                                <tbody>
                                  {ranking.map((row) => (
                                    <tr key={row.kode}>
                                      <td className="highlight">#{row.rank}</td>
                                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{row.kode}</td>
                                      <td>{row.nama}</td>
                                      <td className="number">{row.qi?.toFixed(4)}</td>
                                      <td className="number">{row.si?.toFixed(4)}</td>
                                      <td className="number">{row.ri?.toFixed(4)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </>
      )}

      <GuidedTour page="/riwayat" />
    </>
  );
}
