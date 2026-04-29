# III. Proposed Framework

Bagian ini menjelaskan _framework_ yang diusulkan untuk meningkatkan efisiensi **Adaptive Bitrate (ABR)** pada arsitektur **Named Data Networking (NDN)** melalui pendekatan _cache-assisted intelligence_ dengan dukungan inferensi berbasis AI eksternal.

_Framework_ ini mengadopsi strategi **cache-first, AI-fallback**, di mana keputusan _bitrate_ diambil secara cepat dari jaringan jika tersedia, dan hanya menggunakan inferensi AI ketika diperlukan.

---

### A. System Architecture

_Framework_ ini terdiri dari empat komponen utama yang bekerja secara sinergis:

1.  **Video Server:** Menyediakan konten video dalam berbagai _bitrate_ beserta metadata yang diakses melalui mekanisme _Interest-Data exchange_.
2.  **NDN Network:** Berfungsi sebagai media distribusi sekaligus penyimpanan _in-network caching_. Selain menyimpan segmen video, jaringan menyimpan keputusan _bitrate_ dalam bentuk _named data_ untuk digunakan kembali oleh klien lain.
3.  **Bridge:** Bertindak sebagai perantara antara lingkungan NDN dan sistem AI eksternal. Bridge menerjemahkan permintaan klien ke format model AI dan mengembalikan hasil inferensi ke jaringan sebagai konten NDN.
4.  **Intelligent Client:** Pengendali adaptasi yang mengorkestrasi pengambilan keputusan. Klien memprioritaskan pencarian keputusan di jaringan sebelum memicu inferensi melalui _bridge_.

### B. State Quantization and Naming

Untuk memungkinkan pencarian keputusan yang efisien, kondisi jaringan direpresentasikan melalui proses **kuantisasi state** ke dalam nama terstruktur:

- **Parameter Kuantisasi:**
  - **Buffer Level:** Dikategorikan menjadi label diskret (contoh: _panic, safe, full_).
  - **Bandwidth:** Dikategorikan berdasarkan kecepatan (contoh: _slow, mid, fast_).
  - **Congestion Window (CWND):** Dikategorikan berdasarkan stabilitas (contoh: _congested, stable, wide_).
  - **Kuantisasi Waktu (Temporal Grouping):**
    Segmen waktu dihitung per **10 detik** untuk merepresentasikan dinamika temporal secara efisien:
    - Detik 0–9 masuk ke dalam grup `s0`.
    - Detik 10–19 masuk ke dalam grup `s1`.
    - Dan seterusnya (misal: detik 20-29 menjadi `s2`).
- **Struktur Penamaan NDN:** Hasil kuantisasi dikombinasikan menjadi kunci pencarian (_key_), misalnya:  
   ` /ndn/memo/s3/safe/mid/stable`

### C. Cache-Assisted Decision Mechanism

_Framework_ ini mengimplementasikan mekanisme pengambilan keputusan dengan pendekatan **cache-first**:

- **Proses Pencarian:** Setelah segmen selesai diunduh, klien membangun nama "memo" berdasarkan _state_ saat ini untuk mencari keputusan di jaringan.
- **Cache Hit:** Jika ditemukan, klien langsung menggunakan nilai tersebut. Hal ini memungkinkan pengambilan keputusan dengan latensi sangat rendah tanpa komputasi tambahan.
- **Cache Miss:** Jika tidak ditemukan, klien mengirimkan permintaan ke sistem AI melalui _bridge_. Hasil inferensi yang diterima akan digunakan oleh klien dan disimpan kembali ke jaringan sebagai referensi masa mendatang.

### D. Workflow

Alur kerja sistem secara berurutan adalah sebagai berikut:

1.  **Observasi:** Klien memperbarui estimasi kondisi jaringan setelah pengunduhan segmen selesai.
2.  **Representasi Data:** Membangun _state_ terkuantisasi (untuk _cache_) dan _observations_ mentah (untuk AI).
3.  **Pencarian (Lookup):** Klien mengirimkan permintaan pencarian nama "memo" ke jaringan NDN.
4.  **Eksekusi Keputusan:**
    - **Jika Hit:** Menggunakan keputusan dari _cache_ untuk penyesuaian kualitas.
    - **Jika Miss:** Meneruskan permintaan ke sistem AI melalui _bridge_ untuk inferensi.
5.  **Publikasi:** Hasil inferensi baru dipublikasikan kembali ke jaringan NDN agar dapat dimanfaatkan oleh klien lain sebagai pengetahuan kolektif.

---

> **Catatan:** Melalui mekanisme ini, ketergantungan pada inferensi AI yang berat secara bertahap berkurang seiring dengan bertambahnya basis pengetahuan di dalam _cache_ jaringan.
