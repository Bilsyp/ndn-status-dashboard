# Abstrak

**Sistem adaptive video streaming** menghadapi tantangan dalam menjaga **Quality of Experience (QoE)** pada kondisi jaringan yang dinamis, terutama karena pendekatan berbasis HTTP/DASH masih mengandalkan pengambilan keputusan secara terisolasi di sisi klien. Di sisi lain, **Named Data Networking (NDN)** menawarkan mekanisme _in-network caching_ yang berpotensi meningkatkan efisiensi distribusi konten, namun pemanfaatannya untuk pengambilan keputusan adaptif berbasis pembelajaran masih terbatas.

Penelitian ini mengusulkan sebuah _framework_ berbasis **cache-assisted intelligence** yang mengintegrasikan mekanisme pengambilan keputusan _bitrate_ dengan kemampuan penyimpanan dan distribusi di dalam jaringan NDN.

### **Kontribusi Utama:**

- **Strategi Cache-First, AI-Fallback:** Keputusan _bitrate_ direpresentasikan sebagai _named data_ yang dapat digunakan kembali oleh klien lain dengan kondisi jaringan serupa.
- **Mekanisme Bridge:** Ketika keputusan tidak tersedia di _cache_, permintaan inferensi diteruskan ke sistem AI eksternal melalui komponen _bridge_, menghindari beban komputasi berat di sisi klien.

### **Metodologi & Pengujian:**

Implementasi dilakukan pada lingkungan _end-to-end_ menggunakan **Shaka Player**, **NDNts**, serta emulasi jaringan berbasis **Mahimahi**. Pengujian awal dengan skenario _multi-client_ menunjukkan bahwa mekanisme _decision reuse_ mampu:

1. Mengurangi kebutuhan inferensi berulang.
2. Mempercepat waktu pengambilan keputusan pada kondisi _cache hit_.
3. Menurunkan latensi respons secara signifikan.
4. Meningkatkan stabilitas adaptasi _bitrate_ pada klien.

### **Kesimpulan:**

Temuan ini menunjukkan bahwa jaringan tidak hanya berperan sebagai media distribusi data, tetapi juga dapat berfungsi sebagai **lapisan penyimpanan pengetahuan adaptif** yang mendukung pengambilan keputusan secara kolektif di tingkat sistem.

---

**Kata Kunci:** _Adaptive Video Streaming, Named Data Networking (NDN), Cache-Assisted Intelligence, Decision Reuse, Quality of Experience (QoE)._
