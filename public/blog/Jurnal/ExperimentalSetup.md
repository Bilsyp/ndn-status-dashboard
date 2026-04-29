# IV. Experimental Setup and Preliminary Results

Bagian ini menjelaskan implementasi awal dan pengujian terhadap _framework_ yang diusulkan. Fokus utama pengujian saat ini adalah memvalidasi integrasi antar komponen sistem, khususnya mekanisme _state quantization_, pencarian keputusan berbasis NDN, serta interaksi dengan sistem AI melalui _bridge_.

---

### A. Implementation Setup

_Framework_ diimplementasikan dalam lingkungan _end-to-end_ berbasis Linux dengan spesifikasi komponen sebagai berikut:

- **Video Player:** Menggunakan **Shaka Player** yang telah dimodifikasi untuk mendukung mekanisme adaptasi berbasis NDN.
- **Network Stack:** Menggunakan **NDNts** untuk menangani pengiriman _Interest_ dan penerimaan _Data_ langsung di sisi klien.
- **Decision Module:** Diimplementasikan di sisi klien untuk menangani kuantisasi _state_, pembentukan nama "memo", dan logika _cache-first/AI-fallback_.
- **Inference Bridge:** Menggunakan **WebSocket** sebagai perantara komunikasi antara klien NDN dan _AI server_.

### B. Video Content and Encoding Profile

Konten video berdurasi ±3 menit 55 detik dengan profil _bitrate_ sebagai berikut:

- **240p:** ~0.55 Mbps
- **360p:** ~0.95 Mbps
- **480p:** ~1.67 Mbps
- **720p:** ~3.40 Mbps

Rentang ini dipilih untuk menguji kemampuan sistem dalam beradaptasi pada batas-batas transisi kualitas yang realistis.

### C. Network Emulation Scenarios

Evaluasi dilakukan menggunakan **Mahimahi** untuk mengemulasi tiga skenario jaringan:

1.  **Stable Network (Baseline):** Bandwidth ~5.0 Mbps, latensi 40 ms. Target: Kualitas tinggi konsisten.
2.  **Fluctuating Network (Real-World):** Bandwidth 0.8 – 3.5 Mbps, latensi 30–150 ms. Target: Penanganan perubahan dinamis.
3.  **Degrading Network (Stress Test):** Bandwidth 0.4 – 1.0 Mbps (menurun), latensi 100–300 ms. Target: Batas stabilitas pemutaran.

### D. Relevance to Proposed Framework

Variasi kondisi jaringan di atas akan menghasilkan kombinasi _state_ berbeda yang dipetakan ke dalam nama memo (termasuk segmentasi waktu per 10 detik). Kondisi stabil diharapkan mendorong tingkat **cache hit** yang tinggi, sedangkan kondisi fluktuatif akan memicu penggunaan **inferensi AI melalui bridge**.

### E. Preliminary Quantitative Insights

Pengujian awal dilakukan menggunakan dua klien untuk memvalidasi efektivitas mekanisme _decision reuse_:

- **Klien Pertama (Exploration Node):** Berperan mencari kebijakan baru. Karena keputusan belum tersedia di jaringan, klien ini memicu inferensi melalui _bridge_ dan menyimpan hasilnya ke jaringan NDN.
- **Klien Kedua:** Berjalan setelah klien pertama dalam kondisi jaringan serupa. Klien ini bertindak sebagai penerima manfaat dengan memanfaatkan keputusan yang telah tersedia di _cache_ jaringan (_cache hit_).

#### **Observed Effects**

1. **Reduksi Latensi Keputusan:** Pada kondisi _cache hit_, klien kedua melewati proses inferensi AI sepenuhnya. Pengamatan awal menunjukkan **penurunan latensi respons lebih dari 50%** dibandingkan jalur inferensi melalui _bridge_.
2. **Efisiensi Penggunaan Cache:** Keberhasilan klien kedua menunjukkan bahwa mekanisme kuantisasi _state_ dan penamaan memo mampu menghasilkan kecocokan kondisi yang efektif, mengurangi beban inferensi berulang.
3. **Stabilitas Adaptasi:** Proses adaptasi pada klien kedua menjadi lebih stabil dengan transisi kualitas yang lebih terkontrol karena menggunakan keputusan yang telah tervalidasi sebelumnya.

### F. Comparative Discussion (Conceptual)

Secara konseptual, perbedaan antara _framework_ yang diusulkan dengan pendekatan lain adalah:

| Pendekatan                  | Mekanisme Utama             | Karakteristik                                                                                           |
| :-------------------------- | :-------------------------- | :------------------------------------------------------------------------------------------------------ |
| **HTTP-based ABR**          | Observasi lokal & heuristik | Sensitif terhadap fluktuasi, _switching_ bitrate tinggi.                                                |
| **AI-based ABR (No Reuse)** | Inferensi AI tiap klien     | Adaptasi berkualitas tinggi, namun latensi & beban komputasi tinggi.                                    |
| **Proposed Framework**      | _Cache-Assisted + Bridge_   | Memanfaatkan _shared intelligence_; hasil inferensi dapat digunakan kembali untuk mempercepat adaptasi. |

### G. Future Evaluation Plan

Langkah lanjutan akan difokuskan pada evaluasi kuantitatif skala besar untuk mengukur metrik **QoE** secara komprehensif, mencakup rata-rata _bitrate_, frekuensi _rebuffering_, dan efisiensi _distributed intelligence_ pada topologi jaringan yang lebih kompleks.
