# Metodologi Pembangunan Environment dan Mekanisme RL

---

### 1. Preprocessing Dataset Trace Log

Langkah pertama, model diberikan _environment_ dengan cara melakukan **preprocessing** terhadap dataset _trace log_. Data mentah dikonversi ke format **Mahimahi** agar dapat digunakan dalam simulasi jaringan.

Konversi dilakukan dengan mengubah data paket menjadi _throughput_ dalam satuan Mbps. Setiap paket diasumsikan berukuran 1500 bytes (12.000 bits), kemudian dihitung jumlah paket yang diterima dalam interval 1 detik.

$$Throughput\ (Mbps) = \frac{Jumlah\ Paket \times 12,000}{1,000,000}$$

Hasil dari proses ini adalah _trace log_ yang telah distandarisasi dalam format Mahimahi, sehingga dapat digunakan sebagai _input environment_ untuk model.

---

### 2. Penyesuaian Trace (Dynamic Scaling)

Selanjutnya dilakukan penyesuaian terhadap _trace_ karena _bitrate_ video yang digunakan berada di bawah 5 Mbps. Oleh karena itu, _bandwidth_ pada _trace_ dibatasi agar tidak melebihi ambang tertentu meskipun data asli dapat mencapai >30 Mbps.

Mekanisme yang digunakan adalah **dynamic scaling** dengan target maksimum sekitar **5.10 Mbps** (dihitung dari $MAX\_BITRATE \times 1.5$). Tujuannya agar _environment_ tidak terlalu “longgar”, sehingga agen tidak selalu memilih kualitas tertinggi tanpa proses pembelajaran.

- **Cara Kerja:** Sistem mencari nilai _throughput_ maksimum pada setiap _trace_, lalu menghitung _scale factor_ untuk menyesuaikan seluruh nilai dalam _trace_ tersebut agar puncaknya berada di sekitar 5.10 Mbps.
- **Efek:** Kondisi jaringan menjadi lebih menantang dan realistis untuk skenario adaptasi _bitrate_, sehingga agen dipaksa memilih antara kualitas seperti 480p dan 720p berdasarkan fluktuasi _bandwidth_ yang ada.

---

### 3. Pembangunan Environment Gymnasium

Setelah _trace_ Mahimahi digunakan, langkah berikutnya adalah membangun _environment_ sebagai simulasi kondisi jaringan. _Environment_ ini dibuat menggunakan standar **Gymnasium (OpenAI Gym)** dan berfungsi sebagai “dunia” tempat agen RL (PPO) berinteraksi dan belajar.

_Environment_ yang dibangun merupakan simulator **Adaptive Bitrate (ABR)** yang dikombinasikan dengan metrik jaringan berbasis **Named Data Networking (NDN)**, sehingga tidak hanya mempertimbangkan _throughput_, tetapi juga kondisi jaringan secara lebih luas.

#### **A. Observation Space**

Agen menerima sekumpulan parameter yang direpresentasikan dalam _observation space_ (dinormalisasi ke skala 0–1). Terdiri dari tujuh variabel utama:

1.  **Buffer:** Durasi video tersimpan.
2.  **Mean Throughput:** Rata-rata _bandwidth_ dari Mahimahi.
3.  **Last Executed Bitrate:** Aksi/keputusan sebelumnya.
4.  **Buffer Safety:** Margin keamanan _buffer_.
5.  **Volatility:** Tingkat fluktuasi jaringan.
6.  **Congestion Window (CWND):** Metrik kemacetan NDN.
7.  **Round Trip Time (RTT):** Latensi jaringan.

#### **B. Action Space**

Bersifat diskrit dengan **4 pilihan** level kualitas video yang disesuaikan dengan karakteristik _source video_:

- **240p** (0.55 Mbps)
- **360p** (0.95 Mbps)
- **480p** (1.67 Mbps)
- **720p** (3.40 Mbps)

---

### 4. Aturan Kontrol (Veto Logic)

_Environment_ menerapkan aturan kontrol (**veto logic**) sebagai pembatas keputusan agen untuk memastikan stabilitas sistem:

- **NDN Congestion Veto:** Melarang peningkatan _bitrate_ ketika terdeteksi kemacetan jaringan (CWND rendah).
- **Panic Mode:** Jika _buffer_ turun di bawah ambang kritis, sistem otomatis menurunkan _bitrate_ untuk menghindari _stalling_.
- **Hysteresis (Upgrade):** Kenaikan kualitas mensyaratkan tiga kondisi sekaligus: _throughput_ mencukupi, _buffer_ aman (dinamis terhadap volatilitas), dan RTT stabil.
- **Instan Downgrade:** Penurunan kualitas diterapkan secara instan tanpa syarat sebagai langkah protektif.

---

### 5. Mekanisme Reward dan Penalty

Sistem menggunakan fungsi imbalan untuk mengarahkan perilaku agen:

#### **A. Penalty Policy (Hukuman)**

- **Stalling Penalty:** Diberikan saat terjadi _buffering_.
  $$Penalty_{stall} = -((durasi_{stall} \times 50.0) + 20.0)$$
- **Critical Buffer Penalty:** Diberikan saat _buffer_ berada di level kritis (semakin rendah _buffer_, semakin besar hukuman).
- **Fluctuation Penalty:** Denda kecil untuk setiap perubahan resolusi yang terlalu sering guna menjaga stabilitas.

#### **B. Reward Policy (Imbalan)**

- **Bitrate Reward:** Diberikan secara proporsional terhadap kualitas yang dipilih.
  $$Reward_{bitrate} = \left( \frac{Bitrate_{terpilih}}{Bitrate_{maks}} \right) \times 100.0$$
- **Buffer Bonus:** Bonus konsisten diberikan jika agen mampu menjaga kondisi _buffer_ tetap aman di atas ambang tertentu.

### 5. Mekanisme Reward dan Penalty

Sistem menggunakan fungsi imbalan untuk mengarahkan perilaku agen agar mencapai performa optimal:

#### **A. Penalty Policy (Hukuman)**

Sistem menerapkan penalti yang cukup ketat untuk mencegah perilaku agen yang merugikan pengalaman pengguna (_Quality of Experience_). Rincian bobot penalti adalah sebagai berikut:

| Kategori            | Kondisi               | Rumus / Denda                       | Nilai Penalti  |
| :------------------ | :-------------------- | :---------------------------------- | :------------- |
| **Video Macet**     | _Stalling Event_      | $-((\text{durasi} \times 50) + 20)$ | **min. -20.0** |
| **Buffer Menipis**  | Kritis (Buffer < 3s)  | Penalti Flat                        | **-50.0**      |
| **Buffer Menipis**  | Warning (Buffer < 5s) | Penalti Flat                        | **-20.0**      |
| **Ketidakstabilan** | Pindah Resolusi       | Per perubahan indeks                | **-2.0**       |

> **Catatan:** Penalti _Stalling_ memiliki bobot paling besar karena dampaknya yang paling buruk terhadap kenyamanan penonton. Penalti fluktuasi (pindah resolusi) diberikan agar agen cenderung mempertahankan kualitas yang stabil daripada terus-menerus berganti tingkat _bitrate_.

#### **B. Reward Policy (Imbalan)**

Agen mendapatkan poin positif berdasarkan kualitas video yang dipilih dan kemampuannya menjaga stabilitas pemutaran. Rincian perhitungan poin adalah sebagai berikut:

| Kategori              | Kondisi / Level        | Rumus Kalkulasi            | Poin yang Didapat |
| :-------------------- | :--------------------- | :------------------------- | :---------------- |
| **Kualitas Video**    | 720p (3.40 Mbps)       | $(3.40 / 3.40) \times 100$ | **+100.0**        |
| **Kualitas Video**    | 480p (1.67 Mbps)       | $(1.67 / 3.40) \times 100$ | **+49.12**        |
| **Kualitas Video**    | 360p (0.95 Mbps)       | $(0.95 / 3.40) \times 100$ | **+27.94**        |
| **Kualitas Video**    | 240p (0.55 Mbps)       | $(0.55 / 3.40) \times 100$ | **+16.18**        |
| **Stabilitas Buffer** | Aman (Buffer $\ge$ 5s) | Bonus Flat                 | **+5.0**          |

> **Catatan:** Nilai bitrate maksimum (3.40 Mbps) digunakan sebagai pembagi standar untuk menghitung proporsi _reward_ bitrate secara adil di semua level kualitas.

### 6. Simulasi Perhitungan Reward (Contoh Kasus)

Berikut adalah ilustrasi perhitungan total _reward_ yang didapat AI dalam satu langkah (_step_) pada berbagai skenario operasional:

#### **Skenario A: "Lancar Jaya"**

Kondisi: AI memilih **720p**, Buffer **15 detik** (Aman), dan **tidak pindah** resolusi dari sebelumnya.

- **Bitrate:** +100.0
- **Buffer Bonus:** +5.0
- **Total Reward:** **+105.0** (Skor sempurna).

#### **Skenario B: "Main Aman saat Sinyal Lemah"**

Kondisi: AI memilih **360p**, Buffer **6 detik** (Aman), namun baru saja **turun** dari 480p.

- **Bitrate:** +27.94
- **Buffer Bonus:** +5.0
- **Switching Penalty:** -2.0
- **Total Reward:** **+30.94** (Skor rendah, namun AI tetap dalam zona aman).

#### **Skenario C: "Bencana / Stalling"**

Kondisi: AI memaksakan **720p** saat internet _drop_, mengakibatkan video macet **2 detik** dan Buffer sisa **1 detik**.

- **Bitrate:** +100.0
- **Stalling:** $-((2 \times 50) + 20) = -120.0$
- **Buffer Kritis:** -50.0
- **Total Reward:** **-70.0** (Hukuman berat agar AI menghindari tindakan ini di masa depan).

---

> **Kesimpulan Strategi AI**

Berdasarkan simulasi di atas, terlihat bahwa penalti **Stalling (-120)** dan **Buffer Kritis (-50)** memiliki bobot yang jauh lebih besar daripada keuntungan memilih **720p (+100)**.

Secara teknis, konfigurasi ini membentuk karakteristik **"Risk Averse"** (takut risiko) pada agen AI. Sistem akan cenderung memilih mendapatkan poin rendah secara stabil (+27 poin) daripada mengejar poin tinggi (+100 poin) namun berisiko kehilangan hingga 170 poin sekaligus akibat degradasi layanan.

### 7. Hyperparameter Pelatihan (PPO Configuration)

Untuk melatih agen RL agar mampu beradaptasi pada lingkungan NDN yang kompleks, digunakan konfigurasi algoritma **Proximal Policy Optimization (PPO)** dengan parameter sebagai berikut:

| Parameter                   | Nilai (Value) | Fungsi & Logika Tuning                                                                                                                                      |
| :-------------------------- | :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Policy**                  | `MlpPolicy`   | Menggunakan _Multi-Layer Perceptron_. Sangat cocok untuk _input_ berupa vektor (7 dimensi observasi yang digunakan).                                        |
| **Learning Rate**           | `0.00025`     | Kecepatan belajar standar. Menjaga keseimbangan agar model tidak belajar terlalu cepat (_crash_) namun tetap efisien.                                       |
| **Entropy Coef (ent_coef)** | `0.05`        | Nilai yang cukup tinggi untuk mendorong AI terus melakukan eksplorasi di antara 4 pilihan _bitrate_ dan tidak terjebak pada pilihan "aman" saja.            |
| **n_steps**                 | `2048`        | Jumlah langkah yang dikumpulkan sebelum model melakukan pembaruan kebijakan (_update policy_).                                                              |
| **Batch Size**              | `64`          | Ukuran data yang diambil setiap iterasi optimasi. Angka ini memberikan beban kerja yang seimbang untuk pemrosesan CPU/GPU.                                  |
| **Total Timesteps**         | **500.000**   | Durasi belajar ditingkatkan (sebelumnya 300rb) karena penambahan variasi aksi menjadi 4 _bitrate_, sehingga membutuhkan waktu lebih lama untuk konvergensi. |

---

> **Insight:** Peningkatan `Total Timesteps` menjadi 500.000 langkah sangat krusial. Dengan 4 pilihan kualitas video, ruang pencarian kebijakan (_policy search space_) menjadi lebih luas, sehingga agen memerlukan lebih banyak interaksi dengan _environment_ untuk menemukan strategi optimal.

### 8. Arsitektur Jaringan Saraf (MlpPolicy)

Secara _default_, **Stable Baselines3** membangun struktur jaringan saraf tiruan untuk `MlpPolicy` sebagai berikut:

| Lapisan (Layer)    | Konfigurasi | Keterangan                                                 |
| :----------------- | :---------- | :--------------------------------------------------------- |
| **Input Layer**    | 7 Neuron    | Menampung 7 dimensi variabel observasi.                    |
| **Hidden Layer 1** | 64 Neuron   | Lapisan tersembunyi pertama dengan aktivasi **ReLU**.      |
| **Hidden Layer 2** | 64 Neuron   | Lapisan tersembunyi kedua dengan aktivasi **ReLU**.        |
| **Output Layer**   | 4 Neuron    | Menghasilkan probabilitas aksi (_240p, 360p, 480p, 720p_). |

---

> **Informasi Teknis:** Struktur ini merupakan arsitektur standar yang efisien untuk menangani data berbasis vektor. Penggunaan dua _hidden layer_ dengan masing-masing 64 neuron memberikan kapasitas yang cukup bagi agen untuk mempelajari hubungan non-linear antara kondisi jaringan (volatilitas, RTT, CWND) dan pemilihan _bitrate_ yang optimal.

### 9. Analisis Performa Model (Preliminary Evaluation)

Analisis ini didasarkan pada empat grafik hasil evaluasi model **Hybrid ABR (Adaptive Bitrate)**. Setiap grafik merepresentasikan performa agen AI dalam menghadapi karakteristik jaringan yang berbeda-beda melalui emulasi _trace log_.

---

![log1](/rl_logs_4bitratec3/eval_4bitrate_report_foot_0001.log.png)

### **Analisis Log: `report_foot_0001.log` (Kondisi Ideal & Stabil)**

Grafik ini menunjukkan performa optimal di mana agen mampu memaksimalkan kualitas video dengan risiko gangguan minimal.

- **Panel Atas (Bitrate):**
  Agen berhasil mempertahankan resolusi **720p (3.4 Mbps)** hampir di sepanjang sesi. Terjadi penurunan otomatis ke 480p dan 360p hanya pada segmen 35-45. Hal ini dipicu oleh _throughput_ jaringan (garis biru muda) yang mengalami penurunan signifikan di bawah 2.5 Mbps.
- **Panel Tengah (Buffer):**
  Level _buffer_ berada pada kondisi sangat sehat di kisaran **15-30 detik**. Meskipun terjadi penurunan _throughput_ di tengah sesi yang membuat _buffer_ turun ke titik terendah (sekitar 8 detik), posisi ini masih jauh di atas _Panic Threshold_ (3 detik), sehingga video tetap berjalan tanpa gangguan.
- **Panel Bawah (Volatility):**
  Tingkat volatilitas cenderung rendah (di bawah **0.25**) setelah lonjakan awal. Kondisi yang stabil ini memberikan kepercayaan diri bagi agen untuk mengambil keputusan _bitrate_ tinggi secara konsisten.

---

> **Kesimpulan Awal:** Pada skenario ini, agen membuktikan kemampuannya dalam melakukan **throughput tracking** yang akurat. Agen tidak hanya mengejar kualitas tertinggi, tetapi juga responsif untuk menurunkan kualitas sesaat demi menjaga ketersediaan _buffer_ saat jaringan melemah.

![log1](/rl_logs_4bitratec3/eval_4bitrate_report_foot_0002.log.png)

### **Analisis Log: `report_foot_0002.log` (Kondisi Menantang & Fluktuatif)**

Grafik ini menunjukkan skenario jaringan yang sangat sulit, di mana _throughput_ sering kali berada di bawah ambang kebutuhan _bitrate_ **720p**.

- **Panel Atas (Bitrate):**
  Terjadi aktivitas perpindahan _bitrate_ (_switching_) yang sangat intens. Agen terpaksa melakukan penurunan kualitas hingga ke level terendah, yaitu **240p (0.55 Mbps)**, di beberapa titik untuk menjamin kelangsungan video agar tidak terhenti total.
- **Panel Tengah (Buffer):**
  Terdeteksi beberapa **Stalling Events** (ditandai dengan titik merah) pada segmen 12, 14, 32, dan 44. Hal ini terjadi karena _buffer_ menyentuh angka 5 detik dan terus merosot ke arah _panic threshold_ akibat penurunan _bandwidth_ yang terjadi secara tiba-tiba dan tajam.
- **Panel Bawah (Volatility):**
  Grafik volatilitas menunjukkan angka yang tinggi, sering kali mencapai rentang **0.4 - 0.5**. Tingginya fluktuasi ini menjelaskan perilaku agen yang terlihat "gelisah" dan sangat agresif dalam melakukan _downgrade_ demi memitigasi risiko pengosongan _buffer_ yang lebih parah.

---

> **Insight Teknis:** Skenario ini memvalidasi fungsi **Panic Mode** dan **Veto Logic** yang telah kita tanamkan. Meskipun terjadi _stalling_, agen berhasil melakukan pemulihan (_recovery_) dengan cepat begitu _throughput_ kembali tersedia, mencegah pemutusan koneksi secara permanen.

![log1](/rl_logs_4bitratec3/eval_4bitrate_report_foot_0003.log.png)

### **Analisis Log: `report_foot_0003.log` (Kondisi Slow Start / Ramp-up)**

Gambar ini menunjukkan perilaku agen saat memulai dari kondisi jaringan yang sangat buruk, kemudian membaik secara bertahap seiring berjalannya waktu.

- **Panel Atas (Bitrate):**
  Pada awal sesi (segmen 0-15), agen menunjukkan kewaspadaan tinggi dengan memulai di resolusi **240p** dan **360p** karena _bandwidth_ yang tersedia berada di bawah 1 Mbps. Seiring dengan peningkatan kapasitas jaringan menuju 3 Mbps, agen melakukan proses **_ramp-up_** yang mulus hingga mencapai kualitas tertinggi di **720p**.
- **Panel Tengah (Buffer):**
  Strategi konservatif di awal sesi terbukti efektif dalam membangun cadangan _buffer_. _Buffer_ tumbuh dari 8 detik hingga mencapai titik stabil di kisaran **20-30 detik**. Berkat manajemen yang hati-hati ini, tidak terdeteksi adanya kejadian _stalling_ sama sekali.
- **Panel Bawah (Volatility):**
  Terjadi lonjakan volatilitas yang sangat tinggi di awal (mencapai **0.7**) yang memicu perilaku defensif agen. Namun, begitu volatilitas mereda dan stabil di bawah **0.1**, agen secara konsisten mempertahankan kualitas tertinggi tanpa ragu-ragu.

---

> **Insight Teknis:** Hasil ini membuktikan bahwa agen memiliki kemampuan **Temporal Awareness**. Agen tidak terburu-buru menaikkan _bitrate_ saat jaringan baru mulai membaik, melainkan menunggu hingga kondisi volatilitas benar-benar stabil untuk memastikan pengalaman menonton yang mulus.

![log1](/rl_logs_4bitratec3/eval_4bitrate_report_foot_0004.log.png)

### **Analisis Log: `report_foot_0004.log` (Kondisi Agresif & Sensitif)**

Gambar ini menunjukkan perilaku unik di mana agen mencoba mempertahankan kualitas tinggi, namun tetap sangat responsif terhadap fluktuasi kecil yang terjadi di jaringan.

- **Panel Atas (Bitrate):**
  Meskipun _throughput_ rata-rata secara konsisten berada di atas 3 Mbps (mencukupi untuk kriteria **720p**), agen sering kali melakukan intervensi berupa _Veto_ atau _downgrade_ singkat kembali ke **480p**. Fenomena ini terlihat sebagai garis tegak merah yang muncul berulang kali pada grafik.
- **Panel Tengah (Buffer):**
  Level _buffer_ terjaga sangat stabil di atas **10 detik**. Hal ini memberikan indikasi kuat bahwa keputusan _downgrade_ singkat tersebut dipicu oleh mekanisme **NDN Veto (CWND kritis)** atau lonjakan volatilitas, bukan disebabkan oleh ancaman pengosongan _buffer_.
- **Panel Bawah (Volatility):**
  Terdeteksi beberapa lonjakan volatilitas pada segmen 45 dan 65. Lonjakan ini berkorelasi langsung dengan keputusan preventif agen untuk melakukan _switching_ demi menjaga integritas aliran data di tengah kondisi jaringan yang tidak menentu.

---

> **Insight Teknis:** Hasil ini memperlihatkan efektivitas dari **Hybrid Intelligence**. Agen tidak sekadar pasif menunggu _buffer_ menipis, melainkan memanfaatkan metrik internal jaringan (seperti CWND) untuk melakukan mitigasi dini. Strategi ini berhasil mencegah fluktuasi kecil berubah menjadi masalah besar seperti _stalling_.

![log1](/rl_logs_4bitratec3/eval_4bitrate_report_foot_0005.log.png)

### **Analisis Log: `report_foot_0005.log` (Krisis di Tengah Sesi)**

Grafik ini menunjukkan skenario kritis di mana agen harus berjuang melawan penurunan _bandwidth_ yang sangat tajam setelah melewati fase awal yang stabil.

- **Panel Bitrate:**
  Agen menunjukkan stabilitas yang sangat baik di **720p** pada awal sesi (segmen 5–35). Namun, begitu _throughput_ merosot di bawah 3 Mbps, terjadi fenomena "_flickering_" (perpindahan cepat) antara 720p dan 480p. Pada segmen 70, agen akhirnya terpaksa turun ke level **240p** akibat kondisi jaringan yang memburuk secara ekstrem.
- **Panel Buffer:**
  Terdeteksi **Stalling Event** (titik merah) pada segmen 71. _Buffer_ yang awalnya terisi penuh (30 detik) terkuras habis dalam waktu singkat saat _throughput_ anjlok. Hal ini memicu _Low Buffer Threshold_ dan memaksa sistem melakukan tindakan darurat untuk pengisian ulang.
- **Panel Volatility:**
  Lonjakan volatilitas terlihat jelas mulai dari segmen 40 dan mencapai puncaknya pada segmen 80 (mendekati **0.4**). Tingginya angka volatilitas ini menjadi faktor utama yang menjelaskan ketidakstabilan pilihan _bitrate_ agen di paruh akhir sesi.

---

> **Insight Teknis:** Skenario ini menggambarkan batas kemampuan sistem (_edge case_). Meskipun mekanisme **Panic Mode** sudah aktif, penurunan _throughput_ yang terlalu drastis dalam waktu singkat (lebih cepat dari durasi segmen) tetap berisiko menyebabkan _stalling_. Ini menjadi dasar pentingnya optimasi pada parameter _safety margin_ saat volatilitas mulai merangkak naik.
> ![log1](/rl_logs_4bitratec3/eval_4bitrate_report_foot_0006.log.png)

### **Analisis Log: `report_foot_0006.log` (Masalah Instabilitas/Flickering)**

Grafik ini menyoroti masalah pada efisiensi _switching_ (perpindahan) resolusi, di mana agen menunjukkan perilaku yang kurang stabil dalam mempertahankan satu level kualitas.

- **Panel Bitrate:**
  Meskipun _Mean Throughput_ relatif stabil di angka 2.5 – 3.0 Mbps, agen terlalu sering berpindah-pindah antara **720p** dan **480p**. Ini merupakan indikasi bahwa imbalan (_reward_) untuk _bitrate_ tinggi hampir setara dengan hukuman (_penalty_) untuk _switching_, sehingga AI cenderung terus "berjudi" di kualitas tinggi meskipun kondisi jaringan mepet.
- **Panel Buffer:**
  Kondisi _buffer_ terjaga dengan baik di atas **5 detik** (zona aman). Hal ini berarti bahwa meskipun secara visual kualitas gambar naik-turun (_flickering_), aliran video tidak pernah mengalami penghentian (_stalling_).
- **Panel Volatility:**
  Volatilitas sebenarnya cukup terkontrol (berada di bawah **0.3**). Namun, ketidakstabilan tetap terjadi karena ambang batas keputusan (_decision threshold_) pada model saat ini masih terlalu tipis untuk membedakan antara fluktuasi minor dan perubahan tren jaringan yang permanen.

---

> **Insight Teknis:** Fenomena ini sering disebut sebagai **Oscillation Issue**. Untuk mengatasinya pada iterasi berikutnya, kita bisa mempertimbangkan untuk meningkatkan bobot _Switching Penalty_ atau memperlebar jarak _Hysteresis_ agar agen tidak terlalu sensitif terhadap perubahan _throughput_ kecil saat berada di ambang batas transisi antar resolusi.

> ![log1](/rl_logs_4bitratec3/eval_4bitrate_report_foot_0007.log.png)

### **Analisis Log: `report_foot_0007.log` (Keseimbangan Buffer yang Menurun)**

Skenario ini menunjukkan kondisi jaringan yang sebenarnya cukup baik, namun memiliki fluktuasi mikro yang secara konsisten mengganggu stabilitas pengambilan keputusan agen.

- **Panel Bitrate:**
  Mirip dengan hasil pada log sebelumnya, terjadi banyak aktivitas _switching_ yang agresif. Agen berupaya keras untuk bertahan di kualitas **720p** sesering mungkin, namun sering kali "terpental" kembali ke **480p** setiap kali terdeteksi penurunan _bandwidth_ dalam skala kecil.
- **Panel Buffer:**
  Teramati adanya tren penurunan _buffer_ secara perlahan, mulai dari segmen 20 (di angka 25 detik) merosot hingga segmen 70 (tersisa sekitar 7 detik). Fenomena ini mengindikasikan bahwa _bitrate_ yang dipilih terkadang sedikit melampaui kapasitas riil jaringan, sehingga cadangan _buffer_ terkuras secara bertahap (efek "ember bocor").
- **Panel Volatility:**
  Tingkat volatilitas sempat menyentuh angka **0.3** di tengah sesi. Fase fluktuasi ini bertepatan dengan periode kritis di mana sistem berusaha melakukan pembangunan kembali (_rebuilding_) level _buffer_ agar tidak menyentuh ambang batas bahaya.

---

> **Insight Teknis:** Kasus ini merupakan contoh klasik dari **Throughput Overestimation**. Agen cenderung terlalu optimis terhadap kapasitas jaringan karena hanya melihat rata-rata _bandwidth_ sesaat tanpa mempertimbangkan tren penurunan _buffer_ jangka panjang. Untuk perbaikan, model memerlukan mekanisme "Buffer Trend Awareness" agar lebih konservatif saat mendeteksi _buffer_ yang terus menyusut meskipun _throughput_ terlihat mencukupi.

> ![log1](/rl_logs_4bitratec3/eval_4bitrate_report_foot_0008.log.png)

### **Analisis Log: `report_foot_0008.log` (Slow Start & Stalling Mendadak)**

Grafik terakhir ini memberikan pelajaran penting mengenai perilaku agen saat menangani transisi dari kondisi jaringan lambat ke cepat, serta risiko yang muncul saat stabilisasi kualitas tinggi.

- **Panel Bitrate:**
  Sesi dimulai dengan fase **_Slow Start_** (transisi dari 240p ke 480p). Begitu kapasitas jaringan terdeteksi stabil di atas 3.4 Mbps pada segmen 35, agen langsung melakukan lompatan ke **720p**. Namun, menjelang akhir sesi, performa kembali menunjukkan ketidakstabilan dengan adanya _switching_ yang cukup sering.
- **Panel Buffer:**
  Teramati dua **Stalling Events** berturut-turut pada segmen 40–41. Kejadian ini cukup unik karena terjadi tepat saat agen mencoba menstabilkan diri di kualitas 720p, sementara cadangan _buffer_ sedang mengalami "kekosongan" mendadak akibat estimasi waktu unduh yang tidak akurat pada transisi tersebut.
- **Panel Volatility:**
  Tingkat volatilitas menunjukkan pola gelombang yang konsisten tinggi di fase awal dan tengah (berada di rentang **0.25–0.35**). Pola ini memaksa agen untuk terus beroperasi secara defensif guna melindungi sisa _buffer_ yang ada.

---

> **Insight Teknis:** Kasus ini menunjukkan fenomena **Aggressive Recovery Failure**. Agen terlalu cepat melakukan _upgrade_ ke _bitrate_ tertinggi sesaat setelah jaringan membaik, tanpa memberikan waktu bagi _buffer_ untuk terisi kembali ke level aman (_refilling phase_). Untuk mitigasi, sistem memerlukan aturan tambahan agar _ramp-up_ ke 720p hanya diizinkan jika _buffer_ sudah melewati ambang batas tertentu (misal: > 15 detik) untuk memberikan ruang napas saat terjadi fluktuasi mendadak.
