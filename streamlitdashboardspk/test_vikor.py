import sys
sys.stdout.reconfigure(encoding='utf-8')
from vikor import VIKOR, DEFAULT_ALTERNATIF, DEFAULT_KRITERIA, DEFAULT_MATRIKS

v = VIKOR(DEFAULT_ALTERNATIF, DEFAULT_KRITERIA, DEFAULT_MATRIKS, v=0.5)
v.calculate()

expected = [
    ('A1', 0.0000),
    ('A6', 0.3544),
    ('A7', 0.4620),
    ('A8', 0.4865),
    ('A3', 0.6740),
    ('A4', 0.7599),
    ('A5', 0.9720),
    ('A2', 1.0000),
]

print("=== Ranking ===")
all_ok = True
for r in v.ranking:
    exp = expected[r['rank'] - 1]
    match = r['kode'] == exp[0] and abs(r['qi'] - exp[1]) < 0.01
    if not match:
        all_ok = False
    status = "OK" if match else "MISMATCH"
    print(f"  Rank {r['rank']}: {r['kode']} Q={r['qi']:.4f} | Expected: {exp[0]} Q={exp[1]:.4f} {status}")

print(f"\nAll match: {all_ok}")
print(f"Kondisi 1: {v.validasi['kondisi1']}")
print(f"Kondisi 2: {v.validasi['kondisi2']}")
print(f"Valid: {v.validasi['valid']}")
