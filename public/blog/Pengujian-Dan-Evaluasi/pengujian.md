> **Note:** Ini merupakan **baseline local awalan pertama** sebagai fondasi seluruh rangkaian eksperimen.

## SKENARIO PENGUJIAN

Pengujian dilakukan secara bertahap untuk mengevaluasi performa sistem dalam berbagai kondisi, mulai dari kondisi dasar hingga kondisi jaringan yang dinamis. Setiap tahap dirancang sebagai bagian dari rangkaian eksperimen yang berkesinambungan.

### 1. Pengujian Tanpa Cache (Baseline Test)

Pada tahap awal, sistem diuji tanpa memanfaatkan mekanisme _cache_ untuk melihat performa murni dari model AI.

- **Subjek**: Hanya satu pengguna yang terlibat (_pioneer user_).
- **Mode**: _Cache_ dinonaktifkan.
- **Kondisi Jaringan**: Stabil pada kisaran 9–10 Mbps.

**Tujuan:**

- Mengukur performa dasar sistem berbasis AI.
- Menjadi acuan pembanding (baseline) untuk skenario berikutnya.

### 2. Pengujian dengan Cache Aktif (Cache Warm-Up)

Tahap kedua mengaktifkan fitur _cache_ setelah data keputusan dihasilkan dari pengujian pertama.

- **Subjek**: Pengguna kedua melakukan permintaan pada kondisi jaringan yang sama (stabil).
- **Status Data**: Data hasil keputusan sebelumnya kini tersedia di dalam jaringan NDN.

**Tujuan:**

- Mengukur peningkatan performa akibat penggunaan _cache_.
- Membandingkan _latency_ antara jalur AI (_inference_) dan jalur _cache_.

### 3. Pengujian Jaringan Fluktuatif (Dynamic Condition Test)

Menguji ketahanan dan adaptivitas sistem dalam skenario dunia nyata yang tidak stabil menggunakan simulasi **Mahimahi**.

- **Status**: _Cache_ tetap dalam kondisi aktif.
- **Variasi Bandwidth**: Bervariasi antara 1 Mbps hingga 10 Mbps.
- **Interval Perubahan**: Terjadi setiap 100 milidetik.
- **Durasi**: 60 detik (disesuaikan dengan durasi video).

**Tujuan:**

- Menguji performa sistem dalam kondisi ekstrem.
- Melihat efektivitas _cache_ dalam mengurangi kebutuhan inferensi ulang.
- Mengevaluasi stabilitas keputusan bitrate yang dihasilkan.

![log](/Evaluasi/grap1.png)
![log](/Evaluasi/grap2.png)

### Hasil Pengujian 1: Analisis Baseline (Tanpa Cache)

Pada pengujian pertama ini, sistem sepenuhnya bergantung pada proses inferensi dari server AI. Hasilnya memberikan gambaran performa murni tanpa bantuan optimasi jaringan.

- **Rata-rata Latency**: Berada pada kisaran **124,25 ms**.
- **Stabilitas**: Grafik menunjukkan adanya lonjakan _latency_ signifikan pada titik waktu tertentu, dengan nilai maksimum mendekati **500 ms**.
- **Cache Hit Ratio**: Konstan di angka **0 (nol)**, mengonfirmasi bahwa seluruh permintaan diproses langsung oleh server AI karena belum ada data tersimpan di jaringan NDN.

**Kesimpulan:**
Lonjakan _latency_ hingga 500 ms mengindikasikan bahwa performa sistem berbasis AI memiliki fluktuasi tergantung pada beban komputasi. Data ini akan digunakan sebagai **baseline** untuk mengevaluasi efektivitas mekanisme _cache_ pada tahap pengujian berikutnya.

![log](/Evaluasi/grap3.png)
![log](/Evaluasi/grap4.png)

### Hasil Pengujian 2: Analisis Cache Warm-Up (Cache Aktif)

Pengujian kedua menunjukkan perubahan signifikan setelah mekanisme _cache_ diaktifkan. Jaringan mulai menunjukkan kemampuan menyediakan keputusan tanpa bergantung penuh pada server AI.

#### 1. Efektivitas Cache (Cache Hit Ratio)

- **Rata-rata CHR**: Mencapai **94,47%**.
- **Statistik**: Tercatat total **434 HIT** dan **60 MISS**.
- **Analisis**: Meskipun terdapat penurunan rasio sesekali akibat _MISS_, nilai CHR tetap tinggi, menandakan sebagian besar permintaan berhasil dilayani langsung dari jaringan NDN hasil eksplorasi pengujian pertama.

#### 2. Performa Waktu Respon (Latency)

Terdapat perbedaan performa yang jelas antara dua jalur distribusi keputusan:

- **Jalur AI (Inference)**: Rata-rata _latency_ sebesar **89,22 ms**.
- **Jalur NDN (Cache)**: Rata-rata _latency_ jauh lebih rendah, yaitu **41,90 ms**.

**Kesimpulan:**
Pemanfaatan _cache_ terbukti tidak hanya mengurangi beban komputasi pada sisi _Inference Server_, tetapi juga memberikan peningkatan kecepatan respon yang signifikan serta _latency_ yang lebih stabil dibandingkan jalur AI murni.

![log](/Evaluasi/grap5.png)
![log](/Evaluasi/grap6.png)

### Hasil Pengujian 3: Analisis Jaringan Fluktuatif (Dynamic Condition Test)

Pada pengujian terakhir, sistem diuji dalam kondisi jaringan yang fluktuatif untuk mengevaluasi performa dalam skenario yang lebih realistis menggunakan simulasi bandwidth dinamis.

#### 1. Penurunan Efektivitas Cache

Kondisi jaringan yang terus berubah memperkenalkan situasi baru yang belum tersimpan di memori jaringan:

- **Rata-rata CHR**: Menurun menjadi **58,26%**.
- **Statistik**: Tercatat **187 HIT** dan **342 MISS**.
- **Analisis**: Penurunan ini wajar karena variasi bandwidth menciptakan kombinasi metrik baru yang belum pernah dialami sistem pada pengujian sebelumnya.

#### 2. Performa Latency dalam Kondisi Ekstrem

Terjadi perbedaan performa yang sangat kontras saat jaringan mengalami tekanan (volatilitas tinggi):

- **Jalur AI (Inference)**: Rata-rata _latency_ meningkat tajam menjadi **235,86 ms**, dengan lonjakan ekstrem mencapai lebih dari **1750 ms**.
- **Jalur NDN (Cache)**: Rata-rata _latency_ tetap terjaga rendah di angka **79,42 ms**.

**Kesimpulan:**
Meskipun tingkat _Cache Hit_ menurun dalam kondisi dinamis, keberadaan _cache_ tetap berperan krusial sebagai penstabil sistem. Jalur NDN mampu mencegah lonjakan _latency_ ekstrem (hingga 1,7 detik) yang terjadi pada jalur AI, sehingga menjaga konsistensi pengalaman pengguna (_Quality of Experience_) saat jaringan tidak stabil.
