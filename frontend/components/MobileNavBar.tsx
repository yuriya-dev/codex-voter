"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useVoter } from "@/components/VoterContext";
import { Compass, Heart, QrCode, ClipboardCheck, Trophy, FolderCog, LayoutDashboard } from "lucide-react";

export default function MobileNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { shortlist, setIsDrawerOpen, setQrScannerOpen } = useVoter();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>("groups");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAdminToken(localStorage.getItem("adminToken"));
    }
  }, [pathname]);

  useEffect(() => {
    if (tabParam === "groups" || tabParam === "qr" || tabParam === "voting") {
      setActiveTab(tabParam);
    } else {
      if (pathname === "/admin") {
        setActiveTab("groups");
      }
    }
  }, [pathname, tabParam]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isAdminPath = pathname.startsWith("/admin") || pathname === "/dashboard";

  // Jika belum dimuat di client, kembalikan null untuk mencocokkan render server
  if (!mounted) return null;

  // Jika berada di halaman admin
  if (isAdminPath) {
    // Jika admin belum login (token kosong), sembunyikan navbar agar tidak merusak tampilan login
    if (!adminToken) return null;

    // Jika admin sudah login, tampilkan navbar khusus admin (Kelompok, QR Code, Voting, Dashboard)
    return (
      <div className="mobile-nav-bar" style={{ borderTop: "2px solid var(--color-delft-blue)", background: "var(--color-white)" }}>
        <button 
          className={`mobile-nav-item ${pathname === "/admin" && activeTab === "groups" ? "active" : ""}`}
          onClick={() => handleNavigation("/admin?tab=groups")}
        >
          <FolderCog size={20} />
          <span>Kelompok</span>
        </button>

        <button 
          className={`mobile-nav-item ${pathname === "/admin" && activeTab === "qr" ? "active" : ""}`}
          onClick={() => handleNavigation("/admin?tab=qr")}
        >
          <QrCode size={20} />
          <span>QR Code</span>
        </button>

        <button 
          className={`mobile-nav-item ${pathname === "/admin" && activeTab === "voting" ? "active" : ""}`}
          onClick={() => handleNavigation("/admin?tab=voting")}
        >
          <ClipboardCheck size={20} />
          <span>Voting</span>
        </button>

        <button 
          className={`mobile-nav-item ${pathname === "/dashboard" ? "active" : ""}`}
          onClick={() => handleNavigation("/dashboard")}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>
      </div>
    );
  }

  // Tampilan navbar reguler untuk pemilih/pengunjung
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
