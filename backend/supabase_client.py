"""
supabase_client.py — Modul koneksi Supabase untuk FastAPI backend.
Tidak bergantung pada Streamlit.
"""

import os
from supabase import create_client, Client
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# ═══════════════════════════════════════════════════════════════════
# INISIALISASI CLIENT
# ═══════════════════════════════════════════════════════════════════

_client: Client | None = None
_connection_error: str | None = None


def _init_client():
    global _client, _connection_error
    if _client is not None:
        return
    try:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            _connection_error = "SUPABASE_URL atau SUPABASE_KEY tidak ditemukan di environment."
            return
        _client = create_client(url, key)
    except Exception as e:
        _connection_error = f"Gagal konek Supabase: {type(e).__name__}: {e}"


def get_client() -> Client | None:
    _init_client()
    return _client


def is_connected() -> bool:
    _init_client()
    return _client is not None


def get_connection_error() -> str | None:
    _init_client()
    return _connection_error


# ═══════════════════════════════════════════════════════════════════
# OPERASI SESI
# ═══════════════════════════════════════════════════════════════════

def save_session(nama: str, alternatif: dict, kriteria: dict,
                 matriks: dict, v: float) -> dict:
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
    try:
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return dt.strftime("%d %b %Y, %H:%M")
    except Exception:
        return ts
