# SPK VIKOR — Strategi Pemasaran UMKM

Sistem Pendukung Keputusan berbasis metode VIKOR untuk penentuan strategi pemasaran UMKM Nasi Bakar Mak Yuni, Kota Metro.

Dibangun dengan **Streamlit** dan terintegrasi dengan **Supabase** sebagai database cloud.

---

## Cara Setup dan Menjalankan

### 1. Clone/Download Repositori

```bash
git clone https://github.com/USERNAME/REPO-NAME.git
cd REPO-NAME
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Setup Supabase (Database)

#### a. Buat Project di Supabase
1. Buka [https://supabase.com](https://supabase.com) dan login
2. Klik **New Project**, isi nama dan password database
3. Tunggu project selesai dibuat

#### b. Buat Tabel di Supabase

Masuk ke **SQL Editor** di dashboard Supabase, lalu jalankan query berikut:

```sql
-- Tabel sesi: menyimpan konfigurasi input
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  alternatif JSONB NOT NULL,
  kriteria JSONB NOT NULL,
  matriks JSONB NOT NULL,
  v FLOAT NOT NULL DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel hasil: menyimpan hasil perhitungan VIKOR
CREATE TABLE hasil_perhitungan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  ranking JSONB NOT NULL,
  validasi JSONB NOT NULL,
  si_values JSONB,
  ri_values JSONB,
  qi_values JSONB,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### c. Ambil Credentials Supabase
1. Di dashboard Supabase, masuk ke **Settings → API**
2. Salin:
   - **Project URL** (contoh: `https://abcdefgh.supabase.co`)
   - **anon public key** (string panjang yang dimulai dengan `eyJ...`)

#### d. Setup Secrets (Lokal)

Buka file `.streamlit/secrets.toml` dan isi dengan credentials Anda:

```toml
[supabase]
url = "https://XXXX.supabase.co"
key = "eyJXXXX..."
```

> ⚠️ **Penting:** File ini sudah ada di `.gitignore`, jadi tidak akan ter-upload ke GitHub.

### 4. Jalankan Aplikasi

```bash
streamlit run app.py
```

---

## Deploy ke Streamlit Community Cloud

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: SPK VIKOR"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

> ⚠️ Pastikan file `.streamlit/secrets.toml` **TIDAK** ikut ter-push (sudah diatur di `.gitignore`).

### 2. Deploy di Streamlit Cloud

1. Buka [https://share.streamlit.io](https://share.streamlit.io)
2. Login dengan akun GitHub Anda
3. Klik **New App**
4. Pilih:
   - **Repository**: pilih repo SPK VIKOR Anda
   - **Branch**: `main`
   - **Main file path**: `app.py`
5. Klik **Deploy!**

### 3. Tambahkan Secrets di Streamlit Cloud

Setelah deploy, masuk ke halaman app → klik **⋮ (menu)** → **Settings** → **Secrets**.

Masukkan secrets berikut (format TOML):

```toml
[supabase]
url = "https://XXXX.supabase.co"
key = "eyJXXXX..."
```

Klik **Save**. Aplikasi akan otomatis restart dan terhubung ke Supabase.

---

## Struktur File

```
spk/
├── app.py                    # Aplikasi Streamlit utama
├── vikor.py                  # Logika perhitungan metode VIKOR
├── db.py                     # Modul koneksi & operasi Supabase
├── requirements.txt          # Dependencies Python
├── .gitignore                # File/folder yang dikecualikan dari Git
├── .streamlit/
│   └── secrets.toml          # Credentials lokal (JANGAN di-push!)
└── README.md                 # Dokumentasi ini
```

---

## Fitur Supabase

| Fitur | Keterangan |
|-------|-----------|
| **Simpan Sesi** | Menyimpan konfigurasi input (alternatif, kriteria, matriks, v) ke Supabase |
| **Muat Sesi** | Memuat konfigurasi yang tersimpan untuk digunakan kembali |
| **Hapus Sesi** | Menghapus sesi beserta hasil perhitungannya |
| **Riwayat Perhitungan** | Melihat semua hasil perhitungan yang pernah disimpan |
| **Status Koneksi** | Indikator hijau/merah di sidebar menampilkan status koneksi Supabase |

---

## Teknologi

- **Frontend**: Streamlit
- **Kalkulasi**: Python + NumPy + Pandas
- **Visualisasi**: Plotly
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Streamlit Community Cloud
