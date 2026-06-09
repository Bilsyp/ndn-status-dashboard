## Arsitektur Sistem

![log](/gambar/skenario-cache-hit.excalidraw.svg)
![log](/gambar/skenario-cache-miss.excalidraw.svg)

### 1. Sisi Pengguna (Consumer Layer)

### 2. Lapisan Jaringan (NDN Fabric)

Ini adalah tulang punggung sistem yang menjalankan protokol **Named Data Networking (NDN)** melalui node **NFD** (_Named Data Forwarding_). Di sinilah prinsip _Memoization_ terjadi:

- **Content Store (CS)**: Berfungsi sebagai "mading jaringan" yang menyimpan keputusan-keputusan bitrate dari AI yang sudah pernah diambil sebelumnya.
- **Cache Hit**: Jika klien mengirimkan _Interest_ dengan label situasi yang sudah ada di CS, jawaban diberikan langsung oleh router tanpa menyentuh server pusat.

### 3. Lapisan Mediator (Orchestration Layer: The Bridge)

**Bridge** adalah komponen yang bertugas sebagai penerjemah lintas protokol dengan tiga tanggung jawab utama:

1.  **WebSocket Interface**: Menjaga koneksi _real-time_ dengan klien untuk menerima data sensor asli dan mengirimkan keputusan instan jika terjadi _Cache Miss_.
2.  **HTTP Client**: Melakukan konsultasi ke Server AI menggunakan metode `POST Request` saat solusi belum tersedia di jaringan.
3.  **NDN Interface**: Mempublikasikan (_Publishing_) hasil keputusan AI kembali ke **NDN Repository** agar bisa menjadi "memo" bagi pengguna lain di masa depan.

### 4. Lapisan Kecerdasan (Inference Layer)

Pusat pemrosesan yang menampung model **Reinforcement Learning** dengan algoritma **PPO** (_Proximal Policy Optimization_).

- Server menerima data yang telah dinormalisasi dari Bridge melalui jalur HTTP.
- Model AI menganalisis fluktuasi jaringan dan memberikan rekomendasi indeks bitrate optimal untuk menjaga stabilitas pemutaran video.

---

### Alur Kerja Singkat (Dual-Path)

Sistem bekerja secara **Dual-Path**:

1.  **Cek Jaringan**: Klien mengecek "mading" jaringan melalui NDN.
2.  **Fallback (Miss)**: Jika tidak ada, klien melapor via _WebSocket_ ke Bridge.
3.  **Inference**: Bridge bertanya ke AI via _HTTP_.
4.  **Feedback Loop**: Hasil dikirim ke klien dan "dititipkan" ke jaringan NDN agar pencarian berikutnya jauh lebih cepat melalui cache.

## Detail Implementasi Teknis Komponen

Sistem ini dirancang agar setiap komponen bekerja secara tegas namun tetap terintegrasi secara _hybrid_ untuk mendukung efisiensi distribusi data.

### 1. Frontend (Client Player)

Implementasi pada sisi pengguna menjamin performa antarmuka yang ringan dan responsif.

- **Video Engine**: Menggunakan **Shaka Player** sebagai pemutar video adaptif yang dimodifikasi untuk protokol NDN.
- **Context Sensor**: Mengambil data metrik _real-time_ (buffer, throughput, CWND, dan segmen).
- **Quantizer**: Menjalankan fungsi `getQuantizedName` untuk mengubah metrik numerik menjadi label semantik (_panic_, _safe_, _slow_).
- **Dual-Stack Communication**: Mengirimkan _Interest_ ke NDN dan membuka koneksi _WebSocket_ ke Bridge secara simultan.

### 2. Backend Mediator (The Bridge)

Pusat orkestrasi berbasis **Node.js** yang menjembatani perbedaan protokol komunikasi.

- **WebSocket Server**: Menangani komunikasi dua arah (_persistent_) dengan frontend untuk keputusan instan.
- **NDN Controller**: Menggunakan library **NDNts** untuk _publishing_ hasil keputusan AI ke dalam NDN Repository.
- **HTTP Requester**: Melakukan `POST Request` ke RL Model jika data belum tersedia di _cache_.

### 3. RL Model (Inference Server)

Lapisan kecerdasan menggunakan **Python** (Flask/FastAPI) untuk melayani permintaan inferensi.

- **Algoritma PPO**: Menjalankan model _Proximal Policy Optimization_ yang telah dilatih hingga **500.000 timesteps**.
- **Environment Logic**: Menerima data ter-normalisasi dan mengembalikan indeks bitrate optimal.
- **Stateless Processing**: Fokus pada perhitungan cerdas berdasarkan input HTTP tanpa bergantung pada status koneksi NDN.

### 4. Network Layer (NDN Fabric)

Infrastruktur jaringan tempat data mengalir dan disimpan secara terdistribusi.

- **NFD (Named Data Forwarding)**: Router utama di lingkungan Linux yang mengelola jalur data berdasarkan nama.
- **Content Store (CS)**: Penyimpanan sementara di router untuk menyimpan hasil keputusan AI (**Memo**).
- **Memoization Mechanism**: Mengurangi beban kerja Backend dan AI secara drastis saat terjadi _Cache Hit_.

### 5. Emulation & Environment

Lingkungan pengujian terkontrol untuk memastikan validitas data riset.

- **Mahimahi**: Mensimulasikan berbagai skenario jaringan (stabil, fluktuatif, atau menurun).
- **Linux Environment**: Implementasi pada distribusi Linux (Ubuntu/Linux Mint XFCE) dengan manajemen _interface_ jaringan melalui **Netplan**.
