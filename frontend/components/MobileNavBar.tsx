"use client";

import { usePathname, useRouter } from "next/navigation";
import { useVoter } from "@/components/VoterContext";
import { Compass, Heart, QrCode, ClipboardCheck, Trophy } from "lucide-react";

export default function MobileNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { shortlist, setIsDrawerOpen, setQrScannerOpen } = useVoter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="mobile-nav-bar">
      <button 
        className={`mobile-nav-item ${pathname === "/kelompok" ? "active" : ""}`}
        onClick={() => handleNavigation("/kelompok")}
      >
        <Compass size={20} />
        <span>Jelajah</span>
      </button>

      <button 
        className="mobile-nav-item"
        onClick={() => setIsDrawerOpen(true)}
      >
        <Heart size={20} fill={shortlist.length > 0 ? "var(--color-fern-green)" : "none"} />
        <span>Favorit</span>
        {shortlist.length > 0 && (
          <span className="badge-counter">{shortlist.length}</span>
        )}
      </button>

      {/* Tombol QR Scanner Menonjol di Tengah */}
      <button 
        className="mobile-nav-item"
        onClick={() => setQrScannerOpen(true)}
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
          border: "2px solid var(--color-delft-blue)"
        }}
      >
        <QrCode size={24} style={{ color: "white" }} />
      </button>

      <button 
        className={`mobile-nav-item ${pathname === "/vote" || pathname === "/verifikasi" ? "active" : ""}`}
        onClick={() => handleNavigation("/vote")}
      >
        <ClipboardCheck size={20} />
        <span>Vote</span>
      </button>

      <button 
        className={`mobile-nav-item ${pathname === "/dashboard-publik" ? "active" : ""}`}
        onClick={() => handleNavigation("/dashboard-publik")}
      >
        <Trophy size={20} />
        <span>Leaderboard</span>
      </button>
    </div>
  );
}
