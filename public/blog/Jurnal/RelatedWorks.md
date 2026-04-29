## Related Works

Bagian ini mengkaji tiga area utama yang menjadi fondasi penelitian, yaitu **Adaptive Bitrate (ABR)** streaming, pemanfaatan **Named Data Networking (NDN)** untuk video streaming, dan konsep **distributed intelligence** dalam jaringan.

---

### 1. Adaptive Bitrate (ABR) Streaming

Perkembangan metode pemilihan _bitrate_ secara garis besar terbagi menjadi dua pendekatan:

- **Pendekatan Tradisional:** Metode seperti **BOLA** (berbasis _buffer_) dan pendekatan berbasis _throughput_ telah banyak digunakan karena stabilitasnya. Namun, metode ini sering kali kurang responsif terhadap dinamika jaringan yang sangat fluktuatif.
- **Pendekatan Pembelajaran Mesin:** Protokol seperti **Pensieve** menggunakan _Reinforcement Learning_ (RL) untuk mengoptimalkan pemilihan _bitrate_.
  - _Keterbatasan:_ Mayoritas pendekatan ini masih beroperasi secara terbatas di sisi klien (_client-side_), sehingga gagal memanfaatkan potensi koordinasi di tingkat jaringan.

### 2. Named Data Networking (NDN) dalam Video Streaming

NDN memperkenalkan paradigma komunikasi berbasis konten yang menawarkan keuntungan signifikan:

- **In-Network Caching:** Memungkinkan data dikirim dari _node_ terdekat, secara drastis mengurangi latensi dan meningkatkan efisiensi distribusi video.
- **Kesenjangan Riset:** Sebagian besar studi NDN saat ini masih berfokus pada aspek _forwarding_ dan strategi _caching_. Masih terdapat kekurangan dalam pengintegrasian mekanisme kecerdasan adaptif pada level aplikasi untuk optimasi **Quality of Experience (QoE)**.

### 3. Distributed Intelligence & In-Network Computing

Muncul pergeseran di mana jaringan kini berfungsi sebagai tempat eksekusi logika komputasi, bukan sekadar media transmisi:

- **Integrasi Kebijakan:** Terdapat peluang besar untuk memanfaatkan NDN sebagai media distribusi kebijakan adaptif berbasis pembelajaran.
- **Keputusan Kolektif:** Proses pengambilan keputusan tidak lagi dilakukan secara individual oleh klien, melainkan dapat dibagikan dan dimanfaatkan secara kolektif melalui infrastruktur jaringan.

---

> ### **Sintesis Penelitian**
>
> Berdasarkan tinjauan di atas, penelitian ini bertujuan untuk **menjembatani kesenjangan** antara pendekatan berbasis _Reinforcement Learning_ pada ABR dengan arsitektur jaringan berbasis NDN. Kami mengusulkan mekanisme pengambilan keputusan _bitrate_ yang lebih **terdistribusi, adaptif, dan terkoordinasi** di seluruh sistem.
