-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    booth_number TEXT,
    category TEXT,
    description TEXT,
    full_description TEXT,
    members TEXT[] DEFAULT '{}',
    photo_color TEXT,
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
    identifier TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT now(),
    device_fingerprint TEXT,
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id BIGSERIAL PRIMARY KEY,
    visitor_identifier TEXT REFERENCES visitors(identifier) ON DELETE CASCADE,
    group_id TEXT REFERENCES groups(id) ON DELETE CASCADE,
    vote_code TEXT NOT NULL,
    voted_at TIMESTAMPTZ DEFAULT now(),
    ip TEXT, -- Limits are enforced in backend code
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    time TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1. Membuat Tabel Settings (Pengaturan Voting)
CREATE TABLE IF NOT EXISTS public.settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL
);

-- 2. Mengisi Data Awal Settings
INSERT INTO public.settings (key, value) VALUES
  ('max_votes', '3'),
  ('leaderboard_visible', 'false'),
  ('voting_status', 'not_started'),
  ('voting_end_time', '')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. Membuat Tabel Audit Logs (Jika Belum Ada)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  time VARCHAR(50) NOT NULL,
  action VARCHAR(255) NOT NULL,
  detail TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'success'
);

-- Insert initial groups
INSERT INTO groups (id, name, slug, booth_number, category, description, full_description, members, photo_color, votes)
VALUES 
('g1', 'Arboris: Sensor Kelembaban Hutan Berbasis IoT', 'arboris-iot', 'Booth A01', 'IoT & Hardware', 'Sistem monitoring ekosistem tanah hutan menggunakan sensor IoT bertenaga surya untuk mencegah deforestasi mikro.', 'Arboris adalah solusi teknologi hijau yang dirancang khusus untuk memantau kesehatan ekosistem tanah di area hutan tropis. Menggunakan jaringan mesh mikrokontroler bertenaga surya, Arboris dapat membaca kelembaban, pH tanah, suhu udara, dan tingkat nitrogen secara berkala, lalu mengirimkannya ke server terpusat melalui koneksi LoRaWAN. Sistem ini mempermudah peneliti dan polisi hutan mendeteksi anomali alam seperti potensi kebakaran atau kekeringan ekstrem sebelum terjadi kerusakan parah.', ARRAY['Andi Wijaya', 'Budi Santoso', 'Citra Kirana'], 'linear-gradient(135deg, #1B4D3E, #4B8B3B)', 142),

('g2', 'FaunaTrack: AI Detektor Spesies Endemik', 'faunatrack-ai', 'Booth A02', 'Software & AI', 'Model computer vision yang dipasang pada camera trap untuk mengidentifikasi dan mencatat migrasi fauna langka secara otomatis.', 'FaunaTrack menyelesaikan masalah pemantauan satwa liar di hutan lindung yang selama ini membutuhkan review manual ribuan foto dari camera trap. Dengan menanamkan model TensorFlow Lite yang dioptimalkan di komputasi tepi (Edge AI), kamera dapat mengenali jenis satwa endemik Indonesia (seperti Harimau Sumatera, Orangutan, dan Badak Jawa) secara real-time. Data deteksi berupa koordinat dan jenis satwa dikirimkan secara berkala menggunakan sinyal satelit hemat daya.', ARRAY['Dian Sastro', 'Eko Prasetyo', 'Fiona Agatha'], 'linear-gradient(135deg, #2E5C8A, #5D8AA8)', 98),

('g3', 'TerraGrow: Hidroponik Otomatis Rumah Tangga', 'terragrow-hydro', 'Booth B01', 'IoT & Hardware', 'Alat hidroponik vertikal modular dengan kontrol nutrisi dan pencahayaan otomatis yang dapat dipantau via aplikasi mobile.', 'TerraGrow membawa pertanian modern ke dalam ruang hunian sempit perkotaan (urban farming). Alat ini memadukan sensor kelarutan air (TDS), sensor suhu air, dan lampu grow-light LED berspektrum penuh yang dikontrol oleh ESP32. Pengguna cukup mengisi tangki air dan memilih jenis tanaman di aplikasi Android/iOS, dan sistem akan mengalirkan nutrisi serta mengatur siklus pencahayaan secara presisi.', ARRAY['Genta Prakoso', 'Hendra Wijaya', 'Indah Permata'], 'linear-gradient(135deg, #7A5C12, #C29B38)', 120),

('g4', 'CarbonChain: Buku Besar Jejak Karbon', 'carbonchain', 'Booth B02', 'Software & Web', 'Platform berbasis blockchain konsorsium untuk audit dan verifikasi klaim kredit karbon perusahaan secara transparan.', 'CarbonChain adalah jawaban atas isu greenwashing yang marak dilakukan industri global. Dengan mencatat siklus hidup produksi karbon dan pembelian kredit karbon di jaringan blockchain yang immutable (tidak dapat diubah), CarbonChain mempermudah auditor eksternal melakukan verifikasi kebenaran klaim net-zero emission perusahaan. Pengguna dapat melacak sertifikasi karbon secara detail hingga koordinat pohon yang ditanam sebagai offset.', ARRAY['Jaka Sembung', 'Kurniawan', 'Lina Marlina'], 'linear-gradient(135deg, #3A3A3A, #7A7A7A)', 85),

('g5', 'ReLeaf: Marketplace Bibit & Donasi Pohon', 'releaf-marketplace', 'Booth C01', 'Software & Web', 'Aplikasi crowdfunding penanaman kembali hutan gundul dengan pelacakan pohon berbasis geolocation interaktif.', 'ReLeaf menghubungkan komunitas pecinta alam dengan donatur korporat atau individu yang ingin menyumbang bibit pohon. Berbeda dari donasi biasa, donatur ReLeaf mendapat akses koordinat GPS pohon yang mereka sumbangkan. Komunitas lokal akan mengupdate foto pertumbuhan pohon tersebut setiap 6 bulan melalui platform, memberikan transparansi tinggi dan meningkatkan perekonomian petani bibit lokal.', ARRAY['Mona Lisa', 'Novianti', 'Oki Setiana'], 'linear-gradient(135deg, #4E124C, #9B3B98)', 153)
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name,
slug = EXCLUDED.slug,
booth_number = EXCLUDED.booth_number,
category = EXCLUDED.category,
description = EXCLUDED.description,
full_description = EXCLUDED.full_description,
members = EXCLUDED.members,
photo_color = EXCLUDED.photo_color,
votes = EXCLUDED.votes;
