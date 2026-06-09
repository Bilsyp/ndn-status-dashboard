## **Pengujian Ketiga**

Pengujian ketiga menggunakan skema evaluasi yang mengacu pada paper _Pensieve_ berbasis Reinforcement Learning (RL). Skenario pengujian memanfaatkan emulasi jaringan menggunakan trace file Mahimahi untuk merepresentasikan kondisi jaringan yang realistis dan dapat direproduksi.

Pada pengujian ini, sistem dirancang dalam bentuk **hybrid experimental environment**, yaitu kombinasi antara infrastruktur yang di-deploy secara publik dan sistem pengujian lokal dengan konfigurasi yang serupa. Arsitektur server berbasis NDN dijalankan pada empat VPS (multinode) yang telah dipublikasikan sehingga dapat diakses melalui internet. Sementara itu, pengujian lokal menggunakan setup arsitektur yang sama namun dijalankan dalam lingkungan terbatas (local lab environment).

Meskipun secara lokasi eksekusi berbeda (local vs deployed), secara arsitektural kedua lingkungan ini **memiliki desain sistem yang identik**, terutama pada sisi server-side (NDN multicast/multinode, mekanisme delivery, serta alur streaming). Perbedaan utama tidak terletak pada struktur sistem, melainkan pada **environment eksekusi dan jaringan akses**.

Pada sisi klien, baik pengujian lokal maupun deployed, kondisi jaringan tidak menggunakan koneksi internet asli secara langsung. Sebaliknya, jaringan direkonstruksi menggunakan trace file Mahimahi. Dengan demikian, Mahimahi berfungsi sebagai network emulator yang mengontrol parameter jaringan seperti latency, bandwidth, dan variabilitas koneksi agar skenario pengujian tetap konsisten dan dapat direproduksi.

Perbedaan utama antara kedua lingkungan dapat diringkas sebagai berikut:

- **Local environment**: digunakan untuk validasi awal sistem, debugging, dan memastikan pipeline streaming berjalan sesuai desain.
- **Deployed environment (VPS multinode)**: digunakan untuk mensimulasikan kondisi produksi yang lebih realistis, termasuk distribusi node pada jaringan internet nyata.

Pada sisi klien, baik pengujian lokal maupun deployed, kondisi jaringan tidak menggunakan koneksi internet asli secara langsung. Sebaliknya, jaringan direkonstruksi menggunakan 8 trace file Mahimahi terpilih tersebut. Dengan demikian, Mahimahi berfungsi sebagai network emulator yang mengontrol parameter jaringan seperti bandwidth, delay, dan variabilitas koneksi agar skenario pengujian tetap konsisten dan dapat direproduksi.

Secara alur sistem, proses pengujian dapat digambarkan sebagai berikut:

![alur sistem pengujian 3](/gambar/hasil-pengujian/image.png)

Dengan pendekatan ini, penelitian memastikan bahwa perbedaan hasil bukan berasal dari ketidakstabilan jaringan internet, melainkan dari perilaku sistem streaming dan algoritma yang diuji. Oleh karena itu, kombinasi antara environment lokal dan deployed memberikan keseimbangan antara kontrol eksperimen dan realisme sistem.

Pada tahap ini, jaringan direkonstruksi menggunakan 8 trace file Mahimahi terpilih. Dengan demikian, Mahimahi berfungsi sebagai network emulator yang mengontrol parameter jaringan seperti bandwidth, delay, dan variabilitas koneksi agar skenario pengujian tetap konsisten dan dapat direproduksi.

Konfigurasi emulasi Mahimahi yang digunakan dalam eksperimen ini ditetapkan sebagai berikut:

- Run time per eksperimen: 250 -280 detik / sekitar 3 - 4 menit
- Link delay (MM_DELAY): 40 ms
- Link bandwidth (MM_LINK): 5 Mbps
- Repetition time (REPEAT_TIME): 1

> Selain itu, pengujian dilakukan dengan membandingkan beberapa Adaptive
> Bitrate (ABR) algorithm, yaitu:

- NDN_RL
- Throughput-Based (HTTP)
- Buffer-Based (HTTP)

Untuk setiap trace file, seluruh ABR algorithm dijalankan secara bergantian pada kondisi jaringan yang sama. Dengan kata lain, satu trace file digunakan sebagai lingkungan jaringan tetap, kemudian diuji terhadap tiga algoritma ABR tersebut secara berurutan.

Setiap eksperimen dijalankan dengan durasi 250 detik per run, dengan parameter jaringan (delay dan bandwidth) yang dikendalikan secara statis oleh Mahimahi. Hal ini memastikan bahwa setiap algoritma mendapatkan kondisi jaringan yang identik untuk setiap percobaan.
![alur sistem pengujian 3](/gambar/hasil-pengujian/image2.png)

### 8 trace file Mahimahi terpilih tersebut

![alur sistem pengujian 3](/gambar/hasil-pengujian/test_trace_graph/report_bicycle_0002.png)
![alur sistem pengujian 3](/gambar/hasil-pengujian/test_trace_graph/report_bus_0002.png)
![alur sistem pengujian 3](/gambar/hasil-pengujian/test_trace_graph/report_bus_0009.png)
![alur sistem pengujian 3](/gambar/hasil-pengujian/test_trace_graph/report_car_0003.png)
![alur sistem pengujian 3](/gambar/hasil-pengujian/test_trace_graph/report_car_0005.png)
![alur sistem pengujian 3](/gambar/hasil-pengujian/test_trace_graph/report_foot_0005.png)
![alur sistem pengujian 3](/gambar/hasil-pengujian/test_trace_graph/report_train_0003.png)
![alur sistem pengujian 3](/gambar/hasil-pengujian/test_trace_graph/report_tram_0002.png)

## Berikut merupakan hasil pengujian berdasarkan nilai QoE yang diperoleh dari setiap network trace yang dijalankan dengan Local environment

<div class="flourish-embed flourish-chart" data-src="visualisation/29287799"><img src="https://public.flourish.studio/visualisation/29287799/thumbnail" width="100%" alt="chart visualization" />
</div>

## Hasil QoE dihitung sebagai rata-rata dari nilai QoE yang diperoleh pada setiap pengujian menggunakan satu network trace dalam lingkungan lokal (local environment).

<div class="flourish-embed flourish-chart" data-src="visualisation/29304844"><img src="https://public.flourish.studio/visualisation/29304844/thumbnail" width="100%" alt="chart visualization" /></div>

## Berikut merupakan hasil pengujian berdasarkan nilai QoE yang diperoleh dari setiap network trace yang dijalankan dengan Public environment (Publish ke Internet)

<div class="flourish-embed flourish-chart" data-src="visualisation/29305435"><img src="https://public.flourish.studio/visualisation/29305435/thumbnail" width="100%" alt="chart visualization" /></div>

## Hasil QoE dihitung sebagai rata-rata dari nilai QoE yang diperoleh pada setiap pengujian menggunakan satu network trace dalam lingkungan Public (Publish ke Internet).

<div class="flourish-embed flourish-chart" data-src="visualisation/29305545"><img src="https://public.flourish.studio/visualisation/29305545/thumbnail" width="100%" alt="chart visualization" /></div>

## Analisa Hasil QOE

Berdasarkan analisis terhadap metrik QoE, terlihat adanya perbedaan antara lingkungan local dan public. Pada environment public, nilai QoE cenderung lebih banyak mengalami penurunan dibandingkan dengan local environment. Hal ini kemungkinan disebabkan oleh konfigurasi jaringan dengan delay 40 ms yang dapat memperburuk latency serta meningkatkan potensi gangguan eksternal pada jaringan. Kondisi tersebut berbeda dengan local environment yang relatif lebih stabil.”

“Dari hasil pengujian ini, belum terdapat algoritma ABR yang dapat dikategorikan secara mutlak sebagai yang paling optimal. Namun demikian, ketiga algoritma menunjukkan kemampuan adaptasi yang cukup baik terhadap kondisi jaringan yang diberikan. Nilai QoE yang cenderung rendah tidak selalu menunjukkan performa yang buruk, melainkan lebih dipengaruhi oleh kondisi jaringan yang fluktuatif, yang menyebabkan terjadinya rebuffering atau keterlambatan dalam proses pengisian buffer.
