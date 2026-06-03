"""
db.py — Modul koneksi dan operasi database Supabase
untuk Sistem Pendukung Keputusan Metode VIKOR.
"""

import streamlit as st
from supabase import create_client, Client
from datetime import datetime
import json


# ═══════════════════════════════════════════════════════════════════
# INISIALISASI CLIENT
# ═══════════════════════════════════════════════════════════════════

@st.cache_resource
def init_supabase() -> Client | None:
    """
    Inisialisasi Supabase client menggunakan credentials dari
    st.secrets (Streamlit Cloud) atau secrets.toml (lokal).
    Mengembalikan None jika credentials tidak tersedia.
    """
    try:
        url = st.secrets["supabase"]["url"]
        key = st.secrets["supabase"]["key"]
        return create_client(url, key)
    except Exception:
        return None


def get_client() -> Client | None:
    """Helper untuk mendapatkan Supabase client."""
    return init_supabase()


# ═══════════════════════════════════════════════════════════════════
# OPERASI SESI (Konfigurasi Input)
# ═══════════════════════════════════════════════════════════════════

def save_session(nama: str, alternatif: dict, kriteria: dict,
                 matriks: dict, v: float) -> dict:
    """
    Simpan konfigurasi input (sesi) ke Supabase.

    Returns:
        dict dengan keys 'success' (bool) dan 'message' (str)
    """
    client = get_client()
    if client is None:
        return {"success": False, "message": "Koneksi database tidak tersedia."}

    try:
        data = {
            "nama": nama,
            "alternatif": alternatif,
            "kriteria": kriteria,
            "matriks": matriks,
            "v": v,
        }
        response = client.table("sessions").insert(data).execute()
        if response.data:
            return {
                "success": True,
                "message": f"Sesi '{nama}' berhasil disimpan!",
                "id": response.data[0]["id"],
            }
        return {"success": False, "message": "Gagal menyimpan sesi."}
    except Exception as e:
        return {"success": False, "message": f"Error: {str(e)}"}


def load_sessions() -> list:
    """
    Ambil semua sesi tersimpan dari Supabase, diurutkan terbaru dulu.

    Returns:
        list of dict, atau list kosong jika gagal.
    """
    client = get_client()
    if client is None:
        return []

    try:
        response = (
            client.table("sessions")
            .select("id, nama, v, created_at")
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
        return response.data or []
    except Exception:
        return []


def load_session_detail(session_id: str) -> dict | None:
    """
    Ambil detail lengkap sebuah sesi (termasuk alternatif, kriteria, matriks).

    Returns:
        dict data sesi, atau None jika tidak ditemukan.
    """
    client = get_client()
    if client is None:
        return None

    try:
        response = (
            client.table("sessions")
            .select("*")
            .eq("id", session_id)
            .single()
            .execute()
        )
        return response.data
    except Exception:
        return None


def delete_session(session_id: str) -> dict:
    """
    Hapus sesi berdasarkan ID.

    Returns:
        dict dengan keys 'success' (bool) dan 'message' (str)
    """
    client = get_client()
    if client is None:
        return {"success": False, "message": "Koneksi database tidak tersedia."}

    try:
        client.table("hasil_perhitungan").delete().eq("session_id", session_id).execute()
        client.table("sessions").delete().eq("id", session_id).execute()
        return {"success": True, "message": "Sesi berhasil dihapus."}
    except Exception as e:
        return {"success": False, "message": f"Error: {str(e)}"}


# ═══════════════════════════════════════════════════════════════════
# OPERASI HASIL PERHITUNGAN
# ═══════════════════════════════════════════════════════════════════

def save_hasil(session_id: str, ranking: list, validasi: dict,
               si_values: dict, ri_values: dict, qi_values: dict) -> dict:
    """
    Simpan hasil perhitungan VIKOR ke Supabase.

    Args:
        session_id: ID sesi terkait
        ranking: list of dict hasil ranking
        validasi: dict hasil validasi solusi kompromi
        si_values: dict {kode_alt: nilai_si}
        ri_values: dict {kode_alt: nilai_ri}
        qi_values: dict {kode_alt: nilai_qi}

    Returns:
        dict dengan keys 'success' (bool) dan 'message' (str)
    """
    client = get_client()
    if client is None:
        return {"success": False, "message": "Koneksi database tidak tersedia."}

    try:
        data = {
            "session_id": session_id,
            "ranking": ranking,
            "validasi": validasi,
            "si_values": si_values,
            "ri_values": ri_values,
            "qi_values": qi_values,
        }
        response = client.table("hasil_perhitungan").insert(data).execute()
        if response.data:
            return {"success": True, "message": "Hasil berhasil disimpan!", "id": response.data[0]["id"]}
        return {"success": False, "message": "Gagal menyimpan hasil."}
    except Exception as e:
        return {"success": False, "message": f"Error: {str(e)}"}


def load_riwayat(limit: int = 10) -> list:
    """
    Ambil riwayat hasil perhitungan terbaru beserta nama sesi terkait.

    Returns:
        list of dict, atau list kosong jika gagal.
    """
    client = get_client()
    if client is None:
        return []

    try:
        response = (
            client.table("hasil_perhitungan")
            .select("id, session_id, ranking, validasi, calculated_at, sessions(nama, v)")
            .order("calculated_at", desc=True)
            .limit(limit)
            .execute()
        )
        return response.data or []
    except Exception:
        return []


def load_hasil_detail(hasil_id: str) -> dict | None:
    """
    Ambil detail lengkap satu hasil perhitungan.

    Returns:
        dict data hasil, atau None jika tidak ditemukan.
    """
    client = get_client()
    if client is None:
        return None

    try:
        response = (
            client.table("hasil_perhitungan")
            .select("*, sessions(nama, v, alternatif, kriteria, matriks)")
            .eq("id", hasil_id)
            .single()
            .execute()
        )
        return response.data
    except Exception:
        return None


# ═══════════════════════════════════════════════════════════════════
# UTILITY
# ═══════════════════════════════════════════════════════════════════

def format_timestamp(ts: str) -> str:
    """Format timestamp ISO ke format yang lebih mudah dibaca."""
    try:
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return dt.strftime("%d %b %Y, %H:%M")
    except Exception:
        return ts


def is_connected() -> bool:
    """Cek apakah koneksi Supabase tersedia."""
    return get_client() is not None
