"use client";

import Link from "next/link";
import { useVoter } from "@/components/VoterContext";
import { Leaf, ArrowRight, ShieldCheck, Heart, QrCode } from "lucide-react";
import Header from "@/components/Header";
import BrutalistCard from "@/components/BrutalistCard";

export default function Home() {
  const { setQrScannerOpen, maxVotesLimit } = useVoter();

  return (
    <>
      <Header />
      
      <main className="container" style={{ paddingBottom: "100px" }}>
        
        {/* Unified Split Layout: Header, Intro, & Card */}
        <section className="split-layout" style={{ marginTop: "var(--space-2xl)", marginBottom: "var(--space-xl)", alignItems: "center" }}>
          
          {/* Kolom Kiri: Header & Teks */}
          <div style={{ paddingRight: "var(--space-lg)" }}>
            
            {/* Hero Section Asimetris (di dalam kolom kiri) */}
            <div className="asymmetric-header" style={{ marginTop: 0, marginBottom: "var(--space-md)" }}>
              <span className="badge">Pameran Capstone 2026</span>
              <span className="bg-text-shadow">WILD TECH</span>
              <h1 style={{ color: "var(--color-delft-blue)", textTransform: "none", fontWeight: 700 }}>
                Di Mana Rimbun <span style={{ color: "var(--color-fern-green)", fontStyle: "italic" }}>Alam</span> Memeluk Presisi <span style={{ textDecoration: "underline", textDecorationColor: "var(--color-carolina-blue)" }}>Teknologi</span>.
              </h1>
            </div>

            <p style={{ fontSize: "1.25rem", color: "var(--color-delft-blue)", fontWeight: 500, lineHeight: "1.6", marginBottom: "28px" }}>
              Selamat datang di Ruang Pameran Capstone. Di sini, puluhan ide mahasiswa dikembangkan untuk menjaga bumi dengan kode pemrograman. Berkelilinglah di area booth, amati karya mereka, dan tentukan suara Anda.
            </p>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              <Link href="/kelompok" className="btn btn-primary" style={{ gap: "12px" }}>
                Jelajahi Kelompok
                <ArrowRight size={18} />
              </Link>
              <button 
                onClick={() => setQrScannerOpen(true)} 
                className="btn btn-secondary" 
                style={{ gap: "12px", background: "var(--color-white)" }}
              >
                <QrCode size={18} />
                Scan QR Booth
              </button>
            </div>

            {/* Asymmetric Quote Block */}
            <div 
              style={{ 
                marginTop: "48px", 
                padding: "24px", 
                borderLeft: "4px solid var(--color-fern-green)", 
                backgroundColor: "rgba(67, 113, 24, 0.05)",
                borderRadius: "var(--radius-sm)"
              }}
            >
              <span style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-fern-green)", letterSpacing: "0.1em" }}>
                Prinsip Voting
              </span>
              <p style={{ fontSize: "0.9rem", fontStyle: "italic", marginTop: "8px", color: "var(--color-delft-blue)" }}>
                &ldquo;Satu Akun Google, Satu Pilihan. Setiap pengunjung wajib masuk menggunakan akun Google pribadi dan hanya berhak memberikan <strong>{maxVotesLimit} suara final</strong> untuk proyek terfavorit.&rdquo;
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Brutalist Card */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <BrutalistCard />
          </div>
        </section>

        {/* Whitespace Section Gap */}
        <div style={{ height: "40px" }} />

        {/* Filosofi Jungle Tech Section */}
        <section 
          style={{ 
            margin: "var(--space-xl) 0 var(--space-2xl) 0",
            backgroundColor: "rgba(67, 113, 24, 0.05)",
            border: "2px solid var(--color-delft-blue)",
            borderRadius: "var(--radius-sm)",
            padding: "48px var(--space-lg)",
            position: "relative",
            boxShadow: "5px 5px 0px var(--color-delft-blue)"
          }}
        >
          <div style={{ position: "absolute", top: "-15px", left: "24px" }}>
            <span className="badge" style={{ backgroundColor: "var(--color-delft-blue)", color: "white", fontSize: "0.8rem" }}>
              Tema Pameran
            </span>
          </div>

          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 
              style={{ 
                fontSize: "1.75rem", 
                fontFamily: "var(--font-heading)", 
                color: "var(--color-delft-blue)",
                marginBottom: "20px"
              }}
            >
              Filosofi <span style={{ color: "var(--color-fern-green)", fontStyle: "italic" }}>Jungle Tech</span>
            </h2>
            
            <p 
              style={{ 
                fontSize: "1.1rem", 
                lineHeight: "1.7", 
                color: "var(--color-delft-blue)", 
                fontWeight: "500",
                marginBottom: "36px"
              }}
            >
              Jungle Tech bukanlah tentang mesin yang menaklukkan alam, melainkan tentang simbiosis mutualisme antara sirkuit dan akar, antara inovasi dan ekologi.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
              
              {/* Pilar 1 */}
              <div>
                <h4 style={{ fontSize: "1rem", fontFamily: "var(--font-heading)", color: "var(--color-fern-green)", marginBottom: "8px" }}>
                  1. Inovasi yang Berakar
                </h4>
                <p style={{ fontSize: "0.85rem", opacity: 0.9, lineHeight: "1.6" }}>
                  Teknologi harus memiliki pijakan yang kuat pada kelestarian bumi. Ia tidak merampas, melainkan memelihara.
                </p>
              </div>

              {/* Pilar 2 */}
              <div>
                <h4 style={{ fontSize: "1rem", fontFamily: "var(--font-heading)", color: "var(--color-fern-green)", marginBottom: "8px" }}>
                  2. Pertumbuhan Organik
                </h4>
                <p style={{ fontSize: "0.85rem", opacity: 0.9, lineHeight: "1.6" }}>
                  Seperti hutan yang perlahan membentuk ekosistem yang kompleks dan menghidupi, teknologi yang baik harus berkembang untuk memberi manfaat abadi bagi seluruh makhluk hidup, bukan hanya manusia.
                </p>
              </div>

              {/* Pilar 3 */}
              <div>
                <h4 style={{ fontSize: "1rem", fontFamily: "var(--font-heading)", color: "var(--color-fern-green)", marginBottom: "8px" }}>
                  3. Harmoni Tanpa Jejak Buruk
                </h4>
                <p style={{ fontSize: "0.85rem", opacity: 0.9, lineHeight: "1.6" }}>
                  Kemajuan peradaban tidak boleh diukur dari seberapa banyak pohon yang ditebang, melainkan dari seberapa pintar teknologi kita meniru siklus alam yang tidak pernah menyisakan limbah (semua kembali menjadi kehidupan).
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Alur Voting Section */}
        <section className="section-gap">
          <h2 
            style={{ 
              fontSize: "2rem", 
              textTransform: "uppercase", 
              marginBottom: "32px",
              borderBottom: "2px solid var(--color-delft-blue)",
              paddingBottom: "12px"
            }}
          >
            Alur Voting
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
            
            {/* Step 1 */}
            <div 
              style={{ 
                border: "2px solid var(--color-delft-blue)", 
                padding: "24px", 
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-white)",
                boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
              }}
            >
              <div 
                style={{ 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "50%", 
                  backgroundColor: "var(--color-beige)", 
                  border: "2px solid var(--color-delft-blue)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  marginBottom: "16px"
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>Login Google & Registrasi</h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                Masuk menggunakan akun Google pribadi Anda, lalu lengkapi Nama dan Kategori Pemilih untuk memulai sesi voting.
              </p>
            </div>

            {/* Step 2 */}
            <div 
              style={{ 
                border: "2px solid var(--color-delft-blue)", 
                padding: "24px", 
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-white)",
                boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
              }}
            >
              <div 
                style={{ 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "50%", 
                  backgroundColor: "var(--color-carolina-blue)", 
                  border: "2px solid var(--color-delft-blue)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  marginBottom: "16px"
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>Jelajahi & Shortlist</h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                Kunjungi booth capstone fisik, pindai QR Code di booth, dan tambahkan kelompok proyek terbaik ke dalam daftar favorit Anda.
              </p>
            </div>

            {/* Step 3 */}
            <div 
              style={{ 
                border: "2px solid var(--color-delft-blue)", 
                padding: "24px", 
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-white)",
                boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
              }}
            >
              <div 
                style={{ 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "50%", 
                  backgroundColor: "var(--color-pistachio)", 
                  border: "2px solid var(--color-delft-blue)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  marginBottom: "16px"
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>Scan QR Pintu Keluar</h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                Setelah selesai menjelajahi seluruh area pameran, pindai QR Code di Pintu Keluar (Exit Gate) untuk membuka akses tombol voting.
              </p>
            </div>

            {/* Step 4 */}
            <div 
              style={{ 
                border: "2px solid var(--color-delft-blue)", 
                padding: "24px", 
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-white)",
                boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
              }}
            >
              <div 
                style={{ 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "50%", 
                  backgroundColor: "var(--color-fern-green)", 
                  color: "white",
                  border: "2px solid var(--color-delft-blue)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  marginBottom: "16px"
                }}
              >
                4
              </div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>Vote & Simpan Bukti</h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                Kirim suara Anda ke kelompok capstone pilihan Anda dan catat kode bukti vote unik (`VOTE-XXXX`) untuk penjaminan keaslian.
              </p>
            </div>

          </div>
        </section>

      </main>
    </>
  );
}
