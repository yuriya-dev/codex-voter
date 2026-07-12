export interface Group {
  id: string;
  name: string;
  slug: string;
  booth_number: string;
  category: string;
  description: string;
  fullDescription: string;
  members: string[];
  photoColor: string;
  stats: {
    votes: number;
  };
}

export const MOCK_GROUPS: Group[] = [
  {
    id: "g1",
    name: "Arboris: Sensor Kelembaban Hutan Berbasis IoT",
    slug: "arboris-iot",
    booth_number: "Booth A01",
    category: "IoT & Hardware",
    description: "Sistem monitoring ekosistem tanah hutan menggunakan sensor IoT bertenaga surya untuk mencegah deforestasi mikro.",
    fullDescription: "Arboris adalah solusi teknologi hijau yang dirancang khusus untuk memantau kesehatan ekosistem tanah di area hutan tropis. Menggunakan jaringan mesh mikrokontroler bertenaga surya, Arboris dapat membaca kelembaban, pH tanah, suhu udara, dan tingkat nitrogen secara berkala, lalu mengirimkannya ke server terpusat melalui koneksi LoRaWAN. Sistem ini mempermudah peneliti dan polisi hutan mendeteksi anomali alam seperti potensi kebakaran atau kekeringan ekstrem sebelum terjadi kerusakan parah.",
    members: ["Andi Wijaya", "Budi Santoso", "Citra Kirana"],
    photoColor: "linear-gradient(135deg, #1B4D3E, #4B8B3B)",
    stats: { votes: 142 }
  },
  {
    id: "g2",
    name: "FaunaTrack: AI Detektor Spesies Endemik",
    slug: "faunatrack-ai",
    booth_number: "Booth A02",
    category: "Software & AI",
    description: "Model computer vision yang dipasang pada camera trap untuk mengidentifikasi dan mencatat migrasi fauna langka secara otomatis.",
    fullDescription: "FaunaTrack menyelesaikan masalah pemantauan satwa liar di hutan lindung yang selama ini membutuhkan review manual ribuan foto dari camera trap. Dengan menanamkan model TensorFlow Lite yang dioptimalkan di komputasi tepi (Edge AI), kamera dapat mengenali jenis satwa endemik Indonesia (seperti Harimau Sumatera, Orangutan, dan Badak Jawa) secara real-time. Data deteksi berupa koordinat dan jenis satwa dikirimkan secara berkala menggunakan sinyal satelit hemat daya.",
    members: ["Dian Sastro", "Eko Prasetyo", "Fiona Agatha"],
    photoColor: "linear-gradient(135deg, #2E5C8A, #5D8AA8)",
    stats: { votes: 98 }
  },
  {
    id: "g3",
    name: "TerraGrow: Hidroponik Otomatis Rumah Tangga",
    slug: "terragrow-hydro",
    booth_number: "Booth B01",
    category: "IoT & Hardware",
    description: "Alat hidroponik vertikal modular dengan kontrol nutrisi dan pencahayaan otomatis yang dapat dipantau via aplikasi mobile.",
    fullDescription: "TerraGrow membawa pertanian modern ke dalam ruang hunian sempit perkotaan (urban farming). Alat ini memadukan sensor kelarutan air (TDS), sensor suhu air, dan lampu grow-light LED berspektrum penuh yang dikontrol oleh ESP32. Pengguna cukup mengisi tangki air dan memilih jenis tanaman di aplikasi Android/iOS, dan sistem akan mengalirkan nutrisi serta mengatur siklus pencahayaan secara presisi.",
    members: ["Genta Prakoso", "Hendra Wijaya", "Indah Permata"],
    photoColor: "linear-gradient(135deg, #7A5C12, #C29B38)",
    stats: { votes: 120 }
  },
  {
    id: "g4",
    name: "CarbonChain: Buku Besar Jejak Karbon",
    slug: "carbonchain",
    booth_number: "Booth B02",
    category: "Software & Web",
    description: "Platform berbasis blockchain konsorsium untuk audit dan verifikasi klaim kredit karbon perusahaan secara transparan.",
    fullDescription: "CarbonChain adalah jawaban atas isu greenwashing yang marak dilakukan industri global. Dengan mencatat siklus hidup produksi karbon dan pembelian kredit karbon di jaringan blockchain yang immutable (tidak dapat diubah), CarbonChain mempermudah auditor eksternal melakukan verifikasi kebenaran klaim net-zero emission perusahaan. Pengguna dapat melacak sertifikasi karbon secara detail hingga koordinat pohon yang ditanam sebagai offset.",
    members: ["Jaka Sembung", "Kurniawan", "Lina Marlina"],
    photoColor: "linear-gradient(135deg, #3A3A3A, #7A7A7A)",
    stats: { votes: 85 }
  },
  {
    id: "g5",
    name: "ReLeaf: Marketplace Bibit & Donasi Pohon",
    slug: "releaf-marketplace",
    booth_number: "Booth C01",
    category: "Software & Web",
    description: "Aplikasi crowdfunding penanaman kembali hutan gundul dengan pelacakan pohon berbasis geolocation interaktif.",
    fullDescription: "ReLeaf menghubungkan komunitas pecinta alam dengan donatur korporat atau individu yang ingin menyumbang bibit pohon. Berbeda dari donasi biasa, donatur ReLeaf mendapatkan akses koordinat GPS pohon yang mereka sumbangkan. Komunitas lokal akan mengupdate foto pertumbuhan pohon tersebut setiap 6 bulan melalui platform, memberikan transparansi tinggi dan meningkatkan perekonomian petani bibit lokal.",
    members: ["Mona Lisa", "Novianti", "Oki Setiana"],
    photoColor: "linear-gradient(135deg, #4E124C, #9B3B98)",
    stats: { votes: 153 }
  }
];

// Helper untuk inisialisasi state dummy di localStorage jika tidak ada database
export function getLocalStorageState() {
  if (typeof window === "undefined") return { visitors: [], votes: [], shortlists: [] };
  
  const visitors = JSON.parse(localStorage.getItem("voter_visitors") || "[]");
  const votes = JSON.parse(localStorage.getItem("voter_votes") || "[]");
  const shortlists = JSON.parse(localStorage.getItem("voter_shortlists") || "[]");
  
  return { visitors, votes, shortlists };
}
