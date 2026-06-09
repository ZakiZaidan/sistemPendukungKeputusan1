"""
FastAPI Backend — Sistem Pendukung Keputusan Metode VIKOR
Menyediakan REST API untuk perhitungan VIKOR dan operasi database Supabase.
"""

import sys
import os
import io


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import numpy as np
import pandas as pd

from vikor import VIKOR, DEFAULT_ALTERNATIF, DEFAULT_KRITERIA, DEFAULT_MATRIKS
import supabase_client as supadb

# ═══════════════════════════════════════════════════════════════════
# APP CONFIG
# ═══════════════════════════════════════════════════════════════════

app = FastAPI(
    title="SPK VIKOR API",
    description="API untuk Sistem Pendukung Keputusan Metode VIKOR",
    version="1.0.0",
)

# Allowed origins: localhost (dev) + production URL from env
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════
# PYDANTIC MODELS
# ═══════════════════════════════════════════════════════════════════

class VikorInput(BaseModel):
    alternatif: dict[str, str]
    kriteria: dict[str, dict]
    matriks: dict[str, list]
    v: float = 0.5


class SensitivityInput(BaseModel):
    alternatif: dict[str, str]
    kriteria: dict[str, dict]
    matriks: dict[str, list]
    v_values: list[float]


class SessionInput(BaseModel):
    nama: str
    alternatif: dict[str, str]
    kriteria: dict[str, dict]
    matriks: dict[str, list]
    v: float = 0.5


class HasilInput(BaseModel):
    ranking: list[dict]
    validasi: dict
    si_values: dict[str, float]
    ri_values: dict[str, float]
    qi_values: dict[str, float]


# ═══════════════════════════════════════════════════════════════════
# HELPER: Convert VIKOR result to JSON-serializable dict
# ═══════════════════════════════════════════════════════════════════

def vikor_to_dict(vikor: VIKOR) -> dict:
    """Convert VIKOR calculation results to a JSON-serializable dictionary."""
    # Matriks keputusan
    matriks_data = []
    for i, a in enumerate(vikor.alt_keys):
        row = {"kode": a, "nama": vikor.alternatif[a]}
        for j, k in enumerate(vikor.krit_keys):
            row[k] = float(vikor.matrix[i, j])
        matriks_data.append(row)

    # f+ dan f-
    f_ideal = {}
    for j, k in enumerate(vikor.krit_keys):
        f_ideal[k] = {
            "nama": vikor.kriteria[k]["nama"],
            "tipe": vikor.kriteria[k]["tipe"],
            "f_plus": float(vikor.f_plus[j]),
            "f_minus": float(vikor.f_minus[j]),
        }

    # Normalisasi
    normalisasi_data = []
    for i, a in enumerate(vikor.alt_keys):
        row = {"kode": a, "nama": vikor.alternatif[a]}
        for j, k in enumerate(vikor.krit_keys):
            row[k] = float(vikor.normalisasi[i, j])
        normalisasi_data.append(row)

    # F*ij terbobot
    f_terbobot_data = []
    for i, a in enumerate(vikor.alt_keys):
        row = {"kode": a, "nama": vikor.alternatif[a]}
        for j, k in enumerate(vikor.krit_keys):
            row[k] = float(vikor.f_terbobot[i, j])
        f_terbobot_data.append(row)

    # Si & Ri
    sri_data = []
    for i, a in enumerate(vikor.alt_keys):
        sri_data.append({
            "kode": a,
            "nama": vikor.alternatif[a],
            "si": float(vikor.si[i]),
            "ri": float(vikor.ri[i]),
        })

    # Convert ranking to JSON-safe types (numpy.float64 -> float)
    ranking_safe = [
        {
            'rank': int(r['rank']),
            'kode': r['kode'],
            'nama': r['nama'],
            'qi': float(r['qi']),
            'si': float(r['si']),
            'ri': float(r['ri']),
        }
        for r in vikor.ranking
    ]

    # Convert validasi to JSON-safe types
    val = vikor.validasi
    validasi_safe = {
        'a1st': val['a1st'],
        'a1st_nama': val['a1st_nama'],
        'q1st': float(val['q1st']),
        'a2nd': val['a2nd'],
        'q2nd': float(val['q2nd']),
        'dq': float(val['dq']),
        'selisih': float(val['selisih']),
        'kondisi1': bool(val['kondisi1']),
        'kondisi1_text': val['kondisi1_text'],
        'si_rank': int(val['si_rank']),
        'ri_rank': int(val['ri_rank']),
        'kondisi2': bool(val['kondisi2']),
        'kondisi2_text': val['kondisi2_text'],
        'valid': bool(val['valid']),
    }

    return {
        "matriks": matriks_data,
        "kriteria": {k: v for k, v in vikor.kriteria.items()},
        "krit_keys": vikor.krit_keys,
        "alt_keys": vikor.alt_keys,
        "f_ideal": f_ideal,
        "normalisasi": normalisasi_data,
        "f_terbobot": f_terbobot_data,
        "sri": sri_data,
        "si_min": float(vikor.si.min()),
        "si_max": float(vikor.si.max()),
        "ri_min": float(vikor.ri.min()),
        "ri_max": float(vikor.ri.max()),
        "ranking": ranking_safe,
        "validasi": validasi_safe,
        "v": float(vikor.v),
    }


# ═══════════════════════════════════════════════════════════════════
# ENDPOINTS: Info & Defaults
# ═══════════════════════════════════════════════════════════════════

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "supabase_connected": supadb.is_connected(),
        "supabase_error": supadb.get_connection_error(),
    }


@app.get("/api/defaults")
def get_defaults():
    """Return default data from the journal."""
    return {
        "alternatif": DEFAULT_ALTERNATIF,
        "kriteria": DEFAULT_KRITERIA,
        "matriks": DEFAULT_MATRIKS,
        "v": 0.5,
    }


# ═══════════════════════════════════════════════════════════════════
# HELPER: Convert ranking + validasi to JSON-safe types
# ═══════════════════════════════════════════════════════════════════

def safe_ranking(vikor) -> dict:
    """Convert ranking and validasi from a VIKOR instance to JSON-safe dicts."""
    ranking_safe = [
        {
            'rank': int(r['rank']),
            'kode': r['kode'],
            'nama': r['nama'],
            'qi': float(r['qi']),
            'si': float(r['si']),
            'ri': float(r['ri']),
        }
        for r in vikor.ranking
    ]
    val = vikor.validasi
    validasi_safe = {
        'a1st': val['a1st'],
        'a1st_nama': val['a1st_nama'],
        'q1st': float(val['q1st']),
        'a2nd': val['a2nd'],
        'q2nd': float(val['q2nd']),
        'dq': float(val['dq']),
        'selisih': float(val['selisih']),
        'kondisi1': bool(val['kondisi1']),
        'kondisi1_text': val['kondisi1_text'],
        'si_rank': int(val['si_rank']),
        'ri_rank': int(val['ri_rank']),
        'kondisi2': bool(val['kondisi2']),
        'kondisi2_text': val['kondisi2_text'],
        'valid': bool(val['valid']),
    }
    return {'ranking': ranking_safe, 'validasi': validasi_safe}


# ═══════════════════════════════════════════════════════════════════
# ENDPOINTS: VIKOR Calculation
# ═══════════════════════════════════════════════════════════════════

@app.post("/api/calculate")
def calculate_vikor(data: VikorInput):
    """Run full VIKOR calculation and return all step results."""
    try:
        vikor = VIKOR(
            alternatif=data.alternatif,
            kriteria=data.kriteria,
            matriks=data.matriks,
            v=data.v,
        )
        vikor.calculate()
        return vikor_to_dict(vikor)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/sensitivity")
def sensitivity_analysis(data: SensitivityInput):
    """Run sensitivity analysis with multiple v values."""
    try:
        vikor = VIKOR(
            alternatif=data.alternatif,
            kriteria=data.kriteria,
            matriks=data.matriks,
            v=0.5,
        )
        vikor.calculate()

        results = {}
        for v_val in data.v_values:
            vikor_temp = VIKOR(data.alternatif, data.kriteria, data.matriks, v=v_val)
            vikor_temp.calculate()
            results[str(v_val)] = safe_ranking(vikor_temp)

        return {
            "results": results,
            "alt_keys": list(data.alternatif.keys()),
            "alternatif": data.alternatif,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ═══════════════════════════════════════════════════════════════════
# ENDPOINTS: Sessions
# ═══════════════════════════════════════════════════════════════════

@app.get("/api/sessions")
def get_sessions():
    sessions = supadb.load_sessions()
    return {"sessions": sessions, "connected": supadb.is_connected()}


@app.post("/api/sessions")
def create_session(data: SessionInput):
    result = supadb.save_session(
        nama=data.nama,
        alternatif=data.alternatif,
        kriteria=data.kriteria,
        matriks=data.matriks,
        v=data.v,
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@app.get("/api/sessions/{session_id}")
def get_session_detail(session_id: str):
    detail = supadb.load_session_detail(session_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan.")
    return detail


@app.delete("/api/sessions/{session_id}")
def remove_session(session_id: str):
    result = supadb.delete_session(session_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


# ═══════════════════════════════════════════════════════════════════
# ENDPOINTS: Hasil Perhitungan
# ═══════════════════════════════════════════════════════════════════

@app.post("/api/sessions/{session_id}/hasil")
def save_hasil(session_id: str, data: HasilInput):
    result = supadb.save_hasil(
        session_id=session_id,
        ranking=data.ranking,
        validasi=data.validasi,
        si_values=data.si_values,
        ri_values=data.ri_values,
        qi_values=data.qi_values,
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@app.get("/api/riwayat")
def get_riwayat():
    riwayat = supadb.load_riwayat(limit=15)
    return {"riwayat": riwayat, "connected": supadb.is_connected()}


@app.get("/api/riwayat/{hasil_id}")
def get_riwayat_detail(hasil_id: str):
    detail = supadb.load_hasil_detail(hasil_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Riwayat tidak ditemukan.")
    return detail


# ═══════════════════════════════════════════════════════════════════
# ENDPOINTS: Export Excel
# ═══════════════════════════════════════════════════════════════════

@app.post("/api/export")
def export_excel(data: VikorInput):
    """Generate and download Excel file with VIKOR results."""
    try:
        vikor = VIKOR(
            alternatif=data.alternatif,
            kriteria=data.kriteria,
            matriks=data.matriks,
            v=data.v,
        )
        vikor.calculate()

        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            vikor.get_matriks_df().to_excel(writer, sheet_name="Matriks Keputusan")
            vikor.get_f_ideal_df().to_excel(writer, sheet_name="Nilai Ideal")
            vikor.get_normalisasi_df().to_excel(writer, sheet_name="Normalisasi")
            vikor.get_f_terbobot_df().to_excel(writer, sheet_name="F_ij Terbobot")
            vikor.get_sri_df().to_excel(writer, sheet_name="Si dan Ri", index=False)
            vikor.get_ranking_df().to_excel(writer, sheet_name="Ranking", index=False)
        output.seek(0)

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=Hasil_VIKOR.xlsx"},
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
