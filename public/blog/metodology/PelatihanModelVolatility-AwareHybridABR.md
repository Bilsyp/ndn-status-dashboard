## Deskripsi Dataset

Dataset yang digunakan dalam pengembangan model ini bersumber dari log _bandwidth_ jaringan **4G/LTE di Belgia**. Data ini dikembangkan oleh tim peneliti **IDLab, Universitas Ghent (imec)**, yang juga menjadi referensi utama pada proyek riset ternama, **Pensieve**.

---

### 1. Cakupan dan Skenario Penelitian

Meskipun dataset asli mencakup berbagai kondisi, penelitian ini secara spesifik berfokus pada:

- **Jumlah Data:** 8 buah _trace log_.
- **Skenario Mobilitas:** _Foot_ (pejalan kaki).
- **Waktu Pengumpulan:** Desember 2015 hingga Februari 2016.
- **Lokasi:** Wilayah kota Ghent, Belgia, dan sekitarnya.

![Log1](/trace/report_foot_log_0001.png)
![log2](/trace/report_foot_log_0002.png)
![log3](/trace/report_foot_log_0003.png)
![log4](/trace/report_foot_log_0004.png)
![log5](/trace/report_foot_log_0005.png)
![log6](/trace/report_foot_log_0006.png)
![log7](/trace/report_foot_log_0007.png)
![log8](/trace/report_foot_log_0008.png)

### 2. Struktur dan Informasi Log

Setiap entri dalam _log dataset_ menyediakan metrik penting untuk evaluasi _adaptive streaming_, antara lain:

- **Timestamp:** Waktu dalam milidetik (sejak _epoch_ atau awal percobaan).
- **Koordinat GPS:** Lokasi presisi (_latitude_ dan _longitude_).
- **Volume Data:** Jumlah data yang diterima sejak titik sebelumnya (dalam _byte_).
- **Durasi:** Interval waktu antar pengukuran (dalam milidetik).

### 3. Perangkat dan Karakteristik Jaringan

Proses pengambilan data dilakukan dengan spesifikasi teknis sebagai berikut:

- **Perangkat:** _Smartphone_ Huawei P8 Lite.
- **Protokol:** Pengunduhan file besar melalui HTTP pada jaringan 4G nyata.
- **Dinamika Throughput:**
  - **Kondisi Optimal:** Kecepatan dapat mencapai hingga **95 Mb/s**.
  - **Kondisi Buruk:** Penurunan signifikan terjadi pada area dengan hambatan fisik atau gangguan sinyal, seperti di dalam terowongan.

### 4. Klasifikasi Mobilitas

Selain skenario pejalan kaki, dataset asli Universitas Ghent mencakup kategori mobilitas lain:

1.  **Foot** (Pejalan kaki) — _Digunakan dalam penelitian ini_.
2.  **Bicycle** (Bersepeda).
3.  **Public Transport** (Bus, trem, dan kereta api).
4.  **Car** (Mobil pribadi).

---

> **Informasi Akses:** Secara keseluruhan, dataset ini terdiri dari **40 trace log** dengan total durasi pemantauan aktif sekitar **5 jam**. Dataset ini tersedia untuk publik melalui situs resmi Universitas Ghent.
