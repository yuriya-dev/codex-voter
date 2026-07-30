"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Award, Trophy, LayoutDashboard, Maximize2, Minimize2, Clock } from "lucide-react";
import { getBackendUrl } from "@/lib/config";
import { supabase } from "@/lib/supabase";

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

  // States for 10-second countdown and sounds
  const [countdownSecs, setCountdownSecs] = useState<number | null>(null);
  const [countdownActive, setCountdownActive] = useState<boolean>(false);
  const [forceShowLeaderboard, setForceShowLeaderboard] = useState<boolean>(false);
  const [hasLoadedInitialSettings, setHasLoadedInitialSettings] = useState<boolean>(false);
  const [hasCountedDown, setHasCountedDown] = useState<boolean>(false);
  const [prevLeaderboardVisible, setPrevLeaderboardVisible] = useState<boolean>(false);
  const isFirstTransition = useRef(true);

  const isLeaderboardVisibleNow = settings.leaderboard_visible === "true" || forceShowLeaderboard;

  // State and effect for confetti particle animation
  const [confetti, setConfetti] = useState<number[]>([]);

  useEffect(() => {
    if (isLeaderboardVisibleNow) {
      const particles = Array.from({ length: 60 }, (_, idx) => idx);
      setConfetti(particles);
    } else {
      setConfetti([]);
    }
  }, [isLeaderboardVisibleNow]);

  // Sound synthesizer using Web Audio API
  const playTickSound = (secondsLeft: number) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (secondsLeft === 0) {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (err) {
      console.error("Gagal memutar suara countdown:", err);
    }
  };

  const playFestiveSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const playNote = (freq: number, start: number, duration: number, volume: number = 0.12) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "triangle"; // brassy/warm retro feel
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Triumphant major arpeggio & chord fanfare
      playNote(392.00, 0.0, 0.25);
      playNote(523.25, 0.15, 0.25);
      playNote(659.25, 0.3, 0.25);
      playNote(783.99, 0.45, 0.35);
      
      // Final rich C-major chord
      playNote(523.25, 0.7, 1.5, 0.08);
      playNote(659.25, 0.7, 1.5, 0.08);
      playNote(783.99, 0.7, 1.5, 0.08);
      playNote(1046.50, 0.7, 1.5, 0.08);
      playNote(261.63, 0.7, 1.5, 0.06); // Warm sub bass (C4)

    } catch (err) {
      console.error("Gagal memutar suara kemeriahan:", err);
    }
  };

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
        setHasLoadedInitialSettings(true);
      }
    } catch (err) {
      console.error("Gagal mengambil data statistik publik:", err);
      // Ensure initial setup runs even if fetch fails to avoid locking the UI transitions
      setHasLoadedInitialSettings(true);
    }
  };

  useEffect(() => {
    // 1. Fetch data awal
    fetchStats();

    // 2. Buat channel subscription untuk realtime database dari Supabase
    const channel = supabase
      .channel("db-changes")
      // Listen to changes on votes table
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        (payload) => {
          console.log("Realtime: Perubahan terdeteksi di tabel votes", payload);
          fetchStats();
        }
      )
      // Listen to changes on settings table
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        (payload) => {
          console.log("Realtime: Perubahan terdeteksi di tabel settings", payload);
          fetchStats();
        }
      )
      // Listen to changes on groups table (jika ada nama/booth diubah)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "groups" },
        (payload) => {
          console.log("Realtime: Perubahan terdeteksi di tabel groups", payload);
          fetchStats();
        }
      )
      .subscribe();

    // Cleanup subscription saat unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Polling settings fallback to guarantee instant updates without manual refresh
  useEffect(() => {
    const pollSettings = async () => {
      try {
        const settingsRes = await fetch(`${BACKEND_URL}/api/settings`);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          
          // Check if settings have actually changed
          setSettings(prev => {
            if (
              prev.leaderboard_visible !== settingsData.leaderboard_visible ||
              prev.voting_status !== settingsData.voting_status ||
              prev.voting_end_time !== settingsData.voting_end_time
            ) {
              // Fetch fresh stats to ensure leaderboard data is up-to-date
              fetchStats();
              return settingsData;
            }
            return prev;
          });
          setHasLoadedInitialSettings(true);
        }
      } catch (err) {
        console.error("Gagal polling settings:", err);
      }
    };

    const interval = setInterval(pollSettings, 2000);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (settings.voting_status !== "started" || !settings.voting_end_time) {
      setTimeLeft("");
      setCountdownActive(false);
      setCountdownSecs(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(settings.voting_end_time) - +new Date();
      
      // If the timer is in its last 10 seconds (or has run out)
      if (difference <= 10000) {
        if (difference <= 0) {
          setTimeLeft("00:00:00");
          setCountdownActive(false);
          setCountdownSecs(null);
          setForceShowLeaderboard(true);
          return;
        }

        // Inside the last 10 seconds, show the big countdown
        const secs = Math.ceil(difference / 1000);
        setTimeLeft(`00:00:${String(secs).padStart(2, "0")}`);
        
        setCountdownSecs(secs);
        setCountdownActive(true);
        return;
      }

      // Normal countdown behavior
      setCountdownActive(false);
      setCountdownSecs(null);

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const pad = (num: number) => String(num).padStart(2, "0");
      setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 250); // Check 4 times a second for high responsiveness
    return () => clearInterval(timer);
  }, [settings.voting_status, settings.voting_end_time]);

  // Play tick sound when countdownSecs changes
  useEffect(() => {
    if (countdownActive && countdownSecs !== null && countdownSecs >= 0) {
      playTickSound(countdownSecs);
    }
  }, [countdownActive, countdownSecs]);

  // Leaderboard reveal transition (play festive sound)
  useEffect(() => {
    if (!hasLoadedInitialSettings) return;

    if (isFirstTransition.current) {
      isFirstTransition.current = false;
      setPrevLeaderboardVisible(isLeaderboardVisibleNow);
      return;
    }

    if (isLeaderboardVisibleNow && !prevLeaderboardVisible) {
      playFestiveSound();
    }
    setPrevLeaderboardVisible(isLeaderboardVisibleNow);
  }, [isLeaderboardVisibleNow, prevLeaderboardVisible, hasLoadedInitialSettings]);

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

  // Hitung pemenang per kategori (perolehan terbanyak)
  const categoryWinners: { [key: string]: GroupStat } = {};
  stats.forEach(g => {
    const cat = g.category || "Umum";
    if (!categoryWinners[cat] || g.votes > categoryWinners[cat].votes) {
      categoryWinners[cat] = g;
    }
  });

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
      {/* Confetti Particle Effect */}
      {isLeaderboardVisibleNow && confetti.length > 0 && (
        <div className="confetti-container">
          {confetti.map((idx) => (
            <div
              key={idx}
              className="leaf-particle"
              style={{
                left: `${(idx * 1.6) % 100}vw`,
                animationDelay: `${(idx * 0.15) % 4}s`,
                animationDuration: `${3 + (idx % 3)}s`,
                transform: `rotate(${(idx * 15) % 360}deg) scale(${0.6 + ((idx % 5) * 0.15)})`,
                backgroundColor: idx % 3 === 0 
                  ? "var(--color-fern-green)" 
                  : idx % 3 === 1 
                  ? "var(--color-pistachio)" 
                  : "var(--color-carolina-blue)"
              }}
            />
          ))}
        </div>
      )}
      
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
          <Award size={28} className="leaf-icon" style={{ color: "var(--color-fern-green)", transform: "rotate(-15deg)" }} />
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
            className="btn btn-secondary fullscreen-btn" 
            style={{ padding: "8px", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* Konten Utama */}
      {countdownActive && countdownSecs !== null ? (
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
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scale-pulse {
              0% { transform: scale(0.9); opacity: 0.7; }
              50% { transform: scale(1.15); opacity: 1; text-shadow: 0 0 20px var(--color-pistachio); }
              100% { transform: scale(0.95); opacity: 0.8; }
            }
            @keyframes border-flash {
              0% { border-color: var(--color-delft-blue); box-shadow: 0px 0px 10px rgba(29, 42, 98, 0.2); }
              50% { border-color: var(--color-fern-green); box-shadow: 0px 0px 25px rgba(67, 113, 24, 0.4); }
              100% { border-color: var(--color-delft-blue); box-shadow: 0px 0px 10px rgba(29, 42, 98, 0.2); }
            }
            @keyframes grid-move {
              0% { background-position: 0 0; }
              100% { background-position: 24px 24px; }
            }
          `}} />

          <div 
            className="card" 
            style={{ 
              maxWidth: "600px", 
              width: "100%",
              padding: "60px 40px", 
              textAlign: "center",
              border: "3.5px solid var(--color-delft-blue)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "white",
              boxShadow: "10px 10px 0px var(--color-delft-blue)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "28px",
              animation: "border-flash 1.5s infinite ease-in-out",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: "linear-gradient(rgba(29, 42, 98, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(29, 42, 98, 0.03) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              pointerEvents: "none",
              animation: "grid-move 4s linear infinite"
            }} />

            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "var(--radius-sm)",
              border: "2.5px solid var(--color-delft-blue)",
              background: "var(--color-beige)",
              color: "var(--color-delft-blue)",
              boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
            }}>
              <Clock size={28} className="spin-icon" style={{ animation: "spin 4s linear infinite" }} />
            </div>

            <div style={{ zIndex: 2 }}>
              <span style={{ 
                fontSize: "0.85rem", 
                fontWeight: "800", 
                color: "var(--color-fern-green)", 
                letterSpacing: "4px",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "8px"
              }}>
                🏁 WAKTU VOTING SELESAI
              </span>
              <h2 style={{ 
                fontFamily: "var(--font-heading)", 
                textTransform: "uppercase",
                fontSize: "1.8rem",
                lineHeight: 1.2,
                color: "var(--color-delft-blue)"
              }}>
                LEADERBOARD AKAN DIBUKA DALAM
              </h2>
            </div>

            <div style={{
              fontSize: "8rem",
              fontWeight: "900",
              color: "var(--color-delft-blue)",
              fontFamily: "monospace",
              margin: "10px 0",
              lineHeight: 1.1,
              textShadow: "5px 5px 0px var(--color-pistachio)",
              animation: "scale-pulse 1s infinite ease-in-out",
              zIndex: 2
            }}>
              {countdownSecs}
            </div>

            <p style={{ 
              fontSize: "0.95rem", 
              opacity: 0.85, 
              fontWeight: "600",
              color: "var(--color-delft-blue)",
              maxWidth: "400px",
              lineHeight: 1.5,
              zIndex: 2
            }}>
              Siapkan diri Anda untuk melihat hasil akhir perolehan suara Capstone Project!
            </p>
          </div>
        </div>
      ) : settings.voting_status === "not_started" ? (
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
      ) : settings.leaderboard_visible === "false" && !forceShowLeaderboard ? (
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
          <style dangerouslySetInnerHTML={{__html: `
            @media (max-width: 1200px) {
              .leaderboard-mascot {
                display: none !important;
              }
            }
          `}} />

          {/* Mascot Ilustrasi Kiri */}
          <div 
            className="leaderboard-mascot mascot-left"
            style={{
              position: "fixed",
              bottom: "-10px",
              left: "20px",
              height: "220px",
              width: "auto",
              zIndex: 5,
              pointerEvents: "none"
            }}
          >
            <img 
              src="/like.webp" 
              alt="Mascot Like" 
              style={{
                height: "100%",
                width: "auto",
                objectFit: "contain",
                transform: "scaleX(-1)",
                filter: "drop-shadow(4px 4px 0px var(--color-delft-blue))"
              }}
            />
          </div>

          {/* Mascot Ilustrasi Kanan */}
          <div 
            className="leaderboard-mascot mascot-right"
            style={{
              position: "fixed",
              bottom: "-10px",
              right: "20px",
              height: "220px",
              width: "auto",
              zIndex: 5,
              pointerEvents: "none"
            }}
          >
            <img 
              src="/voted.webp" 
              alt="Mascot Success" 
              style={{
                height: "100%",
                width: "auto",
                objectFit: "contain",
                filter: "drop-shadow(-4px 4px 0px var(--color-delft-blue))"
              }}
            />
          </div>
          
          {/* PODIUM TIGA BESAR */}
          {/* PODIUM TIGA BESAR */}
          {sortedStats.length > 0 && (
            <>
              {/* Desktop View (Horizontal Podium 3D) */}
              <section className="podium-desktop">
                
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

              {/* Mobile View (Stacked List Cards, Sorted 1st -> 2nd -> 3rd) */}
              <section className="podium-mobile">
                {/* Card Juara 1 */}
                {firstPlace && (
                  <div 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "16px", 
                      padding: "16px 20px", 
                      border: "3px solid var(--color-delft-blue)", 
                      borderRadius: "var(--radius-md)", 
                      backgroundColor: "var(--color-pistachio)",
                      boxShadow: "4px 4px 0 var(--color-delft-blue)",
                      position: "relative"
                    }}
                  >
                    {/* Rank Badge */}
                    <div 
                      style={{ 
                        width: "48px", 
                        height: "48px", 
                        borderRadius: "50%", 
                        backgroundColor: "var(--color-white)", 
                        border: "2px solid var(--color-delft-blue)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-delft-blue)",
                        fontWeight: "800",
                        fontSize: "1.25rem",
                        flexShrink: 0
                      }}
                    >
                      1
                    </div>
                    
                    {/* Info Kelompok */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--color-fern-green)", textTransform: "uppercase" }}>
                        🏆 {firstPlace.booth_number} &bull; {firstPlace.category}
                      </span>
                      <h3 style={{ fontSize: "1.05rem", fontFamily: "var(--font-heading)", color: "var(--color-delft-blue)", marginTop: "2px", fontWeight: "700" }}>
                        {firstPlace.name}
                      </h3>
                    </div>

                    {/* Vote Count */}
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--color-delft-blue)" }}>
                        {firstPlace.votes}
                      </span>
                      <span style={{ fontSize: "0.7rem", display: "block", color: "var(--color-delft-blue)", textTransform: "uppercase", fontWeight: "700", marginTop: "-2px" }}>
                        Suara
                      </span>
                    </div>
                  </div>
                )}

                {/* Card Juara 2 */}
                {secondPlace && (
                  <div 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "16px", 
                      padding: "16px 20px", 
                      border: "3px solid var(--color-delft-blue)", 
                      borderRadius: "var(--radius-md)", 
                      backgroundColor: "var(--color-white)",
                      boxShadow: "4px 4px 0 var(--color-delft-blue)",
                      position: "relative"
                    }}
                  >
                    {/* Rank Badge */}
                    <div 
                      style={{ 
                        width: "44px", 
                        height: "44px", 
                        borderRadius: "50%", 
                        backgroundColor: "var(--color-beige)", 
                        border: "2px solid var(--color-delft-blue)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-delft-blue)",
                        fontWeight: "800",
                        fontSize: "1.1rem",
                        flexShrink: 0
                      }}
                    >
                      2
                    </div>
                    
                    {/* Info Kelompok */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--color-fern-green)", textTransform: "uppercase" }}>
                        🥈 {secondPlace.booth_number} &bull; {secondPlace.category}
                      </span>
                      <h3 style={{ fontSize: "1rem", fontFamily: "var(--font-heading)", color: "var(--color-delft-blue)", marginTop: "2px", fontWeight: "700" }}>
                        {secondPlace.name}
                      </h3>
                    </div>

                    {/* Vote Count */}
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--color-fern-green)" }}>
                        {secondPlace.votes}
                      </span>
                      <span style={{ fontSize: "0.7rem", display: "block", color: "rgba(29, 42, 98, 0.6)", textTransform: "uppercase", fontWeight: "700", marginTop: "-2px" }}>
                        Suara
                      </span>
                    </div>
                  </div>
                )}

                {/* Card Juara 3 */}
                {thirdPlace && (
                  <div 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "16px", 
                      padding: "16px 20px", 
                      border: "3px solid var(--color-delft-blue)", 
                      borderRadius: "var(--radius-md)", 
                      backgroundColor: "var(--color-white)",
                      boxShadow: "4px 4px 0 var(--color-delft-blue)",
                      position: "relative"
                    }}
                  >
                    {/* Rank Badge */}
                    <div 
                      style={{ 
                        width: "44px", 
                        height: "44px", 
                        borderRadius: "50%", 
                        backgroundColor: "var(--color-beige)", 
                        border: "2px solid var(--color-delft-blue)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-delft-blue)",
                        fontWeight: "800",
                        fontSize: "1.1rem",
                        flexShrink: 0
                      }}
                    >
                      3
                    </div>
                    
                    {/* Info Kelompok */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--color-fern-green)", textTransform: "uppercase" }}>
                        🥉 {thirdPlace.booth_number} &bull; {thirdPlace.category}
                      </span>
                      <h3 style={{ fontSize: "1rem", fontFamily: "var(--font-heading)", color: "var(--color-delft-blue)", marginTop: "2px", fontWeight: "700" }}>
                        {thirdPlace.name}
                      </h3>
                    </div>

                    {/* Vote Count */}
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--color-fern-green)" }}>
                        {thirdPlace.votes}
                      </span>
                      <span style={{ fontSize: "0.7rem", display: "block", color: "rgba(29, 42, 98, 0.6)", textTransform: "uppercase", fontWeight: "700", marginTop: "-2px" }}>
                        Suara
                      </span>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {/* PEMENANG PER KATEGORI (Perolehan Terbanyak) */}
          {Object.keys(categoryWinners).length > 0 && (
            <section style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
              <h3 style={{ 
                fontSize: "1.1rem", 
                fontFamily: "var(--font-heading)", 
                textTransform: "uppercase", 
                letterSpacing: "0.05em", 
                borderBottom: "2px solid var(--color-delft-blue)", 
                paddingBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--color-delft-blue)"
              }}>
                <Trophy size={18} style={{ color: "var(--color-fern-green)" }} />
                Perolehan Terbanyak Per Kategori
              </h3>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
                gap: "20px" 
              }}>
                {Object.entries(categoryWinners).map(([category, group]) => (
                  <div 
                    key={category}
                    style={{
                      border: "2px solid var(--color-delft-blue)",
                      borderRadius: "var(--radius-md)",
                      padding: "20px",
                      backgroundColor: "white",
                      boxShadow: "4px 4px 0px var(--color-delft-blue)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    {/* Badge Kategori */}
                    <div style={{ 
                      position: "absolute", 
                      top: 0, 
                      right: 0, 
                      backgroundColor: "var(--color-pistachio)", 
                      color: "var(--color-delft-blue)",
                      borderLeft: "2px solid var(--color-delft-blue)",
                      borderBottom: "2px solid var(--color-delft-blue)",
                      padding: "4px 12px",
                      fontSize: "0.7rem",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      borderRadius: "0 0 0 var(--radius-sm)"
                    }}>
                      {category}
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <span style={{ 
                        fontSize: "0.75rem", 
                        fontWeight: "700", 
                        color: "var(--color-fern-green)",
                        textTransform: "uppercase"
                      }}>
                        {group.booth_number}
                      </span>
                      <h4 style={{ 
                        fontSize: "1.05rem", 
                        fontFamily: "var(--font-heading)", 
                        color: "var(--color-delft-blue)",
                        marginTop: "4px",
                        marginBottom: "12px",
                        lineHeight: "1.2"
                      }}>
                        {group.name}
                      </h4>
                    </div>

                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      borderTop: "1px dashed rgba(29, 42, 98, 0.2)",
                      paddingTop: "12px"
                    }}>
                      <span style={{ 
                        fontSize: "0.75rem", 
                        fontWeight: "700", 
                        color: "rgba(29, 42, 98, 0.6)",
                        textTransform: "uppercase" 
                      }}>
                        Total Perolehan
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                        <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--color-fern-green)" }}>
                          {group.votes}
                        </span>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-delft-blue)", textTransform: "uppercase" }}>
                          Suara
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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



    </div>
  );
}
