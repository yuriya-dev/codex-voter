"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Leaf, Award, Trophy, LayoutDashboard, Maximize2, Minimize2, Clock } from "lucide-react";
import { getBackendUrl } from "@/lib/config";

const BACKEND_URL = getBackendUrl();

interface GroupStat {
  id: string;
  name: string;
  booth_number: string;
  category: string;
  votes: number;
}

export default function DashboardPublikPage() {
  const [stats, setStats] = useState<GroupStat[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settings, setSettings] = useState({
    leaderboard_visible: "true",
    voting_status: "not_started",
    voting_end_time: ""
  });
  const [timeLeft, setTimeLeft] = useState<string>("");

  const fetchStats = async () => {
    try {
      // 1. Fetch stats
      const res = await fetch(`${BACKEND_URL}/api/dashboard/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.groupStats);
        setTotalVotes(data.totalVotes);
      }

      // 2. Fetch settings
      const settingsRes = await fetch(`${BACKEND_URL}/api/settings`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (err) {
      console.error("Gagal mengambil data statistik publik:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000); // Polling setiap 3 detik
    return () => clearInterval(interval);
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (settings.voting_status !== "started" || !settings.voting_end_time) {
      setTimeLeft("");
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(settings.voting_end_time) - +new Date();
      if (difference <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const pad = (num: number) => String(num).padStart(2, "0");
      setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [settings.voting_status, settings.voting_end_time]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Gagal mengaktifkan mode layar penuh:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Monitor fullscreen change from OS/Escape key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Sort groups by votes
  const sortedStats = [...stats].sort((a, b) => b.votes - a.votes);

  // Top 3 for Podium
  const firstPlace = sortedStats[0];
  const secondPlace = sortedStats[1];
  const thirdPlace = sortedStats[2];

  // The rest (rank 4+)
  const restStats = sortedStats.slice(3);

  return (
    <div 
      className="publik-dashboard-body" 
      style={{ 
        minHeight: "100vh", 
        backgroundColor: "var(--color-beige)", 
        color: "var(--color-delft-blue)",
        padding: isFullscreen ? "40px" : "24px 16px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "var(--transition-smooth)"
      }}
    >
      
      {/* Background Grid Motif */}
      <div 
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "100%", 
          opacity: 0.05, 
          backgroundImage: "linear-gradient(rgba(29, 42, 98, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(29, 42, 98, 0.1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          pointerEvents: "none"
        }}
      />

      {/* Floating Header */}
      <header 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "40px", 
          zIndex: 10,
          borderBottom: "2px solid var(--color-delft-blue)",
          paddingBottom: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Leaf size={28} className="leaf-icon" style={{ color: "var(--color-fern-green)", transform: "rotate(-15deg)" }} />
          <div>
            <h1 style={{ fontSize: "1.5rem", fontFamily: "var(--font-heading)", textTransform: "uppercase", lineHeight: 1 }}>
              LIVE SCOREBOARD
            </h1>
            <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-fern-green)", marginTop: "4px" }}>
              PAMERAN CAPSTONE TECH JUNGLE
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {timeLeft && (
            <div 
              style={{ 
                backgroundColor: "var(--color-pistachio)", 
                border: "2px solid var(--color-delft-blue)", 
                padding: "6px 16px", 
                borderRadius: "var(--radius-sm)",
                fontWeight: 700,
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "2px 2px 0 0 var(--color-delft-blue)"
              }}
            >
              <Clock size={16} /> SISA WAKTU: <span style={{ fontFamily: "monospace", fontSize: "1rem" }}>{timeLeft}</span>
            </div>
          )}

          {settings.voting_status === "ended" && (
            <div 
              style={{ 
                backgroundColor: "#ff6b6b", 
                color: "white",
                border: "2px solid var(--color-delft-blue)", 
                padding: "6px 16px", 
                borderRadius: "var(--radius-sm)",
                fontWeight: 800,
                fontSize: "0.9rem",
                boxShadow: "2px 2px 0 0 var(--color-delft-blue)"
              }}
            >
              🏁 VOTING SELESAI / HASIL FINAL
            </div>
          )}

          <div 
            style={{ 
              backgroundColor: "white", 
              border: "2px solid var(--color-delft-blue)", 
              padding: "6px 16px", 
              borderRadius: "var(--radius-sm)",
              fontWeight: 700,
              fontSize: "0.9rem",
              boxShadow: "2px 2px 0 0 var(--color-delft-blue)"
            }}
          >
            TOTAL SUARA: <span style={{ color: "var(--color-fern-green)" }}>{totalVotes}</span>
          </div>

          <button 
            onClick={toggleFullscreen} 
            className="btn btn-secondary" 
            style={{ padding: "8px", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* Konten Utama */}
      {settings.voting_status === "not_started" ? (
        <div 
          style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "1200px", 
            margin: "0 auto", 
            width: "100%", 
            zIndex: 10 
          }}
        >
          <div 
            className="card" 
            style={{ 
              maxWidth: "500px", 
              width: "100%",
              padding: "40px", 
              textAlign: "center",
              border: "3px solid var(--color-delft-blue)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "white",
              boxShadow: "6px 6px 0px var(--color-delft-blue)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px"
            }}
          >
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "var(--radius-sm)",
              border: "2px solid var(--color-delft-blue)",
              background: "var(--color-beige)",
              color: "var(--color-delft-blue)",
              boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
            }}>
              <Clock size={32} />
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>Voting Belum Dimulai</h2>
            <p style={{ fontSize: "0.95rem", opacity: 0.8, lineHeight: 1.6 }}>
              Sesi voting belum dibuka oleh panitia. Silakan tunggu informasi dari panitia pameran untuk memulai memindai QR Code dan memilih kelompok favorit Anda.
            </p>
          </div>
        </div>
      ) : settings.leaderboard_visible === "false" ? (
        <div 
          style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "1200px", 
            margin: "0 auto", 
            width: "100%", 
            zIndex: 10 
          }}
        >
          <div 
            className="card" 
            style={{ 
              maxWidth: "500px", 
              width: "100%",
              padding: "40px", 
              textAlign: "center",
              border: "3px solid var(--color-delft-blue)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "white",
              boxShadow: "6px 6px 0px var(--color-delft-blue)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px"
            }}
          >
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "var(--radius-sm)",
              border: "2px solid var(--color-delft-blue)",
              background: "var(--color-pistachio)",
              color: "var(--color-delft-blue)",
              boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
            }}>
              <Trophy size={32} style={{ opacity: 0.5 }} />
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>Leaderboard Ditutup</h2>
            <p style={{ fontSize: "0.95rem", opacity: 0.8, lineHeight: 1.6 }}>
              Hasil perolehan suara sementara sedang disembunyikan oleh panitia untuk menjaga antusiasme dan kejutan hasil akhir pameran.
            </p>
            {timeLeft && (
              <div style={{ 
                marginTop: "12px", 
                padding: "10px 20px", 
                border: "2px solid var(--color-delft-blue)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-beige)",
                fontSize: "1.5rem", 
                fontWeight: "bold", 
                fontFamily: "monospace",
                boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
              }}>
                ⏱️ SISA WAKTU: {timeLeft}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div 
          style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            gap: "40px", 
            maxWidth: "1200px", 
            margin: "0 auto", 
            width: "100%", 
            zIndex: 10 
          }}
        >
          
          {/* PODIUM TIGA BESAR */}
          {sortedStats.length > 0 && (
            <section 
              style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "flex-end", 
                gap: "24px", 
                marginTop: "20px",
                paddingBottom: "20px",
                flexWrap: "wrap"
              }}
            >
              
              {/* Podium Juara 2 (Kiri) */}
              {secondPlace && (
                <div 
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    width: "280px"
                  }}
                >
                  <div style={{ textAlign: "center", marginBottom: "12px", padding: "0 10px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-fern-green)", textTransform: "uppercase" }}>
                      {secondPlace.booth_number}
                    </span>
                    <h3 style={{ fontSize: "1rem", fontFamily: "var(--font-heading)", color: "var(--color-delft-blue)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "240px" }}>
                      {secondPlace.name}
                    </h3>
                  </div>
                  <div 
                    style={{ 
                      height: "140px", 
                      width: "100%", 
                      backgroundColor: "white", 
                      border: "3px solid var(--color-delft-blue)", 
                      borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "20px",
                      boxShadow: "4px 4px 0px var(--color-delft-blue)",
                      position: "relative"
                    }}
                  >
                    <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--color-delft-blue)", fontFamily: "var(--font-heading)" }}>
                      2
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--color-fern-green)" }}>
                        {secondPlace.votes}
                      </div>
                      <div style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "rgba(29, 42, 98, 0.6)" }}>
                        Suara
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Podium Juara 1 (Tengah - Lebih Tinggi & Menonjol) */}
              {firstPlace && (
                <div 
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    width: "320px",
                    zIndex: 2
                  }}
                >
                  <Trophy size={40} style={{ color: "var(--color-pistachio)", marginBottom: "8px", filter: "drop-shadow(2px 2px 0 var(--color-delft-blue))" }} />
                  <div style={{ textAlign: "center", marginBottom: "12px", padding: "0 10px" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-fern-green)", textTransform: "uppercase" }}>
                      {firstPlace.booth_number}
                    </span>
                    <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", color: "var(--color-delft-blue)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "280px" }}>
                      {firstPlace.name}
                    </h3>
                  </div>
                  <div 
                    style={{ 
                      height: "190px", 
                      width: "100%", 
                      backgroundColor: "var(--color-pistachio)", 
                      border: "3px solid var(--color-delft-blue)", 
                      borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "24px",
                      boxShadow: "6px 6px 0px var(--color-delft-blue)",
                      position: "relative"
                    }}
                  >
                    <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--color-delft-blue)", fontFamily: "var(--font-heading)" }}>
                      1
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--color-delft-blue)" }}>
                        {firstPlace.votes}
                      </div>
                      <div style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-delft-blue)" }}>
                        Suara
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Podium Juara 3 (Kanan) */}
              {thirdPlace && (
                <div 
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    width: "280px"
                  }}
                >
                  <div style={{ textAlign: "center", marginBottom: "12px", padding: "0 10px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-fern-green)", textTransform: "uppercase" }}>
                      {thirdPlace.booth_number}
                    </span>
                    <h3 style={{ fontSize: "1rem", fontFamily: "var(--font-heading)", color: "var(--color-delft-blue)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "240px" }}>
                      {thirdPlace.name}
                    </h3>
                  </div>
                  <div 
                    style={{ 
                      height: "110px", 
                      width: "100%", 
                      backgroundColor: "white", 
                      border: "3px solid var(--color-delft-blue)", 
                      borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "16px",
                      boxShadow: "4px 4px 0px var(--color-delft-blue)",
                      position: "relative"
                    }}
                  >
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--color-delft-blue)", fontFamily: "var(--font-heading)" }}>
                      3
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-fern-green)" }}>
                        {thirdPlace.votes}
                      </div>
                      <div style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "rgba(29, 42, 98, 0.6)" }}>
                        Suara
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </section>
          )}

          {/* DAFTAR PERINGKAT LAINNYA */}
          {restStats.length > 0 && (
            <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "1rem", fontFamily: "var(--font-heading)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid var(--color-delft-blue)", paddingBottom: "6px" }}>
                Peringkat Booth Lainnya
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {restStats.map((group, index) => {
                  const percentage = totalVotes > 0 ? (group.votes / totalVotes) * 100 : 0;
                  return (
                    <div 
                      key={group.id} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "16px", 
                        padding: "12px 20px", 
                        border: "2px solid var(--color-delft-blue)", 
                        borderRadius: "var(--radius-sm)", 
                        backgroundColor: "white",
                        boxShadow: "2px 2px 0 var(--color-delft-blue)"
                      }}
                    >
                      {/* Rank */}
                      <div style={{ fontSize: "1.2rem", fontWeight: "700", width: "30px", color: "var(--color-delft-blue)" }}>
                        #{index + 4}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--color-fern-green)", textTransform: "uppercase" }}>
                          {group.booth_number} &bull; {group.category}
                        </span>
                        <h4 style={{ fontSize: "0.95rem", color: "var(--color-delft-blue)", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {group.name}
                        </h4>
                      </div>

                      {/* Progress Bar (Visual) */}
                      <div style={{ width: "180px", display: "none" }} className="public-bar-desktop">
                        <div style={{ width: "100%", height: "12px", border: "1px solid var(--color-delft-blue)", borderRadius: "var(--radius-sm)", overflow: "hidden", backgroundColor: "var(--color-beige)" }}>
                          <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: "var(--color-fern-green)" }} />
                        </div>
                      </div>

                      {/* Vote Count */}
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--color-delft-blue)" }}>
                          {group.votes}
                        </span>
                        <span style={{ fontSize: "0.7rem", display: "block", color: "rgba(29, 42, 98, 0.6)", textTransform: "uppercase", fontWeight: "700", marginTop: "-2px" }}>
                          Suara
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      )}

      {/* Footer / Tombol Kembali */}
      <footer style={{ marginTop: "48px", textAlign: "center", zIndex: 10 }}>
        <Link href="/" className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "8px 16px" }}>
          Kembali ke Halaman Publik
        </Link>
      </footer>

      {/* Responsive Inline CSS Helper */}
      <style jsx global>{`
        @media (min-width: 768px) {
          .public-bar-desktop {
            display: block !important;
          }
        }
      `}</style>

    </div>
  );
}
