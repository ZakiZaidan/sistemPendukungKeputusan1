"""
Modul Perhitungan Metode VIKOR
(VIšekriterijumsko KOmpromisno Rangiranje)

Digunakan untuk Sistem Pendukung Keputusan penentuan strategi pemasaran UMKM.
"""

import numpy as np
import pandas as pd


class VIKOR:
    """
    Class untuk melakukan perhitungan metode VIKOR secara step-by-step.
    
    Parameters
    ----------
    alternatif : dict
        Dictionary {kode: nama} alternatif, misal {'A1': 'Promosi Media Sosial'}
    kriteria : dict
        Dictionary {kode: {'nama': str, 'tipe': 'Cost'/'Benefit', 'bobot': float}}
    matriks : dict
        Dictionary {kode_alternatif: [nilai_per_kriteria]}
    v : float
        Parameter kompromi VIKOR (default 0.5)
    """

    def __init__(self, alternatif: dict, kriteria: dict, matriks: dict, v: float = 0.5):
        self.alternatif = alternatif
        self.kriteria = kriteria
        self.matriks = matriks
        self.v = v

        self.alt_keys = list(alternatif.keys())
        self.krit_keys = list(kriteria.keys())
        self.num_alt = len(self.alt_keys)
        self.num_krit = len(self.krit_keys)

        # Build numpy matrix
        self.matrix = np.array([matriks[a] for a in self.alt_keys], dtype=float)

        # Results (populated after calculate())
        self.f_plus = None
        self.f_minus = None
        self.normalisasi = None
        self.f_terbobot = None
        self.si = None
        self.ri = None
        self.qi = None
        self.ranking = None
        self.validasi = None

    def calculate(self):
        """Run semua tahap perhitungan VIKOR."""
        self._hitung_f_ideal()
        self._hitung_normalisasi()
        self._hitung_f_terbobot()
        self._hitung_si_ri()
        self._hitung_qi()
        self._hitung_ranking()
        self._validasi_kompromi()

    # ─── Tahap 1: Menentukan f+ dan f- ───

    def _hitung_f_ideal(self):
        """Menentukan nilai ideal terbaik (f+) dan terburuk (f-)."""
        self.f_plus = np.zeros(self.num_krit)
        self.f_minus = np.zeros(self.num_krit)

        for j, k in enumerate(self.krit_keys):
            col = self.matrix[:, j]
            if self.kriteria[k]['tipe'] == 'Cost':
                self.f_plus[j] = col.min()   # terbaik = minimum (biaya rendah)
                self.f_minus[j] = col.max()  # terburuk = maximum (biaya tinggi)
            else:  # Benefit
                self.f_plus[j] = col.max()   # terbaik = maximum (nilai tinggi)
                self.f_minus[j] = col.min()  # terburuk = minimum (nilai rendah)

    # ─── Tahap 2: Normalisasi ───

    def _hitung_normalisasi(self):
        """Hitung normalisasi Nij = (f+j − fij) / (f+j − f−j)."""
        self.normalisasi = np.zeros_like(self.matrix)

        for j in range(self.num_krit):
            denom = self.f_plus[j] - self.f_minus[j]
            if denom == 0:
                self.normalisasi[:, j] = 0
            else:
                self.normalisasi[:, j] = (self.f_plus[j] - self.matrix[:, j]) / denom

    # ─── Tahap 3: Pembobotan ───

    def _hitung_f_terbobot(self):
        """Hitung F*ij = Wj × Nij."""
        bobot = np.array([self.kriteria[k]['bobot'] for k in self.krit_keys])
        self.f_terbobot = self.normalisasi * bobot

    # ─── Tahap 4: Hitung Si dan Ri ───

    def _hitung_si_ri(self):
        """
        Si (Utility Measure) = SUM(F*ij) per alternatif.
        Ri (Regret Measure) = MAX(F*ij) per alternatif.
        """
        self.si = self.f_terbobot.sum(axis=1)
        self.ri = self.f_terbobot.max(axis=1)

    # ─── Tahap 5: Hitung Qi ───

    def _hitung_qi(self):
        """
        Qi = v × (Si − S−)/(S+ − S−) + (1−v) × (Ri − R−)/(R+ − R−)
        """
        s_min, s_max = self.si.min(), self.si.max()
        r_min, r_max = self.ri.min(), self.ri.max()

        self.qi = np.zeros(self.num_alt)
        for i in range(self.num_alt):
            s_part = self.v * (self.si[i] - s_min) / (s_max - s_min) if s_max != s_min else 0
            r_part = (1 - self.v) * (self.ri[i] - r_min) / (r_max - r_min) if r_max != r_min else 0
            self.qi[i] = s_part + r_part

    # ─── Tahap 6: Ranking ───

    def _hitung_ranking(self):
        """Urutkan alternatif berdasarkan Qi terkecil."""
        order = np.argsort(self.qi)
        self.ranking = []
        for rank, idx in enumerate(order, 1):
            self.ranking.append({
                'rank': rank,
                'kode': self.alt_keys[idx],
                'nama': self.alternatif[self.alt_keys[idx]],
                'qi': self.qi[idx],
                'si': self.si[idx],
                'ri': self.ri[idx],
            })

    # ─── Tahap 7: Validasi Kompromi ───

    def _validasi_kompromi(self):
        """
        Validasi solusi kompromi:
        Kondisi 1 — Acceptable Advantage: Q(A2nd) − Q(A1st) ≥ 1/(m−1)
        Kondisi 2 — Acceptable Stability: A1st rank 1 pada S atau R
        """
        sorted_qi = sorted(zip(self.alt_keys, self.qi), key=lambda x: x[1])
        a1st_code = sorted_qi[0][0]
        q1st = sorted_qi[0][1]
        q2nd = sorted_qi[1][1] if len(sorted_qi) > 1 else q1st

        dq = 1.0 / (self.num_alt - 1) if self.num_alt > 1 else 0
        selisih = q2nd - q1st
        kondisi1 = selisih >= dq

        # Cek rank pada S dan R
        a1st_idx = self.alt_keys.index(a1st_code)
        si_rank = 1 + sum(1 for s in self.si if s < self.si[a1st_idx])
        ri_rank = 1 + sum(1 for r in self.ri if r < self.ri[a1st_idx])
        kondisi2 = si_rank == 1 or ri_rank == 1

        self.validasi = {
            'a1st': a1st_code,
            'a1st_nama': self.alternatif[a1st_code],
            'q1st': q1st,
            'a2nd': sorted_qi[1][0] if len(sorted_qi) > 1 else None,
            'q2nd': q2nd,
            'dq': dq,
            'selisih': selisih,
            'kondisi1': kondisi1,
            'kondisi1_text': f'Q(A2nd) − Q(A1st) = {selisih:.4f} {"≥" if kondisi1 else "<"} DQ = {dq:.4f}',
            'si_rank': si_rank,
            'ri_rank': ri_rank,
            'kondisi2': kondisi2,
            'kondisi2_text': f'{a1st_code} rank Si={si_rank}, rank Ri={ri_rank}',
            'valid': kondisi1 and kondisi2,
        }

    # ─── Utility Methods ───

    def get_matriks_df(self) -> pd.DataFrame:
        """Return matriks keputusan sebagai DataFrame."""
        df = pd.DataFrame(
            self.matrix,
            index=[f"{k} – {self.alternatif[k]}" for k in self.alt_keys],
            columns=[f"{k} ({self.kriteria[k]['nama']})" for k in self.krit_keys],
        )
        return df

    def get_f_ideal_df(self) -> pd.DataFrame:
        """Return f+ dan f- sebagai DataFrame."""
        data = {
            f"{k} ({self.kriteria[k]['nama']})": [self.f_plus[j], self.f_minus[j]]
            for j, k in enumerate(self.krit_keys)
        }
        df = pd.DataFrame(data, index=['f+ (Terbaik)', 'f− (Terburuk)'])
        return df

    def get_normalisasi_df(self) -> pd.DataFrame:
        """Return matriks normalisasi sebagai DataFrame."""
        df = pd.DataFrame(
            self.normalisasi,
            index=[f"{k} – {self.alternatif[k]}" for k in self.alt_keys],
            columns=[f"{k}" for k in self.krit_keys],
        )
        return df

    def get_f_terbobot_df(self) -> pd.DataFrame:
        """Return matriks F*ij terbobot sebagai DataFrame."""
        df = pd.DataFrame(
            self.f_terbobot,
            index=[f"{k} – {self.alternatif[k]}" for k in self.alt_keys],
            columns=[f"{k}" for k in self.krit_keys],
        )
        return df

    def get_sri_df(self) -> pd.DataFrame:
        """Return Si, Ri sebagai DataFrame."""
        data = {
            'Alternatif': [f"{k} – {self.alternatif[k]}" for k in self.alt_keys],
            'Si (Utility)': self.si,
            'Ri (Regret)': self.ri,
        }
        df = pd.DataFrame(data)
        return df

    def get_ranking_df(self) -> pd.DataFrame:
        """Return ranking sebagai DataFrame."""
        data = {
            'Ranking': [r['rank'] for r in self.ranking],
            'Kode': [r['kode'] for r in self.ranking],
            'Alternatif': [r['nama'] for r in self.ranking],
            'Qi': [r['qi'] for r in self.ranking],
            'Si': [r['si'] for r in self.ranking],
            'Ri': [r['ri'] for r in self.ranking],
        }
        df = pd.DataFrame(data)
        return df

    def analisis_sensitivitas(self, v_values: list = None) -> dict:
        """
        Lakukan analisis sensitivitas dengan variasi parameter v.
        
        Parameters
        ----------
        v_values : list of float
            Daftar nilai v yang akan diuji (default: [0.1, 0.2, ..., 0.9])
            
        Returns
        -------
        dict : {v: ranking_df} untuk setiap nilai v
        """
        if v_values is None:
            v_values = [round(x * 0.1, 1) for x in range(1, 10)]

        results = {}
        for v_val in v_values:
            vikor_temp = VIKOR(self.alternatif, self.kriteria, self.matriks, v=v_val)
            vikor_temp.calculate()
            results[v_val] = {
                'ranking_df': vikor_temp.get_ranking_df(),
                'ranking': vikor_temp.ranking,
                'validasi': vikor_temp.validasi,
            }
        return results


# ─── Data Default dari Jurnal ───

DEFAULT_ALTERNATIF = {
    'A1': 'Promosi melalui Media Sosial',
    'A2': 'Diskon atau Promo Bundling',
    'A3': 'Kerja Sama Pesan Antar Online',
    'A4': 'Peningkatan Kualitas Pelayanan',
    'A5': 'Program Kode Referral',
    'A6': 'Program Loyalitas Pelanggan',
    'A7': 'Promosi Marketplace/Aggregator',
    'A8': 'Kolaborasi Influencer Mikro Lokal',
}

DEFAULT_KRITERIA = {
    'C1': {'nama': 'Biaya Promosi', 'tipe': 'Cost', 'bobot': 0.15},
    'C2': {'nama': 'Jangkauan Pasar', 'tipe': 'Benefit', 'bobot': 0.20},
    'C3': {'nama': 'Kemudahan Implementasi', 'tipe': 'Benefit', 'bobot': 0.15},
    'C4': {'nama': 'Potensi Peningkatan Penjualan', 'tipe': 'Benefit', 'bobot': 0.20},
    'C5': {'nama': 'Tingkat Risiko', 'tipe': 'Cost', 'bobot': 0.10},
    'C6': {'nama': 'Keterukuran Hasil Promosi', 'tipe': 'Benefit', 'bobot': 0.10},
    'C7': {'nama': 'Keberlanjutan Strategi', 'tipe': 'Benefit', 'bobot': 0.10},
}

DEFAULT_MATRIKS = {
    'A1': [2, 8, 9, 8, 3, 9, 8],
    'A2': [3, 6, 8, 7, 4, 6, 6],
    'A3': [4, 7, 7, 8, 5, 7, 7],
    'A4': [1, 7, 8, 7, 2, 5, 8],
    'A5': [2, 6, 7, 7, 3, 6, 7],
    'A6': [3, 7, 8, 8, 3, 7, 9],
    'A7': [5, 9, 7, 9, 5, 8, 7],
    'A8': [4, 7, 8, 8, 4, 7, 7],
}
