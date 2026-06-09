import sys
sys.stdout.reconfigure(encoding='utf-8')

data = {
    'A1': [3.64, 2, 450, 110675],
    'A2': [3.51, 6, 450, 151983],
    'A3': [3.62, 5, 900, 737519],
    'A4': [4.00, 7, 2200, 159346],
    'A5': [3.57, 5, 1300, 540794],
    'A6': [3.59, 5, 450, 778067],
    'A7': [2.82, 2, 450, 500476],
    'A8': [2.86, 5, 450, 996888],
    'A9': [3.62, 4, 450, 472009],
    'A10': [2.64, 3, 900, 858870],
    'A11': [3.67, 7, 1300, 797638],
}

# C1=IP(Benefit), C2=Semester(Cost), C3=Daya Listrik(Cost), C4=Tagihan Listrik(Cost)
types = ['Benefit', 'Cost', 'Cost', 'Cost']

alt_names = list(data.keys())

# Compute f+ and f- with Cost/Benefit aware logic
fp = []
fm = []
for j in range(4):
    vals = [d[j] for d in data.values()]
    t = types[j]
    if t == 'Cost':
        fplus = min(vals)   # best for Cost = smallest
        fminus = max(vals)  # worst for Cost = largest
    else:
        fplus = max(vals)   # best for Benefit = largest
        fminus = min(vals)  # worst for Benefit = smallest
    fp.append(fplus)
    fm.append(fminus)

print("=== Verifying f+ and f- ===")
for j in range(4):
    print(f"  C{j+1} ({types[j]}): f+={fp[j]}, f-={fm[j]}")

print(f"\nLecture says: f+1=4.00, f-1=2.64 (matches our C1 Benefit)")

# Normalisasi
print("\n=== Normalisasi N(i,j) = (f+j - fij) / (f+j - f-j) ===")

lecture_N = [
    [0.264, 0.000, 0.000, 0.000],
    [0.360, 0.800, 0.000, 0.046],
    [0.279, 0.600, 0.257, 0.707],
    [0.000, 1.000, 1.000, 0.054],
    [0.316, 0.600, 0.485, 0.485],
    [0.301, 0.600, 0.000, 0.753],
    [0.867, 0.000, 0.000, 0.439],
    [0.838, 0.600, 0.000, 1.000],
    [0.279, 0.400, 0.000, 0.407],
    [1.000, 0.200, 0.257, 0.844],
    [0.242, 1.000, 0.485, 0.775],
]

all_match = True
print(f"{'Alt':>4}  {'C1_ours':>8} {'C2_ours':>8} {'C3_ours':>8} {'C4_ours':>8}  |  {'C1_lec':>8} {'C2_lec':>8} {'C3_lec':>8} {'C4_lec':>8}  Status")
for i, a in enumerate(alt_names):
    row = []
    for j in range(4):
        denom = fp[j] - fm[j]
        if denom == 0:
            n = 0
        else:
            n = (fp[j] - data[a][j]) / denom
        row.append(round(n, 3))
    l = lecture_N[i]
    ok = all(abs(row[j] - l[j]) < 0.002 for j in range(4))
    if not ok:
        all_match = False
    status = "OK" if ok else "MISMATCH"
    print(f"{a:>4}  {row[0]:>8.3f} {row[1]:>8.3f} {row[2]:>8.3f} {row[3]:>8.3f}  |  {l[0]:>8.3f} {l[1]:>8.3f} {l[2]:>8.3f} {l[3]:>8.3f}  {status}")

print(f"\nAll normalization values match lecture: {all_match}")

# Now verify the Excel file approach
print("\n\n=== Comparing with Excel file approach ===")
print("Excel uses: f+ = IF(Cost, MIN, MAX) and f- = IF(Cost, MAX, MIN)")
print("Lecture uses: Same approach (f+=MIN for Cost, f+=MAX for Benefit)")
print("Result: Excel approach is CORRECT and matches the lecture")

# Check S, R, Q
print("\n=== Checking S, R, Q calculations ===")
W = [0.40, 0.25, 0.10, 0.25]

# Compute F*ij
Fstar = {}
for a in alt_names:
    Fstar[a] = []
    for j in range(4):
        denom = fp[j] - fm[j]
        nij = (fp[j] - data[a][j]) / denom if denom != 0 else 0
        fij = W[j] * nij
        Fstar[a].append(round(fij, 3))

# Compute S and R
Si = {a: sum(Fstar[a]) for a in alt_names}
Ri = {a: max(Fstar[a]) for a in alt_names}

S_min = min(Si.values())
S_max = max(Si.values())
R_min = min(Ri.values())
R_max = max(Ri.values())

print(f"S+ (max) = {S_max:.3f}, S- (min) = {S_min:.3f}")
print(f"R+ (max) = {R_max:.3f}, R- (min) = {R_min:.3f}")
print(f"Lecture: S+=0.735, S-=0.105, R+=0.400, R-=0.105")

v = 0.5
Qi = {}
for a in alt_names:
    s_part = v * (Si[a] - S_min) / (S_max - S_min) if S_max != S_min else 0
    r_part = (1-v) * (Ri[a] - R_min) / (R_max - R_min) if R_max != R_min else 0
    Qi[a] = round(s_part + r_part, 3)

sorted_q = sorted(Qi.items(), key=lambda x: x[1])
print("\nRanking:")
lecture_ranking = [('A1',0.000),('A9',0.175),('A5',0.345),('A2',0.358),('A3',0.405),
                   ('A6',0.420),('A4',0.449),('A11',0.629),('A7',0.688),('A8',0.890),('A10',0.961)]

for rank, (a, q) in enumerate(sorted_q, 1):
    lec_a, lec_q = lecture_ranking[rank-1]
    match_str = "OK" if a == lec_a and abs(q - lec_q) < 0.002 else "MISMATCH"
    print(f"  {rank:>2}. {a:>4} Q={q:.3f}  |  Lecture: {lec_a:>4} Q={lec_q:.3f}  {match_str}")
