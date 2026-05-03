## Skenario Pengujian Lanjutan (VPS & Multi-Node)

Pengujian kedua menggunakan topologi yang secara umum serupa dengan pengujian pertama, namun tidak lagi berjalan pada lingkungan lokal (_baseline_). Pada tahap ini, seluruh node dijalankan pada server **VPS** sehingga merepresentasikan kondisi jaringan yang lebih realistis.

### 1. Distribusi Node dan Lokasi

Percobaan ini menggunakan empat node yang tersebar secara geografis:

- **Producer (Jerman)**: Server pusat penyedia data/konten.
- **Bridge (Indonesia)**: Mediator komunikasi lintas protokol.
- **Service Model (Indonesia)**: Menampung model AI/Inference server.
- **Forwarding Node (Indonesia)**: Bertugas mengambil data dari _producer_.

### 2. Kondisi Simulasi Jaringan (Mahimahi)

Seluruh klien tetap berada di Indonesia, dengan penggunaan **Mahimahi** untuk mensimulasikan berbagai kondisi jaringan. Berikut adalah rincian skenario yang diuji:

#### 🟢 Skenario 1 — Jaringan Stabil (_Baseline Condition_)

- **Deskripsi**: Merepresentasikan kondisi jaringan yang ideal, di mana kapasitas bandwidth relatif konstan tanpa fluktuasi signifikan.
- **Karakteristik**:
  - **Bandwidth**: Stabil (misal ~5 Mbps ± kecil).
  - **Latency**: Konstan (misal ~30–50 ms).
  - **Packet loss**: Sangat rendah (<0.5%).
  - **Variasi**: Minimal.
- **Tujuan**: Baseline untuk mengevaluasi performa algoritma ABR dalam kondisi optimal.

#### 🟡 Skenario 2 — Jaringan Fluktuatif (_Real-World Condition_)

- **Deskripsi**: Mensimulasikan kondisi dunia nyata yang tidak stabil (seperti seluler/WiFi dengan interferensi) di mana bandwidth berubah dinamis.
- **Karakteristik**:
  - **Bandwidth**: Berubah-ubah (misal 0.8 – 3.5 Mbps).
  - **Latency**: Bervariasi (misal 30–150 ms).
  - **Packet loss**: Rendah hingga sedang (0–2%).
  - **Variasi**: Acak / tidak terprediksi.

#### 🔴 Skenario 3 — Jaringan Buruk / Degrading (_Stress Condition_)

- **Deskripsi**: Menggambarkan kondisi jaringan yang buruk atau menurun kualitasnya, seperti saat sinyal melemah atau terjadi kongesti.
- **Karakteristik**:
  - **Bandwidth**: Rendah atau menurun (misal 0.4 – 1 Mbps).
  - **Latency**: Tinggi dan tidak stabil (100–300 ms).
  - **Packet loss**: Sedang hingga tinggi (1–5%).
  - **Variasi**: Cenderung memburuk seiring waktu.

### 3. Metode Beban Kerja

Pengujian dievaluasi melalui dua pendekatan beban kerja guna melihat ketangguhan sistem:

1.  **Sequential Access**: Menjalankan klien secara bergantian.
2.  **Concurrent Access**: Menjalankan klien secara bersamaan (simultan).

### Metrik Evaluasi Pengujian (QoE & Network Efficiency)

Untuk setiap skenario pada pengujian VPS (Stabil, Fluktuatif, dan Buruk), keberhasilan sistem diukur berdasarkan metrik berikut:

| Kategori Metrik               | Nama Metrik          | Deskripsi / Rumus                                                                                 |
| :---------------------------- | :------------------- | :------------------------------------------------------------------------------------------------ |
| **Kualitas Pengalaman (QoE)** | _Rebuffering Ratio_  | Rasio durasi macet terhadap total durasi video ($\text{stall duration} / \text{total duration}$). |
| **Kualitas Pengalaman (QoE)** | _Average Bitrate_    | Nilai rata-rata kualitas video yang berhasil diputar dalam Mbps.                                  |
| **Kualitas Pengalaman (QoE)** | _Bitrate Switches_   | Frekuensi perubahan level kualitas video (indikator stabilitas).                                  |
| **Efisiensi Jaringan**        | _NDN Cache Hit Rate_ | Persentase Interest yang dijawab oleh Cache ($\text{HIT} / \text{total Interest}$).               |
| **Efisiensi Jaringan**        | _AI Inference Count_ | Jumlah total permintaan yang diteruskan hingga ke model AI (jalur HTTP).                          |

---

**Catatan Analisis:**

- **Rebuffering Ratio** yang rendah menunjukkan algoritma ABR berhasil menjaga kelancaran pemutaran video meskipun bandwidth turun (Skenario 3).
- **Bitrate Switches** yang terlalu tinggi (sering berubah-ubah) dapat mengganggu kenyamanan visual pengguna.
- **NDN Cache Hit Rate** akan dibandingkan antar skenario untuk melihat seberapa efektif _Memoization_ bekerja saat pola jaringan menjadi tidak terprediksi.
