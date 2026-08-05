"use client";

import { useState, useEffect, useRef } from "react";
import { useVoter } from "@/components/VoterContext";
import { gsap } from "gsap";
import Header from "@/components/Header";
import { 
  QrCode, 
  Heart, 
  Lock, 
  Unlock, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Pause, 
  ShieldCheck, 
  Info,
  RotateCcw,
  Smartphone,
  MousePointerClick,
  Compass,
  Trophy,
  ClipboardCheck,
  Search,
  KeyRound,
  Mail,
  GraduationCap,
  Sparkles,
  RefreshCw,
  LockKeyhole,
  Menu,
  ChevronLeft,
  X
} from "lucide-react";

export default function TutorialPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Animation refs
  const screenRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const steps = [
    {
      num: 1,
      title: "SCAN QR ENTRANCE",
      shortTitle: "Pindai Masuk",
      badgeText: "Entry Gate",
      desc: "Pindai QR Code di area masuk pameran untuk mengakses website utama CODEX Voter.",
      instructions: [
        "Buka aplikasi kamera bawaan ponsel Anda di pintu masuk pameran.",
        "Arahkan ke QR Code pada banner selamat datang.",
        "Ketuk spanduk/notifikasi tautan untuk membuka browser web."
      ],
      details: "Langkah ini memuat data kelompok capstone langsung ke memori peramban Anda untuk pengalaman offline-first yang cepat."
    },
    {
      num: 2,
      title: "SHORTLIST PROJECT FAVORIT",
      shortTitle: "Daftar Favorit",
      badgeText: "Booth Capstone",
      desc: "Jelajahi pameran, pindai QR Code di booth kelompok, lalu tambahkan proyek terfavorit Anda ke shortlist.",
      instructions: [
        "Kunjungi meja/booth kelompok capstone pilihan Anda.",
        "Pindai QR Code kelompok di meja booth.",
        "Lihat detail proyek, lalu ketuk tombol hati (shortlist) untuk disimpan."
      ],
      details: "Sistem shortlist berfungsi seperti keranjang belanja. Anda bisa menyortir dan memilih kelompok terbaik secara fleksibel saat berkeliling pameran."
    },
    {
      num: 3,
      title: "SCAN QR EXIT GATE",
      shortTitle: "Pindai Pintu Keluar",
      badgeText: "Exit Gate Only",
      desc: "Berjalanlah ke pintu keluar pameran, pindai QR Code Exit, untuk membuka kunci panel voting final.",
      instructions: [
        "Setelah mengunjungi seluruh booth, silakan datangi Exit Gate.",
        "Ketuk tombol QR di tengah navbar, lalu pindai QR Code Exit khusus dari panitia.",
        "Layar voting Anda akan terbuka kuncinya secara otomatis."
      ],
      details: "Lapisan keamanan fisik ini memastikan suara berasal dari pengunjung nyata yang benar-benar menghadiri dan mengamati pameran."
    },
    {
      num: 4,
      title: "LOGIN GOOGLE & KIRIM SUARA",
      shortTitle: "Kirim Vote",
      badgeText: "Final Ballot",
      desc: "Masuk dengan Google, lengkapi identitas singkat Anda, lalu kirimkan suara final Anda untuk kelompok terfavorit.",
      instructions: [
        "Hubungkan Akun Google pribadi Anda sebagai validasi keamanan anti-fraud.",
        "Lengkapi nama lengkap dan instansi/kategori (Mahasiswa, Siswa, Dosen, Umum).",
        "Pilih hingga 3 kelompok terfavorit Anda, ketuk 'KIRIM SUARA FINAL', lalu simpan bukti vote."
      ],
      details: "Setiap alamat IP dan akun Google dibatasi maksimal 1 kali voting final. Bukti voting dapat Anda tunjukkan ke panitia untuk menukarkan merchandise menarik."
    }
  ];

  // Auto-play timer effect
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setTimeout(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 9000); // 9 seconds per step
    }
    return () => {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
      }
    };
  }, [activeStep, isPlaying]);

  // GSAP animations for step changes
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Animate text panel
    gsap.fromTo(".step-content-anim",
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power1.out" }
    );

    // Animate phone screen change
    gsap.fromTo(screenRef.current,
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
    );

    const newTl = gsap.timeline({ repeat: -1 });
    timelineRef.current = newTl;

    if (activeStep === 0) {
      // Step 1: Phone Camera -> Scan QR -> Slide browser up
      newTl.set(".browser-container-sim", { y: "100%", opacity: 0 });
      newTl.set(".camera-app-sim", { display: "flex", opacity: 1 });
      newTl.set(".camera-link-banner-sim", { y: -40, opacity: 0 });
      newTl.set(".pointer-sim", { x: 200, y: 480, scale: 1 });
      
      newTl.fromTo(".camera-laser-sim", 
        { top: "25%" }, 
        { top: "75%", duration: 1.5, repeat: -1, yoyo: true, ease: "power1.inOut" }
      );
      
      newTl.to(".camera-link-banner-sim", { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)", delay: 0.8 })
        .to(".pointer-sim", { x: 148, y: 86, duration: 0.8, delay: 0.4 })
        .to(".pointer-sim", { scale: 0.8, duration: 0.15 })
        .to(".camera-link-banner-sim", { scale: 0.98, duration: 0.1 })
        .to(".pointer-sim", { scale: 1, duration: 0.1 })
        .to(".camera-app-sim", { opacity: 0, display: "none", duration: 0.3 })
        .to(".browser-container-sim", { y: "0%", opacity: 1, duration: 0.6, ease: "power3.out" })
        .to({}, { duration: 3 }); // hold
    } 
    else if (activeStep === 1) {
      // Step 2: Browse page -> Add to shortlist -> Float heart
      newTl.set(".flying-heart-sim", { opacity: 0, x: 0, y: 0, scale: 1 });
      newTl.set(".drawer-badge-sim", { textContent: "0" });
      newTl.set(".drawer-inner-item-sim", { display: "none", opacity: 0 });
      newTl.set(".pointer-sim", { x: 200, y: 480, scale: 1 });
      
      newTl.to(".pointer-sim", { x: 240, y: 375, duration: 1, delay: 0.8 })
        .to(".pointer-sim", { scale: 0.8, duration: 0.2 })
        .to(".mobile-heart-btn-sim", { scale: 1.15, backgroundColor: "var(--color-pistachio)", duration: 0.1 })
        .to(".pointer-sim", { scale: 1, duration: 0.1 })
        .to(".mobile-heart-btn-sim", { scale: 1, duration: 0.1 })
        .to(".heart-svg-path-sim", { fill: "#e63946", stroke: "#e63946", duration: 0.15 })
        .to(".flying-heart-sim", { opacity: 1, duration: 0.1 })
        .to(".flying-heart-sim", { 
          x: 40, 
          y: -230, 
          scale: 0.4, 
          duration: 1, 
          ease: "power2.inOut" 
        })
        .to(".flying-heart-sim", { opacity: 0, duration: 0.1 })
        .to(".drawer-badge-sim", { textContent: "3", scale: 1.4, backgroundColor: "var(--color-fern-green)", duration: 0.2 })
        .to(".drawer-badge-sim", { scale: 1, backgroundColor: "var(--color-delft-blue)", duration: 0.2 })
        .to(".drawer-inner-item-sim", { display: "flex", opacity: 1, duration: 0.3 })
        .to({}, { duration: 3 });
    } 
    else if (activeStep === 2) {
      // Step 3: Locked screen -> Click scanner -> Scan -> Unlocked screen
      newTl.set(".exit-scanner-overlay-sim", { display: "none", opacity: 0 });
      newTl.set(".lock-status-badge-sim", { textContent: "VOTING TERKUNCI", backgroundColor: "#fee2e2", color: "#ef4444" });
      newTl.set(".locked-visual-sim", { display: "flex", opacity: 1 });
      newTl.set(".unlocked-visual-sim", { display: "none", opacity: 0 });
      newTl.set(".pointer-sim", { x: 200, y: 480, scale: 1 });
      
      newTl.to(".pointer-sim", { x: 148, y: 564, duration: 1, delay: 0.6 }) // Move to central QR nav button
        .to(".pointer-sim", { scale: 0.8, duration: 0.2 })
        .to(".nav-center-qr-btn-sim", { scale: 0.9, duration: 0.1 })
        .to(".pointer-sim", { scale: 1, duration: 0.1 })
        .to(".nav-center-qr-btn-sim", { scale: 1, duration: 0.1 })
        .to(".exit-scanner-overlay-sim", { display: "block", opacity: 1, duration: 0.3 })
        .fromTo(".laser-line-exit-sim", 
          { top: "25%" }, 
          { top: "75%", duration: 1.2, repeat: -1, yoyo: true, ease: "power1.inOut" }
        )
        .to({}, { duration: 1.5 }) // wait scan
        .to(".exit-scanner-overlay-sim", { opacity: 0, display: "none", duration: 0.3 })
        .to(".locked-visual-sim", { opacity: 0, display: "none", duration: 0.3 })
        .to(".unlocked-visual-sim", { display: "flex", opacity: 1, duration: 0.3 })
        .to(".lock-status-badge-sim", { textContent: "AKSES TERBUKA", backgroundColor: "#d1fae5", color: "var(--color-fern-green)", duration: 0.1 })
        .to({}, { duration: 3.5 });
    } 
    else if (activeStep === 3) {
      // Step 4: Google sign-in -> Complete form -> Ballot -> Confetti
      newTl.set(".google-auth-box-sim", { display: "flex", opacity: 1 });
      newTl.set(".identity-form-box-sim", { display: "none", opacity: 0 });
      newTl.set(".vote-ballot-box-sim", { display: "none", opacity: 0 });
      newTl.set(".success-result-box-sim", { display: "none", opacity: 0 });
      newTl.set(".receipt-card-replica-sim", { y: 150, opacity: 0 });
      newTl.set(".pointer-sim", { x: 200, y: 435, scale: 1 });
 
      newTl.to(".pointer-sim", { x: 148, y: 375, duration: 0.8, delay: 0.6 }) // tap google login
        .to(".pointer-sim", { scale: 0.8, duration: 0.2 })
        .to(".google-login-btn-replica", { scale: 0.96, duration: 0.1 })
        .to(".pointer-sim", { scale: 1, duration: 0.1 })
        .to(".google-login-btn-replica", { scale: 1, duration: 0.1 })
        .to(".google-auth-box-sim", { opacity: 0, display: "none", duration: 0.3 })
        .to(".identity-form-box-sim", { display: "flex", opacity: 1, duration: 0.3 })
        
        .to(".pointer-sim", { x: 148, y: 395, duration: 0.8, delay: 0.6 }) // tap submit identity
        .to(".pointer-sim", { scale: 0.8, duration: 0.2 })
        .to(".identity-submit-btn-replica", { scale: 0.95, duration: 0.1 })
        .to(".pointer-sim", { scale: 1, duration: 0.1 })
        .to(".identity-submit-btn-replica", { scale: 1, duration: 0.1 })
        .to(".identity-form-box-sim", { opacity: 0, display: "none", duration: 0.3 })
        .to(".vote-ballot-box-sim", { display: "flex", opacity: 1, duration: 0.3 })
        
        .to(".pointer-sim", { x: 148, y: 395, duration: 0.8, delay: 0.6 }) // tap submit ballot
        .to(".pointer-sim", { scale: 0.8, duration: 0.2 })
        .to(".ballot-submit-btn-replica", { scale: 0.95, duration: 0.1 })
        .to(".pointer-sim", { scale: 1, duration: 0.1 })
        .to(".ballot-submit-btn-replica", { scale: 1, duration: 0.1 })
        .to(".vote-ballot-box-sim", { opacity: 0, display: "none", duration: 0.3 })
        .to(".success-result-box-sim", { display: "flex", opacity: 1, duration: 0.3 })
        .to(".receipt-card-replica-sim", { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.5)" })
        .to(".pointer-sim", { x: 200, y: 480, duration: 0.8, delay: 0.6 }) // Move out of the way
        .to({}, { duration: 3.5 });
    }

  }, [activeStep]);

  const handleNext = () => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  };

  const handlePrev = () => {
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  return (
    <>
      <Header />
      
      <main className="container" style={{ paddingBottom: "120px" }}>
        
        {/* Header Asimetris */}
        <div className="asymmetric-header" style={{ marginBottom: "24px" }}>
          <span className="badge">Panduan Voting</span>
          <span className="bg-text-shadow">TUTORIAL</span>
          <h1 style={{ color: "var(--color-delft-blue)" }}>Simulasi Alur Voting</h1>
        </div>

        {/* Layout Utama */}
        <div className="split-layout" style={{ gap: "40px" }}>
          
          {/* Sisi Kiri: Deskripsi Stepper */}
          <div className="left-stepper-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Stepper Tabs (menggunakan category-tabs asli kita) */}
            <div className="category-tabs" style={{ marginBottom: "24px", gridTemplateColumns: "repeat(4, 1fr)" }}>
              {steps.map((step, idx) => (
                <button
                  key={step.num}
                  type="button"
                  className={`category-tab ${activeStep === idx ? "active" : ""}`}
                  onClick={() => {
                    setActiveStep(idx);
                    setIsPlaying(false);
                  }}
                  style={{
                    padding: "12px 4px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span 
                    style={{ 
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      fontSize: "0.75rem",
                      border: `2px solid var(--color-delft-blue)`,
                      backgroundColor: activeStep === idx ? "var(--color-fern-green)" : "rgba(255,255,255,0.7)",
                      color: activeStep === idx ? "white" : "var(--color-delft-blue)",
                      fontWeight: "bold"
                    }}
                  >
                    {step.num}
                  </span>
                  <span className="category-tab-title" style={{ fontSize: "0.7rem" }}>
                    {step.shortTitle}
                  </span>
                </button>
              ))}
            </div>

            {/* Detail Box (Brutalist card sama persis dengan yang kita miliki di homepage) */}
            <div 
              className="card stepper-detail-card" 
              style={{ 
                padding: "36px", 
                backgroundColor: "white", 
                position: "relative",
                minHeight: "480px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              {/* PushPin (Atas tengah) */}
              <svg 
                width="36" 
                height="36" 
                viewBox="0 0 120 120" 
                style={{ 
                  position: "absolute", 
                  top: "-18px", 
                  left: "50%", 
                  transform: "translateX(-50%) rotate(-4deg)", 
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

              {/* Mascot Badge (Atas kanan melayang miring) */}
              <div 
                style={{ 
                  position: "absolute",
                  top: "-24px",
                  right: "-24px",
                  width: "76px",
                  height: "76px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  transform: "rotate(12deg)",
                  filter: "drop-shadow(3px 3px 0px var(--color-delft-blue))"
                }}
              >
                <div 
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-beige)",
                    border: "2px dashed var(--color-delft-blue)",
                    position: "absolute",
                    zIndex: 1
                  }}
                />
                <img 
                  src={
                    activeStep === 0 ? "/sticker7.webp" :
                    activeStep === 1 ? "/like.webp" :
                    activeStep === 2 ? "/exit.webp" :
                    "/okay.webp"
                  } 
                  alt="Step Mascot" 
                  style={{ 
                    width: "68px", 
                    height: "68px", 
                    objectFit: "contain",
                    position: "relative",
                    zIndex: 2
                  }}
                />
              </div>
              <div ref={descriptionRef}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }} className="step-content-anim">
                  <span 
                    className="badge" 
                    style={{ 
                      backgroundColor: "rgba(67, 113, 24, 0.1)", 
                      color: "var(--color-fern-green)",
                      border: "1.5px solid var(--color-fern-green)",
                      transform: "none",
                      margin: 0,
                      fontWeight: "bold",
                      fontSize: "0.75rem"
                    }}
                  >
                    {steps[activeStep].badgeText}
                  </span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "bold", opacity: 0.7 }}>
                    LANGKAH {steps[activeStep].num} DARI 4
                  </span>
                </div>

                <h2 
                  className="step-content-anim"
                  style={{ 
                    fontFamily: "var(--font-heading)", 
                    color: "var(--color-delft-blue)", 
                    fontSize: "1.6rem", 
                    marginBottom: "16px",
                    textTransform: "uppercase"
                  }}
                >
                  {steps[activeStep].title}
                </h2>

                <p 
                  className="step-content-anim"
                  style={{ 
                    fontSize: "1.1rem", 
                    lineHeight: "1.6", 
                    color: "var(--color-delft-blue)", 
                    fontWeight: 500,
                    marginBottom: "24px"
                  }}
                >
                  {steps[activeStep].desc}
                </p>

                <div 
                  className="step-content-anim"
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "12px", 
                    marginBottom: "28px" 
                  }}
                >
                  {steps[activeStep].instructions.map((inst, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span 
                        style={{ 
                          color: "var(--color-fern-green)", 
                          backgroundColor: "rgba(67, 113, 24, 0.08)",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          flexShrink: 0,
                          marginTop: "2px"
                        }}
                      >
                        {index + 1}
                      </span>
                      <span style={{ fontSize: "0.9rem", lineHeight: "1.5", color: "rgba(29, 42, 98, 0.9)" }}>{inst}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box Info */}
              <div 
                className="step-content-anim"
                style={{ 
                  padding: "16px", 
                  backgroundColor: "rgba(29, 42, 98, 0.03)", 
                  borderLeft: "4px solid var(--color-carolina-blue)",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                  display: "flex",
                  gap: "12px",
                  marginBottom: "24px"
                }}
              >
                <Info size={20} style={{ color: "var(--color-carolina-blue)", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "bold", marginBottom: "4px", color: "var(--color-delft-blue)" }}>Mengapa ini penting?</h4>
                  <p style={{ fontSize: "0.8rem", lineHeight: "1.4", opacity: 0.8 }}>{steps[activeStep].details}</p>
                </div>
              </div>

              {/* Navigasi */}
              <div 
                className="stepper-actions"
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  gap: "16px",
                  borderTop: "2.5px solid var(--color-delft-blue)",
                  paddingTop: "20px"
                }}
              >
                <button
                  onClick={() => {
                    handlePrev();
                    setIsPlaying(false);
                  }}
                  className="btn btn-secondary"
                  style={{ gap: "10px", padding: "12px 20px" }}
                >
                  <ArrowLeft size={16} />
                  Sebelumnya
                </button>

                <div className="right-buttons-group" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="btn btn-secondary"
                    style={{ 
                      padding: "12px", 
                      width: "44px", 
                      height: "44px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center" 
                    }}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (activeStep === 3) {
                        setActiveStep(0);
                      } else {
                        handleNext();
                      }
                      setIsPlaying(false);
                    }}
                    className="btn btn-primary"
                    style={{ gap: "10px", padding: "12px 24px" }}
                  >
                    {activeStep === 3 ? "Ulangi" : "Lanjut"}
                    {activeStep === 3 ? <RotateCcw size={16} /> : <ArrowRight size={16} />}
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Sisi Kanan: Simulator Phone (Browser Mobile & Aplikasi 100% Cocok) */}
          <div className="phone-mockup-wrapper">
            {/* Frame Smartphone */}
            <div 
              className="phone-mockup-container"
              style={{
                width: "320px",
                height: "640px",
                backgroundColor: "var(--color-charcoal)",
                borderRadius: "44px",
                border: "8px solid var(--color-delft-blue)",
                padding: "12px",
                boxShadow: "0 25px 50px -12px rgba(29, 42, 98, 0.4), 8px 8px 0 var(--color-fern-green)",
                position: "relative",
                overflow: "hidden",
                zIndex: 5
              }}
            >
              {/* Notch */}
              <div 
                style={{
                  position: "absolute",
                  top: "0",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "140px",
                  height: "26px",
                  backgroundColor: "var(--color-charcoal)",
                  borderBottomLeftRadius: "18px",
                  borderBottomRightRadius: "18px",
                  zIndex: 100,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <div style={{ width: "40px", height: "4px", backgroundColor: "#374151", borderRadius: "2px" }} />
              </div>

              {/* Layar Smartphone Internal */}
              <div 
                ref={screenRef}
                className="phone-view-screen"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#000000",
                  borderRadius: "32px",
                  position: "relative",
                  overflow: "hidden",
                  fontFamily: "var(--font-body)",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* Status Bar */}
                <div 
                  style={{
                    height: "36px",
                    padding: "0 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    color: "white",
                    zIndex: 90,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    pointerEvents: "none"
                  }}
                >
                  <span style={{ color: activeStep === 0 ? "white" : "var(--color-delft-blue)" }}>22:15</span>
                  <div style={{ display: "flex", gap: "4px", color: activeStep === 0 ? "white" : "var(--color-delft-blue)" }}>
                    <span>5G</span>
                    <span style={{ border: "1px solid", padding: "1px 2px", borderRadius: "2px", fontSize: "0.55rem" }}>100%</span>
                  </div>
                </div>

                {/* --- A. KAMERA BAWAAN (HANYA STEP 1 DI AWAL) --- */}
                {activeStep === 0 && (
                  <div className="camera-app-sim" style={{ width: "100%", height: "100%", backgroundColor: "#090d16", display: "flex", flexDirection: "column", position: "relative", zIndex: 10 }}>
                    
                    {/* Viewfinder Grid */}
                    <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                    <div className="camera-laser-sim" style={{ position: "absolute", left: "15%", width: "70%", height: "2.5px", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981", zIndex: 15 }} />
                    
                    {/* QR Code Banner */}
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 12 }}>
                      <div className="qr-box-inner" style={{ width: "120px", height: "120px", border: "3px dashed rgba(255,255,255,0.4)", borderRadius: "16px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <QrCode size={90} style={{ color: "white" }} />
                      </div>
                    </div>

                    {/* Banner Notifikasi URL Safari/Chrome */}
                    <div 
                      className="camera-link-banner-sim"
                      style={{
                        position: "absolute",
                        top: "60px",
                        left: "12px",
                        width: "272px",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(8px)",
                        border: "2px solid var(--color-delft-blue)",
                        borderRadius: "14px",
                        padding: "10px 14px",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                        zIndex: 25,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                      }}
                    >
                      <QrCode size={18} style={{ color: "var(--color-fern-green)" }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ display: "block", fontSize: "0.55rem", fontWeight: "900", color: "var(--color-delft-blue)", opacity: 0.6 }}>URL TERDETEKSI</span>
                        <span style={{ display: "block", fontSize: "0.65rem", fontWeight: "bold", color: "var(--color-fern-green)" }}>codex-voter.vercel.app</span>
                      </div>
                      <ArrowRight size={14} style={{ color: "var(--color-delft-blue)" }} />
                    </div>

                    {/* Tombol Shutter Kamera */}
                    <div style={{ position: "absolute", bottom: "30px", left: "0", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "24px" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", border: "2px solid white", opacity: 0.5 }} />
                      <div style={{ width: "52px", height: "52px", borderRadius: "50%", border: "4px solid white", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "white" }} />
                      </div>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", border: "2px solid white", opacity: 0.5 }} />
                    </div>

                  </div>
                )}


                {/* --- B. MOBILE BROWSER CONTAINER (UNTUK SEMUA STEP WEB APP) --- */}
                <div 
                  className="browser-container-sim"
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    display: activeStep === 0 ? "none" : "flex", 
                    flexDirection: "column",
                    backgroundColor: "var(--color-beige)",
                    zIndex: 5
                  }}
                >
                  
                  {/* Browser Address Bar (Chrome/Safari style) */}
                  <div 
                    style={{
                      padding: "36px 12px 6px 12px",
                      backgroundColor: "#ffffff",
                      borderBottom: "2px solid var(--color-delft-blue)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f3f4f6", border: "1.5px solid var(--color-delft-blue)", borderRadius: "var(--radius-sm)", padding: "4px 8px", width: "100%" }}>
                      <LockKeyhole size={10} style={{ color: "var(--color-fern-green)", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.55rem", color: "var(--color-delft-blue)", opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        codex-voter.vercel.app{activeStep === 1 ? "/kelompok" : activeStep === 2 ? "/verifikasi" : activeStep === 3 ? "/vote" : "/"}
                      </span>
                      <RefreshCw size={10} style={{ opacity: 0.5, flexShrink: 0 }} />
                    </div>
                  </div>

                  {/* Browser Content Area */}
                  <div 
                    className="browser-content-sim"
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      padding: "12px 10px 60px 10px" // bottom padding for MobileNavBar
                    }}
                  >
                    
                    {/* 1. Header Web App Replica (Sama persis versi mobile) */}
                    <header 
                      style={{ 
                        height: "44px", 
                        backgroundColor: "#ffffff", 
                        border: "2px solid var(--color-delft-blue)", 
                        borderRadius: "8px", 
                        padding: "0 10px", 
                        display: "flex", 
                        alignItems: "center", 
                        boxShadow: "2px 2px 0 var(--color-delft-blue)",
                        marginBottom: "12px",
                        flexShrink: 0
                      }}
                    >
                      {/* Logo */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <img src="/logo.svg" alt="Logo" style={{ height: "14px", width: "auto" }} />
                        <span style={{ fontSize: "0.65rem", fontWeight: "bold", opacity: 0.6 }}>x</span>
                        <img src="/logo-comit.svg" alt="COMIT Logo" style={{ height: "14px", width: "auto" }} />
                        <span style={{ fontSize: "0.6rem", fontWeight: "900", color: "var(--color-delft-blue)", marginLeft: "2px" }}>COMIT UPB</span>
                      </div>
                    </header>

                    {/* 2. Page Contents Replika */}

                    {/* Halaman Home (Step 1) */}
                    {activeStep === 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ position: "relative" }}>
                          <span className="badge" style={{ transform: "rotate(-1deg)", fontSize: "0.55rem", padding: "1px 6px", border: "1px solid var(--color-delft-blue)", backgroundColor: "var(--color-carolina-blue)" }}>
                            Pameran Capstone 2026
                          </span>
                          
                          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", lineHeight: "1.1", color: "var(--color-delft-blue)", margin: "8px 0 6px" }}>
                            Di Mana Rimbun <span style={{ color: "var(--color-fern-green)", fontStyle: "italic" }}>Alam</span> Memeluk Presisi <span style={{ textDecoration: "underline" }}>Teknologi</span>.
                          </h1>

                          <p style={{ fontSize: "0.6rem", lineHeight: "1.3", opacity: 0.85, marginBottom: "12px" }}>
                            Selamat datang di Ruang Pameran Capstone. Amati karya dan tentukan suara Anda.
                          </p>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <button style={{ flex: 1, height: "30px", fontSize: "0.6rem", fontWeight: "bold", backgroundColor: "var(--color-fern-green)", color: "white", border: "1.5px solid var(--color-delft-blue)", borderRadius: "4px", boxShadow: "2px 2px 0 var(--color-delft-blue)", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                              Jelajah Kelompok <ArrowRight size={10} />
                            </button>
                            <button style={{ height: "30px", width: "30px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "white", border: "1.5px solid var(--color-delft-blue)", borderRadius: "4px", boxShadow: "2px 2px 0 var(--color-delft-blue)" }}>
                              <QrCode size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Quote Block */}
                        <div style={{ padding: "10px", borderLeft: "3px solid var(--color-fern-green)", backgroundColor: "rgba(67, 113, 24, 0.05)", borderRadius: "4px" }}>
                          <span style={{ fontSize: "0.5rem", fontWeight: "bold", textTransform: "uppercase", color: "var(--color-fern-green)" }}>PRINSIP VOTING</span>
                          <p style={{ fontSize: "0.55rem", fontStyle: "italic", marginTop: "4px", color: "var(--color-delft-blue)", lineHeight: "1.2" }}>
                            Satu Akun Google, Satu Pilihan. Vote final dibuka setelah memindai QR Exit Gate.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Halaman Kelompok (Step 2) */}
                    {activeStep === 1 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ borderBottom: "1.5px solid var(--color-delft-blue)", paddingBottom: "4px", marginBottom: "4px" }}>
                          <h2 style={{ fontSize: "0.85rem", fontFamily: "var(--font-heading)", color: "var(--color-delft-blue)", margin: 0 }}>Daftar Kelompok</h2>
                        </div>

                        {/* Search Bar */}
                        <div style={{ position: "relative" }}>
                          <input type="text" readOnly placeholder="Cari nama kelompok..." style={{ width: "100%", height: "24px", fontSize: "0.55rem", paddingLeft: "20px", border: "1.5px solid var(--color-delft-blue)", borderRadius: "4px" }} />
                          <Search size={10} style={{ position: "absolute", left: "6px", top: "7px", opacity: 0.6 }} />
                        </div>

                        {/* Real GroupCard Replica */}
                        <div className="sim-card" style={{ marginTop: "4px" }}>
                          {/* Category Tag */}
                          <span className="sim-card-tag">IoT & Hardware</span>
                          
                          {/* Photo Wrapper */}
                          <div className="sim-card-image-wrapper">
                            <div 
                              style={{ 
                                width: "100%", 
                                height: "100%", 
                                background: "linear-gradient(135deg, #1B4D3E, #4B8B3B)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontFamily: "var(--font-heading)",
                                fontWeight: "700",
                                fontSize: "1.5rem",
                                textShadow: "2px 2px 0 var(--color-delft-blue)"
                              }}
                            >
                              A01
                            </div>
                            <span className="sim-card-booth">Booth A01</span>
                          </div>

                          {/* Content */}
                          <h3 style={{ fontSize: "0.85rem", marginBottom: "4px", color: "var(--color-delft-blue)", fontFamily: "var(--font-heading)" }}>
                            Arboris: Sensor Kelembaban Hutan Berbasis IoT
                          </h3>
                          
                          <p style={{ fontSize: "0.6rem", opacity: 0.8, marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "1.6rem", lineHeight: "1.3" }}>
                            Sistem monitoring ekosistem tanah hutan menggunakan sensor IoT bertenaga surya untuk mencegah deforestasi mikro.
                          </p>

                          {/* Action Footer */}
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <button className="sim-btn sim-btn-secondary" style={{ flex: 1 }}>
                              Detail
                            </button>
                            
                            <button 
                              className="sim-btn sim-btn-secondary mobile-heart-btn-sim"
                              style={{ 
                                width: "28px", 
                                height: "28px", 
                                padding: 0, 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center"
                              }}
                            >
                              <Heart className="heart-svg-path-sim" size={12} style={{ color: "var(--color-delft-blue)", transition: "all 0.2s" }} fill="none" />
                            </button>
                          </div>

                          <Heart 
                            className="flying-heart-sim" 
                            size={20} 
                            fill="var(--color-fern-green)" 
                            style={{
                              position: "absolute",
                              bottom: "8px",
                              right: "12px",
                              color: "var(--color-fern-green)",
                              opacity: 0,
                              pointerEvents: "none",
                              zIndex: 100
                            }}
                          />
                        </div>

                        {/* Shortlist Drawer Replica (Sama persis versi mobile web) */}
                        <div 
                          className="drawer-inner-item-sim"
                          style={{
                            marginTop: "10px",
                            border: "2.5px solid var(--color-delft-blue)",
                            borderRadius: "6px",
                            padding: "6px 10px",
                            backgroundColor: "var(--color-white)",
                            boxShadow: "2px 2px 0 var(--color-delft-blue)",
                            display: "none",
                            opacity: 0,
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Heart size={12} fill="#e63946" stroke="#e63946" />
                            <span style={{ fontSize: "0.55rem", fontWeight: "bold", color: "var(--color-delft-blue)" }}>Arboris (A01) & 2 lainnya</span>
                          </div>
                          <span style={{ fontSize: "0.5rem", color: "var(--color-fern-green)", fontWeight: "bold" }}>Terpilih</span>
                        </div>
                      </div>
                    )}

                    {/* Halaman Verifikasi (Step 3) */}
                    {activeStep === 2 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "center" }}>
                        
                        {/* Status Badge */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                          <span 
                            className="lock-status-badge-sim" 
                            style={{ 
                              fontSize: "0.55rem", 
                              fontWeight: "bold", 
                              padding: "2px 8px", 
                              borderRadius: "4px", 
                              border: "1.5px solid var(--color-delft-blue)",
                              backgroundColor: "#fee2e2",
                              color: "#ef4444"
                            }}
                          >
                            VOTING TERKUNCI
                          </span>
                        </div>

                        {/* Visual Terkunci */}
                        <div 
                          className="sim-card locked-visual-sim"
                          style={{
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            padding: "16px"
                          }}
                        >
                          <Lock size={32} style={{ color: "#ef4444" }} />
                          <h3 style={{ fontSize: "0.8rem", fontFamily: "var(--font-heading)", color: "var(--color-delft-blue)", margin: 0 }}>Identitas Pengunjung</h3>
                          <p style={{ fontSize: "0.55rem", lineHeight: "1.3", opacity: 0.85, margin: 0 }}>
                            Akses voting terkunci. Silakan dekati pintu keluar (Exit Gate) dan scan QR khusus panitia.
                          </p>
                        </div>

                        {/* Visual Terbuka Kunci */}
                        <div 
                          className="sim-card unlocked-visual-sim"
                          style={{
                            textAlign: "center",
                            display: "none",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            padding: "16px",
                            opacity: 0
                          }}
                        >
                          <Unlock size={32} style={{ color: "var(--color-fern-green)" }} />
                          <h3 style={{ fontSize: "0.8rem", fontFamily: "var(--font-heading)", color: "var(--color-delft-blue)", margin: 0 }}>Akses Terbuka</h3>
                          <p style={{ fontSize: "0.55rem", lineHeight: "1.3", opacity: 0.85, margin: 0 }}>
                            Kunci Exit Gate valid! Silakan login Google untuk mendaftarkan suara.
                          </p>
                          <button className="sim-btn" style={{ width: "100%", height: "26px", fontSize: "0.55rem", backgroundColor: "var(--color-fern-green)", color: "white", border: "1.5px solid var(--color-delft-blue)", borderRadius: "4px", fontWeight: "bold" }}>
                            Lanjut ke Vote
                          </button>
                        </div>

                        {/* Scanner Exit (Kamera Web App) overlay */}
                        <div 
                          className="exit-scanner-overlay-sim"
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "#000000",
                            zIndex: 80,
                            display: "none",
                            opacity: 0
                          }}
                        >
                          <div style={{ position: "absolute", inset: 0, opacity: 0.2, backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "15px 15px" }} />
                          <div className="laser-line-exit-sim" style={{ position: "absolute", left: "15%", width: "70%", height: "2.5px", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981", zIndex: 85 }} />
                          
                          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                            <div style={{ width: "110px", height: "110px", border: "2px dashed #10b981", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}>
                              <QrCode size={90} style={{ color: "#10b981" }} />
                            </div>
                            <span style={{ color: "white", fontSize: "0.5rem", display: "block", marginTop: "8px" }}>Scan Exit QR Gate...</span>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Halaman Google Login / Ballot / Success (Step 4) */}
                    {activeStep === 3 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "center" }}>
                        
                        {/* 4a. Google Sign In Replica */}
                        <div 
                          className="sim-card google-auth-box-sim"
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            gap: "8px",
                            padding: "16px"
                          }}
                        >
                          <ShieldCheck size={28} style={{ color: "var(--color-fern-green)" }} />
                          <h4 style={{ fontSize: "0.75rem", fontFamily: "var(--font-heading)", color: "var(--color-delft-blue)", margin: 0 }}>Otentikasi Akun</h4>
                          <p style={{ fontSize: "0.55rem", opacity: 0.8, lineHeight: "1.3", margin: 0 }}>
                            Masuk Google untuk verifikasi suara anti-fraud.
                          </p>

                          <button
                            className="google-login-btn-replica"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              width: "100%",
                              height: "30px",
                              fontSize: "0.6rem",
                              fontWeight: "bold",
                              backgroundColor: "white",
                              color: "#3c4043",
                              border: "1.5px solid #dadce0",
                              borderRadius: "4px"
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Masuk dengan Google
                          </button>
                        </div>

                        {/* 4b. Form Identitas Replica */}
                        <div 
                          className="sim-card identity-form-box-sim"
                          style={{
                            display: "none",
                            opacity: 0,
                            gap: "8px",
                            padding: "10px"
                          }}
                        >
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", backgroundColor: "#f3f4f6", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ddd" }}>
                            <Mail size={12} style={{ color: "var(--color-fern-green)" }} />
                            <span style={{ fontSize: "0.55rem", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>budi.s@gmail.com</span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.5rem" }}>
                            <div>
                              <label style={{ fontWeight: "bold", display: "block" }}>Nama Lengkap</label>
                              <input type="text" readOnly value="Budi Setiawan" style={{ width: "100%", padding: "4px", border: "1.5px solid var(--color-delft-blue)", borderRadius: "3px" }} />
                            </div>
                            <div>
                              <label style={{ fontWeight: "bold", display: "block" }}>Kampus</label>
                              <input type="text" readOnly value="Universitas Putra Bangsa" style={{ width: "100%", padding: "4px", border: "1.5px solid var(--color-delft-blue)", borderRadius: "3px" }} />
                            </div>
                          </div>

                          <button 
                            className="identity-submit-btn-replica"
                            style={{
                              width: "100%",
                              height: "26px",
                              backgroundColor: "var(--color-fern-green)",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              fontWeight: "bold",
                              fontSize: "0.55rem",
                              cursor: "pointer"
                            }}
                          >
                            Lanjut ke Halaman Voting
                          </button>
                        </div>

                        {/* 4c. Vote Ballot Replica */}
                        <div 
                          className="sim-card vote-ballot-box-sim"
                          style={{
                            display: "none",
                            opacity: 0,
                            gap: "8px",
                            padding: "10px"
                          }}
                        >
                           <h4 style={{ fontSize: "0.75rem", fontFamily: "var(--font-heading)", color: "var(--color-delft-blue)", margin: 0 }}>Keranjang Vote Final</h4>
                           
                           <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", border: "1.5px solid var(--color-delft-blue)", borderRadius: "6px", backgroundColor: "#f9fafb", fontSize: "0.52rem" }}>
                               <span style={{ fontWeight: "bold" }}>Arboris IoT - Booth A01</span>
                               <Check size={10} style={{ color: "var(--color-fern-green)" }} />
                             </div>
                             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", border: "1.5px solid var(--color-delft-blue)", borderRadius: "6px", backgroundColor: "#f9fafb", fontSize: "0.52rem" }}>
                               <span style={{ fontWeight: "bold" }}>FaunaTrack AI - Booth A02</span>
                               <Check size={10} style={{ color: "var(--color-fern-green)" }} />
                             </div>
                             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", border: "1.5px solid var(--color-delft-blue)", borderRadius: "6px", backgroundColor: "#f9fafb", fontSize: "0.52rem" }}>
                               <span style={{ fontWeight: "bold" }}>TerraGrow - Booth B01</span>
                               <Check size={10} style={{ color: "var(--color-fern-green)" }} />
                             </div>
                           </div>

                          <button 
                            className="ballot-submit-btn-replica sim-btn"
                            style={{
                              width: "100%",
                              height: "30px",
                              backgroundColor: "#ff6b6b",
                              color: "white",
                              boxShadow: "2px 2px 0 var(--color-delft-blue)",
                              cursor: "pointer"
                            }}
                          >
                            KIRIM SUARA FINAL
                          </button>
                        </div>

                        {/* 4d. Vote Success Slip Replica */}
                        <div 
                          className="success-result-box-sim"
                          style={{
                            display: "none",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            textAlign: "center"
                          }}
                        >
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#22c55e", border: "2px solid var(--color-delft-blue)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "6px", boxShadow: "2px 2px 0 var(--color-delft-blue)" }}>
                            <Check size={18} style={{ color: "white" }} />
                          </div>

                          <span style={{ fontSize: "0.6rem", fontWeight: "bold", color: "var(--color-fern-green)", textTransform: "uppercase" }}>Vote Sukses!</span>

                          <div 
                            className="sim-card receipt-card-replica-sim"
                            style={{
                              width: "100%",
                              padding: "8px",
                              marginTop: "8px",
                              textAlign: "left"
                            }}
                          >
                            <span style={{ fontSize: "0.45rem", display: "block", color: "gray" }}>BUKTI RESMI SUARA</span>
                            <strong style={{ fontSize: "0.7rem", display: "block", margin: "2px 0 4px", color: "var(--color-delft-blue)" }}>VOTE-9F82-D7C5</strong>
                            <div style={{ height: "1px", backgroundColor: "#ddd", margin: "4px 0" }} />
                             <span style={{ display: "block", fontSize: "0.48rem", opacity: 0.85 }}><strong>Nama:</strong> Budi Setiawan</span>
                             <span style={{ display: "block", fontSize: "0.48rem", opacity: 0.85, marginTop: "2px" }}>✓ Arboris IoT (Booth A01)</span>
                             <span style={{ display: "block", fontSize: "0.48rem", opacity: 0.85, marginTop: "1px" }}>✓ FaunaTrack AI (Booth A02)</span>
                             <span style={{ display: "block", fontSize: "0.48rem", opacity: 0.85, marginTop: "1px" }}>✓ TerraGrow (Booth B01)</span>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* 3. MobileNavBar Replica (Sama persis versi mobile website) */}
                  <div className="sim-mobile-nav-bar">
                    {/* Jelajah tab */}
                    <button className={`sim-mobile-nav-item ${activeStep === 1 ? "active" : ""}`}>
                      <Compass size={20} />
                      <span>Jelajah</span>
                    </button>

                    {/* Favorit tab */}
                    <button className="sim-mobile-nav-item">
                      <Heart size={20} fill="none" />
                      <span>Favorit</span>
                      <span className="badge-counter drawer-badge-sim">0</span>
                    </button>

                    {/* QR Code Tab (Protruding center button) */}
                    <button 
                      className="sim-mobile-nav-item nav-center-qr-btn-sim"
                      style={{ 
                        transform: "translateY(-14px)", 
                        background: "var(--color-fern-green)",
                        color: "white",
                        borderRadius: "var(--radius-full)",
                        width: "54px",
                        height: "54px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 10px rgba(67, 113, 24, 0.4)",
                        border: "2px solid var(--color-delft-blue)",
                        outline: "none"
                      }}
                    >
                      <QrCode size={24} style={{ color: "white" }} />
                    </button>

                    {/* Vote tab */}
                    <button className={`sim-mobile-nav-item ${activeStep === 2 || activeStep === 3 ? "active" : ""}`}>
                      <ClipboardCheck size={20} />
                      <span>Vote</span>
                    </button>

                    {/* Leaderboard tab */}
                    <button className="sim-mobile-nav-item">
                      <Trophy size={20} />
                      <span>Leaderboard</span>
                    </button>
                  </div>

                </div>

                {/* Simulated Mouse Pointer cursor */}
                <MousePointerClick className="pointer-sim" size={24} style={{ position: "absolute", top: "0px", left: "0px", color: "var(--color-delft-blue)", zIndex: 99, pointerEvents: "none" }} />

              </div>
            </div>
            
            {/* Phone Home indicator bar */}
            <div 
              style={{
                width: "100px",
                height: "4px",
                backgroundColor: "var(--color-delft-blue)",
                borderRadius: "2px",
                marginTop: "12px"
              }}
            />
          </div>

        </div>
        <style jsx global>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.4; }
            100% { transform: scale(1); opacity: 1; }
          }
          .hide-mobile {
            display: inline;
          }
          @media (max-width: 600px) {
            .hide-mobile {
              display: none;
            }
          }
          .mobile-tutorial-floating-badge {
            display: none !important;
          }
          
          /* Mobile Responsiveness for Stepper card and Tabs */
          html, body {
            overflow-x: hidden !important;
            max-width: 100% !important;
          }
          .left-stepper-container {
            width: 100%;
            max-width: 100%;
            overflow: visible;
          }
          .left-stepper-container .stepper-detail-card {
            border: 3.5px solid var(--color-delft-blue) !important;
            box-shadow: 8px 8px 0 var(--color-delft-blue) !important;
            border-radius: var(--radius-md) !important;
            overflow: visible !important;
            transform: rotate(-0.5deg);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .category-tab-title {
            white-space: nowrap;
          }
          @media (max-width: 768px) {
            .left-stepper-container {
              overflow-x: hidden !important;
              padding-right: 8px !important; /* leaves room for card's 4px shadow */
            }
            .left-stepper-container .stepper-detail-card {
              min-height: auto !important;
              padding: 20px !important;
              transform: none !important; /* disable rotation on mobile to prevent overflow-x */
              box-shadow: 4px 4px 0 var(--color-delft-blue) !important; /* smaller shadow */
            }
            .category-tabs {
              gap: 6px !important;
            }
            .category-tabs .category-tab {
              padding: 8px 2px !important;
              font-size: 0.7rem !important;
              min-width: 0 !important;
            }
            .category-tabs .category-tab span {
              font-size: 0.7rem !important;
            }
            .category-tab-title {
              white-space: normal !important;
              line-height: 1.1 !important;
              text-align: center !important;
            }
            .bg-text-shadow {
              font-size: 4.5rem !important;
              top: -1rem !important;
            }
            
            /* Stack stepper actions vertically on smaller viewports to prevent button overflows */
            .stepper-actions {
              flex-direction: column-reverse !important;
              gap: 12px !important;
              align-items: stretch !important;
            }
            .stepper-actions .btn {
              width: 100% !important;
              justify-content: center !important;
              padding: 10px 16px !important;
              font-size: 0.8rem !important;
            }
            .stepper-actions .right-buttons-group {
              width: 100% !important;
              display: flex !important;
              gap: 10px !important;
            }
            .stepper-actions .right-buttons-group .btn {
              flex: 1 !important;
            }
          }

          /* --- Responsive scaling for Smartphone simulator on small viewports --- */
          .phone-mockup-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 100%;
            overflow: visible;
            height: 660px;
            transition: all 0.3s ease;
          }
          .phone-mockup-container {
            width: 320px;
            height: 640px;
            flex-shrink: 0;
            transition: transform 0.3s ease;
          }
          @media (max-width: 380px) {
            .phone-mockup-container {
              transform: scale(0.9);
              transform-origin: center center;
            }
            .phone-mockup-wrapper {
              height: 580px;
            }
          }
          @media (max-width: 340px) {
            .phone-mockup-container {
              transform: scale(0.8);
              transform-origin: center center;
            }
            .phone-mockup-wrapper {
              height: 520px;
            }
          }

          /* --- Scoped UI simulation styles inside Phone mockup --- */
          .phone-view-screen .sim-card {
            background-color: var(--color-white) !important;
            border: 2px solid var(--color-delft-blue) !important;
            border-radius: var(--radius-md) !important;
            box-shadow: 3px 3px 0px 0px var(--color-delft-blue) !important;
            padding: 12px !important;
            position: relative !important;
            overflow: hidden !important;
            display: flex;
            flex-direction: column;
            transition: none !important;
          }

          .phone-view-screen .sim-card-tag {
            position: absolute !important;
            top: 8px !important;
            right: 8px !important;
            background: var(--color-white) !important;
            border: 1px solid var(--color-delft-blue) !important;
            padding: 2px 6px !important;
            font-size: 0.5rem !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            z-index: 10 !important;
            box-shadow: 1.5px 1.5px 0px 0px var(--color-delft-blue) !important;
          }

          .phone-view-screen .sim-card-image-wrapper {
            position: relative !important;
            margin: -12px -12px var(--space-sm) -12px !important;
            height: 76px !important;
            overflow: hidden !important;
          }

          .phone-view-screen .sim-card-booth {
            position: absolute !important;
            bottom: 8px !important;
            left: 8px !important;
            background: var(--color-fern-green) !important;
            color: var(--color-white) !important;
            border: 1px solid var(--color-delft-blue) !important;
            padding: 1px 6px !important;
            font-size: 0.55rem !important;
            font-weight: 700 !important;
            z-index: 10 !important;
          }

          .phone-view-screen .sim-btn {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 4px !important;
            font-family: var(--font-heading) !important;
            font-size: 0.65rem !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.02em !important;
            padding: 4px 8px !important;
            border: 1.5px solid var(--color-delft-blue) !important;
            border-radius: var(--radius-sm) !important;
            cursor: pointer !important;
            background-color: var(--color-white) !important;
            color: var(--color-delft-blue) !important;
            height: 28px !important;
            box-shadow: 1.5px 1.5px 0px 0px var(--color-delft-blue) !important;
          }
          .phone-view-screen .sim-btn-secondary {
            background-color: var(--color-white) !important;
            color: var(--color-delft-blue) !important;
          }
          .phone-view-screen .sim-btn-primary {
            background-color: var(--color-pistachio) !important;
            color: var(--color-delft-blue) !important;
          }

          /* Force mobile navigation bar to display inside the phone mockup container */
          .phone-view-screen .sim-mobile-nav-bar {
            display: flex !important;
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 52px !important;
            background: var(--color-white) !important;
            border-top: 2px solid var(--color-delft-blue) !important;
            z-index: 90 !important;
            padding: 4px 0 !important;
            box-shadow: 0 -4px 20px rgba(29, 42, 98, 0.08) !important;
            border-bottom-left-radius: 32px !important;
            border-bottom-right-radius: 32px !important;
            align-items: center !important;
            justify-content: space-around !important;
          }
          .phone-view-screen .sim-mobile-nav-item {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 0.48rem !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            color: var(--color-delft-blue) !important;
            gap: 2px !important;
            position: relative !important;
            background: none !important;
            border: none !important;
            cursor: pointer !important;
            padding: 4px 8px !important;
            opacity: 0.4;
          }
          .phone-view-screen .sim-mobile-nav-item.active {
            opacity: 1 !important;
            color: var(--color-fern-green) !important;
          }
          .phone-view-screen .nav-center-qr-btn-sim {
            background: var(--color-fern-green) !important;
            border: 2px solid var(--color-delft-blue) !important;
            opacity: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .phone-view-screen .sim-mobile-nav-item .badge-counter {
            position: absolute !important;
            top: -2px !important;
            right: 6px !important;
            background-color: var(--color-delft-blue) !important;
            color: var(--color-white) !important;
            font-size: 0.45rem !important;
            width: 11px !important;
            height: 11px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-weight: bold !important;
          }
        `}</style>
      </main>
    </>
  );
}
