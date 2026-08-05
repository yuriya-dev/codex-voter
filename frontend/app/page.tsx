"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useVoter } from "@/components/VoterContext";
import { Leaf, ArrowRight, ShieldCheck, Heart, QrCode, HelpCircle } from "lucide-react";
import Header from "@/components/Header";
import BrutalistCard from "@/components/BrutalistCard";
import { gsap } from "gsap";

export default function Home() {
  const { setQrScannerOpen, maxVotesLimit } = useVoter();

  // Coordinate tracking for responsive flow lines
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updatePoints = () => {
    if (!containerRef.current) return;
    const parentRect = containerRef.current.getBoundingClientRect();
    const newPoints = cardRefs.current.map((card) => {
      if (!card) return { x: 0, y: 0 };
      const rect = card.getBoundingClientRect();
      // Calculate top center of the card where the pushpin is
      return {
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top
      };
    });
    setPoints(newPoints.filter((p) => p.x !== 0 || p.y !== 0));
  };

  useEffect(() => {
    const timer = setTimeout(updatePoints, 350);
    window.addEventListener("resize", updatePoints);
    return () => {
      window.removeEventListener("resize", updatePoints);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    // Marching dotted line animation
    const lineAnim = gsap.to(".connector-path", {
      strokeDashoffset: -20,
      duration: 1.2,
      repeat: -1,
      ease: "none"
    });

    // Staggered entrance animation for cards
    const cards = cardRefs.current.filter(Boolean);
    if (cards.length > 0) {
      gsap.fromTo(cards, 
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6, 
          stagger: 0.1, 
          ease: "back.out(1.5)",
          overwrite: "auto"
        }
      );
    }

    return () => {
      lineAnim.kill();
    };
  }, [points]);

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
              <Link href="/tutorial" className="btn btn-secondary" style={{ gap: "12px", background: "var(--color-carolina-blue)", color: "var(--color-delft-blue)" }}>
                <HelpCircle size={18} />
                Panduan Voting
              </Link>
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
        <section className="section-gap" style={{ overflow: "visible" }}>
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

          {(() => {
            const steps = [
              {
                num: "1",
                title: "SCAN WEBSITE UTAMA",
                desc: "Pindai QR Code di area masuk pameran untuk mengakses website utama CODEX Voter.",
                mascot: "/sticker7.webp",
                rotation: "-2.5deg"
              },
              {
                num: "2",
                title: "SHORTLIST FAVORIT",
                desc: "Jelajahi pameran, scan QR kelompok di booth, lalu tambahkan proyek terfavorit Anda ke shortlist.",
                mascot: "/like.webp",
                rotation: "3deg"
              },
              {
                num: "3",
                title: "SCAN KELUAR & LOGIN",
                desc: "Berjalanlah ke pintu keluar, pindai QR Exit, lalu login dengan akun Google & isi nama Anda untuk membuka kunci voting.",
                mascot: "/exit.webp",
                rotation: "-2deg"
              },
              {
                num: "4",
                title: "VOTE & SELESAI",
                desc: "Gunakan hak suara Anda untuk memilih kelompok terbaik, kirim suara Anda, dan simpan bukti voting sebelum keluar.",
                mascot: "/okay.webp",
                rotation: "2.5deg"
              }
            ];

            return (
              <>
                <div 
                  ref={containerRef}
                style={{ 
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "48px", 
                  marginTop: "24px",
                  overflow: "visible",
                  position: "relative",
                  width: "100%"
                }}
              >
                {/* Dynamic SVG Connecting Line tracking the measured pushpin coordinates */}
                {points.length === 4 && (
                  <svg 
                    style={{ 
                      position: "absolute", 
                      top: 0, 
                      left: 0, 
                      width: "100%", 
                      height: "100%", 
                      pointerEvents: "none", 
                      zIndex: 1 // Placed behind the cards (zIndex 3)
                    }}
                  >
                    {(() => {
                      let pathD = "";
                      for (let i = 0; i < 3; i++) {
                        const startX = points[i].x;
                        const startY = points[i].y;
                        const endX = points[i+1].x;
                        const endY = points[i+1].y;
                        
                        const dx = endX - startX;
                        const dy = endY - startY;
                        
                        if (i === 0) {
                          pathD += `M ${startX} ${startY} `;
                        }
                        
                        if (Math.abs(dy) < 60) {
                          // Same row: curve downwards (+45) so it is not clipped at the top of the container
                          pathD += `C ${startX + dx/3} ${startY + 45}, ${startX + 2*dx/3} ${startY + 45}, ${endX} ${endY} `;
                        } else {
                          // Different rows (wrapping): curve down and snake sideways
                          pathD += `C ${startX + dx} ${startY + dy/4}, ${startX} ${startY + 3*dy/4}, ${endX} ${endY} `;
                        }
                      }
                        return (
                          <path 
                            className="connector-path"
                            d={pathD} 
                            fill="none" 
                            stroke="var(--color-delft-blue)" 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                            strokeDasharray="6 6"
                          />
                        );
                    })()}
                  </svg>
                )}

                {steps.map((item, idx) => {
                  const shadowOffset = 10;
                  return (
                    <div
                      key={item.num}
                      ref={(el) => { cardRefs.current[idx] = el; }}
                      style={{
                        position: "relative",
                        width: "280px",
                        height: "230px",
                        transform: `rotate(${item.rotation})`,
                        transformOrigin: "center center",
                        margin: "20px 0",
                        flexShrink: 0,
                        overflow: "visible",
                        zIndex: 3 // Set zIndex to 3 to render above the SVG line (zIndex 1)
                      }}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget;
                        const shadow = target.querySelector(".brutalist-card-shadow");
                        const mascot = target.querySelector(".brutalist-card-mascot");
                        
                        // Lift card, rotate to 0, scale slightly
                        gsap.to(target, {
                          scale: 1.05,
                          rotate: 0,
                          y: -8,
                          duration: 0.3,
                          ease: "power2.out",
                          overwrite: "auto"
                        });
                        
                        // Push shadow deeper and turn green
                        if (shadow) {
                          gsap.to(shadow, {
                            top: "16px",
                            left: "16px",
                            backgroundColor: "var(--color-fern-green)",
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto"
                          });
                        }
                        
                        // Pop mascot up
                        if (mascot) {
                          gsap.to(mascot, {
                            y: -15,
                            scale: 1.1,
                            duration: 0.3,
                            ease: "back.out(2)",
                            overwrite: "auto"
                          });
                        }
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget;
                        const shadow = target.querySelector(".brutalist-card-shadow");
                        const mascot = target.querySelector(".brutalist-card-mascot");
                        
                        // Restore card
                        gsap.to(target, {
                          scale: 1,
                          rotate: item.rotation,
                          y: 0,
                          duration: 0.3,
                          ease: "power2.out",
                          overwrite: "auto"
                        });
                        
                        // Restore shadow
                        if (shadow) {
                          gsap.to(shadow, {
                            top: `${shadowOffset}px`,
                            left: `${shadowOffset}px`,
                            backgroundColor: "var(--color-delft-blue)",
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto"
                          });
                        }
                        
                        // Restore mascot
                        if (mascot) {
                          gsap.to(mascot, {
                            y: 0,
                            scale: 1,
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto"
                          });
                        }
                      }}
                    >
                      {/* Physical Shadow Div */}
                      <div 
                        className="brutalist-card-shadow"
                        style={{
                          position: "absolute",
                          top: `${shadowOffset}px`,
                          left: `${shadowOffset}px`,
                          width: "100%",
                          height: "100%",
                          backgroundColor: "var(--color-delft-blue)",
                          borderRadius: "12px",
                          zIndex: 1
                        }}
                      />

                      {/* Card Body */}
                      <div
                        className="brutalist-poster-card"
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#ffffff",
                          border: "3px solid var(--color-delft-blue)",
                          borderRadius: "12px",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          zIndex: 3,
                          overflow: "visible"
                        }}
                      >
                        {/* Grid Pattern Backgrounds */}
                        <div className="brutalist-card-pattern-grid" style={{ zIndex: 1, opacity: 0.4 }} />
                        <div className="brutalist-card-overlay-dots" style={{ zIndex: 1, opacity: 0.2 }} />

                        {/* Header Title Area */}
                        <div 
                          className="brutalist-card-title-area"
                          style={{ 
                            backgroundColor: "var(--color-carolina-blue)", 
                            color: "var(--color-delft-blue)",
                            borderBottom: "3px solid var(--color-delft-blue)",
                            padding: "6px 12px",
                            fontSize: "11px",
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
                              backgroundColor: "var(--color-pistachio)",
                              color: "var(--color-delft-blue)",
                              fontSize: "8.5px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "2px solid var(--color-delft-blue)",
                              fontWeight: "bold"
                            }}
                          >
                            CODEX
                          </span>
                        </div>

                        {/* Mascot/Photo Container */}
                        <div style={{
                          width: "100%",
                          height: "90px",
                          backgroundColor: "var(--color-beige)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderBottom: "3px solid var(--color-delft-blue)",
                          position: "relative",
                          overflow: "visible", // Allow mascot to pop out
                          zIndex: 2
                        }}>
                          <img
                            className="brutalist-card-mascot"
                            src={item.mascot}
                            alt={item.title}
                            style={{
                              height: "125px",
                              width: "auto",
                              objectFit: "contain",
                              position: "absolute",
                              bottom: "-15px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              filter: "none",
                              pointerEvents: "none",
                              zIndex: 5
                            }}
                          />
                        </div>

                        {/* Action/Description Row */}
                        <div style={{
                          padding: "8px 12px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          position: "relative",
                          zIndex: 2,
                          backgroundColor: "#ffffff",
                          flex: 1,
                          justifyContent: "center",
                          borderRadius: "0 0 8px 8px"
                        }}>
                          <h4 style={{
                            fontSize: "12px",
                            fontWeight: "900",
                            fontFamily: "var(--font-heading)",
                            color: "var(--color-delft-blue)",
                            margin: 0,
                            letterSpacing: "0.03em"
                          }}>
                            {item.title}
                          </h4>
                          <p style={{
                            fontSize: "9.5px",
                            lineHeight: "1.35",
                            fontWeight: "600",
                            color: "var(--color-delft-blue)",
                            margin: 0,
                            opacity: 0.95
                          }}>
                            {item.desc}
                          </p>
                        </div>

                      </div>

                      {/* PushPin (sibling to Card Body, outside of it so it is not clipped) */}
                      <svg 
                        width="36" 
                        height="36" 
                        viewBox="0 0 120 120" 
                        style={{ 
                          position: "absolute", 
                          top: "-18px", 
                          left: "50%", 
                          transform: "translateX(-50%) rotate(-8deg)", 
                          zIndex: 10
                        }}
                      >
                        <line x1="60" y1="75" x2="60" y2="105" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                        <ellipse cx="60" cy="105" rx="3" ry="1.5" fill="rgba(0,0,0,0.4)" />
                        <ellipse cx="66" cy="41" rx="22" ry="12" fill="rgba(0,0,0,0.15)" />
                        <rect x="52" y="41" width="28" height="22" rx="4" fill="rgba(0,0,0,0.15)" />
                        <polygon points="48,63 84,63 76,78 56,78" fill="rgba(0,0,0,0.15)" />
                        <ellipse cx="60" cy="35" rx="22" ry="12" fill="#ef4444" />
                        <rect x="46" y="35" width="28" height="22" rx="4" fill="#ef4444" filter="brightness(0.9)" />
                        <polygon points="42,57 78,57 70,72 50,72" fill="#ef4444" filter="brightness(0.8)" />
                        <ellipse cx="54" cy="32" rx="10" ry="4" fill="rgba(255,255,255,0.4)" />
                      </svg>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "48px", width: "100%" }}>
                <Link href="/tutorial" className="btn btn-primary" style={{ gap: "12px", textTransform: "uppercase", padding: "16px 32px", fontSize: "1rem" }}>
                  Buka Panduan & Simulasi Voting (GSAP)
                  <ArrowRight size={18} />
                </Link>
              </div>
            </>
            );
          })()}
        </section>

      </main>
    </>
  );
}
