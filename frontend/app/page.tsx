"use client";

import Link from "next/link";
import { useVoter } from "@/components/VoterContext";
import { Leaf, ArrowRight, ShieldCheck, Heart, QrCode } from "lucide-react";
import Header from "@/components/Header";

export default function Home() {
  const { setQrScannerOpen } = useVoter();

  return (
    <>
      <Header />
      
      <main className="container" style={{ paddingBottom: "100px" }}>
        
        {/* Hero Section Asimetris */}
        <section className="asymmetric-header">
          <span className="badge">Pameran Capstone 2026</span>
          <span className="bg-text-shadow">WILD TECH</span>
          <h1 style={{ color: "var(--color-delft-blue)", textTransform: "none", fontWeight: 700 }}>
            Di Mana Rimbun <span style={{ color: "var(--color-fern-green)", fontStyle: "italic" }}>Alam</span> Memeluk Presisi <span style={{ textDecoration: "underline", textDecorationColor: "var(--color-carolina-blue)" }}>Teknologi</span>.
          </h1>
        </section>

        {/* Overlapping Hero Banner & Intro */}
        <section className="split-layout" style={{ margin: "var(--space-xl) 0" }}>
          
          {/* Kolom Kiri: Teks & Whitespace */}
          <div style={{ paddingRight: "var(--space-lg)" }}>
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
                &ldquo;Satu Pengunjung, Satu Suara. Suara Anda sepenuhnya terenkripsi dan diverifikasi menggunakan perangkat fisik guna menjamin transparansi mutlak.&rdquo;
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Gambar Overlapping & Asimetris */}
          <div style={{ position: "relative" }}>
            {/* Background Block Solid Tergeser */}
            <div 
              style={{ 
                position: "absolute", 
                top: "20px", 
                left: "20px", 
                width: "100%", 
                height: "320px", 
                backgroundColor: "var(--color-pistachio)", 
                border: "2px solid var(--color-delft-blue)",
                borderRadius: "var(--radius-md)",
                zIndex: 1
              }}
            />
            
            {/* Foto Utama */}
            <div 
              style={{ 
                position: "relative", 
                height: "320px", 
                border: "2px solid var(--color-delft-blue)", 
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                zIndex: 2,
                backgroundColor: "var(--color-white)"
              }}
            >
              <div 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  background: "linear-gradient(45deg, var(--color-delft-blue), var(--color-fern-green))",
                  padding: "40px",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative"
                }}
              >
                {/* SVG/CSS Botanical Tech Line Art (Hand-drawn feel) */}
                <div style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.15, pointerEvents: "none" }}>
                  <svg width="240" height="240" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10,90 Q30,60 50,50 T90,10" />
                    <path d="M50,50 Q40,30 20,20" />
                    <path d="M50,50 Q60,70 80,80" />
                    <circle cx="50" cy="50" r="4" fill="currentColor" />
                    <circle cx="90" cy="10" r="3" fill="currentColor" />
                    <circle cx="20" cy="20" r="3" fill="currentColor" />
                    <circle cx="80" cy="80" r="3" fill="currentColor" />
                  </svg>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Leaf size={32} style={{ color: "var(--color-pistachio)" }} />
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", border: "1px solid white", padding: "4px 8px", textTransform: "uppercase" }}>
                    Live Booths Open
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: "1.75rem", fontFamily: "var(--font-heading)", marginBottom: "8px" }}>
                    Explore the Tech Jungle
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
                    Gunakan handphone Anda untuk memindai QR Code di papan fisik setiap booth, simpan kelompok ke daftar favorit, lalu kirim suara Anda saat selesai berkeliling.
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Tag Overlap */}
            <div 
              style={{ 
                position: "absolute", 
                bottom: "-20px", 
                left: "-15px", 
                backgroundColor: "var(--color-white)", 
                border: "2px solid var(--color-delft-blue)", 
                padding: "12px 20px",
                zIndex: 3,
                borderRadius: "var(--radius-sm)",
                boxShadow: "4px 4px 0px 0px var(--color-delft-blue)",
                transform: "rotate(-1.5deg)"
              }}
            >
              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-fern-green)", textTransform: "uppercase" }}>
                Kategori Proyek
              </p>
              <h4 style={{ fontSize: "1.1rem", fontFamily: "var(--font-heading)", color: "var(--color-delft-blue)" }}>
                IoT, Software, & Web Hijau
              </h4>
            </div>
          </div>
        </section>

        {/* Whitespace Section Gap */}
        <div style={{ height: "40px" }} />

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
              <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>Jelajahi Booth</h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                Kelilingi ruang pameran fisik, temukan proyek capstone mahasiswa yang inovatif, dan berinteraksi dengan tim.
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
              <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>Simpan Favorit</h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                Scan QR Code di booth atau klik tombol Hati (<Heart size={14} />) di website untuk menyimpan kelompok ke daftar favorit Anda.
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
              <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>Verifikasi Identitas</h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                Masukkan Email/WhatsApp aktif Anda dan pilih kategori pengunjung untuk menerima kode OTP verifikasi anti-fraud.
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
              <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>Vote & Ambil Bukti</h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                Pilih satu kelompok terbaik untuk diberikan suara Anda, lalu simpan kode bukti vote unik (`VOTE-XXXX`) yang diberikan.
              </p>
            </div>

          </div>
        </section>

      </main>
    </>
  );
}
