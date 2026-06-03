"""
Sistem Pendukung Keputusan — Metode VIKOR
Penentuan Strategi Pemasaran UMKM Nasi Bakar Mak Yuni Kota Metro

Aplikasi Streamlit dengan desain modern dan navigasi multi-halaman.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import io
import copy

from vikor import VIKOR, DEFAULT_ALTERNATIF, DEFAULT_KRITERIA, DEFAULT_MATRIKS
import db as supadb

# ═══════════════════════════════════════════════════════════════════
# PAGE CONFIG & THEME
# ═══════════════════════════════════════════════════════════════════

st.set_page_config(
    page_title="SPK VIKOR — Strategi Pemasaran UMKM",
    page_icon="SPK",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── Custom CSS for Minimalist UI ───

st.markdown("""
<style>
/* ── Google Font + Material Icons ── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined');

/* Force Material Icons to render as icons, not text */
.material-icons, .material-icons-outlined {
    font-family: 'Material Icons', 'Material Icons Outlined' !important;
    font-style: normal !important;
    display: inline-block !important;
}

/* ── Root Variables ── */
:root {
    --primary: #3b82f6;
    --primary-dark: #2563eb;
    --secondary: #64748b;
    --bg-dark: #0f172a;
    --card-bg: #1e293b;
    --card-border: #334155;
    --text-primary: #f8fafc;
    --text-muted: #94a3b8;
    --gradient-1: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    --gradient-2: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    --shadow-glow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.18);
}

/* ── Global ── */
html, body, [class*="st-"], .stApp {
    font-family: 'Inter', sans-serif !important;
}

.stApp {
    background: var(--bg-dark);
}

/* ── Sidebar ── */
section[data-testid="stSidebar"] {
    background: #1e293b;
    border-right: 1px solid var(--card-border);
}

section[data-testid="stSidebar"] .stRadio > label {
    color: var(--text-muted) !important;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    font-size: 0.7rem;
}

section[data-testid="stSidebar"] .stRadio > div[role="radiogroup"] > label {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 12px;
    padding: 10px 16px;
    margin: 2px 0;
    transition: all 0.3s ease;
    color: var(--text-primary) !important;
    font-weight: 500;
}

section[data-testid="stSidebar"] .stRadio > div[role="radiogroup"] > label:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: var(--card-border);
}

section[data-testid="stSidebar"] .stRadio > div[role="radiogroup"] > label[data-checked="true"],
section[data-testid="stSidebar"] .stRadio > div[role="radiogroup"] > label[aria-checked="true"] {
    background: rgba(59, 130, 246, 0.15) !important;
    border-color: var(--primary) !important;
}

/* ── Cards ── */
.glass-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.glass-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* ── Hero Section ── */
.hero-section {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 32px 40px;
    text-align: center;
    margin-bottom: 32px;
}

.hero-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.hero-subtitle {
    font-size: 1.1rem;
    color: var(--text-muted);
    font-weight: 400;
}

/* ── Metric Cards ── */
.metric-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 20px 24px;
    text-align: center;
}

.metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary);
}

.metric-label {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
}

/* ── Step indicator ── */
.step-badge {
    display: inline-block;
    background: var(--primary);
    color: white;
    font-weight: 700;
    font-size: 0.75rem;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
}

/* ── Section title ── */
.section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.section-desc {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 16px;
}

/* ── Result badge ── */
.result-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    color: #4ade80;
}

.result-badge-fail {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
}

/* ── Rank card ── */
.rank-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
}

.rank-card.rank-1 {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.4);
}

.rank-number {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 8px;
    color: var(--text-primary);
}

.rank-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
}

.rank-qi {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 4px;
}

/* ── Dataframe styling ── */
.stDataFrame {
    border-radius: 12px;
    overflow: hidden;
}

div[data-testid="stDataFrame"] > div {
    border-radius: 12px;
}

/* ── Info boxes ── */
.info-box {
    background: rgba(59, 130, 246, 0.1);
    border-left: 4px solid var(--primary);
    border-radius: 0 12px 12px 0;
    padding: 16px 20px;
    margin: 12px 0;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.info-box strong {
    color: var(--primary);
}

/* ── Buttons ── */
.stButton > button {
    background: var(--primary) !important;
    color: white !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 10px 24px !important;
    font-weight: 600 !important;
    letter-spacing: 0.3px;
    transition: all 0.3s ease !important;
}

.stButton > button:hover {
    background: var(--primary-dark) !important;
}

/* ── Tabs ── */
.stTabs [data-baseweb="tab-list"] {
    gap: 4px;
    background: #0f172a;
    border-radius: 8px;
    padding: 4px;
}

.stTabs [data-baseweb="tab"] {
    border-radius: 6px;
    font-weight: 500;
    padding: 8px 20px;
    color: var(--text-muted);
}

.stTabs [data-baseweb="tab"][aria-selected="true"] {
    background: #334155;
    color: var(--text-primary);
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.18);
}

/* ── Expander ── */
.streamlit-expanderHeader,
[data-testid="stExpander"] summary,
[data-testid="stExpanderToggleIcon"],
details summary {
    font-weight: 600;
    color: var(--text-primary) !important;
    background: var(--card-bg);
    border-radius: 8px;
    display: flex !important;
    align-items: center !important;
    gap: 8px;
    padding: 10px 14px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
[data-testid="stExpander"] summary span,
[data-testid="stExpander"] summary p {
    white-space: normal;
    overflow: visible;
    line-height: 1.4;
}

/* ── Divider ── */
hr {
    border-color: var(--card-border) !important;
}

/* ── Number input / select ── */
.stNumberInput > div, .stSelectbox > div {
    border-radius: 10px;
}

/* ── Footer ── */
.footer {
    text-align: center;
    padding: 24px;
    color: var(--text-muted);
    font-size: 0.8rem;
    border-top: 1px solid var(--card-border);
    margin-top: 48px;
}
/* ── Hide Streamlit UI clutter ── */

/* Sembunyikan header & toolbar Streamlit */
[data-testid="stToolbar"] { display: none !important; }
[data-testid="stDecoration"] { display: none !important; }
[data-testid="stStatusWidget"] { display: none !important; }
header[data-testid="stHeader"] { display: none !important; }

/* Sembunyikan tombol collapse sidebar (penyebab "keyboard_double") */
[data-testid="stSidebarCollapsedControl"] { display: none !important; }
button[data-testid="collapsedControl"] { display: none !important; }
[data-testid="collapsedControl"] { display: none !important; }

/* Sembunyikan ikon arrow teks di expander (penyebab "d_arr...") */
[data-testid="stExpander"] details summary svg { display: none !important; }
[data-testid="stExpander"] details summary > div:first-child > svg { display: none !important; }
[data-testid="stExpander"] summary > div:first-child { display: none !important; }

/* Pastikan expander summary tidak overflow */
[data-testid="stExpander"] details summary {
    overflow: hidden !important;
    text-overflow: clip !important;
    white-space: nowrap !important;
}
[data-testid="stExpander"] details summary p,
[data-testid="stExpander"] details summary span {
    white-space: normal !important;
    overflow: visible !important;
}

/* Tambah padding atas agar konten tidak tertimpa header */
.main .block-container {
    padding-top: 1rem !important;
}

</style>
""", unsafe_allow_html=True)

# Inject Material Icons font as HTML link tag (more reliable than CSS @import)
st.markdown(
    '<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round">',
    unsafe_allow_html=True,
)

# ═══════════════════════════════════════════════════════════════════
# SESSION STATE INITIALIZATION
# ═══════════════════════════════════════════════════════════════════


def init_session_state():
    """Initialize session state with default data from journal."""
    if 'alternatif' not in st.session_state:
        st.session_state.alternatif = copy.deepcopy(DEFAULT_ALTERNATIF)
    if 'kriteria' not in st.session_state:
        st.session_state.kriteria = copy.deepcopy(DEFAULT_KRITERIA)
    if 'matriks' not in st.session_state:
        st.session_state.matriks = copy.deepcopy(DEFAULT_MATRIKS)
    if 'v' not in st.session_state:
        st.session_state.v = 0.5
    if 'calculated' not in st.session_state:
        st.session_state.calculated = False
    if 'vikor_result' not in st.session_state:
        st.session_state.vikor_result = None

init_session_state()


# ═══════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════

def run_calculation():
    """Run VIKOR calculation and store results in session state."""
    vikor = VIKOR(
        st.session_state.alternatif,
        st.session_state.kriteria,
        st.session_state.matriks,
        st.session_state.v,
    )
    vikor.calculate()
    st.session_state.vikor_result = vikor
    st.session_state.calculated = True


def make_plotly_dark(fig):
    """Apply dark theme to plotly figure."""
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Inter", color="#f8fafc"),
        margin=dict(l=40, r=40, t=50, b=40),
        legend=dict(
            bgcolor="rgba(30,41,59,0.8)",
            bordercolor="#334155",
            borderwidth=1,
        ),
    )
    fig.update_xaxes(gridcolor="#334155", zerolinecolor="#475569")
    fig.update_yaxes(gridcolor="#334155", zerolinecolor="#475569")
    return fig


PLOTLY_COLORS = [
    '#3b82f6', '#ef4444', '#22c55e', '#eab308', '#06b6d4',
    '#8b5cf6', '#d946ef', '#0ea5e9', '#f43f5e', '#64748b',
]


# ═══════════════════════════════════════════════════════════════════
# SIDEBAR NAVIGATION
# ═══════════════════════════════════════════════════════════════════

with st.sidebar:
    st.markdown("""
    <div style="text-align:center; padding: 16px 0 8px;">
        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">SPK VIKOR</div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
            Sistem Pendukung Keputusan</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("---")

    page = st.radio(
        "NAVIGASI",
        [
            "Beranda",
            "Input Data",
            "Perhitungan",
            "Hasil & Ranking",
            "Analisis Sensitivitas",
            "Riwayat",
        ],
        label_visibility="collapsed",
    )

    st.markdown("---")

    # Quick info
    n_alt = len(st.session_state.alternatif)
    n_krit = len(st.session_state.kriteria)
    st.markdown(f"""
    <div style="padding: 12px 16px; background: #1e293b;
         border-radius: 8px; border: 1px solid #334155;">
        <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;
             letter-spacing: 1px; margin-bottom: 8px;">Data Saat Ini</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #94a3b8; font-size: 0.85rem;">Alternatif</span>
            <span style="color: #f8fafc; font-weight: 600;">{n_alt}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #94a3b8; font-size: 0.85rem;">Kriteria</span>
            <span style="color: #f8fafc; font-weight: 600;">{n_krit}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
            <span style="color: #94a3b8; font-size: 0.85rem;">Parameter v</span>
            <span style="color: #f8fafc; font-weight: 600;">{st.session_state.v}</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("---")

    # ─── Supabase Panel ───
    is_connected = supadb.is_connected()
    conn_error = supadb.get_connection_error()
    if is_connected:
        st.markdown("""
        <div style="display:flex; align-items:center; gap:6px;
             padding: 6px 10px; background: rgba(34,197,94,0.12);
             border: 1px solid rgba(34,197,94,0.25); border-radius: 8px;
             margin-bottom: 10px;">
            <div style="width:8px; height:8px; background:#4ade80;
                 border-radius:50%; flex-shrink:0;"></div>
            <span style="font-size:0.78rem; color:#4ade80;">Supabase Terhubung</span>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown("""
        <div style="display:flex; align-items:center; gap:6px;
             padding: 6px 10px; background: rgba(239,68,68,0.1);
             border: 1px solid rgba(239,68,68,0.2); border-radius: 8px;
             margin-bottom: 6px;">
            <div style="width:8px; height:8px; background:#f87171;
                 border-radius:50%; flex-shrink:0;"></div>
            <span style="font-size:0.78rem; color:#f87171;">Offline (tanpa DB)</span>
        </div>
        """, unsafe_allow_html=True)
        if conn_error:
            st.caption(f"⚠️ {conn_error}")

    if is_connected:
        # ─── Simpan Sesi ───
        if "show_simpan" not in st.session_state:
            st.session_state.show_simpan = False
        if "show_muat" not in st.session_state:
            st.session_state.show_muat = False

        col_s, col_m = st.columns(2)
        with col_s:
            if st.button("Simpan Sesi", key="toggle_simpan", use_container_width=True):
                st.session_state.show_simpan = not st.session_state.show_simpan
                st.session_state.show_muat = False
        with col_m:
            if st.button("Muat Sesi", key="toggle_muat", use_container_width=True):
                st.session_state.show_muat = not st.session_state.show_muat
                st.session_state.show_simpan = False

        if st.session_state.show_simpan:
            nama_sesi = st.text_input(
                "Nama sesi",
                placeholder="cth: Analisis UMKM Jun 2026",
                key="nama_sesi_input",
                label_visibility="collapsed",
            )
            if st.button("Simpan ke Database", key="btn_simpan_sesi", use_container_width=True):
                if nama_sesi.strip():
                    result = supadb.save_session(
                        nama=nama_sesi.strip(),
                        alternatif=st.session_state.alternatif,
                        kriteria=st.session_state.kriteria,
                        matriks=st.session_state.matriks,
                        v=st.session_state.v,
                    )
                    if result["success"]:
                        st.session_state["last_saved_session_id"] = result.get("id")
                        st.success(result["message"])
                        if st.session_state.calculated and st.session_state.vikor_result:
                            vk = st.session_state.vikor_result
                            supadb.save_hasil(
                                session_id=result["id"],
                                ranking=vk.ranking,
                                validasi=vk.validasi,
                                si_values={k: float(v) for k, v in zip(vk.alt_keys, vk.si)},
                                ri_values={k: float(v) for k, v in zip(vk.alt_keys, vk.ri)},
                                qi_values={k: float(v) for k, v in zip(vk.alt_keys, vk.qi)},
                            )
                        st.session_state.show_simpan = False
                    else:
                        st.error(result["message"])
                else:
                    st.warning("Masukkan nama sesi.")

        if st.session_state.show_muat:
            sessions = supadb.load_sessions()
            if sessions:
                sesi_options = {f"{s['nama']} ({supadb.format_timestamp(s['created_at'])})": s["id"]
                                for s in sessions}
                pilihan = st.selectbox(
                    "Pilih sesi",
                    options=list(sesi_options.keys()),
                    key="pilih_sesi_select",
                    label_visibility="collapsed",
                )
                if st.button("Muat Sesi Ini", key="btn_muat_sesi", use_container_width=True):
                    sesi_id = sesi_options[pilihan]
                    detail = supadb.load_session_detail(sesi_id)
                    if detail:
                        st.session_state.alternatif = detail["alternatif"]
                        st.session_state.kriteria = detail["kriteria"]
                        st.session_state.matriks = {k: list(v) if isinstance(v, list) else v
                                                    for k, v in detail["matriks"].items()}
                        st.session_state.v = detail["v"]
                        st.session_state.calculated = False
                        st.session_state.vikor_result = None
                        st.session_state.show_muat = False
                        st.success(f"Sesi '{detail['nama']}' berhasil dimuat!")
                        st.rerun()
                    else:
                        st.error("Gagal memuat sesi.")
            else:
                st.caption("Belum ada sesi tersimpan.")


    st.markdown("""
    <div class="footer" style="margin-top: 24px; border: none; padding: 8px;">
        <div style="font-size: 0.7rem; color: #555;">
            Metode VIKOR v1.0<br>
            © 2026 — SPK UMKM
        </div>
    </div>
    """, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════
# PAGE: BERANDA
# ═══════════════════════════════════════════════════════════════════

def page_beranda():
    # Hero
    st.markdown("""
    <div class="hero-section">
        <div class="hero-title">Sistem Pendukung Keputusan</div>
        <div class="hero-subtitle">
            Metode VIKOR — Penentuan Strategi Pemasaran UMKM<br>
            <span style="font-size: 0.9rem; opacity: 0.7;">
                Studi Kasus: UMKM Nasi Bakar Mak Yuni, Kota Metro
            </span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Quick metrics
    col1, col2, col3, col4 = st.columns(4)
    metrics = [
        ("8", "Alternatif"),
        ("7", "Kriteria"),
        ("v = 0.5", "Parameter Kompromi"),
        ("VIKOR", "Metode"),
    ]
    for col, (val, label) in zip([col1, col2, col3, col4], metrics):
        with col:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value">{val}</div>
                <div class="metric-label">{label}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Two column layout: Metode & Studi Kasus
    col_l, col_r = st.columns([1, 1])

    with col_l:
        st.markdown("""
        <div class="glass-card">
            <div class="step-badge">METODE</div>
            <div class="section-title">Apa itu VIKOR?</div>
            <div class="section-desc" style="margin-top: 12px; line-height: 1.8;">
                <strong style="color: #6C63FF;">VIKOR</strong> 
                (<em>VIšekriterijumsko KOmpromisno Rangiranje</em>) adalah metode 
                pengambilan keputusan multi-kriteria yang berfokus pada 
                <strong style="color: #FF6584;">solusi kompromi</strong> — 
                yaitu alternatif yang paling mendekati kondisi ideal berdasarkan 
                pertimbangan seluruh kriteria secara seimbang.
                <br><br>
                Metode ini menghasilkan <strong style="color: #43E97B;">ranking</strong> 
                berdasarkan indeks VIKOR (Qi), di mana alternatif dengan Qi terkecil 
                adalah yang terbaik.
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col_r:
        st.markdown("""
        <div class="glass-card">
            <div class="step-badge">STUDI KASUS</div>
            <div class="section-title">UMKM Nasi Bakar Mak Yuni</div>
            <div class="section-desc" style="margin-top: 12px; line-height: 1.8;">
                Sistem ini mengimplementasikan metode VIKOR untuk membantu 
                <strong style="color: #6C63FF;">UMKM Nasi Bakar Mak Yuni</strong> di Kota Metro 
                dalam menentukan <strong style="color: #FF6584;">strategi pemasaran terbaik</strong> 
                dari 8 alternatif yang tersedia.
                <br><br>
                Penilaian dilakukan berdasarkan <strong style="color: #43E97B;">7 kriteria</strong> 
                yang mencakup biaya, jangkauan, kemudahan, potensi penjualan, risiko, 
                keterukuran, dan keberlanjutan.
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # VIKOR Steps
    st.markdown("""
    <div class="glass-card">
        <div class="step-badge">ALUR PERHITUNGAN</div>
        <div class="section-title">Tahapan Metode VIKOR</div>
    </div>
    """, unsafe_allow_html=True)

    steps = [
        ("1", "Input Data", "Masukkan alternatif, kriteria, bobot, dan matriks keputusan"),
        ("2", "Nilai Ideal", "Tentukan f+ (terbaik) dan f- (terburuk) untuk setiap kriteria"),
        ("3", "Normalisasi", "Hitung Nij = (f+j - fij) / (f+j - f-j)"),
        ("4", "Pembobotan", "Hitung F*ij = Wj x Nij"),
        ("5", "Si & Ri", "Si = ΣF*ij (total gap), Ri = MAX(F*ij) (gap terburuk)"),
        ("6", "Indeks Qi", "Qi = v(Si-S-)/(S+-S-) + (1-v)(Ri-R-)/(R+-R-)"),
        ("7", "Ranking", "Urutkan Qi dari terkecil ke terbesar"),
        ("8", "Validasi", "Cek Acceptable Advantage & Acceptable Stability"),
    ]

    cols = st.columns(4)
    for i, (num, title, desc) in enumerate(steps):
        with cols[i % 4]:
            st.markdown(f"""
            <div class="glass-card" style="min-height: 140px;">
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary); margin-bottom: 8px;">{num}</div>
                <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 4px;">
                    {title}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">{desc}</div>
            </div>
            """, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════
# PAGE: INPUT DATA
# ═══════════════════════════════════════════════════════════════════

def page_input():
    st.markdown("""
    <div class="hero-section" style="padding: 32px 40px;">
        <div class="hero-title" style="font-size: 1.8rem;">Input Data</div>
        <div class="hero-subtitle">Kelola kriteria, alternatif, dan matriks keputusan</div>
    </div>
    """, unsafe_allow_html=True)

    tab1, tab2, tab3, tab4 = st.tabs([
        "Kriteria & Bobot",
        "Alternatif",
        "Matriks Keputusan",
        "Parameter",
    ])

    # ─── Tab: Kriteria ───
    with tab1:
        st.markdown("""
        <div class="info-box">
            <strong>Kriteria Penilaian:</strong> Tentukan kriteria beserta tipe (Cost/Benefit) 
            dan bobotnya. Total bobot harus = 1.00.
        </div>
        """, unsafe_allow_html=True)

        kriteria = st.session_state.kriteria
        krit_keys = list(kriteria.keys())

        # Show current criteria as editable table
        krit_data = []
        for k in krit_keys:
            krit_data.append({
                'Kode': k,
                'Nama Kriteria': kriteria[k]['nama'],
                'Tipe': kriteria[k]['tipe'],
                'Bobot': kriteria[k]['bobot'],
            })
        
        df_krit = pd.DataFrame(krit_data)
        
        edited_krit = st.data_editor(
            df_krit,
            column_config={
                "Kode": st.column_config.TextColumn("Kode", width="small"),
                "Nama Kriteria": st.column_config.TextColumn("Nama Kriteria", width="large"),
                "Tipe": st.column_config.SelectboxColumn("Tipe", options=["Benefit", "Cost"], width="small"),
                "Bobot": st.column_config.NumberColumn("Bobot", min_value=0.0, max_value=1.0, step=0.01, format="%.2f", width="small"),
            },
            num_rows="dynamic",
            use_container_width=True,
            key="krit_editor",
        )

        # Show total bobot
        total_bobot = edited_krit['Bobot'].sum()
        bobot_color = "#43E97B" if abs(total_bobot - 1.0) < 0.001 else "#FF6584"
        st.markdown(f"""
        <div style="text-align: right; padding: 8px 16px;">
            Total Bobot: <span style="color: {bobot_color}; font-weight: 700; font-size: 1.1rem;">
            {total_bobot:.2f}</span>
            <span style="color: #8B8FA3;"> / 1.00</span>
        </div>
        """, unsafe_allow_html=True)

        if st.button("Simpan Kriteria", key="save_krit"):
            new_kriteria = {}
            for _, row in edited_krit.iterrows():
                if pd.notna(row['Kode']) and row['Kode'].strip():
                    new_kriteria[row['Kode'].strip()] = {
                        'nama': row['Nama Kriteria'],
                        'tipe': row['Tipe'],
                        'bobot': float(row['Bobot']),
                    }
            st.session_state.kriteria = new_kriteria
            st.session_state.calculated = False
            st.success("Kriteria berhasil disimpan!")

    # ─── Tab: Alternatif ───
    with tab2:
        st.markdown("""
        <div class="info-box">
            <strong>Alternatif Strategi:</strong> Daftar alternatif yang akan dievaluasi 
            menggunakan metode VIKOR.
        </div>
        """, unsafe_allow_html=True)

        alternatif = st.session_state.alternatif
        alt_data = [{'Kode': k, 'Nama Alternatif': v} for k, v in alternatif.items()]
        df_alt = pd.DataFrame(alt_data)

        edited_alt = st.data_editor(
            df_alt,
            column_config={
                "Kode": st.column_config.TextColumn("Kode", width="small"),
                "Nama Alternatif": st.column_config.TextColumn("Nama Alternatif", width="large"),
            },
            num_rows="dynamic",
            use_container_width=True,
            key="alt_editor",
        )

        if st.button("Simpan Alternatif", key="save_alt"):
            new_alt = {}
            for _, row in edited_alt.iterrows():
                if pd.notna(row['Kode']) and row['Kode'].strip():
                    new_alt[row['Kode'].strip()] = row['Nama Alternatif']
            st.session_state.alternatif = new_alt
            # Also update matriks to match new alternatif
            old_matriks = st.session_state.matriks
            new_matriks = {}
            num_krit = len(st.session_state.kriteria)
            for k in new_alt:
                if k in old_matriks:
                    new_matriks[k] = old_matriks[k]
                else:
                    new_matriks[k] = [5] * num_krit  # default value
            st.session_state.matriks = new_matriks
            st.session_state.calculated = False
            st.success("Alternatif berhasil disimpan!")

    # ─── Tab: Matriks ───
    with tab3:
        st.markdown("""
        <div class="info-box">
            <strong>Matriks Keputusan:</strong> Nilai penilaian setiap alternatif 
            terhadap setiap kriteria (skala 1-9).
        </div>
        """, unsafe_allow_html=True)

        kriteria = st.session_state.kriteria
        alternatif = st.session_state.alternatif
        matriks = st.session_state.matriks
        krit_keys = list(kriteria.keys())
        alt_keys = list(alternatif.keys())

        # Build matrix DataFrame
        mat_data = {}
        mat_data['Alternatif'] = [f"{k} – {alternatif[k]}" for k in alt_keys]
        for j, kk in enumerate(krit_keys):
            col_name = f"{kk} ({kriteria[kk]['nama']})"
            mat_data[col_name] = [matriks.get(a, [5]*len(krit_keys))[j] for a in alt_keys]

        df_mat = pd.DataFrame(mat_data)

        col_config = {
            "Alternatif": st.column_config.TextColumn("Alternatif", disabled=True, width="large"),
        }
        for kk in krit_keys:
            col_name = f"{kk} ({kriteria[kk]['nama']})"
            col_config[col_name] = st.column_config.NumberColumn(
                col_name, min_value=1, max_value=9, step=1, width="small"
            )

        edited_mat = st.data_editor(
            df_mat,
            column_config=col_config,
            use_container_width=True,
            key="mat_editor",
            disabled=["Alternatif"],
        )

        if st.button("Simpan Matriks", key="save_mat"):
            new_matriks = {}
            for i, a in enumerate(alt_keys):
                vals = []
                for kk in krit_keys:
                    col_name = f"{kk} ({kriteria[kk]['nama']})"
                    vals.append(int(edited_mat.iloc[i][col_name]))
                new_matriks[a] = vals
            st.session_state.matriks = new_matriks
            st.session_state.calculated = False
            st.success("Matriks keputusan berhasil disimpan!")

    # ─── Tab: Parameter ───
    with tab4:
        st.markdown("""
        <div class="info-box">
            <strong>Parameter v:</strong> Menentukan bobot antara kepentingan mayoritas (Si) 
            dan kepentingan individu (Ri). Nilai v = 0.5 berarti seimbang (by consensus).
        </div>
        """, unsafe_allow_html=True)

        v_val = st.slider(
            "Parameter v (kompromi)",
            min_value=0.0,
            max_value=1.0,
            value=st.session_state.v,
            step=0.1,
            format="%.1f",
            key="v_slider",
        )

        col1, col2, col3 = st.columns(3)
        with col1:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value" style="font-size: 1.5rem;">{v_val:.1f}</div>
                <div class="metric-label">Bobot Si (Mayoritas)</div>
            </div>
            """, unsafe_allow_html=True)
        with col2:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value" style="font-size: 1.5rem;">{1-v_val:.1f}</div>
                <div class="metric-label">Bobot Ri (Individual)</div>
            </div>
            """, unsafe_allow_html=True)
        with col3:
            interpretasi = "Seimbang (Consensus)" if v_val == 0.5 else (
                "Lebih ke Mayoritas" if v_val > 0.5 else "Lebih ke Individual"
            )
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value" style="font-size: 1rem;">{interpretasi}</div>
                <div class="metric-label">Interpretasi</div>
            </div>
            """, unsafe_allow_html=True)

        if st.button("Simpan Parameter", key="save_param"):
            st.session_state.v = v_val
            st.session_state.calculated = False
            st.success("Parameter berhasil disimpan!")

    # ─── Preset button ───
    st.markdown("---")
    col_a, col_b = st.columns([1, 1])
    with col_a:
        if st.button("Reset ke Data Awal", key="reset_default"):
            st.session_state.alternatif = copy.deepcopy(DEFAULT_ALTERNATIF)
            st.session_state.kriteria = copy.deepcopy(DEFAULT_KRITERIA)
            st.session_state.matriks = copy.deepcopy(DEFAULT_MATRIKS)
            st.session_state.v = 0.5
            st.session_state.calculated = False
            st.rerun()

    with col_b:
        if st.button("Jalankan Perhitungan", key="run_calc_input", type="primary"):
            run_calculation()
            st.success("Perhitungan selesai! Buka halaman Perhitungan atau Hasil untuk melihat.")


# ═══════════════════════════════════════════════════════════════════
# PAGE: PERHITUNGAN
# ═══════════════════════════════════════════════════════════════════

def page_perhitungan():
    st.markdown("""
    <div class="hero-section" style="padding: 32px 40px;">
        <div class="hero-title" style="font-size: 1.8rem;">Perhitungan VIKOR</div>
        <div class="hero-subtitle">Step-by-step proses perhitungan metode VIKOR</div>
    </div>
    """, unsafe_allow_html=True)

    if not st.session_state.calculated:
        st.markdown("""
        <div class="info-box" style="border-left-color: #f59e0b;">
            <strong>Belum ada perhitungan.</strong> Klik tombol di bawah untuk menjalankan perhitungan.
        </div>
        """, unsafe_allow_html=True)
        if st.button("Jalankan Perhitungan", key="run_calc_page", type="primary"):
            run_calculation()
            st.rerun()
        return

    vikor = st.session_state.vikor_result

    # ─── Step 1: Matriks Keputusan ───
    st.markdown("""
    <div class="glass-card" style="padding: 14px 20px; margin-bottom: 8px;
         border-left: 3px solid #3b82f6;">
        <div style="font-size: 1rem; font-weight: 600; color: #f1f5f9;">
            Tahap 1 &nbsp;&mdash;&nbsp; Matriks Keputusan (fij)</div>
    </div>
    """, unsafe_allow_html=True)
    with st.container():
        st.markdown("""
        <div class="step-badge">TAHAP 1</div>
        <div class="section-desc">
            Matriks keputusan berisi nilai penilaian setiap alternatif terhadap setiap kriteria.
        </div>
        """, unsafe_allow_html=True)
        st.dataframe(
            vikor.get_matriks_df().style.format("{:.0f}"),
            use_container_width=True,
        )

    # ─── Step 2: f+ dan f- ───
    st.markdown("""
    <div class="glass-card" style="padding: 14px 20px; margin-bottom: 8px;
         border-left: 3px solid #3b82f6;">
        <div style="font-size: 1rem; font-weight: 600; color: #f1f5f9;">
            Tahap 2 &nbsp;&mdash;&nbsp; Nilai Ideal (f+ dan f-)</div>
    </div>
    """, unsafe_allow_html=True)
    with st.container():
        st.markdown("""
        <div class="step-badge">TAHAP 2</div>
        <div class="section-desc">
            <strong>Benefit:</strong> f+ = MAX (terbaik), f− = MIN (terburuk)<br>
            <strong>Cost:</strong> f+ = MIN (terbaik), f− = MAX (terburuk)
        </div>
        """, unsafe_allow_html=True)

        tipe_data = {f"{k} ({vikor.kriteria[k]['nama']})": vikor.kriteria[k]['tipe'] for k in vikor.krit_keys}
        st.markdown(f"""
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
            {''.join(f'<span style="background: {"rgba(255,101,132,0.15)" if t=="Cost" else "rgba(67,233,123,0.15)"}; color: {"#FF6584" if t=="Cost" else "#43E97B"}; padding: 4px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;">{k}: {t}</span>' for k, t in tipe_data.items())}
        </div>
        """, unsafe_allow_html=True)

        st.dataframe(
            vikor.get_f_ideal_df().style.format("{:.0f}"),
            use_container_width=True,
        )

    # ─── Step 3: Normalisasi ───
    st.markdown("""
    <div class="glass-card" style="padding: 14px 20px; margin-bottom: 8px;
         border-left: 3px solid #3b82f6;">
        <div style="font-size: 1rem; font-weight: 600; color: #f1f5f9;">
            Tahap 3 &nbsp;&mdash;&nbsp; Normalisasi (Nij)</div>
    </div>
    """, unsafe_allow_html=True)
    with st.container():
        st.markdown("""
        <div class="step-badge">TAHAP 3</div>
        <div class="section-desc">
            Rumus: <strong style="color: #FF6584;">Nij = (f⁺j − fij) / (f⁺j − f⁻j)</strong><br>
            Nilai 0 = terbaik, Nilai 1 = terburuk
        </div>
        """, unsafe_allow_html=True)

        df_norm = vikor.get_normalisasi_df()

        def color_rygr(val):
            """Warna merah-kuning-hijau terbalik: rendah=hijau, tinggi=merah."""
            try:
                v = float(val)
            except Exception:
                return ''
            v = max(0.0, min(1.0, v))
            if v <= 0.5:
                r = int(v * 2 * 255)
                g = 200
                b = 80
            else:
                r = 220
                g = int((1 - (v - 0.5) * 2) * 200)
                b = 60
            return f'background-color: rgba({r},{g},{b},0.35); color: #fff'

        st.dataframe(
            df_norm.style.format("{:.4f}").map(color_rygr),
            use_container_width=True,
        )

    # ─── Step 4: F*ij Terbobot ───
    st.markdown("""
    <div class="glass-card" style="padding: 14px 20px; margin-bottom: 8px;
         border-left: 3px solid #3b82f6;">
        <div style="font-size: 1rem; font-weight: 600; color: #f1f5f9;">
            Tahap 4 &nbsp;&mdash;&nbsp; Normalisasi Terbobot (F*ij)</div>
    </div>
    """, unsafe_allow_html=True)
    with st.container():
        st.markdown("""
        <div class="step-badge">TAHAP 4</div>
        <div class="section-desc">
            Rumus: <strong style="color: #FF6584;">F*ij = Wj × Nij</strong>
        </div>
        """, unsafe_allow_html=True)

        bobot_str = " | ".join([f"{k}: {vikor.kriteria[k]['bobot']:.2f}" for k in vikor.krit_keys])
        st.markdown(f"""
        <div class="info-box">
            <strong>Bobot (Wj):</strong> {bobot_str}
        </div>
        """, unsafe_allow_html=True)

        df_ftb = vikor.get_f_terbobot_df()
        st.dataframe(
            df_ftb.style.format("{:.4f}").map(color_rygr),
            use_container_width=True,
        )

    # ─── Step 5: Si dan Ri ───
    st.markdown("""
    <div class="glass-card" style="padding: 14px 20px; margin-bottom: 8px;
         border-left: 3px solid #3b82f6;">
        <div style="font-size: 1rem; font-weight: 600; color: #f1f5f9;">
            Tahap 5 &nbsp;&mdash;&nbsp; Utility Measure (Si) &amp; Regret Measure (Ri)</div>
    </div>
    """, unsafe_allow_html=True)
    with st.container():
        st.markdown("""
        <div class="step-badge">TAHAP 5</div>
        <div class="section-desc">
            <strong style="color: #6C63FF;">Si = &sum;F*ij</strong> (total penyimpangan) &nbsp;&nbsp;|&nbsp;&nbsp;
            <strong style="color: #FF6584;">Ri = MAX(F*ij)</strong> (penyimpangan terburuk)
        </div>
        """, unsafe_allow_html=True)

        df_sri = vikor.get_sri_df()
        st.dataframe(
            df_sri.style.format({'Si (Utility)': '{:.4f}', 'Ri (Regret)': '{:.4f}'}),
            use_container_width=True,
        )

        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value" style="font-size: 1.2rem; background: var(--gradient-2);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;">{vikor.si.min():.4f}</div>
                <div class="metric-label">S⁻ (Min)</div>
            </div>
            """, unsafe_allow_html=True)
        with col2:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value" style="font-size: 1.2rem;">{vikor.si.max():.4f}</div>
                <div class="metric-label">S⁺ (Max)</div>
            </div>
            """, unsafe_allow_html=True)
        with col3:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value" style="font-size: 1.2rem; background: var(--gradient-2);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;">{vikor.ri.min():.4f}</div>
                <div class="metric-label">R⁻ (Min)</div>
            </div>
            """, unsafe_allow_html=True)
        with col4:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value" style="font-size: 1.2rem;">{vikor.ri.max():.4f}</div>
                <div class="metric-label">R⁺ (Max)</div>
            </div>
            """, unsafe_allow_html=True)

    # ─── Step 6: Qi ───
    st.markdown(f"""
    <div class="glass-card" style="padding: 14px 20px; margin-bottom: 8px;
         border-left: 3px solid #3b82f6;">
        <div style="font-size: 1rem; font-weight: 600; color: #f1f5f9;">
            Tahap 6 &nbsp;&mdash;&nbsp; Indeks VIKOR (Qi)</div>
    </div>
    """, unsafe_allow_html=True)
    with st.container():
        st.markdown(f"""
        <div class="step-badge">TAHAP 6</div>
        <div class="section-desc">
            Rumus: <strong style="color: #FF6584;">Qi = v × (Si − S⁻)/(S⁺ − S⁻) + (1 − v) × (Ri − R⁻)/(R⁺ − R⁻)</strong>
            &nbsp;&nbsp;|&nbsp;&nbsp; v = {vikor.v}
        </div>
        """, unsafe_allow_html=True)

        df_ranking = vikor.get_ranking_df()
        st.dataframe(
            df_ranking.style.format({'Qi': '{:.4f}', 'Si': '{:.4f}', 'Ri': '{:.4f}'}),
            use_container_width=True,
        )

    # ─── Step 7: Validasi ───
    st.markdown("""
    <div class="glass-card" style="padding: 14px 20px; margin-bottom: 8px;
         border-left: 3px solid #3b82f6;">
        <div style="font-size: 1rem; font-weight: 600; color: #f1f5f9;">
            Tahap 7 &nbsp;&mdash;&nbsp; Validasi Solusi Kompromi</div>
    </div>
    """, unsafe_allow_html=True)
    with st.container():
        st.markdown("""
        <div class="step-badge">TAHAP 7</div>
        """, unsafe_allow_html=True)

        val = vikor.validasi

        col1, col2 = st.columns(2)
        with col1:
            badge_class = "result-badge" if val['kondisi1'] else "result-badge result-badge-fail"
            icon = "✓" if val['kondisi1'] else "✗"
            st.markdown(f"""
            <div class="glass-card">
                <div style="font-weight: 700; margin-bottom: 8px; color: #FAFAFA;">
                    Kondisi 1: Acceptable Advantage</div>
                <div style="font-size: 0.85rem; color: #8B8FA3; margin-bottom: 12px;">
                    Q(A2nd) − Q(A1st) ≥ DQ = 1/(m−1)</div>
                <div style="font-size: 0.9rem; color: #FAFAFA; margin-bottom: 8px;">
                    {val['kondisi1_text']}</div>
                <div class="{badge_class}">
                    {icon} {"TERPENUHI" if val['kondisi1'] else "TIDAK TERPENUHI"}
                </div>
            </div>
            """, unsafe_allow_html=True)

        with col2:
            badge_class = "result-badge" if val['kondisi2'] else "result-badge result-badge-fail"
            icon = "✓" if val['kondisi2'] else "✗"
            st.markdown(f"""
            <div class="glass-card">
                <div style="font-weight: 700; margin-bottom: 8px; color: #FAFAFA;">
                    Kondisi 2: Acceptable Stability</div>
                <div style="font-size: 0.85rem; color: #8B8FA3; margin-bottom: 12px;">
                    A1st harus rank 1 pada Si atau Ri</div>
                <div style="font-size: 0.9rem; color: #FAFAFA; margin-bottom: 8px;">
                    {val['kondisi2_text']}</div>
                <div class="{badge_class}">
                    {icon} {"TERPENUHI" if val['kondisi2'] else "TIDAK TERPENUHI"}
                </div>
            </div>
            """, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════
# PAGE: HASIL & RANKING
# ═══════════════════════════════════════════════════════════════════

def page_hasil():
    st.markdown("""
    <div class="hero-section" style="padding: 32px 40px;">
        <div class="hero-title" style="font-size: 1.8rem;">Hasil & Ranking</div>
        <div class="hero-subtitle">Ranking final, visualisasi, dan rekomendasi</div>
    </div>
    """, unsafe_allow_html=True)

    if not st.session_state.calculated:
        st.markdown("""
        <div class="info-box" style="border-left-color: #f59e0b;">
            <strong>Belum ada perhitungan.</strong> Klik tombol di bawah untuk menjalankan perhitungan.
        </div>
        """, unsafe_allow_html=True)
        if st.button("Jalankan Perhitungan", key="run_calc_hasil", type="primary"):
            run_calculation()
            st.rerun()
        return

    vikor = st.session_state.vikor_result

    # ─── Top 3 Cards ───
    ranking = vikor.ranking
    top_3 = ranking[:min(3, len(ranking))]

    cols = st.columns(len(top_3))
    for i, (col, r) in enumerate(zip(cols, top_3)):
        with col:
            is_first = "rank-1" if i == 0 else ""
            st.markdown(f"""
            <div class="rank-card {is_first}">
                <div class="rank-number">#{r['rank']}</div>
                <div class="rank-name">{r['kode']} — {r['nama']}</div>
                <div class="rank-qi">Q = {r['qi']:.4f}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ─── Full Ranking Table ───
    st.markdown("""
    <div class="glass-card" style="padding: 16px 24px;">
        <div class="section-title" style="font-size: 1.2rem;">Ranking Lengkap</div>
    </div>
    """, unsafe_allow_html=True)

    df_ranking = vikor.get_ranking_df()
    st.dataframe(
        df_ranking.style.format({'Qi': '{:.4f}', 'Si': '{:.4f}', 'Ri': '{:.4f}'}),
        use_container_width=True,
    )

    st.markdown("<br>", unsafe_allow_html=True)

    # ─── Charts ───
    col_chart1, col_chart2 = st.columns(2)

    with col_chart1:
        st.markdown("""
        <div class="glass-card" style="padding: 16px 24px;">
            <div class="section-title" style="font-size: 1.1rem;">Bar Chart — Indeks Qi</div>
        </div>
        """, unsafe_allow_html=True)

        fig_bar = go.Figure()
        fig_bar.add_trace(go.Bar(
            x=[f"{r['kode']}" for r in ranking],
            y=[r['qi'] for r in ranking],
            marker=dict(
                color=[PLOTLY_COLORS[i % len(PLOTLY_COLORS)] for i in range(len(ranking))],
                line=dict(width=0),
                cornerradius=6,
            ),
            text=[f"{r['qi']:.4f}" for r in ranking],
            textposition='outside',
            textfont=dict(size=11, color="#FAFAFA"),
        ))
        fig_bar.update_layout(
            title=None,
            xaxis_title="Alternatif",
            yaxis_title="Nilai Qi",
            height=400,
            showlegend=False,
        )
        make_plotly_dark(fig_bar)
        st.plotly_chart(fig_bar, use_container_width=True)

    with col_chart2:
        st.markdown("""
        <div class="glass-card" style="padding: 16px 24px;">
            <div class="section-title" style="font-size: 1.1rem;">Radar Chart — Si vs Ri</div>
        </div>
        """, unsafe_allow_html=True)

        categories = [f"{r['kode']}" for r in ranking]
        
        fig_radar = go.Figure()
        fig_radar.add_trace(go.Scatterpolar(
            r=[r['si'] for r in ranking],
            theta=categories,
            fill='toself',
            name='Si (Utility)',
            fillcolor='rgba(108, 99, 255, 0.15)',
            line=dict(color='#6C63FF', width=2),
        ))
        fig_radar.add_trace(go.Scatterpolar(
            r=[r['ri'] for r in ranking],
            theta=categories,
            fill='toself',
            name='Ri (Regret)',
            fillcolor='rgba(255, 101, 132, 0.15)',
            line=dict(color='#FF6584', width=2),
        ))
        fig_radar.update_layout(
            polar=dict(
                bgcolor='rgba(0,0,0,0)',
                radialaxis=dict(gridcolor='rgba(108,99,255,0.1)', linecolor='rgba(108,99,255,0.2)'),
                angularaxis=dict(gridcolor='rgba(108,99,255,0.1)', linecolor='rgba(108,99,255,0.2)'),
            ),
            height=400,
            showlegend=True,
        )
        make_plotly_dark(fig_radar)
        st.plotly_chart(fig_radar, use_container_width=True)

    # ─── Comparative Bar Chart: Si, Ri, Qi ───
    st.markdown("""
    <div class="glass-card" style="padding: 16px 24px;">
        <div class="section-title" style="font-size: 1.1rem;">Perbandingan Si, Ri, Qi</div>
    </div>
    """, unsafe_allow_html=True)

    fig_compare = go.Figure()
    alt_labels = [f"{r['kode']}" for r in ranking]
    fig_compare.add_trace(go.Bar(name='Si', x=alt_labels, y=[r['si'] for r in ranking],
                                  marker_color='#6C63FF', marker_cornerradius=4))
    fig_compare.add_trace(go.Bar(name='Ri', x=alt_labels, y=[r['ri'] for r in ranking],
                                  marker_color='#FF6584', marker_cornerradius=4))
    fig_compare.add_trace(go.Bar(name='Qi', x=alt_labels, y=[r['qi'] for r in ranking],
                                  marker_color='#43E97B', marker_cornerradius=4))
    fig_compare.update_layout(
        barmode='group',
        xaxis_title="Alternatif",
        yaxis_title="Nilai",
        height=400,
    )
    make_plotly_dark(fig_compare)
    st.plotly_chart(fig_compare, use_container_width=True)

    # ─── Validasi Summary ───
    st.markdown("<br>", unsafe_allow_html=True)
    val = vikor.validasi

    valid_class = "result-badge" if val['valid'] else "result-badge result-badge-fail"
    valid_icon = "✅" if val['valid'] else "❌"
    valid_text = (
        f"{val['a1st']} — {val['a1st_nama']} adalah **SOLUSI KOMPROMI TERBAIK** yang sah."
        if val['valid'] else
        "Solusi kompromi tidak valid. Perlu analisis tambahan."
    )

    st.markdown(f"""
    <div class="glass-card" style="text-align: center;">
        <div class="section-title" style="font-size: 1.3rem; margin-bottom: 16px;">
            ✅ Kesimpulan Validasi</div>
        <div class="{valid_class}" style="display: inline-flex; font-size: 1.05rem; padding: 16px 28px;">
            {valid_icon} {valid_text}
        </div>
        <div style="margin-top: 16px; font-size: 0.85rem; color: #8B8FA3;">
            Kondisi 1 (Acceptable Advantage): {"✓" if val['kondisi1'] else "✗"} &nbsp;|&nbsp;
            Kondisi 2 (Acceptable Stability): {"✓" if val['kondisi2'] else "✗"}
        </div>
    </div>
    """, unsafe_allow_html=True)

    # ─── Rekomendasi ───
    st.markdown("<br>", unsafe_allow_html=True)
    best = ranking[0]
    st.markdown(f"""
    <div class="glass-card">
        <div class="section-title" style="font-size: 1.2rem;">Rekomendasi</div>
        <div style="margin-top: 12px; line-height: 1.9; color: #FAFAFA; font-size: 0.95rem;">
            Berdasarkan hasil perhitungan metode VIKOR dengan parameter v = {vikor.v}, 
            alternatif <strong style="color: #6C63FF;">{best['kode']} — {best['nama']}</strong> 
            mendapatkan nilai Qi terendah yaitu <strong style="color: #43E97B;">{best['qi']:.4f}</strong>, 
            yang berarti alternatif ini memiliki penyimpangan paling kecil dari solusi ideal.
            <br><br>
            {"Kedua kondisi validasi solusi kompromi (Acceptable Advantage dan Acceptable Stability) <strong style='color: #43E97B;'>TERPENUHI</strong>, sehingga " + best['kode'] + " dapat dinyatakan sebagai solusi kompromi yang sah dan direkomendasikan sebagai strategi pemasaran utama." if val['valid'] else "Namun, validasi solusi kompromi belum sepenuhnya terpenuhi. Disarankan untuk melakukan analisis lebih lanjut atau mempertimbangkan set solusi kompromi."}
        </div>
    </div>
    """, unsafe_allow_html=True)

    # ─── Export ───
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("""
    <div class="glass-card" style="padding: 16px 24px;">
        <div class="section-title" style="font-size: 1.1rem;">Export Hasil</div>
    </div>
    """, unsafe_allow_html=True)

    # Create Excel export
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        vikor.get_matriks_df().to_excel(writer, sheet_name='Matriks Keputusan')
        vikor.get_f_ideal_df().to_excel(writer, sheet_name='Nilai Ideal')
        vikor.get_normalisasi_df().to_excel(writer, sheet_name='Normalisasi')
        vikor.get_f_terbobot_df().to_excel(writer, sheet_name='F_ij Terbobot')
        vikor.get_sri_df().to_excel(writer, sheet_name='Si dan Ri', index=False)
        vikor.get_ranking_df().to_excel(writer, sheet_name='Ranking', index=False)
    output.seek(0)

    st.download_button(
        label="Download Hasil (Excel)",
        data=output,
        file_name="Hasil_VIKOR.xlsx",
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


# ═══════════════════════════════════════════════════════════════════
# PAGE: ANALISIS SENSITIVITAS
# ═══════════════════════════════════════════════════════════════════

def page_sensitivitas():
    st.markdown("""
    <div class="hero-section" style="padding: 32px 40px;">
        <div class="hero-title" style="font-size: 1.8rem;">Analisis Sensitivitas</div>
        <div class="hero-subtitle">
            Variasi parameter v untuk menguji stabilitas ranking
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="info-box">
        <strong>Analisis Sensitivitas</strong> dilakukan dengan memvariasikan parameter v 
        dari 0.1 hingga 0.9. Parameter v mengontrol keseimbangan antara 
        <strong>kepentingan mayoritas</strong> (Si) dan <strong>kepentingan individu terburuk</strong> (Ri).
        Jika ranking stabil terhadap perubahan v, maka keputusan dianggap <strong>robust</strong>.
    </div>
    """, unsafe_allow_html=True)

    # Run sensitivity analysis
    if not st.session_state.calculated:
        run_calculation()

    vikor = st.session_state.vikor_result

    # Let user select v values
    st.markdown("""
    <div class="glass-card" style="padding: 16px 24px;">
        <div class="section-title" style="font-size: 1.1rem;">Konfigurasi Analisis</div>
    </div>
    """, unsafe_allow_html=True)

    col1, col2 = st.columns([2, 1])
    with col1:
        v_values = st.multiselect(
            "Pilih nilai v untuk dianalisis",
            options=[round(x * 0.1, 1) for x in range(1, 10)],
            default=[0.3, 0.4, 0.5, 0.6, 0.7],
            key="sens_v_values",
        )
    with col2:
        st.markdown(f"""
        <div class="metric-card" style="margin-top: 8px;">
            <div class="metric-value" style="font-size: 1.5rem;">{len(v_values)}</div>
            <div class="metric-label">Variasi v</div>
        </div>
        """, unsafe_allow_html=True)

    if not v_values:
        st.warning("Pilih minimal 1 nilai v.")
        return

    v_values_sorted = sorted(v_values)

    # Run sensitivity
    results = vikor.analisis_sensitivitas(v_values_sorted)

    # ─── Ranking comparison table ───
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("""
    <div class="glass-card" style="padding: 16px 24px;">
        <div class="section-title" style="font-size: 1.1rem;">Perbandingan Ranking</div>
        <div class="section-desc">Ranking alternatif untuk setiap nilai v</div>
    </div>
    """, unsafe_allow_html=True)

    # Build comparison table
    alt_names = list(st.session_state.alternatif.keys())
    comp_data = {'Alternatif': [f"{k} – {st.session_state.alternatif[k]}" for k in alt_names]}
    
    for v_val in v_values_sorted:
        res = results[v_val]
        rank_map = {r['kode']: r['rank'] for r in res['ranking']}
        comp_data[f'v = {v_val}'] = [rank_map.get(a, '-') for a in alt_names]

    df_comp = pd.DataFrame(comp_data)
    st.dataframe(df_comp, use_container_width=True)

    # ─── Qi values table ───
    st.markdown("""
    <div class="glass-card" style="padding: 16px 24px;">
        <div class="section-title" style="font-size: 1.1rem;">Nilai Qi per Variasi v</div>
    </div>
    """, unsafe_allow_html=True)

    qi_data = {'Alternatif': [f"{k}" for k in alt_names]}
    for v_val in v_values_sorted:
        res = results[v_val]
        qi_map = {r['kode']: r['qi'] for r in res['ranking']}
        qi_data[f'v = {v_val}'] = [qi_map.get(a, 0) for a in alt_names]

    df_qi = pd.DataFrame(qi_data)
    
    # Format numeric columns
    format_dict = {f'v = {v}': '{:.4f}' for v in v_values_sorted}
    st.dataframe(df_qi.style.format(format_dict), use_container_width=True)

    # ─── Line Chart: Ranking stability ───
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("""
    <div class="glass-card" style="padding: 16px 24px;">
        <div class="section-title" style="font-size: 1.1rem;">Grafik Perubahan Ranking</div>
        <div class="section-desc">Stabilitas ranking terhadap perubahan parameter v</div>
    </div>
    """, unsafe_allow_html=True)

    fig_rank = go.Figure()
    for i, a in enumerate(alt_names):
        ranks = []
        for v_val in v_values_sorted:
            res = results[v_val]
            rank_map = {r['kode']: r['rank'] for r in res['ranking']}
            ranks.append(rank_map.get(a, len(alt_names)))
        
        fig_rank.add_trace(go.Scatter(
            x=v_values_sorted,
            y=ranks,
            mode='lines+markers',
            name=f"{a} – {st.session_state.alternatif[a]}",
            line=dict(color=PLOTLY_COLORS[i % len(PLOTLY_COLORS)], width=2.5),
            marker=dict(size=8),
        ))

    fig_rank.update_layout(
        xaxis_title="Parameter v",
        yaxis_title="Ranking",
        yaxis=dict(autorange="reversed", dtick=1),
        xaxis=dict(dtick=0.1),
        height=500,
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.35,
            xanchor="center",
            x=0.5,
        ),
    )
    make_plotly_dark(fig_rank)
    st.plotly_chart(fig_rank, use_container_width=True)

    # ─── Line Chart: Qi values ───
    st.markdown("""
    <div class="glass-card" style="padding: 16px 24px;">
        <div class="section-title" style="font-size: 1.1rem;">Grafik Nilai Qi</div>
        <div class="section-desc">Perubahan nilai Qi terhadap variasi parameter v</div>
    </div>
    """, unsafe_allow_html=True)

    fig_qi = go.Figure()
    for i, a in enumerate(alt_names):
        qi_vals = []
        for v_val in v_values_sorted:
            res = results[v_val]
            qi_map = {r['kode']: r['qi'] for r in res['ranking']}
            qi_vals.append(qi_map.get(a, 0))
        
        fig_qi.add_trace(go.Scatter(
            x=v_values_sorted,
            y=qi_vals,
            mode='lines+markers',
            name=f"{a}",
            line=dict(color=PLOTLY_COLORS[i % len(PLOTLY_COLORS)], width=2),
            marker=dict(size=7),
        ))

    fig_qi.update_layout(
        xaxis_title="Parameter v",
        yaxis_title="Nilai Qi",
        xaxis=dict(dtick=0.1),
        height=450,
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.3,
            xanchor="center",
            x=0.5,
        ),
    )
    make_plotly_dark(fig_qi)
    st.plotly_chart(fig_qi, use_container_width=True)

    # ─── Validasi per v ───
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("""
    <div class="glass-card" style="padding: 16px 24px;">
        <div class="section-title" style="font-size: 1.1rem;">Validasi Kompromi per Nilai v</div>
    </div>
    """, unsafe_allow_html=True)

    val_data = []
    for v_val in v_values_sorted:
        res = results[v_val]
        val = res['validasi']
        val_data.append({
            'v': v_val,
            'Rank 1': f"{val['a1st']} – {val['a1st_nama']}",
            'Q (Rank 1)': f"{val['q1st']:.4f}",
            'Kondisi 1': "✓" if val['kondisi1'] else "✗",
            'Kondisi 2': "✓" if val['kondisi2'] else "✗",
            'Valid': "✓ SAH" if val['valid'] else "✗ Tidak Sah",
        })

    df_val = pd.DataFrame(val_data)
    st.dataframe(df_val, use_container_width=True)

    # ─── Stability conclusion ───
    first_ranks = [results[v]['ranking'][0]['kode'] for v in v_values_sorted]
    is_stable = len(set(first_ranks)) == 1
    stable_alt = first_ranks[0] if is_stable else None

    st.markdown("<br>", unsafe_allow_html=True)
    if is_stable:
        st.markdown(f"""
        <div class="glass-card" style="text-align: center;">
            <div class="section-title" style="font-size: 1.2rem; margin-bottom: 12px;">
                Kesimpulan Analisis Sensitivitas</div>
            <div class="result-badge" style="display: inline-flex; font-size: 1rem; padding: 14px 24px;">
                Ranking STABIL — {stable_alt} ({st.session_state.alternatif.get(stable_alt, '')}) 
                konsisten di peringkat 1 untuk semua variasi v
            </div>
            <div style="margin-top: 12px; font-size: 0.85rem; color: #8B8FA3;">
                Keputusan bersifat <strong style="color: #43E97B;">robust</strong> dan tidak sensitif 
                terhadap perubahan parameter kompromi.
            </div>
        </div>
        """, unsafe_allow_html=True)
    else:
        change_info = ", ".join([f"v={v}: {r}" for v, r in zip(v_values_sorted, first_ranks)])
        st.markdown(f"""
        <div class="glass-card" style="text-align: center;">
            <div class="section-title" style="font-size: 1.2rem; margin-bottom: 12px;">
                Kesimpulan Analisis Sensitivitas</div>
            <div class="result-badge result-badge-fail" style="display: inline-flex; font-size: 1rem; padding: 14px 24px;">
                Ranking BERUBAH — Peringkat 1 tidak konsisten antar variasi v
            </div>
            <div style="margin-top: 12px; font-size: 0.85rem; color: #8B8FA3;">
                Rank 1: {change_info}
            </div>
        </div>
        """, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════
# PAGE: RIWAYAT
# ═══════════════════════════════════════════════════════════════════

def page_riwayat():
    st.markdown("""
    <div class="hero-section" style="padding: 32px 40px;">
        <div class="hero-title" style="font-size: 1.8rem;">Riwayat Perhitungan</div>
        <div class="hero-subtitle">Semua hasil perhitungan yang tersimpan di Supabase</div>
    </div>
    """, unsafe_allow_html=True)

    if not supadb.is_connected():
        st.markdown("""
        <div class="info-box" style="border-left-color: #f59e0b;">
            <strong>Database tidak terhubung.</strong> Masukkan credentials Supabase
            di file <code>.streamlit/secrets.toml</code> untuk menggunakan fitur ini.
        </div>
        """, unsafe_allow_html=True)

        st.markdown("""
        <div class="glass-card">
            <div class="section-title" style="font-size: 1.1rem;">Cara Setup Supabase</div>
            <div style="margin-top: 12px; font-size: 0.9rem; color: var(--text-muted); line-height: 2;">
                1. Buka <strong style="color: var(--primary);">supabase.com</strong> dan login ke project Anda<br>
                2. Masuk ke <strong>Settings → API</strong><br>
                3. Salin <strong>Project URL</strong> dan <strong>anon public key</strong><br>
                4. Buka file <code>.streamlit/secrets.toml</code> dan isi nilainya<br>
                5. Restart aplikasi Streamlit
            </div>
        </div>
        """, unsafe_allow_html=True)
        return

    # Tabs: Sesi & Riwayat
    tab1, tab2 = st.tabs(["Sesi Tersimpan", "Riwayat Perhitungan"])

    with tab1:
        sessions = supadb.load_sessions()
        if not sessions:
            st.info("Belum ada sesi yang tersimpan. Gunakan tombol 'Simpan Sesi' di sidebar.")
        else:
            st.markdown(f"""
            <div class="glass-card" style="padding: 16px 24px;">
                <div class="section-title" style="font-size: 1.1rem;">
                    {len(sessions)} Sesi Tersimpan</div>
            </div>
            """, unsafe_allow_html=True)

            for s in sessions:
                col1, col2, col3 = st.columns([4, 2, 1])
                with col1:
                    st.markdown(f"""
                    <div style="padding: 12px 0; border-bottom: 1px solid var(--card-border);">
                        <div style="font-weight: 600; color: var(--text-primary);">{s['nama']}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                            {supadb.format_timestamp(s['created_at'])} &nbsp;|&nbsp; v = {s['v']}
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                with col2:
                    if st.button("Muat", key=f"muat_{s['id']}", use_container_width=True):
                        detail = supadb.load_session_detail(s['id'])
                        if detail:
                            st.session_state.alternatif = detail["alternatif"]
                            st.session_state.kriteria = detail["kriteria"]
                            st.session_state.matriks = {k: list(v) if isinstance(v, list) else v
                                                        for k, v in detail["matriks"].items()}
                            st.session_state.v = detail["v"]
                            st.session_state.calculated = False
                            st.session_state.vikor_result = None
                            st.success(f"Sesi '{detail['nama']}' dimuat! Buka halaman Input Data.")
                            st.rerun()
                with col3:
                    if st.button("Hapus", key=f"hapus_{s['id']}", use_container_width=True):
                        result = supadb.delete_session(s['id'])
                        if result["success"]:
                            st.success(result["message"])
                            st.rerun()
                        else:
                            st.error(result["message"])

    with tab2:
        riwayat = supadb.load_riwayat(limit=15)
        if not riwayat:
            st.info("Belum ada riwayat perhitungan. Jalankan perhitungan dan simpan sesi terlebih dahulu.")
        else:
            st.markdown(f"""
            <div class="glass-card" style="padding: 16px 24px;">
                <div class="section-title" style="font-size: 1.1rem;">
                    {len(riwayat)} Riwayat Terbaru</div>
            </div>
            """, unsafe_allow_html=True)

            for r in riwayat:
                sesi_nama = r.get("sessions", {}).get("nama", "—") if r.get("sessions") else "—"
                sesi_v = r.get("sessions", {}).get("v", "—") if r.get("sessions") else "—"
                ranking = r.get("ranking", [])
                rank1 = ranking[0] if ranking else {}
                validasi = r.get("validasi", {})

                valid_color = "#4ade80" if validasi.get("valid") else "#f87171"
                valid_text = "SAH" if validasi.get("valid") else "Tidak Sah"

                with st.expander(
                    f"{supadb.format_timestamp(r['calculated_at'])} — Sesi: {sesi_nama}",
                    expanded=False,
                ):
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.markdown(f"""
                        <div class="metric-card">
                            <div class="metric-value" style="font-size: 1.2rem;">{rank1.get('kode','—')}</div>
                            <div class="metric-label">Peringkat 1</div>
                        </div>
                        """, unsafe_allow_html=True)
                    with col2:
                        st.markdown(f"""
                        <div class="metric-card">
                            <div class="metric-value" style="font-size: 1.2rem;">{rank1.get('qi', 0):.4f}</div>
                            <div class="metric-label">Nilai Qi Terbaik</div>
                        </div>
                        """, unsafe_allow_html=True)
                    with col3:
                        st.markdown(f"""
                        <div class="metric-card">
                            <div class="metric-value"
                                 style="font-size: 1.1rem; color: {valid_color};">{valid_text}</div>
                            <div class="metric-label">Validasi Kompromi</div>
                        </div>
                        """, unsafe_allow_html=True)

                    if ranking:
                        df_rank = pd.DataFrame(ranking)[['rank', 'kode', 'nama', 'qi', 'si', 'ri']]
                        df_rank.columns = ['Rank', 'Kode', 'Nama', 'Qi', 'Si', 'Ri']
                        st.dataframe(
                            df_rank.style.format({'Qi': '{:.4f}', 'Si': '{:.4f}', 'Ri': '{:.4f}'}),
                            use_container_width=True,
                            hide_index=True,
                        )


# ═══════════════════════════════════════════════════════════════════
# MAIN ROUTER
# ═══════════════════════════════════════════════════════════════════

if "Beranda" in page:
    page_beranda()
elif "Input" in page:
    page_input()
elif "Perhitungan" in page:
    page_perhitungan()
elif "Hasil" in page:
    page_hasil()
elif "Sensitivitas" in page:
    page_sensitivitas()
elif "Riwayat" in page:
    page_riwayat()

# Footer
st.markdown("""
<div class="footer">
    <div>Sistem Pendukung Keputusan — Metode VIKOR</div>
    <div>Penentuan Strategi Pemasaran UMKM Nasi Bakar Mak Yuni, Kota Metro</div>
</div>
""", unsafe_allow_html=True)
