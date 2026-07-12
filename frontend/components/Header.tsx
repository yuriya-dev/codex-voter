"use client";

import Link from "next/link";
import { useVoter } from "@/components/VoterContext";
import { Heart, Trophy, KeyRound, Vote } from "lucide-react";

export default function Header() {
  const { shortlist, setIsDrawerOpen, visitor } = useVoter();

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
