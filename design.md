# Panduan Desain Visual — Tema "Tech Jungle"

Dokumen ini mendefinisikan panduan visual, desain antarmuka (UI), pengalaman pengguna (UX), serta spesifikasi komponen untuk **Sistem Voting Pameran Capstone**, mengikuti spesifikasi teknis pada [architecture.md](file:///Users/wahyutricahya/Web%20Development/CODEX%20VOTER/architecture.md).

---

## 1. Konsep & Filosofi Desain

Tema **"Tech Jungle"** menggabungkan dua elemen kontras:
1. **Jungle (Organik, Alami, Liar)**: Diwakili oleh garis lengkung lembut, warna hijau dedaunan, latar belakang beige hangat, tekstur organik, dan transisi halus.
2. **Tech (Digital, Presisi, Futuristik)**: Diwakili oleh struktur grid yang kaku, garis sirkuit tipis, font bergaya sans-serif geometris, efek glow (pendaran) halus, dan badge status presisi.

Sinergi ini menciptakan antarmuka yang ramah dan segar, sekaligus canggih dan tepercaya.

---

## 2. Design Tokens (Variabel CSS)

Gunakan variabel CSS berikut pada berkas global stylesheet (misalnya `styles/theme.css` atau `app/globals.css`):

```css
:root {
  /* --- Palette Warna Utama --- */
  --color-fern-green: #437118;     /* Warna primer (tombol utama, brand) */
  --color-pistachio: #afd06e;      /* Warna sekunder/hover (sorotan, hover state) */
  --color-beige: #f5f3d8;          /* Background halaman utama */
  --color-carolina-blue: #87aece;  /* Warna aksen teknologi (link, badge, status) */
  --color-delft-blue: #1d2a62;     /* Warna teks gelap, header/footer, status kontras */

  /* --- Variasi Warna Tambahan --- */
  --color-white: #ffffff;
  --color-charcoal: #121824;       /* Latar belakang untuk mode gelap/section khusus */
  --color-leaf-shadow: rgba(67, 113, 24, 0.15);
  --color-glow-blue: rgba(135, 174, 206, 0.4);
  --color-glow-green: rgba(175, 208, 110, 0.4);

  /* --- Tipografi --- */
  --font-heading: 'Outfit', 'Space Grotesk', system-ui, sans-serif; /* Tech feel */
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;       /* Clean reading */

  /* --- Spasi (Grid & Gap) --- */
  --space-xs: 0.25rem;  /* 4px */
  --space-sm: 0.5rem;   /* 8px */
  --space-md: 1rem;     /* 16px */
  --space-lg: 1.5rem;   /* 24px */
  --space-xl: 2rem;     /* 32px */
  --space-2xl: 3rem;    /* 48px */

  /* --- Efek Visual --- */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-full: 9999px;
  
  --shadow-organic: 0 8px 30px var(--color-leaf-shadow);
  --shadow-tech: 0 0 15px var(--color-glow-blue);
  --shadow-tech-hover: 0 0 25px var(--color-glow-green);
  
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.15s ease-out;
}
```

---

## 3. Tipografi & Ikonografi

### 3.1 Tipografi
* **Heading (`<h1>`, `<h2>`, `<h3>`)**: Menggunakan font **Outfit** atau **Space Grotesk** dengan bobot tebal (`font-weight: 700`). Karakter geometris memberikan nuansa modern/coding.
* **Body Text (`<p>`, `<span>`, label)**: Menggunakan font **Inter** (`font-weight: 400` untuk reguler, `500` untuk medium). Sangat mudah dibaca pada perangkat mobile dalam ukuran kecil.

### 3.2 Ikonografi
* Menggunakan ikon bergaris tipis (misal: *Lucide Icons* atau *Phosphor Icons*).
* **Ikon Booth / Lokasi**: Menggunakan ikon berbentuk **Daun** (`Leaf`) atau **Pin Lokasi berbentuk Daun** untuk memadukan sisi organik dengan navigasi pameran.
* **Ikon Favorit / Shortlist**: Menggunakan bentuk **Hati** (`Heart`) dengan transisi isi (*solid*) saat dipilih.
* **Ikon Verifikasi**: Menggunakan simbol **Kunci/OTP** (`Key`) atau **Centang Digital** (`ShieldCheck`).

---

## 4. Struktur & Tata Letak Halaman Utama

### 4.1 Halaman Landing (`app/(public)/page.tsx`)
Halaman pertama yang dilihat pengunjung saat membuka website.
* **Hero Section**:
  * **Background**: Gradasi radial lembut dari `#f5f3d8` (Beige) ke putih, dengan pola grid teknologi (*tech grid*) samar berwarna abu-abu tipis.
  * **Aksen Visual**: Ilustrasi abstrak bertekstur daun low-poly dan efek pendaran hijau-biru.
  * **CTA Utama**: Tombol besar berwarna `Fern Green` bertuliskan **"Jelajahi Kelompok & Vote"** dengan efek transisi ke `Pistachio`.
* **Statistik Cepat**: Informasi jumlah kelompok, jumlah kategori pemilih, dan status waktu voting.

### 4.2 Halaman Daftar Kelompok (`app/(public)/kelompok/page.tsx`)
* **Bar Pencarian & Filter**: 
  * Bar input bergaya minimalis dengan border radius besar (`--radius-lg`).
  * Filter berdasarkan kategori (misalnya: Software, IoT, Hardware) atau Lokasi Booth.
* **Grid Kelompok**:
  * Menampilkan deretan `GroupCard` menggunakan tata letak Responsive Grid (`repeat(auto-fill, minmax(300px, 1fr))`).

### 4.3 Halaman Detail Kelompok (`app/(public)/kelompok/[slug]/page.tsx`)
* **Header Halaman**: Foto banner proyek dengan efek overlay gradasi gelap di bagian bawah agar teks nama kelompok terbaca jelas.
* **Informasi Utama**: 
  * Badge nomor booth dengan bentuk heksagonal (tech) tetapi menggunakan warna hijau alam (organic).
  * Tombol **"Simpan ke Shortlist"** berukuran besar di bagian bawah (tetap melayang / *sticky mobile button*).
* **Konten Deskripsi**: Grid 2 kolom pada desktop (Kiri: deskripsi & foto detail, Kanan: info anggota kelompok & video demonstrasi jika ada).

---

## 5. Komponen Kunci (Spesifikasi UI)

### 5.1 `GroupCard`
Komponen kartu yang digunakan untuk menampilkan kelompok di halaman daftar kelompok dan shortlist.

```
+------------------------------------------+
|  [ Foto Kelompok / Banner Proyek ]       |
|  [ Kategori / Tag ]   [ Booth #B12 ]     |
+------------------------------------------+
|  Nama Proyek Kelompok                    |
|  Deskripsi singkat proyek capstone...    |
|                                          |
|  +--------------------+   +-----------+  |
|  | Detail Kelompok    |   |  ❤️ (Fav) |  |
|  +--------------------+   +-----------+  |
+------------------------------------------+
```

* **Gaya Visual**:
  * `background-color`: `#ffffff`
  * `border`: `1px solid rgba(67, 113, 24, 0.1)`
  * `border-radius`: `var(--radius-md)`
  * `box-shadow`: `var(--shadow-organic)`
* **Hover State**:
  * Naik 4px ke atas (`transform: translateY(-4px)`)
  * Border berubah menjadi `1px solid var(--color-carolina-blue)`
  * Memunculkan efek pendaran tipis `box-shadow: var(--shadow-tech)`
* **Tombol Favorit (Hati)**:
  * Default: Garis tepi `Delft Blue`.
  * Saat aktif (disimpan): Berwarna merah muda/hijau Pistachio menyala (sesuai pilihan palet), berdenyut (*pulse animation*) saat pertama kali diklik.

### 5.2 `ShortlistDrawer`
Panel yang bergeser masuk (*slide-in*) dari arah kanan (desktop) atau bawah (mobile) untuk menampilkan kelompok-kelompok yang telah ditandai pengunjung.

* **Desain Header**:
  * Menampilkan teks "Shortlist Saya" dan badge bulat kecil penunjuk jumlah kelompok yang disimpan (contoh: `[ 3 ]`).
* **Daftar Item**:
  * List vertikal berisi ringkasan kelompok (foto kecil, nama kelompok, nomor booth).
  * Tombol hapus cepat (ikon silang/sampah) di samping setiap item.
* **CTA Utama (Lanjut ke Halaman Vote)**:
  * Tombol penuh (*width: 100%*) berwarna `Fern Green` yang melayang statis (*sticky*) di bagian bawah laci (*drawer*).

### 5.3 `VoteConfirmation`
Layar sukses yang muncul setelah pengunjung berhasil melakukan submit vote final di `/vote`.

* **Desain Kotak Konfirmasi**:
  * Box putih melayang dengan efek border sirkuit teknologi neon hijau di pinggirannya.
  * Animasi ikon centang yang berputar dan memancarkan gelombang radial hijau Pistachio.
* **Tampilan Kode Bukti Vote (`vote_code`)**:
  * Teks kode unik (misal: `VOTE-9A8F-4C2D`) ditampilkan dengan font *monospace* tebal di dalam kotak berwarna `Carolina Blue` transparan.
  * Tombol **"Salin Kode"** di sampingnya untuk kemudahan penyimpanan.
* **Efek Latar Belakang**:
  * Hujan konfeti bertema dedaunan hijau kecil yang jatuh perlahan di layar (efek CSS sederhana).

---

## 6. Alur & Desain Antarmuka Verifikasi (OTP)

Untuk mencegah kecurangan dan memvalidasi pengguna, proses verifikasi di `/verifikasi` didesain bersih dan minim hambatan:

1. **Pemilihan Kategori Pengguna**:
   * Pilihan kategori (Mahasiswa / Siswa / Umum) disajikan dalam bentuk tab kartu besar dengan ilustrasi ikon minimalis (ikon Toga untuk Mahasiswa, Ransel untuk Siswa, dan Orang untuk Umum).
2. **Form Input OTP**:
   * Input teks untuk Email/WhatsApp dibuat besar dengan fokus otomatis (*autofocus*).
   * Kotak input kode OTP berupa 6 kotak terpisah yang otomatis berpindah fokus ke kotak berikutnya saat angka dimasukkan.
3. **Pemberitahuan Waktu & Limit**:
   * Di bawah tombol kirim OTP terdapat teks hitung mundur kecil untuk kirim ulang OTP (contoh: "Kirim ulang dalam 59 detik") guna mencegah spam jaringan.

---

## 7. Mikro-interaksi & Animasi (Micro-interactions)

Untuk menghidupkan antarmuka bertema "Tech Jungle", terapkan beberapa animasi CSS berikut:

### 7.1 Animasi Hover Tombol (Organic Glow Expansion)
Tombol utama melebar sedikit dan memancarkan bayangan lembut saat diarahkan kursor.
```css
.btn-primary {
  background-color: var(--color-fern-green);
  color: var(--color-beige);
  transition: var(--transition-smooth);
}

.btn-primary:hover {
  background-color: var(--color-pistachio);
  color: var(--color-delft-blue);
  box-shadow: 0 0 20px var(--color-glow-green);
  transform: scale(1.02);
}
```

### 7.2 Animasi Berdenyut Ikon Favorit (Pulse Heart)
```css
@keyframes heartPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.heart-active {
  animation: heartPulse 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: #e63946; /* Merah organik */
}
```

### 7.3 Animasi Masuk Drawer (Slide-In Transition)
```css
.drawer-content {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Mobile: Slide dari bawah */
@media (max-width: 768px) {
  .drawer-closed { transform: translateY(100%); }
  .drawer-open { transform: translateY(0); }
}

/* Desktop: Slide dari kanan */
@media (min-width: 769px) {
  .drawer-closed { transform: translateX(100%); }
  .drawer-open { transform: translateX(0); }
}
```

---

## 8. Desain Adaptif & Responsif (Mobile-First Guidelines)

Sistem ini didesain mengutamakan perangkat mobile (*Mobile-First*) sebagai prioritas 100% karena sebagian besar pengunjung akan membuka website melalui ponsel pintar (iOS/Android) sambil berjalan berkeliling booth pameran capstone.

### 8.1 Breakpoint & Layout Grid
* **Perangkat Seluler / Mobile (Mobile - `< 640px`)**:
  * Seluruh tata letak menggunakan struktur satu kolom vertikal.
  * Kartu kelompok (`GroupCard`) mengambil lebar penuh layar minus padding kontainer (`calc(100vw - 32px)`).
  * Tombol navigasi krusial (Shortlist, Vote) dibuat melayang statis (*floating sticky bar*) di bagian bawah layar agar mudah dijangkau dengan satu jempol tangan.
* **Perangkat Tablet (`640px - 1024px`)**:
  * Grid kelompok beralih menjadi 2 kolom.
  * Sidebar filter di halaman daftar kelompok dialihkan menjadi menu *collapsible/drawer* yang muncul dari bawah.
* **Perangkat Desktop (Desktop - `> 1024px`)**:
  * Grid kelompok menjadi 3 atau 4 kolom.
  * Filter kelompok ditampilkan permanen di sisi kiri layar (*sticky sidebar*).
  * Laci Shortlist (`ShortlistDrawer`) tampil sebagai panel geser dari kanan tanpa menutupi seluruh layar.

---

## 9. Optimasi Pengalaman & Performa Mobile (Mobile Smoothness)

Untuk memastikan aplikasi berjalan dengan performa tinggi (60 FPS) tanpa *lag*, kedipan, atau kesalahan input di browser seluler kelas bawah sekalipun, ikuti spesifikasi teknis berikut:

### 9.1 Ukuran Area Sentuh (Touch Target Size) & Pencegahan Salah Tap
* **Ukuran Tombol**: Semua tombol interaktif (tombol favorit, tombol detail, link menu) harus memiliki area sentuh minimum **48px x 48px** (sesuai standar Web Content Accessibility Guidelines - WCAG).
* **Jarak Antar Tombol**: Jarak antar tombol interaktif yang berdekatan minimal **12px** untuk mencegah salah tekan saat pengguna berjalan.
* **Pencegahan Delay Sentuhan**: Terapkan properti CSS `touch-action: manipulation` pada seluruh tombol untuk menghilangkan delay sentuh 300ms yang biasanya ada pada browser mobile versi lama.

### 9.2 Optimasi Rendering & Animasi GPU (60 FPS)
* **Akselerasi Perangkat Keras (Hardware Acceleration)**: Untuk transisi laci (`ShortlistDrawer`) dan animasi kartu (`GroupCard`), gunakan properti CSS `transform: translate3d(0, 0, 0)` atau `will-change: transform` untuk memaksa browser menggunakan GPU mobile.
* **Inertia Scrolling**: Untuk area yang dapat discroll secara horizontal atau vertikal di dalam laci (*drawer*), tambahkan `-webkit-overflow-scrolling: touch` agar scroll terasa natural dan memiliki efek inersia di iOS Safari.
* **Animasi Non-Layout-Reflow**: Hindari melakukan animasi pada properti seperti `top`, `left`, `margin`, atau `height` karena memicu kalkulasi ulang tata letak (*reflow*) yang membuat CPU mobile panas. Gunakan hanya `transform: scale()` atau `transform: translate()` dan `opacity`.

### 9.3 Penanganan Keyboard Virtual (Virtual Keyboard UX)
* **Input OTP Tanpa Zoom**: Pada perangkat iOS, browser akan otomatis memperbesar layar (*zoom-in*) jika ukuran teks input kurang dari 16px saat keyboard aktif. Pastikan semua *font-size* pada input teks minimal **16px** (atau setara dengan `1rem`) untuk menghindari zoom otomatis yang mengacaukan layout.
* **Jenis Keyboard yang Tepat**:
  * Untuk input OTP, gunakan atribut `inputmode="numeric" pattern="[0-9]*"` pada tag `<input>` agar keyboard numerik otomatis muncul.
  * Gunakan atribut `autocomplete="one-time-code"` agar kode OTP dari SMS/WhatsApp dapat langsung disalin secara otomatis oleh sistem operasi HP pengguna (*SMS auto-fill*).
* **Posisi Tombol Sticky**: Saat keyboard virtual aktif, posisi elemen `position: fixed` di bagian bawah layar akan terdorong ke atas. Desain antarmuka harus mendeteksi fokus input dan mengubah posisi tombol *sticky* menjadi `position: relative` di bawah form agar area input tidak tertutup tombol.

### 9.4 Pencegahan Layout Shift (Cumulative Layout Shift - CLS)
* **Aspek Rasio Gambar**: Foto kelompok di dalam `GroupCard` wajib mendefinisikan aspek rasio menggunakan CSS `aspect-ratio: 16 / 9` dengan placeholder warna beige muda sebelum gambar termuat sempurna. Hal ini mencegah halaman "melompat" saat gambar kelompok yang berukuran besar selesai diunduh via koneksi mobile.
* **Dynamic Viewport Height**: Hindari penggunaan unit `100vh` untuk tinggi penuh layar pada mobile karena tinggi *address bar* browser mobile sering berubah saat discroll. Gunakan unit baru CSS **`100dvh`** (Dynamic Viewport Height) atau `100svh` agar tinggi halaman selalu pas dengan area layar yang terlihat.

### 9.5 Integrasi QR Scanner yang Mulus
* **Akses Cepat**: Tambahkan ikon scan QR mengambang (*Floating Action Button*) berbentuk bulat di pojok kanan bawah halaman daftar kelompok dengan kontras warna `Fern Green` yang tinggi.
* **Performa Kamera**: Saat modul scanner kamera aktif, matikan rendering efek latar belakang yang berat (seperti konfeti atau grid dinamis) untuk membebaskan memori RAM ponsel pengunjung. Gunakan pustaka pembaca QR berbasis WASM (seperti `html5-qrcode` atau `jsQR`) yang berjalan di *background worker* agar frame rate kamera tetap stabil di 30-60 FPS.

