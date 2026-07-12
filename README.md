# CODEX VOTER 🌿 (Sistem Voting Pameran Capstone "Jungle Tech")

CODEX VOTER adalah aplikasi pemungutan suara (*voting*) berbasis web modern yang dirancang khusus untuk memeriahkan dan mengamankan pemungutan suara kelompok capstone terbaik pada pameran teknologi. 

Aplikasi ini mengusung tema **Jungle Tech** dengan sentuhan estetika alami, asimetris, dan brutalism yang premium untuk menjauhkan kesan kaku "AI Core".

---

## 🌲 Filosofi Tema: Jungle Tech

> *"Jungle Tech bukanlah tentang mesin yang menaklukkan alam, melainkan tentang simbiosis mutualisme antara sirkuit dan akar, antara inovasi dan ekologi."*

Filosofi ini bersandar pada tiga pilar utama:
1. **Inovasi yang Berakar:** Teknologi harus memiliki pijakan yang kuat pada kelestarian bumi. Ia tidak merampas, melainkan memelihara.
2. **Pertumbuhan Organik:** Seperti hutan yang perlahan membentuk ekosistem yang kompleks dan menghidupi, teknologi yang baik harus berkembang untuk memberi manfaat abadi bagi seluruh makhluk hidup, bukan hanya manusia.
3. **Harmoni Tanpa Jejak Buruk:** Kemajuan peradaban tidak boleh diukur dari seberapa banyak pohon yang ditebang, melainkan dari seberapa pintar teknologi kita meniru siklus alam yang tidak pernah menyisakan limbah (semua kembali menjadi kehidupan).

---

## 🔒 Alur Voting & Lapisan Keamanan (Anti-Fraud)

Sistem ini didesain sesederhana mungkin untuk pengguna (tanpa kode OTP yang merepotkan) namun tetap memiliki proteksi anti-kecurangan berlapis:

1. **Registrasi Nama & Kategori:** Pengunjung mendaftarkan Nama Lengkap dan Kategori (Mahasiswa, Siswa, Dosen/Staf, Umum) untuk memulai sesi.
2. **Jelajahi & Shortlist:** Pengunjung berkeliling meninjau kelompok capstone dan memindai QR Code untuk menambahkan kelompok ke daftar favorit (*shortlist*).
3. **Penguncian QR Pintu Keluar (Exit Gate):** Tombol vote final terkunci secara default. Akses voting baru akan **terbuka** setelah pengunjung memindai QR Code khusus di pintu keluar pameran untuk memastikan mereka telah meninjau proyek capstone.
4. **Validasi Alamat IP (Duplicate IP Prevention):** Server secara otomatis mencatat alamat IP pengunjung saat melakukan registrasi & voting. Setiap alamat IP hanya diperbolehkan mengirimkan **1 suara final**. Percobaan kirim ganda akan langsung diblokir oleh backend.
5. **Kode Bukti Vote & Audit Logs:** Setelah vote terkirim, sistem menghasilkan kode unik (`VOTE-XXXX-XXXX`) dan mencatat log aktivitas admin secara real-time.

---

## 🛠️ Struktur Proyek (Pemisahan FE & BE)

Aplikasi ini dibagi menjadi dua bagian terpisah guna modularitas dan performa maksimal:

### 1. Frontend (`/frontend`)
* **Teknologi:** Next.js 16 (App Router), TypeScript, Vanilla CSS, Lucide Icons.
* **Fitur Utama:** Daftar kelompok capstone, Shortlist drawer, QR Scanner kamera terintegrasi, Halaman Vote Terkunci, dan Leaderboard Publik Real-time (Podium & Screen projector optimized).
* **Port Standar:** `3030` (Dikonfigurasi agar tidak konflik dengan server PHP port 3000 bawaan macOS).

### 2. Backend (`/backend`)
* **Teknologi:** Node.js, Express, CORS.
* **Fitur Utama:** In-memory Database untuk kelompok, pengunjung, dan suara masuk. Logger audit keamanan terintegrasi dan endpoint manajemen admin.
* **Port Standar:** `5050` (Dikonfigurasi agar tidak bentrok dengan AirPlay Receiver macOS di port 5000).

---

## 🚀 Cara Menjalankan Layanan Secara Lokal

### Prasyarat
Pastikan Node.js telah terpasang di komputer Anda.

### 1. Jalankan Backend Server
Buka terminal baru pada direktori root proyek:
```bash
cd backend
npm install   # (hanya jika pertama kali)
npm start
```
*Backend server akan berjalan aktif di: `http://localhost:5050`*

### 2. Jalankan Frontend Server
Buka terminal baru pada direktori root proyek:
```bash
cd frontend
npm install   # (hanya jika pertama kali)
npm run dev
```
*Next.js development server akan berjalan aktif di: `http://localhost:3030`*

### 3. Akses Halaman Web
Buka browser Anda dan kunjungi halaman utama:
* **Halaman Publik:** [http://localhost:3030](http://localhost:3030)
* **Leaderboard Publik:** [http://localhost:3030/dashboard-publik](http://localhost:3030/dashboard-publik)
* **Portal Manajemen Admin (Panitia):** [http://localhost:3030/admin](http://localhost:3030/admin)
