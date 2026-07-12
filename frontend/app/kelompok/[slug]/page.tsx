"use client";

import { use, useEffect, useState } from "react";
import { useVoter } from "@/components/VoterContext";
import Link from "next/link";
import Header from "@/components/Header";
import { ArrowLeft, Heart, CheckCircle2, User, Landmark, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GroupDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { groupsList, isShortlisted, addToShortlist, removeFromShortlist, visitor } = useVoter();
  
  const group = groupsList.find((g) => g.slug === slug);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (group) {
      setActive(isShortlisted(group.id));
    }
  }, [group, isShortlisted]);

  if (!group) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: "center", padding: "100px 20px" }}>
          <h2 style={{ fontFamily: "var(--font-heading)" }}>Kelompok Tidak Ditemukan</h2>
          <p style={{ marginTop: "10px", marginBottom: "20px" }}>Maaf, rincian kelompok capstone yang Anda cari tidak tersedia.</p>
          <Link href="/kelompok" className="btn btn-primary">Kembali ke Daftar</Link>
        </div>
      </>
    );
  }

  const handleFavoriteClick = () => {
    if (active) {
      removeFromShortlist(group.id);
      setActive(false);
    } else {
      addToShortlist(group.id);
      setActive(true);
    }
  };

  const handleVoteDirectly = () => {
    // Tambahkan kelompok ini ke shortlist, lalu bawa ke halaman vote
    addToShortlist(group.id);
    if (visitor) {
      router.push("/vote");
    } else {
      router.push("/verifikasi");
    }
  };

  return (
    <>
      <Header />
      
      <main className="container" style={{ paddingBottom: "120px" }}>
        
        {/* Back Link */}
        <Link 
          href="/kelompok" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            margin: "24px 0",
            fontSize: "0.9rem",
            color: "var(--color-delft-blue)",
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} />
          Kembali ke Daftar Kelompok
        </Link>

        {/* Banner Utama Asimetris */}
        <div className="detail-hero-card">
          <div className="detail-banner">
            <div 
              style={{ 
                width: "100%", 
                height: "100%", 
                background: group.photoColor,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontFamily: "var(--font-heading)",
                fontWeight: "700",
                fontSize: "6rem",
                textShadow: "4px 4px 0 var(--color-delft-blue)"
              }}
            >
              {group.booth_number.replace("Booth ", "")}
            </div>
            
            {/* Booth Badge Melayang Heksagonal/Asimetris */}
            <div 
              style={{ 
                position: "absolute", 
                bottom: "-15px", 
                right: "24px", 
                backgroundColor: "var(--color-pistachio)", 
                color: "var(--color-delft-blue)", 
                border: "2px solid var(--color-delft-blue)",
                padding: "8px 20px",
                fontFamily: "var(--font-heading)",
                fontWeight: "700",
                fontSize: "1.1rem",
                borderRadius: "var(--radius-sm)",
                boxShadow: "3px 3px 0px 0px var(--color-delft-blue)",
                zIndex: 10
              }}
            >
              {group.booth_number}
            </div>
          </div>

          <div className="detail-info-overlay">
            <span style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-fern-green)", letterSpacing: "0.05em" }}>
              {group.category}
            </span>
            <h1 
              style={{ 
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)", 
                fontFamily: "var(--font-heading)", 
                color: "var(--color-delft-blue)",
                marginTop: "4px",
                lineHeight: "1.2"
              }}
            >
              {group.name}
            </h1>
          </div>
        </div>

        {/* Layout Split Asimetris */}
        <div className="split-layout">
          
          {/* Kolom Kiri: Informasi Detail & Deskripsi Proyek */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Section Deskripsi */}
            <div>
              <h3 
                style={{ 
                  fontSize: "1.25rem", 
                  textTransform: "uppercase", 
                  fontFamily: "var(--font-heading)",
                  borderBottom: "2px solid var(--color-delft-blue)",
                  paddingBottom: "8px",
                  marginBottom: "16px"
                }}
              >
                Tentang Proyek
              </h3>
              <p style={{ fontSize: "1.05rem", lineHeight: "1.7", color: "var(--color-delft-blue)", opacity: 0.9 }}>
                {group.fullDescription}
              </p>
            </div>

            {/* Section Anggota */}
            <div>
              <h3 
                style={{ 
                  fontSize: "1.25rem", 
                  textTransform: "uppercase", 
                  fontFamily: "var(--font-heading)",
                  borderBottom: "2px solid var(--color-delft-blue)",
                  paddingBottom: "8px",
                  marginBottom: "16px"
                }}
              >
                Tim Pengembang
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {group.members.map((member, idx) => (
                  <div key={idx} className="group-member-card">
                    <div className="group-member-avatar">
                      <User size={20} style={{ color: "var(--color-fern-green)" }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "0.9rem", color: "var(--color-delft-blue)", fontWeight: "600" }}>{member}</h4>
                      <p style={{ fontSize: "0.75rem", opacity: 0.7 }}>Mahasiswa Capstone</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Actions Panel (Sticky/Melayang Asimetris) */}
          <div 
            style={{ 
              border: "2px solid var(--color-delft-blue)", 
              padding: "28px", 
              borderRadius: "var(--radius-md)", 
              backgroundColor: "var(--color-white)",
              boxShadow: "6px 6px 0px 0px var(--color-delft-blue)",
              position: "sticky",
              top: "90px"
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "16px" }}>
              Berikan Suara Anda
            </h3>
            
            <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "24px" }}>
              Simpan proyek ini ke daftar favorit Anda terlebih dahulu, atau berikan suara langsung sebagai satu-satunya hak pilih Anda.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Button Favorite */}
              <button 
                onClick={handleFavoriteClick}
                className="btn"
                style={{ 
                  width: "100%", 
                  gap: "10px", 
                  backgroundColor: active ? "var(--color-pistachio)" : "white",
                  justifyContent: "center"
                }}
              >
                <Heart size={18} fill={active ? "#e63946" : "none"} stroke={active ? "#e63946" : "currentColor"} />
                {active ? "Tersimpan di Favorit" : "Simpan ke Favorit"}
              </button>

              {/* Button Vote Direct */}
              <button 
                onClick={handleVoteDirectly}
                className="btn btn-primary" 
                style={{ width: "100%", gap: "10px", justifyContent: "center" }}
              >
                <CheckCircle2 size={18} />
                Pilih Kelompok Ini
              </button>
            </div>

            {/* Asymmetric Info Badge */}
            <div 
              style={{ 
                marginTop: "24px", 
                padding: "16px", 
                backgroundColor: "var(--color-beige)", 
                border: "1px dashed var(--color-delft-blue)", 
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                display: "flex",
                gap: "8px",
                alignItems: "flex-start"
              }}
            >
              <HelpCircle size={16} style={{ flexShrink: 0, color: "var(--color-fern-green)" }} />
              <div>
                <span style={{ fontWeight: 700 }}>PENTING:</span> Setiap pengunjung hanya berhak memberikan 1 suara final. Pilihan yang dikirim tidak dapat dibatalkan atau diedit kembali.
              </div>
            </div>
          </div>

        </div>

      </main>
    </>
  );
}
