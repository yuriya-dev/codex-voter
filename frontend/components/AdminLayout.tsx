"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FolderCog, QrCode, ClipboardCheck, LogOut, Vote, Globe } from "lucide-react";
import Header from "@/components/Header";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("adminToken");
    setAdminToken(token);
  }, []);

  // Sync token changes (e.g. login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setAdminToken(localStorage.getItem("adminToken"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // We check the token periodically to handle standard page changes
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token !== adminToken) {
      setAdminToken(token);
    }
  }, [pathname, adminToken]);

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
    router.push("/admin");
    // Trigger storage event for other components
    window.dispatchEvent(new Event("storage"));
  };

  if (!mounted) {
    return (
      <>
        <Header />
        <main className="container" style={{ paddingBottom: "120px" }}>
          {children}
        </main>
      </>
    );
  }

  // If admin is not logged in, just show the login page layout (without sidebar)
  if (!adminToken) {
    return (
      <>
        <Header />
        <main className="container" style={{ paddingBottom: "120px" }}>
          {children}
        </main>
      </>
    );
  }

  // Determine active item in sidebar
  const isDashboardActive = pathname === "/dashboard";
  const isGroupsActive = pathname === "/admin" && (tabParam === "groups" || !tabParam);
  const isQrActive = pathname === "/admin" && tabParam === "qr";
  const isVotingActive = pathname === "/admin" && tabParam === "voting";

  return (
    <div className="admin-layout-wrapper">
      {/* Sidebar - Desktop Only (Hidden on Mobile via CSS) */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Link href="/admin" className="logo">
            <Vote size={22} className="leaf-icon" style={{ transform: "rotate(-15deg)", color: "var(--color-fern-green)" }} />
            CODEX<span>Admin</span>
          </Link>
        </div>

        <nav className="admin-sidebar-menu">
          <Link 
            href="/dashboard"
            className={`admin-sidebar-item ${isDashboardActive ? "active" : ""}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link 
            href="/admin?tab=groups"
            className={`admin-sidebar-item ${isGroupsActive ? "active" : ""}`}
          >
            <FolderCog size={18} />
            <span>Kelompok</span>
          </Link>

          <Link 
            href="/admin?tab=qr"
            className={`admin-sidebar-item ${isQrActive ? "active" : ""}`}
          >
            <QrCode size={18} />
            <span>QR Code</span>
          </Link>

          <Link 
            href="/admin?tab=voting"
            className={`admin-sidebar-item ${isVotingActive ? "active" : ""}`}
          >
            <ClipboardCheck size={18} />
            <span>Voting</span>
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <Link 
            href="/"
            className="admin-sidebar-item"
            style={{ marginBottom: "12px", fontSize: "0.85rem" }}
          >
            <Globe size={16} />
            <span>Halaman Publik</span>
          </Link>

          <button 
            onClick={handleAdminLogout}
            className="admin-sidebar-logout-btn"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content-area">
        {/* Top Header - Mobile Only (Hidden on Desktop via CSS) */}
        <Header />

        <main className="container" style={{ paddingBottom: "120px", marginTop: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
