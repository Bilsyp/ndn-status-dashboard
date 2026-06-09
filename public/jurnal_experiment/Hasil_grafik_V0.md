# **Evaluasi Performa Algoritma ABR pada Arsitektur NDN dan HTTP**

## **1\. Pendahuluan dan Arsitektur Pengujian**

Penelitian ini melakukan eksperimen adaptasi bitrate untuk membandingkan performa algoritma **ABR (_Adaptive Bitrate_)** pada dua arsitektur jaringan yang berbeda, yaitu:

- **Named Data Networking (NDN)**
- **HTTP Konvensional**

Pengujian dilakukan menggunakan satu aplikasi web yang sama, yang dirancang mampu mendukung perpindahan algoritma dan arsitektur pengujian secara dinamis.

## **2\. Parameter dan Skenario Pengujian**

- **Durasi Video:** 3 menit 44 detik (disamakan untuk semua pengujian).
- **Sumber Video HTTP:** Server konvensional.
- **Sumber Video NDN:** Memanfaatkan keunggulan _multimode_ yang secara struktural berbeda karena melibatkan distribusi node.

Fokus utama pengujian ini adalah mengukur efektivitas algoritma ABR baru berbasis **Kecerdasan Buatan (AI)** ketika diintegrasikan dengan NDN _multimode_. Pada arsitektur ini:

- Hasil keputusan AI disimpan di node sebagai _cache_ menggunakan konsep **_reuse bitrate_**.
- _Reuse bitrate_ disesuaikan melalui sistem penamaan (_naming system_) kategori kondisi jaringan klien.
- Sebagai pembanding, pengujian pada sisi HTTP menggunakan logika konvensional berbasis **_buffer-based_** dan **_throughput-based_** yang dibuat semirip mungkin dengan kondisi umum.

## **3\. Metodologi dan Penyesuaian Skenario**

Pengujian ini dilakukan menggunakan **Mahimahi** untuk mereplikasi _network traces_ nyata dan **Selenium** sebagai alat otomatisasi pada sisi klien.

### **Kendala Skenario Awal**

- **Rencana Awal:** Menggunakan 40 _network trace logs_ untuk menguji kemampuan adaptasi algoritma ABR dan sistem jaringan _multimode_ pada NDN.
- **Masalah:** Skenario tersebut menghasilkan _error_ pada aplikasi web penguji. Hal ini menyebabkan data rekaman **QoE (_Quality of Experience_)** menjadi tidak beraturan dan beberapa nilai metrik hilang.
- **Solusi:** Karena penyebab _error_ belum diketahui secara pasti, strategi dialihkan menggunakan metode **_1-round running test_** dengan membatasi jumlah data menjadi **8 _trace logs_**.

## **4\. Landasan Pemilihan 8 Trace Logs**

Pemilihan 8 _trace logs_ ini didasarkan pada data _testing_ yang digunakan saat proses pelatihan agent _Reinforcement Learning_ (RL) NDN:

- _Agent_ RL sebelumnya dilatih menggunakan **32 _trace logs_** dan dievaluasi dengan **8 _trace logs_**.
- **Estimasi Waktu:** 4 hingga 5 menit per file _trace log_.
- **Total Durasi Pengujian (8 _trace logs_):** 1 jam 40 menit.
- **Metode Run:** Dilakukan sebanyak satu kali putaran (_1-round_) untuk masing-masing dari 3 algoritma yang diuji.
