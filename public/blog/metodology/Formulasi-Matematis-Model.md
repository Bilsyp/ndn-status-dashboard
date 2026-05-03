## 1. Rumus Penentu Throughput dari Trace Mahimahi

Rumus ini digunakan untuk mengonversi data paket mentah menjadi satuan **Mbps** yang bisa dimengerti oleh sistem.

### Kalkulasi Mbps:

$$\text{mbps} = \frac{\text{packet\_count} \times \text{PACKET\_SIZE\_BITS}}{1.000.000}$$

**Penjelasan:**

- **packet_count**: Jumlah paket yang tiba dalam satu detik.
- **PACKET_SIZE_BITS**: Ukuran paket (1500 bytes × 8 bit).
- **Konversi**: Hasil akhir dibagi 1.000.000 untuk mendapatkan satuan Megabit per detik (Mbps).

## 2. Rumus Scaling Target Jaringan (Headroom)

Sistem ini secara otomatis menyesuaikan kapasitas jaringan simulasi agar selalu relevan dengan kualitas video tertinggi yang tersedia.

### Target Scaling:

$$\text{SCALE\_TARGET} = \text{MAX\_BITRATE} \times 1,5$$

**Penjelasan:**
Memberikan _headroom_ sebesar 50% di atas bitrate tertinggi ($3,4 \text{ Mbps} \times 1,5 = 5,1 \text{ Mbps}$). Ini memastikan agen RL memiliki ruang untuk mencoba menaikkan bitrate ke level maksimal (720p).

## 3. Rumus Normalisasi Observasi (Input RL)

Sebelum masuk ke model PPO, data mentah harus dinormalisasi ke rentang $[0, 1]$ agar pelatihan stabil.

**Normalisasi Buffer:**
$\text{buffer} / 30,0$ (Asumsi buffer maksimal 30 detik).

**Normalisasi Throughput:**
$\text{mean\_tp} / \text{SCALE\_TARGET}$ (Rerata throughput dibagi batas atas jaringan).

### Normalisasi Volatilitas:

$$
\text{volatility} = \frac{\text{std\_deviation}(\text{tp\_history})}{\text{mean\_tp} + 1e-6}
$$

**Penjelasan:**
Menggunakan _Coefficient of Variation_ (CV) untuk mengukur seberapa tidak stabil jaringan tersebut. Penambahan $1e-6$ dilakukan untuk menghindari pembagian dengan nol (_division by zero_).

## 4. Logika Veto NDN (Congestion Control)

Rumus ini berfungsi sebagai rem darurat yang mencegah kenaikan bitrate jika jaringan NDN terdeteksi sibuk, meskipun buffer penuh.

**Kondisi Veto:**
$\text{new\_cwnd} < \text{NDN\_CONGESTION\_CWND}$ (Default: 3.0).

**Penjelasan:**
Jika _Congestion Window_ (CWND) pada jaringan NDN turun di bawah 3.0, sistem akan melarang kenaikan bitrate (_Veto Upgrade_) untuk menghindari kemacetan parah.

## 5. Rumus Ambang Buffer Dinamis

Batas aman buffer tidak lagi statis, melainkan menyesuaikan dengan kondisi volatilitas jaringan.

### Dynamic Buffer Requirement:

$$
\text{dynamic\_buffer\_req} = \text{LOW\_BUFFER\_THRESHOLD} + (\text{volatility} \times 5,0)
$$

**Penjelasan:**
Jika jaringan sangat fluktuatif (volatilitas tinggi), sistem akan menaikkan ambang batas buffer aman agar lebih waspada.

## 6. Rumus Fungsi Reward (Imbalan)

Ini adalah "otak" yang mendikte perilaku agen PPO. Rumus ini dikalibrasi ulang untuk 4 level bitrate.

### Reward Bitrate Terpilih:

$$
\text{norm\_reward} = \left( \frac{\text{chosen\_bitrate}}{\text{MAX\_BITRATE}} \right) \times 100,0
$$

**Penjelasan:**
Memberikan poin positif berdasarkan kualitas video. Pembagi `MAX_BITRATE` memastikan _reward_ tidak bias meskipun bitrate yang digunakan relatif rendah.

### Penalti Stalling (Macet):

$$
\text{penalty} = -(\text{stalling\_time} \times 50,0 + 20,0)
$$

**Penjelasan:**
Memberikan hukuman berat jika video berhenti berputar (_buffering_).

### Reward/Penalti Buffer:

- **Jika buffer < 3 detik:** $-50.0$ (Kritis).
- **Jika buffer < 5 detik:** $-20.0$ (Peringatan).
- **Jika buffer aman:** $+5.0$.
