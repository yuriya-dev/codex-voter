const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors({ origin: "http://localhost:3030" }));
app.use(express.json());

// In-Memory Database (State Server)
let groups = [
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
    votes: 142
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
    votes: 98
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
    votes: 120
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
    votes: 85
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
    votes: 153
  }
];

let votes = [];
let visitors = [];
let auditLogs = [
  {
    id: "a1",
    time: "22:35:12",
    action: "System Boot",
    detail: "Backend API Server initialized on port 5000",
    status: "success"
  }
];

// OTP Store (identifier -> code)
const otpStore = new Map();

// Helper to push audit logs
function addAuditLog(action, detail, status = "success") {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    time: timeStr,
    action,
    detail,
    status
  };
  
  auditLogs = [newLog, ...auditLogs.slice(0, 49)]; // Limit to 50 logs
  console.log(`[AUDIT LOG] [${status.toUpperCase()}] ${action}: ${detail}`);
}

// REST Endpoints
app.get("/api/groups", (req, res) => {
  // Return groups mapped with votes
  const responseGroups = groups.map(g => {
    const extraVotes = votes.filter(v => v.groupId === g.id).length;
    return {
      ...g,
      stats: { votes: g.votes + extraVotes }
    };
  });
  res.json(responseGroups);
});

// Helper to format client IP
function getClientIp(req) {
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    return "127.0.0.1";
  }
  return ip;
}

// Verify & Register Visitor using Name & Category
app.post("/api/auth/verify", (req, res) => {
  const { name, category } = req.body;
  const ipAddress = getClientIp(req);

  if (!name || !category) {
    return res.status(400).json({ error: "Nama Lengkap dan Kategori wajib diisi" });
  }

  // Check if this IP address has already voted
  const ipHasVoted = votes.some(v => v.ip === ipAddress);
  if (ipHasVoted) {
    addAuditLog("Access Denied", `IP ${ipAddress} mencoba masuk kembali tapi sudah pernah melakukan vote.`, "error");
    return res.status(403).json({ error: "Perangkat dengan alamat IP ini sudah digunakan untuk memberikan suara!" });
  }

  // Create hash from name for visitor identifier
  const identifierHash = Buffer.from(name.trim()).toString("base64").substring(0, 12);
  
  let visitor = visitors.find(v => v.identifier === identifierHash);
  if (!visitor) {
    visitor = {
      identifier: identifierHash,
      name: name.trim(),
      category,
      verifiedAt: new Date().toISOString(),
      deviceFingerprint: "fingerprint_" + Math.random().toString(36).substr(2, 9),
      ip: ipAddress
    };
    visitors.push(visitor);
  }

  addAuditLog("Registration Success", `Pengunjung '${name}' (${category}) terdaftar dari IP: ${ipAddress}`, "success");
  
  // Check if visitor has already voted by identifier
  const existingVote = votes.find(v => v.visitorIdentifier === identifierHash);

  res.json({
    visitor,
    hasVoted: !!existingVote || ipHasVoted,
    activeVote: existingVote || null
  });
});

// Cast Vote (Enforces 1 vote per visitor and 1 vote per IP)
app.post("/api/votes", (req, res) => {
  const { visitorIdentifier, groupId } = req.body;
  const ipAddress = getClientIp(req);
  
  if (!visitorIdentifier || !groupId) {
    return res.status(400).json({ error: "Identitas pemilih dan pilihan kelompok wajib diisi" });
  }

  // 1. Enforce 1 visitor = 1 vote constraint
  const alreadyVoted = votes.some(v => v.visitorIdentifier === visitorIdentifier);
  if (alreadyVoted) {
    addAuditLog("Double Vote Denied", `Mencegah vote ganda dari identitas: ${visitorIdentifier}`, "error");
    return res.status(403).json({ error: "Nama Anda sudah tercatat memberikan suara!" });
  }

  // 2. Enforce 1 IP = 1 vote constraint (Duplicate IP prevention)
  const ipAlreadyVoted = votes.some(v => v.ip === ipAddress);
  if (ipAlreadyVoted) {
    addAuditLog("Duplicate IP Denied", `Mencegah vote ganda dari alamat IP: ${ipAddress}`, "error");
    return res.status(403).json({ error: "Perangkat/IP ini sudah digunakan untuk memberikan suara!" });
  }

  // 3. Verify group exists
  const targetGroup = groups.find(g => g.id === groupId);
  if (!targetGroup) {
    return res.status(404).json({ error: "Kelompok tidak ditemukan" });
  }

  // 4. Cast Vote
  const voteCode = `VOTE-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  const newVote = {
    visitorIdentifier,
    groupId,
    voteCode,
    votedAt: new Date().toISOString(),
    ip: ipAddress
  };

  votes.push(newVote);
  addAuditLog(
    "Vote Submitted", 
    `Suara diberikan ke ${targetGroup.name} (${targetGroup.booth_number}) dari IP: ${ipAddress}`, 
    "success"
  );

  res.json(newVote);
});

// Admin Dashboard stats
app.get("/api/dashboard/stats", (req, res) => {
  const groupStats = groups.map(g => {
    const extraVotes = votes.filter(v => v.groupId === g.id).length;
    return {
      id: g.id,
      name: g.name,
      booth_number: g.booth_number,
      category: g.category,
      votes: g.votes + extraVotes
    };
  });

  res.json({
    totalVotes: groups.reduce((sum, g) => sum + g.votes, 0) + votes.length,
    groupStats
  });
});

// Admin Dashboard logs
app.get("/api/dashboard/logs", (req, res) => {
  res.json(auditLogs);
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🟢 BACKEND SERVER IS RUNNING ON http://localhost:${PORT}`);
  console.log(`====================================================`);
});
