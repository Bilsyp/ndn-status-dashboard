## 1. 🎯 Introduction

_(Bagian ini akan dikembangkan lebih lanjut nanti)_

### Masalah: Adaptive Streaming di Network Dinamis

Tantangan utama yang dihadapi dalam riset ini adalah optimasi pengiriman konten video pada kondisi jaringan yang fluktuatif. Berikut adalah poin-poin permasalahannya:

1.  **Keterbatasan Arsitektur Host-Centric:** Arsitektur internet saat ini (TCP/IP) berfokus pada lokasi (IP address). Hal ini kurang efisien untuk distribusi konten masif seperti video streaming yang membutuhkan pengiriman data berdasarkan nama konten (content-centric).
2.  **Variabilitas Bandwidth:** Pada jaringan dinamis, ketersediaan bandwidth berubah dengan cepat. Protokol tradisional sering kali mengalami _latency_ tinggi atau _buffering_ karena mekanisme _request-response_ yang tidak cukup fleksibel menghadapi perubahan jalur atau kepadatan jaringan.
3.  **Inkonsistensi Quality of Experience (QoE):** Algoritma Adaptive Bitrate (ABR) standar sering kali kesulitan melakukan estimasi _throughput_ yang akurat di lingkungan yang tidak stabil, sehingga mengakibatkan penurunan kualitas visual atau interupsi pemutaran video.
4.  **Optimasi Pengambilan Data (Fetching):** Dalam riset ini, masalah utamanya adalah bagaimana memanfaatkan keunggulan **Named Data Networking (NDN)**—seperti _in-network caching_ dan _interest-data exchange_—untuk memastikan pengambilan _chunk_ video tetap optimal meskipun kondisi jaringan sedang mengalami gangguan.

**Solusi yang Sedang Dikembangkan:**
Mengintegrasikan NDN dengan **Shaka Player** melalui **WebSocket Bridge** agar keputusan pemilihan bitrate (ABR) dapat dilakukan secara lebih cerdas (AI-driven) berdasarkan data jaringan yang dikumpulkan langsung dari lingkungan NDN.

## 2. 🧠 Background / Concept

Bagian ini merangkum pilar utama yang digabungkan dalam sistem ini, fokus pada peran fungsional setiap komponen dalam riset.

### ABR (Adaptive Bitrate): Throughput vs Buffer-Based

Algoritma ABR menentukan kualitas video yang diminta oleh player secara real-time.

- **Throughput-Based:** Menghitung kecepatan unduh _chunk_ sebelumnya untuk memprediksi kondisi jalur. Kelemahannya adalah sering terjadi _over-estimation_ pada jaringan dinamis.
- **Buffer-Based (BBA):** Fokus pada level keterisian buffer di player. Jika buffer melimpah, kualitas dinaikkan. Pendekatan ini lebih stabil terhadap interupsi kecil namun bisa kurang agresif dalam memanfaatkan bandwidth yang tersedia.

### NDN (Named Data Networking): Naming & Caching

Berbeda dengan TCP/IP yang bersifat _host-centric_, NDN bersifat _content-centric_.

- **Naming:** Data diidentifikasi dengan nama unik (misal: `/video/segmen1/1080p`). Hal ini memudahkan pengambilan data secara paralel dan efisien.
- **In-Network Caching:** Router NDN memiliki kemampuan menyimpan data secara temporer (_Content Store_). Jika data yang sama diminta kembali, router bisa langsung merespons tanpa harus kembali ke _producer_ asli, yang secara drastis mengurangi latensi.

### AI / Memoization: Decision Reuse

Pemanfaatan AI di sini bukan sekadar prediksi, melainkan optimasi keputusan.

- **AI Bridge:** Menggunakan WebSocket untuk mengirim parameter jaringan dari lingkungan NDN ke model AI.
- **Memoization (Decision Reuse):** Strategi untuk menyimpan hasil keputusan bitrate yang telah dibuat sebelumnya untuk kondisi jaringan tertentu. Jika kondisi yang serupa terdeteksi kembali, sistem akan melakukan _reuse_ keputusan tersebut untuk mempercepat waktu respons dan mengurangi beban komputasi.

## 3. 🏗️ System Design (Core Architecture)

Bagian ini menjelaskan struktur utama dan alur kerja sistem yang mengintegrasikan pengiriman data berbasis nama dengan pengambilan keputusan cerdas.

### 📌 Arsitektur Sistem

Arsitektur ini terdiri dari tiga lapisan utama yang saling berinteraksi secara _real-time_:

- **Client Player (Front-End):** Menggunakan **Shaka Player** yang telah dimodifikasi untuk mendukung protokol NDN. Bertugas memonitor kondisi internal player (seperti _buffer level_) dan meminta _chunk_ video berdasarkan rekomendasi bitrate.
- **NDN Node (Network Layer):** Berjalan di atas library `ndnts` untuk menangani paket _Interest_ dan _Data_. Mengelola mekanisme _caching_ di level node untuk mempercepat distribusi segmen video yang populer.
- **AI / Memoization Layer (Decision Engine):** Terdiri dari **AI Agent** yang menghitung bitrate optimal dan **Memoization Table** yang menyimpan pasangan "Kondisi Jaringan -> Keputusan Bitrate" untuk meminimalkan beban komputasi melalui _decision reuse_.

### 📌 Flow Sistem

Alur kerja pengambilan keputusan bitrate mengikuti logika berikut untuk memastikan efisiensi maksimal:

1.  **Request Initiation:** Player bersiap meminta _chunk_ video berikutnya dan mengirimkan parameter jaringan saat ini (latency, throughput, buffer) ke sistem.
2.  **Memoization Check:** Sistem memeriksa **Memo Table**.
    - _Jika ada (Hit):_ Langsung gunakan **Decision** yang tersimpan.
    - _Jika tidak ada (Miss):_ Lanjut ke tahap berikutnya.
3.  **AI/Fallback Processing:** Parameter dikirim ke **AI Agent** untuk dihitung secara mendalam. Hasil keputusan baru kemudian disimpan kembali ke dalam memo.
4.  **Bitrate Application:** Player menerima instruksi bitrate, lalu mengirimkan _Interest Packet_ ke **NDN Node** untuk mengambil segmen video yang sesuai.

![Flow Cache Hit](../gambar/skenario-cache-hit.excalidraw.svg)
![Flow Cache Miss](../gambar/skenario-cache-miss.excalidraw.svg)

## 4. ⚙️ Experimental Setup

Bagian ini merinci konfigurasi laboratorium riset dan parameter yang digunakan untuk menguji performa sistem NDN-ABR-AI.

### 🎮 ABR Modes (Skenario Pengujian)

Kami membandingkan tiga pendekatan untuk memvalidasi efisiensi sistem:

- **Throughput-Based:** Baseline menggunakan estimasi kecepatan jaringan tradisional.
- **Buffer-Based:** Baseline menggunakan estimasi kecepatan jaringan tradisional.
- **NDN + AI:** Sistem usulan yang mengintegrasikan NDN dengan AI Layer dan mekanisme _decision reuse_.

### 🌐 Network Scenario

Pengujian dilakukan menggunakan **Mahimahi Network Emulator** dengan tiga skenario utama:

1. **Stable:** Bandwidth konsisten untuk melihat batas atas performa.
2. **Fluctuating:** Perubahan bandwidth yang dinamis untuk menguji responsivitas algoritma.
3. **Bad:** Kondisi _low-bandwidth_ dan _high-latency_ untuk menguji ketahanan sistem.

### 📦 Configuration Details

- **Video Config:** Menggunakan _bitrate ladder_ dengan rentang **0.4 Mbps – 3.3 Mbps**.
- **Player Config:** **BufferingGoal** ditetapkan pada **30 detik** untuk menyeimbangkan antara latensi awal dan stabilitas pemutaran.

### 👥 Multi-user Setup

- **Throughput-Based:** Baseline menggunakan estimasi kecepatan jaringan tradisional.

Untuk menguji skalabilitas dan efisiensi _caching_:

- **3 User Environment:** Simulasi dilakukan dengan 3 user aktif secara bersamaan.
- **Dynamic Traces:** Setiap user menggunakan _network trace_ (rekaman kondisi jaringan) yang berbeda di Mahimahi untuk mensimulasikan kondisi riil yang heterogen.

## 5. 📊 Evaluation Metrics

Performa sistem dievaluasi berdasarkan tiga metrik utama yang secara langsung mempengaruhi **Quality of Experience (QoE)** pengguna:

### 1. Average Bitrate

Mengukur rata-rata tingkat _throughput_ video yang berhasil di-render oleh player.

- **Fokus:** Menilai sejauh mana sistem mampu memberikan kualitas visual tertinggi (mendekati 3.3 Mbps) di berbagai kondisi jaringan.

### 2. Rebuffering Ratio

Rasio antara total waktu _stalling_ (buffering) dengan total durasi pemutaran video.

- **Fokus:** Menilai stabilitas sistem. Penggunaan NDN caching dan AI diharapkan dapat meminimalkan interupsi pemutaran, menjaga rasio ini sedekat mungkin dengan nol.

### 3. Switch Frequency

Frekuensi perubahan tingkat bitrate selama sesi streaming berlangsung.

- **Fokus:** Menilai kenyamanan visual. Pergantian bitrate yang terlalu sering dapat mengganggu pengalaman menonton. Sistem yang ideal adalah yang mampu mempertahankan kualitas tinggi dengan jumlah perpindahan (_switching_) yang minimal.

## 6. 📈 Results (Raw Data)

Bagian ini menyajikan data mentah hasil pengujian pada skenario **Fluctuating** (Jaringan Dinamis). Data berikut merupakan hasil observasi langsung dari sistem sebelum dilakukan analisis mendalam.

### Scenario: Network

| Algorithm               | Avg. Bitrate (Mbps) | Rebuffering Ratio (%) | Switch Frequency |
| :---------------------- | :------------------ | :-------------------- | :--------------- |
| **Throughput-Based**    | _sedang diuji_      | _sedang diuji_        | _sedang diuji_   |
| **Buffer-Based**        | _sedang diuji_      | _sedang diuji_        | _sedang diuji_   |
| **NDN + AI (Proposed)** | _sedang diuji_      | _sedang diuji_        | _sedang diuji_   |

## 7. 🔍 Discussion: Arsitektur Strategis & Analisis Performa

Bagian ini membedah alasan teknis di balik pemilihan arsitektur Hybrid NDN-AI dan memetakan batasan operasional antara metode konvensional dengan sistem yang dikembangkan.

### 7.1. Mengapa NDN + AI? (The Power of Decision Reuse)

Dalam sistem ABR tradisional (seperti HTTP-based), setiap _client_ adalah "pulau terisolasi". Jika terjadi kemacetan jaringan, setiap _client_ harus melakukan kalkulasi ulang secara mandiri. Integrasi NDN dan AI di sini mengubah paradigma tersebut:

- **Caching Keputusan (Memoization):** Berbeda dengan sistem _client-server_ biasa, NDN memungkinkan hasil inferensi AI disimpan sebagai _Content Store_.
- **Sinergi Bridge & Router:** Saat terjadi _Cache Hit_, beban komputasi di _Inference Server_ hilang sepenuhnya. Jaringan tidak lagi hanya memindahkan data, tapi "mengingat" keputusan cerdas yang pernah diambil untuk situasi tertentu (misal: label _Panic_ atau _Slow_).
- **Efisiensi Kolektif:** Sistem ini unggul dalam skenario _multi-node_ karena adanya distribusi keputusan. Satu _Pioneer User_ membayar "harga" komputasi (_latency_), sementara _Follower Users_ menikmati hasilnya secara instan.

### 7.2. Kapan Metode Konvensional Dianggap Cukup?

Riset ini tidak menafikan metode klasik. Ada kondisi di mana algoritma sederhana tetap menjadi pilihan rasional:

- **Throughput-Based:** Sangat efektif pada skenario **Jaringan Statis**. Jika bandwidth tersedia luas dan stabil (misal: koneksi kabel _dedicated_), penggunaan AI hanya akan menjadi _overhead_ komputasi yang tidak memberikan peningkatan _Quality of Experience_ (QoE) yang signifikan.
- **Buffer-Based:** Cukup memadai pada perangkat dengan kapasitas memori besar dan pada konten yang tidak sensitif terhadap _latency_ awal (_non-real-time_). Selama buffer aman, perhitungan kompleksitas jaringan bisa diabaikan.

### 7.3. Posisi Riset terhadap Framework Pensieve

Penting untuk dicatat bahwa sistem ini dikembangkan dengan mengambil inspirasi dari logika **Pensieve** (_Deep Reinforcement Learning_ untuk ABR). Namun, terdapat perbedaan fundamental dalam implementasi:

- **Framing Arsitektur:** Jika Pensieve orisinal fokus pada model saraf di sisi _server/client_ HTTP, riset ini melakukan _framing_ ulang menggunakan protokol NDN untuk mengatasi masalah redundansi _request_.
- **Status Pengujian:** Saat ini, sistem berada pada tahap validasi mekanisme _Bridge_ dan _In-network Caching_. Belum dilakukan uji komparatif 1:1 secara langsung dengan _framework_ Pensieve asli dalam lingkungan yang identik. Fokus saat ini adalah membuktikan bahwa _Decision Reuse_ melalui NDN dapat berjalan secara fungsional sebelum masuk ke tahap adu performa model AI.

### 7.4. Ringkasan Temuan

Kombinasi **NDN + AI** menunjukkan potensi peningkatan signifikan pada kondisi jaringan yang fluktuatif. Keunggulan utamanya bukan hanya pada akurasi prediksi bitrate, melainkan pada kecepatan distribusi keputusan melalui jalur _Cache Hit_. Hal ini meminimalkan interaksi dengan _Inference Server_ yang secara teori akan menurunkan _end-to-end latency_ pada permintaan konten yang berulang di lingkungan terdistribusi.
