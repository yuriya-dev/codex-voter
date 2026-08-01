"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, Printer, Palette, Layout, Edit3, ShieldAlert, Sparkles, Check } from "lucide-react";
import { EXIT_UNLOCK_TOKEN } from "@/lib/config";

interface PosterGeneratorProps {
  origin: string;
}

type AspectRatioType = "6:16" | "1:1" | "4:5";
type ThemeType = "brand" | "midnight" | "brutalist" | "ocean";

interface ThemeStyles {
  bg: string;
  textColor: string;
  subTextColor: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  badgeBg: string;
  badgeText: string;
  numberBg: string;
  numberText: string;
  accentColor: string;
  rulesBg: string;
  rulesBorder: string;
}

export default function PosterGenerator({ origin }: PosterGeneratorProps) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("6:16");
  const [theme, setTheme] = useState<ThemeType>("brand");
  const [title, setTitle] = useState("PANDUAN ALUR VOTING");
  const [subtitle, setSubtitle] = useState("CAPSTONE PROJECT EXHIBITION");
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(0.25);
  
  const posterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Target links
  const mainWebLink = `${origin}/`;
  const exitGateLink = `${origin}/?unlock=${EXIT_UNLOCK_TOKEN}`;

  // QR API link generator
  const getQrUrl = (url: string) => 
    `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(url)}`;

  // Define Theme Palettes
  const themes: Record<ThemeType, ThemeStyles> = {
    brand: {
      bg: "#f5f3d8", // var(--color-beige)
      textColor: "#1d2a62", // var(--color-delft-blue)
      subTextColor: "rgba(29, 42, 98, 0.8)",
      cardBg: "#ffffff",
      cardBorder: "3px solid #1d2a62",
      cardShadow: "5px 5px 0px 0px #1d2a62",
      badgeBg: "#87aece", // var(--color-carolina-blue)
      badgeText: "#1d2a62",
      numberBg: "#afd06e", // var(--color-pistachio)
      numberText: "#1d2a62",
      accentColor: "#437118", // var(--color-fern-green)
      rulesBg: "#ffffff",
      rulesBorder: "3px solid #1d2a62",
    },
    midnight: {
      bg: "#0a0d14",
      textColor: "#f8fafc",
      subTextColor: "#94a3b8",
      cardBg: "#121824",
      cardBorder: "2px solid #334155",
      cardShadow: "0px 0px 20px rgba(59, 130, 246, 0.25)",
      badgeBg: "#3b82f6", // Neon Blue
      badgeText: "#ffffff",
      numberBg: "#10b981", // Neon Green
      numberText: "#0a0d14",
      accentColor: "#10b981",
      rulesBg: "rgba(18, 24, 36, 0.8)",
      rulesBorder: "2px solid #ef4444",
    },
    brutalist: {
      bg: "#ffffff",
      textColor: "#000000",
      subTextColor: "#555555",
      cardBg: "#ffffff",
      cardBorder: "4px solid #000000",
      cardShadow: "8px 8px 0px 0px #000000",
      badgeBg: "#000000",
      badgeText: "#ffffff",
      numberBg: "#facc15", // Bright yellow
      numberText: "#000000",
      accentColor: "#000000",
      rulesBg: "#ffffff",
      rulesBorder: "4px solid #000000",
    },
    ocean: {
      bg: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
      textColor: "#0369a1",
      subTextColor: "#0ea5e9",
      cardBg: "#ffffff",
      cardBorder: "2px solid #0284c7",
      cardShadow: "4px 4px 15px rgba(14, 165, 233, 0.15)",
      badgeBg: "#0ea5e9",
      badgeText: "#ffffff",
      numberBg: "#38bdf8",
      numberText: "#0284c7",
      accentColor: "#0369a1",
      rulesBg: "#ffffff",
      rulesBorder: "2px dashed #0284c7",
    }
  };

  const currentTheme = themes[theme];

  // Dynamic Poster Dimensions for High-Res Output
  const dimensions: Record<AspectRatioType, { width: number; height: number }> = {
    "6:16": { width: 720, height: 1920 },
    "1:1": { width: 1000, height: 1000 },
    "4:5": { width: 800, height: 1000 }
  };

  const currentSize = dimensions[aspectRatio];

  // Adjust preview scaling to fit the screen container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32; // minus padding
        const containerHeight = 550; // max height of preview card
        const scaleW = containerWidth / currentSize.width;
        const scaleH = containerHeight / currentSize.height;
        setScale(Math.min(scaleW, scaleH, 1));
      }
    };

    handleResize();
    // Delay slightly to ensure layout has rendered
    const timer = setTimeout(handleResize, 100);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [aspectRatio, currentSize.width, currentSize.height]);

  // Export functions using html2canvas & jspdf
  const exportPoster = async (format: "jpg" | "pdf") => {
    if (!posterRef.current) return;
    setIsExporting(true);

    try {
      // Import html2canvas dynamically to bypass SSR issues
      const html2canvas = (await import("html2canvas")).default;
      
      // Target element clone to handle rendering accurately
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        scale: 2, // Double resolution for high-res print quality
        backgroundColor: theme === "midnight" ? "#0a0d14" : "#ffffff",
        logging: false
      });

      if (format === "jpg") {
        const image = canvas.toDataURL("image/jpeg", 0.95);
        const link = document.createElement("a");
        link.href = image;
        link.download = `codex_voter_poster_${aspectRatio.replace(":", "x")}.jpg`;
        link.click();
      } else if (format === "pdf") {
        const jspdf = await import("jspdf");
        const pdf = new jspdf.jsPDF({
          orientation: "portrait" as "portrait",
          unit: "px",
          format: [currentSize.width, currentSize.height]
        });
        
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 0, 0, currentSize.width, currentSize.height);
        pdf.save(`codex_voter_poster_${aspectRatio.replace(":", "x")}.pdf`);
      }
    } catch (error) {
      console.error("Gagal mengekspor poster:", error);
      alert("Terjadi kesalahan saat mengekspor poster. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Tab Header Description */}
      <div>
        <h2 style={{ fontSize: "1.6rem", fontFamily: "var(--font-heading)", textTransform: "uppercase", marginBottom: "8px" }}>
          🎨 Poster Alur Voting Generator
        </h2>
        <p style={{ fontSize: "0.9rem", opacity: 0.85 }}>
          Buat dan unduh poster petunjuk alur voting fisik untuk pameran. Dilengkapi dengan QR Code otomatis yang tertaut ke website utama dan exit gate Anda.
        </p>
      </div>

      <div className="split-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px", alignItems: "start" }}>
        
        {/* Kolom Kiri: Control Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Panel 1: Desain & Teks */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-heading)", borderBottom: "2px solid var(--color-delft-blue)", paddingBottom: "8px", textTransform: "uppercase" }}>
              <Edit3 size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Kustomisasi Teks
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>Judul Poster</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value.toUpperCase())}
                style={{ 
                  padding: "10px", 
                  borderRadius: "var(--radius-sm)", 
                  border: "2px solid var(--color-delft-blue)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: "bold"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>Subjudul / Event</label>
              <input 
                type="text" 
                value={subtitle} 
                onChange={(e) => setSubtitle(e.target.value.toUpperCase())}
                style={{ 
                  padding: "10px", 
                  borderRadius: "var(--radius-sm)", 
                  border: "2px solid var(--color-delft-blue)",
                  fontSize: "0.85rem"
                }}
              />
            </div>
          </div>

          {/* Panel 2: Ratio & Theme */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-heading)", borderBottom: "2px solid var(--color-delft-blue)", paddingBottom: "8px", textTransform: "uppercase", marginBottom: "12px" }}>
                <Layout size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Format & Rasio Aspek
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {(["6:16", "1:1", "4:5"] as AspectRatioType[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`btn ${aspectRatio === ratio ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      padding: "8px 0", 
                      fontSize: "0.8rem", 
                      justifyContent: "center",
                      backgroundColor: aspectRatio === ratio ? "var(--color-delft-blue)" : "transparent",
                      color: aspectRatio === ratio ? "white" : "var(--color-delft-blue)",
                    }}
                  >
                    {ratio === "6:16" ? "6:16 (Tall)" : ratio === "1:1" ? "1:1 (Square)" : "4:5 (Social)"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-heading)", borderBottom: "2px solid var(--color-delft-blue)", paddingBottom: "8px", textTransform: "uppercase", marginBottom: "12px" }}>
                <Palette size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Tema Warna
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {(["brand", "midnight", "brutalist", "ocean"] as ThemeType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`btn ${theme === t ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      padding: "10px 8px", 
                      fontSize: "0.8rem", 
                      justifyContent: "flex-start",
                      gap: "8px",
                      textTransform: "capitalize",
                      backgroundColor: theme === t ? "var(--color-delft-blue)" : "transparent",
                      color: theme === t ? "white" : "var(--color-delft-blue)"
                    }}
                  >
                    <span style={{ 
                      width: "12px", 
                      height: "12px", 
                      borderRadius: "50%", 
                      border: "1px solid black",
                      backgroundColor: t === "brand" ? "#f5f3d8" : t === "midnight" ? "#0a0d14" : t === "brutalist" ? "#ffffff" : "#e0f2fe",
                      display: "inline-block"
                    }} />
                    {t === "brand" ? "Tech Jungle" : t === "midnight" ? "Neon Dark" : t === "brutalist" ? "Brutalist" : "Ocean Fresh"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Panel 3: Ekspor */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-heading)", borderBottom: "2px solid var(--color-delft-blue)", paddingBottom: "8px", textTransform: "uppercase" }}>
              💾 Ekspor & Cetak
            </h3>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                onClick={() => exportPoster("jpg")}
                disabled={isExporting}
                className="btn btn-primary"
                style={{ flex: 1, height: "46px", justifyContent: "center", gap: "8px" }}
              >
                <Download size={18} /> {isExporting ? "Memproses..." : "Unduh JPG"}
              </button>
              <button 
                onClick={() => exportPoster("pdf")}
                disabled={isExporting}
                className="btn btn-secondary"
                style={{ flex: 1, height: "46px", justifyContent: "center", gap: "8px" }}
              >
                <Printer size={18} /> {isExporting ? "Memproses..." : "Unduh PDF"}
              </button>
            </div>
            
            <div style={{ fontSize: "0.75rem", opacity: 0.7, textAlign: "center" }}>
              * JPG disarankan untuk dibagikan online. PDF disarankan untuk pencetakan banner fisik berkualitas tinggi.
            </div>
          </div>

        </div>

        {/* Kolom Kanan: Live Preview Container */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", opacity: 0.7 }}>PRATINJAU POSTER</span>
            <span className="badge" style={{ backgroundColor: "var(--color-pistachio)", color: "var(--color-delft-blue)" }}>
              {currentSize.width}px x {currentSize.height}px
            </span>
          </div>

          {/* Wrapper to handle scaling nicely */}
          <div 
            ref={containerRef}
            style={{ 
              backgroundColor: "#e2e8f0", 
              border: "3px solid var(--color-delft-blue)", 
              borderRadius: "var(--radius-sm)",
              height: "580px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              overflow: "hidden",
              position: "relative",
              boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)"
            }}
          >
            {/* The Actual Poster Element (Exported at full res, scaled down for preview) */}
            <div
              ref={posterRef}
              style={{
                width: `${currentSize.width}px`,
                height: `${currentSize.height}px`,
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                flexShrink: 0,
                background: currentTheme.bg,
                color: currentTheme.textColor,
                fontFamily: "var(--font-body)",
                boxSizing: "border-box",
                padding: aspectRatio === "6:16" ? "64px 48px" : "48px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "absolute",
                transition: "all 0.2s ease-out"
              }}
            >
              
              {/* TOP HEADER SECTION */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%" }}>
                {/* Event Tag */}
                <div style={{ 
                  backgroundColor: currentTheme.badgeBg, 
                  color: currentTheme.badgeText,
                  fontWeight: "bold",
                  fontSize: "16px",
                  padding: "6px 16px",
                  borderRadius: "var(--radius-full)",
                  border: theme === "brutalist" ? "2px solid black" : "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "16px",
                  fontFamily: "var(--font-heading)"
                }}>
                  {subtitle || "CAPSTONE PROJECT EXHIBITION"}
                </div>
                
                {/* Main Title */}
                <h1 style={{ 
                  fontSize: aspectRatio === "6:16" ? "42px" : "36px", 
                  fontFamily: "var(--font-heading)",
                  color: currentTheme.textColor,
                  lineHeight: "1.1",
                  margin: "8px 0",
                  textTransform: "uppercase",
                  fontWeight: "900",
                  letterSpacing: "-0.01em"
                }}>
                  {title}
                </h1>
                
                {/* Underline separator */}
                <div style={{ 
                  width: "120px", 
                  height: "5px", 
                  backgroundColor: currentTheme.accentColor, 
                  marginTop: "8px",
                  marginBottom: "16px",
                  border: theme === "brutalist" ? "1px solid black" : "none"
                }} />
              </div>

              {/* MIDDLE SECTION: THE FLOW STEPS */}
              <div style={{ 
                display: "flex", 
                flexDirection: aspectRatio === "6:16" ? "column" : "row",
                gap: "24px",
                width: "100%",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                margin: "32px 0"
              }}>
                
                {/* Step Cards Definition */}
                {[
                  {
                    step: "1",
                    title: "Login Google & Registrasi",
                    desc: "Pindai QR utama di bawah, masuk dengan akun Google pribadi Anda, lalu lengkapi Nama & Kategori Anda."
                  },
                  {
                    step: "2",
                    title: "Jelajahi & Shortlist",
                    desc: "Kunjungi booth pameran capstone, scan QR code di booth kelompok, dan simpan kelompok terfavorit Anda."
                  },
                  {
                    step: "3",
                    title: "Scan QR Pintu Keluar",
                    desc: "Setelah selesai berkunjung, pergilah ke pintu keluar (Exit Gate) dan scan QR exit untuk membuka tombol voting."
                  },
                  {
                    step: "4",
                    title: "Kirim Vote & Bukti",
                    desc: "Salurkan suara Anda untuk max 3 kelompok capstone yang berbeda dan simpan bukti kode vote unik Anda."
                  }
                ].map((item, idx) => (
                  <div
                    key={item.step}
                    style={{
                      backgroundColor: currentTheme.cardBg,
                      border: currentTheme.cardBorder,
                      boxShadow: currentTheme.cardShadow,
                      borderRadius: "12px",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      flex: 1,
                      width: "100%",
                      maxWidth: aspectRatio === "6:16" ? "620px" : "none",
                      height: aspectRatio === "6:16" ? "auto" : "320px",
                      position: "relative",
                      transition: "all 0.2s"
                    }}
                  >
                    {/* Number Badge */}
                    <div style={{ 
                      width: "42px", 
                      height: "42px", 
                      borderRadius: "50%", 
                      backgroundColor: currentTheme.numberBg,
                      color: currentTheme.numberText,
                      border: theme === "brutalist" ? "3px solid black" : currentTheme.cardBorder,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "900",
                      fontSize: "20px",
                      fontFamily: "var(--font-heading)"
                    }}>
                      {item.step}
                    </div>

                    <h4 style={{ 
                      fontSize: "18px", 
                      fontWeight: "bold",
                      fontFamily: "var(--font-heading)",
                      color: currentTheme.textColor,
                      margin: "4px 0"
                    }}>
                      {item.title}
                    </h4>
                    
                    <p style={{ 
                      fontSize: "14px", 
                      lineHeight: "1.4", 
                      color: currentTheme.subTextColor,
                      margin: 0
                    }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* BOTTOM SECTION: QR CODES & LAWS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
                
                {/* QR Codes Row */}
                <div style={{ display: "flex", gap: "32px", justifyContent: "center", width: "100%" }}>
                  
                  {/* QR 1: Website Utama */}
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    gap: "8px",
                    flex: 1
                  }}>
                    <span style={{ fontSize: "13px", fontWeight: "bold", opacity: 0.8, textTransform: "uppercase" }}>
                      [1] Pindai Untuk Masuk
                    </span>
                    <div style={{ 
                      border: currentTheme.cardBorder,
                      boxShadow: currentTheme.cardShadow,
                      borderRadius: "12px",
                      padding: "16px",
                      backgroundColor: "#ffffff",
                      display: "inline-block"
                    }}>
                      <img 
                        src={getQrUrl(mainWebLink)} 
                        alt="QR Web Utama"
                        style={{ width: "140px", height: "140px", display: "block" }}
                      />
                    </div>
                    <span style={{ fontSize: "11px", fontFamily: "monospace", opacity: 0.6 }}>
                      {origin.replace("http://", "").replace("https://", "")}/
                    </span>
                  </div>

                  {/* QR 2: Pintu Keluar */}
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    gap: "8px",
                    flex: 1
                  }}>
                    <span style={{ fontSize: "13px", fontWeight: "bold", opacity: 0.8, textTransform: "uppercase" }}>
                      [3] Pindai di Pintu Keluar
                    </span>
                    <div style={{ 
                      border: currentTheme.cardBorder,
                      boxShadow: currentTheme.cardShadow,
                      borderRadius: "12px",
                      padding: "16px",
                      backgroundColor: "#ffffff",
                      display: "inline-block"
                    }}>
                      <img 
                        src={getQrUrl(exitGateLink)} 
                        alt="QR Pintu Keluar"
                        style={{ width: "140px", height: "140px", display: "block" }}
                      />
                    </div>
                    <span style={{ fontSize: "11px", fontFamily: "monospace", opacity: 0.6 }}>
                      Scan di Exit Gate saja
                    </span>
                  </div>

                </div>

                {/* Anti-Cheat Warning Banner */}
                <div style={{ 
                  backgroundColor: currentTheme.rulesBg,
                  border: currentTheme.rulesBorder,
                  borderRadius: "12px",
                  padding: "16px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: theme === "brutalist" ? "4px 4px 0px 0px black" : "none"
                }}>
                  <ShieldAlert size={28} style={{ color: "#ef4444", flexShrink: 0 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "bold", color: "#ef4444", textTransform: "uppercase" }}>
                      SISTEM PROTEKSI KEAMANAN AKTIF
                    </span>
                    <p style={{ fontSize: "11px", margin: 0, opacity: 0.8, color: currentTheme.textColor }}>
                      Satu perangkat fisik hanya diizinkan memberikan suara untuk maks 3 akun Google berbeda. Tindakan manipulasi akan dideteksi oleh sistem fingerprinting perangkat dan suara akan dicoret oleh panitia saat audit suara.
                    </p>
                  </div>
                </div>

                {/* Footer Brand */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${currentTheme.textColor}`, paddingTop: "12px", opacity: 0.6, fontSize: "12px" }}>
                  <span>© 2026 CODEX VOTER</span>
                  <span>Verifikasi Keamanan Berlapis</span>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
