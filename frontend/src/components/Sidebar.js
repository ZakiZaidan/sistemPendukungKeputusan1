'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import useStore from '@/lib/store';
import { NAV_ITEMS } from '@/lib/constants';
import { getHealth, saveSession, getSessions, getSessionDetail } from '@/lib/api';

/* ── SVG Icon Components ── */
const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconCalculator = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="18" x2="16" y2="18"/>
  </svg>
);
const IconTrophy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
  </svg>
);
const IconBarChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconLogo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="url(#grad)"/>
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4f6ef7"/>
        <stop offset="1" stopColor="#7c3aed"/>
      </linearGradient>
    </defs>
    <polyline points="6 22 12 14 18 18 26 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="26" cy="8" r="2" fill="white"/>
  </svg>
);
const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconSave = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconFolder = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const NAV_ICONS = {
  '/': IconHome,
  '/input': IconEdit,
  '/perhitungan': IconCalculator,
  '/hasil': IconTrophy,
  '/sensitivitas': IconBarChart,
  '/riwayat': IconClock,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessions, setSessions] = useState([]);

  const {
    alternatif, kriteria, v,
    supabaseConnected, setSupabaseConnected,
    loadSession, setToast, getInputData,
  } = useStore();

  useEffect(() => {
    getHealth()
      .then((data) => setSupabaseConnected(data.supabase_connected))
      .catch(() => setSupabaseConnected(false));
  }, [setSupabaseConnected]);

  const handleSave = async () => {
    if (!sessionName.trim()) return;
    try {
      const result = await saveSession({ nama: sessionName.trim(), ...getInputData() });
      setToast({ type: 'success', message: result.message });
      setShowSave(false);
      setSessionName('');
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleLoadList = async () => {
    try {
      const data = await getSessions();
      setSessions(data.sessions || []);
      setShowLoad(true);
      setShowSave(false);
    } catch {
      setSessions([]);
    }
  };

  const handleLoadSession = async (id) => {
    try {
      const detail = await getSessionDetail(id);
      loadSession(detail);
      setToast({ type: 'success', message: `Sesi '${detail.nama}' berhasil dimuat!` });
      setShowLoad(false);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const nAlt = Object.keys(alternatif).length;
  const nKrit = Object.keys(kriteria).length;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <IconClose /> : <IconMenu />}
      </button>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <IconLogo />
          </div>
          <div className="sidebar-logo-text">SPK VIKOR</div>
          <div className="sidebar-logo-sub">Sistem Pendukung Keputusan</div>
        </div>

        <div className="sidebar-divider" />

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Menu Utama</div>
          {NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.path];
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="sidebar-link-icon">
                  {Icon && <Icon />}
                </span>
                <span className="sidebar-link-label">{item.label}</span>
                {isActive && <span className="sidebar-link-dot" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-divider" />

        {/* Quick Info */}
        <div className="sidebar-info">
          <div className="sidebar-info-title">Status Data</div>
          <div className="sidebar-info-row">
            <span>Alternatif</span>
            <span className="sidebar-info-badge">{nAlt}</span>
          </div>
          <div className="sidebar-info-row">
            <span>Kriteria</span>
            <span className="sidebar-info-badge">{nKrit}</span>
          </div>
          <div className="sidebar-info-row">
            <span>Parameter v</span>
            <span className="sidebar-info-badge">{v}</span>
          </div>
        </div>

        {/* Supabase Status */}
        <div className={`sidebar-status ${supabaseConnected ? 'connected' : 'offline'}`}>
          <span className="sidebar-status-dot" />
          <span>{supabaseConnected ? 'Database Terhubung' : 'Mode Offline'}</span>
        </div>

        {/* Save/Load Buttons */}
        {supabaseConnected && (
          <div className="sidebar-actions">
            <button
              className="sidebar-action-btn"
              onClick={() => { setShowSave(!showSave); setShowLoad(false); }}
            >
              <IconSave />
              <span>Simpan Sesi</span>
            </button>
            <button
              className="sidebar-action-btn"
              onClick={handleLoadList}
            >
              <IconFolder />
              <span>Muat Sesi</span>
            </button>

            {showSave && (
              <div className="sidebar-panel">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nama sesi..."
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                />
                <button className="btn btn-primary btn-sm btn-block mt-1" onClick={handleSave}>
                  Simpan ke Database
                </button>
              </div>
            )}

            {showLoad && sessions.length > 0 && (
              <div className="sidebar-panel">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    className="sidebar-session-item"
                    onClick={() => handleLoadSession(s.id)}
                  >
                    <div className="sidebar-session-name">{s.nama}</div>
                    <div className="sidebar-session-meta">v = {s.v}</div>
                  </button>
                ))}
              </div>
            )}

            {showLoad && sessions.length === 0 && (
              <div className="sidebar-panel" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '12px' }}>
                Belum ada sesi tersimpan.
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="sidebar-footer">
          <span>Metode VIKOR v1.0</span>
          <span>© 2026 SPK UMKM</span>
        </div>

        <style jsx>{`
          .mobile-toggle {
            display: none;
            position: fixed;
            top: 12px;
            left: 12px;
            z-index: 1100;
            background: var(--bg-white);
            border: 1px solid var(--card-border);
            color: var(--text-primary);
            border-radius: 10px;
            width: 40px;
            height: 40px;
            cursor: pointer;
            box-shadow: var(--shadow-sm);
            align-items: center;
            justify-content: center;
          }
          @media (max-width: 768px) {
            .mobile-toggle { display: flex; }
          }

          .sidebar {
            position: fixed;
            top: 0; left: 0;
            width: var(--sidebar-width);
            height: 100vh;
            background: var(--bg-white);
            border-right: 1px solid var(--card-border);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            z-index: 1000;
            transition: transform 0.3s ease;
          }
          @media (max-width: 768px) {
            .sidebar { transform: translateX(-100%); box-shadow: var(--shadow-lg); }
            .sidebar.open { transform: translateX(0); }
          }

          /* Logo */
          .sidebar-logo {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 28px 20px 18px;
            gap: 6px;
          }
          .sidebar-logo-mark {
            margin-bottom: 2px;
          }
          .sidebar-logo-text {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--text-primary);
            letter-spacing: -0.02em;
          }
          .sidebar-logo-sub {
            font-size: 0.7rem;
            color: var(--text-dim);
            letter-spacing: 0.2px;
            text-align: center;
          }

          /* Divider */
          .sidebar-divider {
            height: 1px;
            background: var(--card-border);
            margin: 0 16px;
            flex-shrink: 0;
          }

          /* Nav */
          .sidebar-nav {
            padding: 12px 10px 6px;
          }
          .sidebar-nav-label {
            font-size: 0.65rem;
            font-weight: 600;
            color: var(--text-dim);
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 0 10px 8px;
          }
          .sidebar-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 12px;
            margin: 1px 0;
            border-radius: 9px;
            color: var(--text-muted);
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.15s ease;
            text-decoration: none;
            position: relative;
          }
          .sidebar-link:hover {
            background: var(--bg-subtle);
            color: var(--text-primary);
          }
          .sidebar-link.active {
            background: var(--primary-glow);
            color: var(--primary);
            font-weight: 600;
          }
          .sidebar-link-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            flex-shrink: 0;
            opacity: 0.85;
          }
          .sidebar-link.active .sidebar-link-icon {
            opacity: 1;
          }
          .sidebar-link-label {
            flex: 1;
          }
          .sidebar-link-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--primary);
            flex-shrink: 0;
          }

          /* Info panel */
          .sidebar-info {
            margin: 8px 12px;
            padding: 12px 14px;
            background: var(--bg-subtle);
            border-radius: 10px;
          }
          .sidebar-info-title {
            font-size: 0.65rem;
            font-weight: 600;
            color: var(--text-dim);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          .sidebar-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.82rem;
            padding: 4px 0;
            color: var(--text-muted);
          }
          .sidebar-info-badge {
            background: var(--bg-white);
            border: 1px solid var(--card-border);
            border-radius: 6px;
            padding: 1px 8px;
            font-size: 0.78rem;
            font-weight: 600;
            color: var(--text-primary);
          }

          /* Status */
          .sidebar-status {
            display: flex;
            align-items: center;
            gap: 7px;
            margin: 6px 12px;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 500;
          }
          .sidebar-status.connected {
            background: var(--success-bg);
            border: 1px solid var(--success-border);
            color: var(--success);
          }
          .sidebar-status.offline {
            background: var(--danger-bg);
            border: 1px solid var(--danger-border);
            color: var(--danger);
          }
          .sidebar-status-dot {
            width: 7px; height: 7px;
            border-radius: 50%;
            flex-shrink: 0;
          }
          .sidebar-status.connected .sidebar-status-dot { background: var(--success); }
          .sidebar-status.offline .sidebar-status-dot { background: var(--danger); }

          /* Session actions */
          .sidebar-actions {
            padding: 4px 12px 8px;
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .sidebar-action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 8px 12px;
            background: var(--bg-white);
            border: 1px solid var(--card-border);
            border-radius: 8px;
            font-family: 'Inter', sans-serif;
            font-size: 0.82rem;
            font-weight: 500;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.15s ease;
            text-align: left;
          }
          .sidebar-action-btn:hover {
            background: var(--bg-subtle);
            border-color: var(--card-border-hover);
            color: var(--text-primary);
          }
          .sidebar-panel {
            background: var(--bg-subtle);
            border-radius: 8px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .sidebar-session-item {
            background: var(--bg-white);
            border: 1px solid var(--card-border);
            border-radius: 7px;
            padding: 8px 10px;
            cursor: pointer;
            text-align: left;
            color: var(--text-primary);
            transition: all 0.15s ease;
            font-family: 'Inter', sans-serif;
            width: 100%;
          }
          .sidebar-session-item:hover {
            border-color: var(--primary);
            background: var(--primary-surface);
          }
          .sidebar-session-name { font-size: 0.82rem; font-weight: 500; }
          .sidebar-session-meta { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }

          /* Footer */
          .sidebar-footer {
            margin-top: auto;
            padding: 14px 16px;
            border-top: 1px solid var(--card-border);
            display: flex;
            justify-content: space-between;
            font-size: 0.68rem;
            color: var(--text-dim);
          }
        `}</style>
      </aside>
    </>
  );
}
