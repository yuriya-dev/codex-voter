"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, Printer, Palette, Layout, Edit3, ShieldAlert } from "lucide-react";

interface PosterGeneratorProps {
  origin: string;
}

type AspectRatioType = "6:16" | "1:1" | "4:5";
type ThemeType = "brand" | "midnight" | "brutalist" | "ocean";

interface ThemeStyles {
  bg: string;
  gridColor: string;
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
  pinColor: string;
  lineColor: string;
  lineShadow: string;
}

// 3D Pushpin Component
const PushPin = ({ color = "#ef4444" }: { color?: string }) => (
  <svg 
    width="44" 
    height="44" 
    viewBox="0 0 120 120" 
    style={{ 
      position: "absolute", 
      top: "-22px", 
      left: "50%", 
      transform: "translateX(-50%) rotate(-8deg)", 
      zIndex: 10,
      filter: "drop-shadow(2px 5px 3px rgba(0,0,0,0.3))" 
    }}
  >
    {/* Metal needle */}
    <line x1="60" y1="75" x2="60" y2="105" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
    <ellipse cx="60" cy="105" rx="3" ry="1.5" fill="rgba(0,0,0,0.4)" />
    
    {/* Plastic body */}
    <ellipse cx="60" cy="35" rx="22" ry="12" fill={color} />
    <rect x="46" y="35" width="28" height="22" rx="4" fill={color} filter="brightness(0.9)" />
    <polygon points="42,57 78,57 70,72 50,72" fill={color} filter="brightness(0.8)" />
    
    {/* Highlight */}
    <ellipse cx="54" cy="32" rx="10" ry="4" fill="rgba(255,255,255,0.4)" />
  </svg>
);

export default function PosterGenerator({ origin }: PosterGeneratorProps) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("6:16");
  const [theme, setTheme] = useState<ThemeType>("brand");
  const [title, setTitle] = useState("PANDUAN ALUR VOTING");
  const [subtitle, setSubtitle] = useState("CAPSTONE PROJECT EXHIBITION");
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(0.25);
  
  const posterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Themes Configuration
  const themes: Record<ThemeType, ThemeStyles> = {
    brand: {
      bg: "#f5f3d8", // Muted Beige
      gridColor: "rgba(29, 42, 98, 0.07)",
      textColor: "#1d2a62", // Delft Blue
      subTextColor: "rgba(29, 42, 98, 0.8)",
      cardBg: "#ffffff",
      cardBorder: "3px solid #1d2a62",
      cardShadow: "6px 6px 0px 0px #1d2a62",
      badgeBg: "#87aece", // Carolina Blue
      badgeText: "#1d2a62",
      numberBg: "#afd06e", // Pistachio
      numberText: "#1d2a62",
      accentColor: "#437118", // Fern Green
      rulesBg: "#ffffff",
      rulesBorder: "3px solid #1d2a62",
      pinColor: "#ef4444",
      lineColor: "#1d2a62",
      lineShadow: "none"
    },
    midnight: {
      bg: "#0b0f19", // Midnight Dark
      gridColor: "rgba(59, 130, 246, 0.12)",
      textColor: "#f8fafc",
      subTextColor: "#94a3b8",
      cardBg: "#131c2e",
      cardBorder: "3px solid #1e293b",
      cardShadow: "0px 0px 20px rgba(59, 130, 246, 0.2)",
      badgeBg: "#3b82f6",
      badgeText: "#ffffff",
      numberBg: "#10b981",
      numberText: "#0b0f19",
      accentColor: "#10b981",
      rulesBg: "#131c2e",
      rulesBorder: "3px solid #ef4444",
      pinColor: "#3b82f6",
      lineColor: "#3b82f6",
      lineShadow: "0 0 8px rgba(59, 130, 246, 0.6)"
    },
    brutalist: {
      bg: "#ffffff",
      gridColor: "rgba(0, 0, 0, 0.08)",
      textColor: "#000000",
      subTextColor: "#333333",
      cardBg: "#ffffff",
      cardBorder: "4px solid #000000",
      cardShadow: "8px 8px 0px 0px #000000",
      badgeBg: "#000000",
      badgeText: "#ffffff",
      numberBg: "#facc15",
      numberText: "#000000",
      accentColor: "#000000",
      rulesBg: "#ffffff",
      rulesBorder: "4px solid #000000",
      pinColor: "#000000",
      lineColor: "#000000",
      lineShadow: "none"
    },
    ocean: {
      bg: "#f0f9ff",
      gridColor: "rgba(14, 165, 233, 0.08)",
      textColor: "#0369a1",
      subTextColor: "#0ea5e9",
      cardBg: "#ffffff",
      cardBorder: "2px solid #0ea5e9",
      cardShadow: "5px 5px 15px rgba(14, 165, 233, 0.15)",
      badgeBg: "#0ea5e9",
      badgeText: "#ffffff",
      numberBg: "#38bdf8",
      numberText: "#0369a1",
      accentColor: "#0369a1",
      rulesBg: "#ffffff",
      rulesBorder: "2px dashed #0ea5e9",
      pinColor: "#f43f5e",
      lineColor: "#0284c7",
      lineShadow: "none"
    }
  };

  const currentTheme = themes[theme];

  // Grid/Paper Background Styles
  const gridBackgroundStyle = {
    backgroundImage: `
      linear-gradient(${currentTheme.gridColor} 1.5px, transparent 1.5px),
      linear-gradient(90deg, ${currentTheme.gridColor} 1.5px, transparent 1.5px)
    `,
    backgroundSize: "28px 28px",
    backgroundColor: theme === "midnight" ? "#0b0f19" : theme === "ocean" ? "#f0f9ff" : theme === "brand" ? "#f5f3d8" : "#ffffff"
  };

  // High-Res dimensions for each aspect ratio
  const dimensions: Record<AspectRatioType, { width: number; height: number }> = {
    "6:16": { width: 720, height: 1920 },
    "1:1": { width: 1000, height: 1000 },
    "4:5": { width: 800, height: 1000 }
  };

  const currentSize = dimensions[aspectRatio];

  // Adjust preview scaling dynamically to fit container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32;
        const containerHeight = 550;
        const scaleW = containerWidth / currentSize.width;
        const scaleH = containerHeight / currentSize.height;
        setScale(Math.min(scaleW, scaleH, 1));
      }
    };

    handleResize();
    const timer = setTimeout(handleResize, 100);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [aspectRatio, currentSize.width, currentSize.height]);

  // Export PDF or JPG
  const exportPoster = async (format: "jpg" | "pdf") => {
    if (!posterRef.current) return;
    setIsExporting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        scale: 2, // 2x resolution
        backgroundColor: theme === "midnight" ? "#0b0f19" : "#ffffff",
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

  // Step Data Definition
  const steps = [
    {
      num: "1",
      title: "LOGIN & DAFTAR",
      desc: "Pindai QR masuk di pintu masuk pameran, login dengan akun Google, dan isi nama & kategori Anda.",
      mascot: `${origin}/sticker7.webp`,
      rotation: "-2.5deg"
    },
    {
      num: "2",
      title: "SHORTLIST FAVORIT",
      desc: "Jelajahi pameran, scan QR kelompok di booth, lalu tambahkan proyek terfavorit Anda ke shortlist.",
      mascot: `${origin}/like.webp`,
      rotation: "3deg"
    },
    {
      num: "3",
      title: "SCAN PINTU KELUAR",
      desc: "Jika Anda telah selesai menjelajah, berjalanlah ke pintu keluar dan pindai QR Exit untuk membuka kunci voting.",
      mascot: `${origin}/exit.webp`,
      rotation: "-2deg"
    },
    {
      num: "4",
      title: "VOTE & BUKTI SAH",
      desc: "Gunakan kuota 3 suara Anda untuk proyek favorit, tekan kirim, lalu screenshot bukti kode unik vote Anda.",
      mascot: `${origin}/okay.webp`,
      rotation: "2.5deg"
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Description */}
      <div>
        <h2 style={{ fontSize: "1.6rem", fontFamily: "var(--font-heading)", textTransform: "uppercase", marginBottom: "8px" }}>
          🎨 Poster Alur Voting Generator
        </h2>
        <p style={{ fontSize: "0.9rem", opacity: 0.85 }}>
          Generasi poster petunjuk alur voting bergaya *Collage Scrapbook*. Menggunakan maskot resmi dari website Anda dan layout asimetris miring yang premium.
        </p>
      </div>

      <div className="split-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px", alignItems: "start" }}>
        
        {/* Left Column: Control Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Panel 1: Texts */}
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

          {/* Panel 2: Aspect Ratio & Theme */}
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
                      backgroundColor: t === "brand" ? "#f5f3d8" : t === "midnight" ? "#0b0f19" : t === "brutalist" ? "#ffffff" : "#f0f9ff",
                      display: "inline-block"
                    }} />
                    {t === "brand" ? "Tech Jungle" : t === "midnight" ? "Neon Dark" : t === "brutalist" ? "Brutalist" : "Ocean Fresh"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Panel 3: Export */}
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
          </div>

        </div>

        {/* Right Column: Live Preview */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", opacity: 0.7 }}>PRATINJAU DESAIN BARU</span>
            <span className="badge" style={{ backgroundColor: "var(--color-pistachio)", color: "var(--color-delft-blue)" }}>
              {currentSize.width}px x {currentSize.height}px
            </span>
          </div>

          <div 
            ref={containerRef}
            style={{ 
              backgroundColor: "#ccd5ae", 
              border: "3px solid var(--color-delft-blue)", 
              borderRadius: "var(--radius-sm)",
              height: "580px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              overflow: "hidden",
              position: "relative",
              boxShadow: "inset 0 0 12px rgba(0,0,0,0.15)"
            }}
          >
            {/* High-res Poster Canvas */}
            <div
              poster-canvas="true"
              ref={posterRef}
              style={{
                width: `${currentSize.width}px`,
                height: `${currentSize.height}px`,
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                flexShrink: 0,
                ...gridBackgroundStyle,
                color: currentTheme.textColor,
                boxSizing: "border-box",
                padding: aspectRatio === "6:16" ? "80px 48px" : "60px 48px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "absolute",
                overflow: "hidden",
                transition: "all 0.2s ease-out"
              }}
            >
              
              {/* Giant Watermark background text */}
              <div style={{
                position: "absolute",
                top: "100px",
                left: "40px",
                fontSize: "140px",
                fontFamily: "monospace",
                opacity: 0.05,
                transform: "rotate(-15deg)",
                pointerEvents: "none",
                fontWeight: "bold",
                color: currentTheme.accentColor
              }}>
                VOTE
              </div>

              {/* 1. HEADER SECTION */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%", zIndex: 5 }}>
                <div style={{ 
                  backgroundColor: currentTheme.badgeBg, 
                  color: currentTheme.badgeText,
                  fontWeight: "900",
                  fontSize: "16px",
                  padding: "8px 24px",
                  borderRadius: "var(--radius-sm)",
                  border: theme === "brutalist" ? "4px solid #000" : currentTheme.cardBorder,
                  boxShadow: theme === "brutalist" ? "3px 3px 0px 0px #000" : "3px 3px 0px 0px " + currentTheme.textColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "20px",
                  fontFamily: "var(--font-heading)"
                }}>
                  {subtitle || "CAPSTONE PROJECT EXHIBITION"}
                </div>
                
                <h1 style={{ 
                  fontSize: aspectRatio === "6:16" ? "54px" : "48px", 
                  fontFamily: "var(--font-heading)",
                  color: currentTheme.textColor,
                  lineHeight: "1.0",
                  margin: "8px 0",
                  textTransform: "uppercase",
                  fontWeight: "900",
                  letterSpacing: "-0.02em",
                  textShadow: theme === "midnight" ? "0 0 10px rgba(59, 130, 246, 0.4)" : "none"
                }}>
                  {title}
                </h1>
                
                <div style={{ 
                  width: "160px", 
                  height: "6px", 
                  backgroundColor: currentTheme.accentColor, 
                  marginTop: "12px",
                  marginBottom: "8px",
                  border: theme === "brutalist" ? "2px solid black" : "none"
                }} />
              </div>

              {/* 2. MIDDLE FLOW SECTION: Tilted Polaroid Cards & SVG Connection Strings */}
              <div style={{ 
                position: "relative",
                display: aspectRatio === "6:16" ? "flex" : "grid",
                flexDirection: aspectRatio === "6:16" ? "column" : undefined,
                gridTemplateColumns: aspectRatio === "6:16" ? undefined : "1fr 1fr",
                rowGap: aspectRatio === "6:16" ? "48px" : "80px",
                columnGap: aspectRatio === "6:16" ? undefined : "60px",
                width: "100%",
                flex: 1,
                alignItems: "center",
                justifyContent: aspectRatio === "6:16" ? "space-between" : undefined,
                justifyItems: "center",
                margin: "48px 0",
                zIndex: 4
              }}>
                
                {/* SVG Connecting String (Snaking perfectly through pushpin centers) */}
                <svg 
                  style={{ 
                    position: "absolute", 
                    top: 0, 
                    left: 0, 
                    width: "100%", 
                    height: "100%", 
                    pointerEvents: "none", 
                    zIndex: 2 
                  }}
                >
                  {aspectRatio === "6:16" ? (
                    // Winding path for vertical layout (720x1920) connecting cards stagger-aligned
                    <path 
                      d="M 260 145 C 380 230, 390 380, 460 470 C 330 550, 230 730, 260 825 C 390 910, 390 1060, 460 1150" 
                      fill="none" 
                      stroke={currentTheme.lineColor} 
                      strokeWidth="5" 
                      strokeLinecap="round"
                      style={{ filter: currentTheme.lineShadow }}
                    />
                  ) : aspectRatio === "1:1" ? (
                    // Connection path for 2x2 grid (1000x1000) linking Pins: 1 -> 2 -> 3 -> 4
                    // Pin 1 (270, 160) -> Pin 2 (730, 160) -> Pin 3 (270, 520) -> Pin 4 (730, 520)
                    <path 
                      d="M 270 160 C 450 60, 550 60, 730 160 C 810 320, 190 360, 270 520 C 450 620, 550 620, 730 520" 
                      fill="none" 
                      stroke={currentTheme.lineColor} 
                      strokeWidth="5" 
                      strokeLinecap="round"
                      style={{ filter: currentTheme.lineShadow }}
                    />
                  ) : (
                    <path 
                      d="M 220 160 C 350 60, 450 60, 580 160 C 650 320, 150 360, 220 520 C 350 620, 450 620, 580 520" 
                      fill="none" 
                      stroke={currentTheme.lineColor} 
                      strokeWidth="5" 
                      strokeLinecap="round"
                      style={{ filter: currentTheme.lineShadow }}
                    />
                  )}
                </svg>

                {/* Polaroid Cards rendering */}
                {steps.map((item, idx) => {
                  let alignmentStyle: React.CSSProperties = {};
                  
                  if (aspectRatio === "6:16") {
                    alignmentStyle = {
                      marginLeft: idx % 2 === 0 ? "40px" : "auto",
                      marginRight: idx % 2 === 0 ? "auto" : "40px"
                    };
                  }

                  const isTall = aspectRatio === "6:16";
                  const cardWidth = isTall ? "420px" : aspectRatio === "1:1" ? "350px" : "315px";
                  const cardHeight = isTall ? "330px" : "240px";
                  const mascotHeight = isTall ? "150px" : "90px";
                  const bodyPadding = isTall ? "14px 16px" : "8px 12px";
                  const descFontSize = isTall ? "11px" : "9.5px";

                  return (
                    <div
                      key={item.num}
                      className="brutalist-card"
                      style={{
                        width: cardWidth,
                        height: cardHeight,
                        backgroundColor: currentTheme.cardBg,
                        border: theme === "brutalist" ? "5px solid #000" : currentTheme.cardBorder,
                        boxShadow: theme === "brutalist" ? "8px 8px 0px 0px #000" : currentTheme.cardShadow,
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        transform: `rotate(${item.rotation})`,
                        zIndex: 3,
                        flexShrink: 0,
                        overflow: "visible",
                        ...alignmentStyle
                      }}
                    >
                      {/* Sub-patterns inside the card to replicate the BrutalistCard reference */}
                      <div className="brutalist-card-pattern-grid" style={{ zIndex: 1, opacity: 0.4 }} />
                      <div className="brutalist-card-overlay-dots" style={{ zIndex: 1, opacity: 0.2 }} />

                      {/* Pushpin at the top center of card */}
                      <PushPin color={currentTheme.pinColor} />

                      {/* Header Title Area (replicates brutalist-card-title-area) */}
                      <div 
                        className="brutalist-card-title-area"
                        style={{ 
                          backgroundColor: currentTheme.badgeBg, 
                          color: currentTheme.badgeText,
                          borderBottom: theme === "brutalist" ? "4px solid #000" : `3px solid ${currentTheme.textColor}`,
                          padding: isTall ? "10px 16px" : "6px 12px",
                          fontSize: isTall ? "13px" : "11px",
                          fontWeight: "900",
                          letterSpacing: "0.05em",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          zIndex: 2,
                          fontFamily: "var(--font-heading)",
                          borderRadius: "8px 8px 0 0",
                          textTransform: "uppercase"
                        }}
                      >
                        <span>LANGKAH {item.num}</span>
                        <span 
                          className="brutalist-card-tag"
                          style={{
                            backgroundColor: currentTheme.numberBg,
                            color: currentTheme.numberText,
                            fontSize: isTall ? "10px" : "8.5px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            border: `2px solid ${currentTheme.textColor}`,
                            fontWeight: "bold"
                          }}
                        >
                          CODEX
                        </span>
                      </div>

                      {/* Mascot/Photo Container (replicates brutalist card photo area) */}
                      <div style={{
                        width: "100%",
                        height: mascotHeight,
                        backgroundColor: theme === "midnight" ? "#0f172a" : "var(--color-beige)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderBottom: theme === "brutalist" ? "4px solid #000" : `3.5px solid ${currentTheme.textColor}`,
                        position: "relative",
                        overflow: "hidden",
                        zIndex: 2
                      }}>
                        <img
                          src={item.mascot}
                          alt={item.title}
                          style={{
                            height: "90%",
                            width: "auto",
                            objectFit: "contain",
                            filter: `drop-shadow(4px 4px 0px ${currentTheme.textColor})`,
                            pointerEvents: "none",
                            zIndex: 5
                          }}
                        />
                      </div>

                      {/* Action/Description Row (replicates brutalist card action section) */}
                      <div style={{
                        padding: bodyPadding,
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        position: "relative",
                        zIndex: 2,
                        backgroundColor: currentTheme.cardBg,
                        flex: 1,
                        justifyContent: "center",
                        borderRadius: "0 0 8px 8px"
                      }}>
                        <h4 style={{
                          fontSize: isTall ? "14px" : "12px",
                          fontWeight: "900",
                          fontFamily: "var(--font-heading)",
                          color: currentTheme.textColor,
                          margin: 0,
                          letterSpacing: "0.03em"
                        }}>
                          {item.title}
                        </h4>
                        <p style={{
                          fontSize: descFontSize,
                          lineHeight: "1.35",
                          fontWeight: "600",
                          color: currentTheme.textColor,
                          margin: 0,
                          opacity: 0.95
                        }}>
                          {item.desc}
                        </p>
                      </div>

                    </div>
                  );
                })}

              </div>

              {/* 3. RULES & AUDIT WARNING SECTION (No QRs) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", zIndex: 5 }}>
                
                {/* Warning Polaroid Container */}
                {(() => {
                  const isTall = aspectRatio === "6:16";
                  const warningPadding = isTall ? "24px 32px" : "12px 20px";
                  const warningFontSize = isTall ? "13px" : "10px";
                  const warningTitleSize = isTall ? "15px" : "12px";
                  const warningGap = isTall ? "24px" : "14px";
                  const warningIconSize = isTall ? 26 : 20;
                  const warningIconBoxSize = isTall ? "48px" : "36px";

                  return (
                    <div style={{ 
                      backgroundColor: currentTheme.rulesBg,
                      border: theme === "brutalist" ? "4px solid #000" : currentTheme.rulesBorder,
                      boxShadow: theme === "brutalist" ? "6px 6px 0px 0px #000" : currentTheme.cardShadow,
                      borderRadius: "8px",
                      padding: warningPadding,
                      display: "flex",
                      alignItems: "center",
                      gap: warningGap
                    }}>
                      <div style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        borderRadius: "50%",
                        width: warningIconBoxSize,
                        height: warningIconBoxSize,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        border: theme === "brutalist" ? "3px solid #000" : "none"
                      }}>
                        <ShieldAlert size={warningIconSize} />
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" }}>
                        <span style={{ fontSize: warningTitleSize, fontWeight: "900", color: "#ef4444", textTransform: "uppercase", fontFamily: "var(--font-heading)", letterSpacing: "0.05em" }}>
                          🚨 SISTEM KEAMANAN & VERIFIKASI VOTE AKTIF
                        </span>
                        <p style={{ fontSize: warningFontSize, margin: 0, opacity: 0.9, lineHeight: "1.4", color: currentTheme.textColor, fontWeight: "500" }}>
                          Setiap perangkat fisik dikunci hanya untuk **1 Akun Google** saja. Tindakan mencurigakan seperti berganti-ganti akun Google di perangkat yang sama akan secara otomatis diblokir oleh sistem *fingerprinting* perangkat keras. **Proses audit manual suara** oleh panitia akan dilakukan sebelum rilis final untuk mencoret suara tidak sah.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Footer Brand info */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  borderTop: `2.5px dashed ${currentTheme.textColor}`, 
                  paddingTop: "12px", 
                  opacity: 0.7, 
                  fontSize: aspectRatio === "6:16" ? "13px" : "11px",
                  fontWeight: "bold" 
                }}>
                  <span>© 2026 CODEX VOTER</span>
                  <span>SECURITY PLATFORM ACTIVE</span>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
