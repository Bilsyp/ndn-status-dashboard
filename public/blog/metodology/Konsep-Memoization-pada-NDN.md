## Penjelasan Konsep Memoization pada NDN (Multi-Tier Quantization untuk ABR)

Secara garis besar, fungsi _memoization_ ini berfungsi sebagai **penerjemah kondisi riil client menjadi sebuah "Nama NDN" (NDN Name)** yang terstandardisasi. Nama inilah yang menjadi kunci utama (_cache key_) dalam mekanisme _memoization_.

### 1. Filosofi Utama: Mengapa Memoization Ini Penting?

Pada arsitektur jaringan konvensional (IP), client harus mengirimkan data mentah (_raw state_) ke server, lalu server menghitung algoritma ABR untuk menentukan bitrate terbaik.

Namun, dalam **NDN (Named Data Networking)**, fokus utamanya adalah **Data/Konten**, bukan lokasi (IP). Dengan mengubah kondisi client (buffer dan throughput) menjadi sebuah **Nama NDN yang terkuantisasi**, kita bisa memanfaatkan fitur _Content Store_ (cache) bawaan NDN. Jika ada client lain (atau client yang sama di waktu berbeda) memiliki kondisi jaringan yang mirip, NDN tidak perlu menghitung ulang algoritma ABR dari nol. NDN cukup mengambil hasil keputusan bitrate yang sudah tersimpan (_memoized_) berdasarkan komponen nama tersebut.

### 2. Breakdown Mekanisme Kode (Cara Kerja Sistem)

Fungsi _memoization_ melakukan penyederhanaan ruang keadaan (_state space reduction_) melalui dua tahap klusterisasi (**Multi-Tier Quantization**):

#### A. Klusterisasi Buffer (State Level)

Fungsi pertama-tama memetakan metrik buffer client (dalam satuan detik) ke dalam 4 kategori kritis:

- <= 5.1 detik **Panic**: Kondisi kritis, berisiko tinggi terjadi
  _stalling_ (video macet)

- 5.1 - 15.0 detik **Low**: Batas waspada, buffer mulai menipis

- 15.0 - 25.0 detik **Safe**: Kondisi aman dan ideal.

- 25.0 detik **Abundant**: Buffer sangat melimpah.

#### B. Klusterisasi Throughput (Bandwidth Level)

Fungsi kedua memetakan kecepatan jaringan (throughput dalam Mbps) ke dalam 4 kategori yang disesuaikan dengan profil target bitrate video:

- < 1.2 Mbps **Critical**: Jaringan sangat lambat.
- 1.2 - 2.3 Mbps **Fair**: Jaringan standar/cukup.
- 2.3 - 3.8 Mbps **Good**: Jaringan bagus dan stabil.
- ">= 3.8 Mbps **Excellent**: Jaringan sangat cepat.

### 3. Output Nama NDN dan Pencarian pada Node

Dari kombinasi 4 kategori buffer dan 4 kategori throughput, terciptalah **16 kombinasi keadaan unik**. Kode ini menghasilkan format nama NDN sebagai berikut:

**Format Nama: /ndn/memo/[bufferBucket]/[tpBucket]**

**Contoh Kasus:**

Jika client saat ini memiliki buffer = 4.5 detik dan throughput = 3.0 Mbps, maka fungsi akan menghasilkan nama:

> **/ndn/memo/panic/good**

#### Bagaimana Node NDN Memproses Nama Ini?

1.  **Pencarian di Cache (Memoization Search):** Client akan mengirimkan _Interest Packet_ dengan nama /ndn/memo/panic/good.
2.  **Node Terdekat Merespons:** Node NDN (bisa _router_ terdekat atau CS lokal) akan memeriksa apakah nama tersebut sudah memiliki data
    keputusan bitrate (misalnya: "Rekomendasi Bitrate: 1080p" atau
    "Rekomendasi Bitrate: 480p").
3.  **Efisiensi Komputasi:** Jika ada (_Cache Hit_), keputusan bitrate langsung dikembalikan ke client dalam hitungan milidetik tanpa perlu
    mengeksekusi ulang algoritma ABR yang berat di sisi
    kontroler/server.

![alur sistem pengujian 3](/gambar/memoization/image.png)

## Keuntungan Pendekatan Ini dalam ABR

**Reduksi Ruang State (State Space Reduction):** Tanpa kuantisasi ini, variasi nilai buffer (misal: 5.12, 5.13, 5.14) dan throughput akan menghasilkan kombinasi yang tak terbatas, membuat cache jaringan tidak efektif. Dengan 16 kombinasi tetap, _cache hit ratio_ di node NDN akan meningkat drastis.

**Mengurangi Latensi Keputusan ABR:** Client mendapatkan rekomendasi bitrate lebih cepat, sehingga adaptasi video terhadap perubahan jaringan menjadi jauh lebih responsif.

**Mengurangi Beban Kerja (Overhead) Server:** Algoritma ABR tidak perlu terus-menerus menghitung ulang metrik yang mirip secara berulang-ulang.

## Kelemahan Sistem Memoization ABR pada NDN

### 1. Masalah _Granularity Loss_ (Kehilangan Presisi Kondisi Riil)

Kuantisasi mengubah data kontinu yang sensitif menjadi kategori diskrit (hanya ada 4 pilihan). Hal ini memicu masalah di area perbatasan (_boundary area_).

**Efek Pingpong (_Osclilation_):** Misalnya, batas buffer antara panic dan low adalah **5.1**. Jika kondisi buffer client tidak stabil dan naik-turun tipis di angka **5.0** lalu **5.2**, lalu **5.0** lagi, maka Nama NDN akan terus melompat dari /ndn/memo/panic/... ke /ndn/memo/low/....

**Dampaknya:** Client akan mengalami perubahan bitrate video yang terlalu sering dan drastis (video mendadak buram lalu jernih secara agresif), yang justru merusak kenyamanan menonton (_Quality of Experience_ / QoE).

**Ketidakadilan Keputusan (Unfair Decision):** Client dengan throughput **2.4 Mbps** dan client dengan **3.7 Mbps** sama-sama dikategorikan sebagai good. Padahal, kapasitas jaringan mereka berbeda jauh. Client dengan 3.7 Mbps berhak mendapatkan bitrate yang lebih tinggi, namun karena dicatat dalam "kotak" yang sama, mereka akan menerima rekomendasi bitrate yang persis sama.
