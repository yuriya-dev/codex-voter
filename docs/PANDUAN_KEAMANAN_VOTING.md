# 📢 Informasi Keamanan & Aturan Voting — CODEX VOTER

Demi menjaga integritas, keadilan, dan sportivitas dalam penentuan pemenang pameran, panitia menerapkan sistem pengamanan berlapis berbasis teknologi. Informasi ini ditujukan kepada seluruh **kelompok peserta pameran** dan **pengunjung**.

---

## 🔒 1. Mekanisme Pengamanan Sistem Voting
Sistem voting **CODEX VOTER** mengintegrasikan dua pilar keamanan utama untuk memverifikasi setiap suara:

1. **Google Authentication (Wajib Login)**
   * Setiap pengunjung wajib masuk menggunakan akun Google aktif mereka sendiri.
   * Sistem akan mendeteksi **usia pembuatan akun Google**. Akun baru yang dibuat dalam waktu kurang dari 5 menit saat voting berlangsung akan langsung ditandai secara otomatis oleh sistem sebagai akun mencurigakan (potensi bot/akun spam).
2. **Device Fingerprinting (Sidik Jari Perangkat)**
   * Sistem memetakan identitas unik dari perangkat keras (browser canvas, WebGL, ukuran layar, dan user-agent).
   * **Batas Maksimal Device:** Satu perangkat fisik hanya diizinkan untuk menyalurkan **maksimal 3 suara (vote)**, terlepas dari berapa banyak akun Google berbeda yang mencoba masuk melalui perangkat tersebut.
3. **Proteksi IP & Jaringan**
   * Terdapat kuota pembatasan jumlah pemilih unik dari satu koneksi IP untuk mencegah serangan spam terorganisir.

---

## 🎟️ 2. Ketentuan Menggunakan Hak Suara (Pengunjung)
* **Kuota Suara:** Pengunjung berhak memberikan **maksimal 3 suara** untuk kelompok yang berbeda.
* **Perangkat Pribadi:** Pengunjung disarankan menggunakan smartphone pribadi masing-masing saat melakukan scan QR Code di booth kelompok dan saat memberikan suara.
* **Pendaftaran Mandiri:** Dilarang mendaftarkan akun Google milik orang lain untuk tujuan manipulasi suara.

---

## 🚨 3. Konsekuensi Tindakan Curang
Sistem secara otomatis mencatat setiap tindakan yang dinilai tidak wajar ke dalam **Audit Logs** admin. Indikasi kecurangan yang akan ditindak meliputi:
1. Mencoba melakukan voting berulang kali dari satu perangkat fisik dengan mengganti akun Google.
2. Menggunakan bot atau script untuk melakukan registrasi/voting masal.
3. Menggunakan akun Google yang baru dibuat secara instan saat pameran berlangsung.

**Konsekuensi Hukum Acara Pameran:**
* **Bagi Pengunjung:** Suara yang terbukti melanggar parameter keamanan akan **dihapus dan dibatalkan**.
* **Bagi Kelompok Peserta:** Kelompok yang terbukti melakukan mobilisasi suara tidak sah secara sengaja (menggunakan bot/akun palsu) dapat dikenakan sanksi pengurangan poin hingga **diskualifikasi dari kompetisi**.

---

## 🔍 4. Proses Audit oleh Admin (Sebelum Hasil Final)
Sebelum pemenang pameran diumumkan secara resmi:
* Admin akan melakukan **proses peninjauan dan audit menyeluruh** terhadap data transaksi suara.
* Semua suara yang masuk ke database ditandai sebagai *suspicious* (karena faktor usia akun, kecocokan sidik jari ganda, dll.) akan diperiksa secara manual melalui panel audit.
* Panitia berhak memfilter, membersihkan, dan mencoret suara-suara ilegal dari leaderboard final untuk memastikan bahwa pemenang terpilih murni berdasarkan antusiasme pengunjung nyata.
