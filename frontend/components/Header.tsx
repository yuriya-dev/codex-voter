"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useVoter } from "@/components/VoterContext";
import { Heart, Trophy, KeyRound, Vote } from "lucide-react";

export default function Header() {
  const { shortlist, setIsDrawerOpen, visitor } = useVoter();
  const pathname = usePathname();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const isAdminPath = pathname.startsWith("/admin") || pathname === "/dashboard";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAdminToken(localStorage.getItem("adminToken"));
    }
  }, [pathname]);

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin";
  };

  // Menjamin render pertama client cocok 100% dengan render HTML dari server
  if (!mounted) {
    if (isAdminPath) {
      return (
        <header className="site-header">
          <div className="nav-container">
            <Link href="/" className="logo">
              <Vote size={22} className="leaf-icon" style={{ transform: "rotate(-15deg)", color: "var(--color-fern-green)" }} />
              CODEX<span>Admin</span>
            </Link>
            <nav className="nav-links">
              <Link href="/" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                Kembali ke Halaman Publik
              </Link>
            </nav>
          </div>
        </header>
      );
    }

    return (
      <header className="site-header">
        <div className="nav-container">
          <Link href="/" className="logo">
            <Vote size={22} className="leaf-icon" style={{ transform: "rotate(-15deg)", color: "var(--color-fern-green)" }} />
            CODEX<span>Voter</span>
          </Link>

          <nav className="nav-links">
            <Link href="/kelompok">Daftar Kelompok</Link>
            <Link href="/verifikasi" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <KeyRound size={16} />
              Verifikasi
            </Link>
            <Link href="/dashboard-publik" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Trophy size={16} />
              Leaderboard
            </Link>
            <button 
              className="btn btn-secondary" 
              onClick={() => setIsDrawerOpen(true)}
              style={{ 
                padding: "8px 16px", 
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Heart size={16} fill="none" />
              Shortlist
            </button>
          </nav>
        </div>
      </header>
    );
  }

  // 1. Jika di rute Admin dan Admin SUDAH LOGIN
  if (isAdminPath && adminToken) {
    return (
      <header className="site-header">
        <div className="nav-container">
          <Link href="/admin" className="logo">
            <Vote size={22} className="leaf-icon" style={{ transform: "rotate(-15deg)", color: "var(--color-fern-green)" }} />
            CODEX<span>Admin</span>
          </Link>

          <nav className="nav-links" style={{ alignItems: "center", gap: "24px" }}>
            <Link 
              href="/dashboard" 
              style={{
                fontWeight: 700,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: pathname === "/dashboard" ? "var(--color-fern-green)" : "var(--color-delft-blue)",
                borderBottom: pathname === "/dashboard" ? "2px solid var(--color-fern-green)" : "2px solid transparent",
                padding: "4px 0",
                transition: "all 0.2s ease"
              }}
            >
              Dashboard Panitia
            </Link>

            <Link 
              href="/admin" 
              style={{
                fontWeight: 700,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: pathname.startsWith("/admin") ? "var(--color-fern-green)" : "var(--color-delft-blue)",
                borderBottom: pathname.startsWith("/admin") ? "2px solid var(--color-fern-green)" : "2px solid transparent",
                padding: "4px 0",
                transition: "all 0.2s ease"
              }}
            >
              Manajemen
            </Link>

            <button
              onClick={handleAdminLogout}
              className="btn"
              style={{
                background: "#ff6b6b",
                color: "white",
                border: "2px solid var(--color-delft-blue)",
                boxShadow: "3px 3px 0px var(--color-delft-blue)",
                height: "38px",
                cursor: "pointer",
                fontWeight: "700",
                padding: "0 16px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderRadius: "var(--radius-sm)"
              }}
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
    );
  }

  // 2. Jika di rute Admin dan Admin BELUM LOGIN
  if (isAdminPath && !adminToken) {
    return (
      <header className="site-header">
        <div className="nav-container">
          <Link href="/" className="logo">
            <Vote size={22} className="leaf-icon" style={{ transform: "rotate(-15deg)", color: "var(--color-fern-green)" }} />
            CODEX<span>Admin</span>
          </Link>
          <nav className="nav-links">
            <Link href="/" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              Kembali ke Halaman Publik
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  // 3. Tampilan Header reguler untuk pengunjung/publik
  return (
    <header className="site-header">
      <div className="nav-container">
        <Link href="/" className="logo">
          <Vote size={22} className="leaf-icon" style={{ transform: "rotate(-15deg)", color: "var(--color-fern-green)" }} />
          CODEX<span>Voter</span>
        </Link>

        <nav className="nav-links">
          <Link href="/kelompok">Daftar Kelompok</Link>
          
          {visitor ? (
            <Link href="/vote" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="dot" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e" }}></span>
              Halaman Vote
            </Link>
          ) : (
            <Link href="/verifikasi" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <KeyRound size={16} />
              Verifikasi
            </Link>
          )}

          <Link href="/dashboard-publik" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Trophy size={16} />
            Leaderboard
          </Link>

          <button 
            className="btn btn-secondary" 
            onClick={() => setIsDrawerOpen(true)}
            style={{ 
              padding: "8px 16px", 
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Heart size={16} fill={shortlist.length > 0 ? "var(--color-fern-green)" : "none"} />
            Shortlist
            {shortlist.length > 0 && (
              <span 
                style={{ 
                  backgroundColor: "var(--color-delft-blue)", 
                  color: "white", 
                  fontSize: "0.75rem", 
                  padding: "1px 6px", 
                  borderRadius: "var(--radius-full)" 
                }}
              >
                {shortlist.length}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
