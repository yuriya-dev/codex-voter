"use client";

import { useEffect, useState } from "react";
import { useVoter } from "@/components/VoterContext";
import Header from "@/components/Header";
import { BarChart3, Download, RefreshCw, AlertTriangle, ShieldCheck, Clock } from "lucide-react";

interface AuditLog {
  id: string;
  time: string;
  action: string;
  detail: string;
  status: "success" | "warning" | "error";
}

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "a1",
    time: "22:35:12",
    action: "OTP Request",
    detail: "Menerbitkan kode verifikasi untuk identitas NIM 2110xxxxxx",
    status: "success"
  },
  {
    id: "a2",
    time: "22:35:58",
    action: "Vote Submitted",
    detail: "ID hash 4c2d3e berhasil melakukan vote Booth A01 (mahasiswa)",
    status: "success"
  },
  {
    id: "a3",
    time: "22:36:02",
    action: "Rate Limit Triggered",
    detail: "Blokir request OTP ganda dari IP 192.168.1.100 (percobaan ke-4)",
    status: "warning"
  },
  {
    id: "a4",
    time: "22:37:10",
    action: "Duplicate Vote Blocked",
    detail: "RLS UNIQUE(visitor_id) menolak data vote ganda untuk hash 4c2d3e",
    status: "error"
  },
  {
    id: "a5",
    time: "22:38:00",
    action: "Shortlist Synced",
    detail: "Sinkronisasi 3 kelompok favorit dari local storage pengunjung baru",
    status: "success"
  }
];

export default function DashboardPage() {
  const { groupsList } = useVoter();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [totalVoteCount, setTotalVoteCount] = useState(0);

  // Calculate stats
  useEffect(() => {
    const total = groupsList.reduce((sum, g) => sum + g.stats.votes, 0);
    setTotalVoteCount(total);
  }, [groupsList]);

  // Fetch real audit logs periodically from backend
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/dashboard/logs");
        if (res.ok) {
          const logs = await res.json();
          setAuditLogs(logs);
        }
      } catch (err) {
        console.error("Gagal memuat audit logs dari backend:", err);
      }
    };

    fetchLogs();
    const interval = setInterval(() => {
      fetchLogs();
    }, 4000); // refresh logs every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ["Booth", "Nama Proyek", "Kategori", "Jumlah Vote"];
    const rows = groupsList.map((g) => [g.booth_number, g.name, g.category, g.stats.votes]);
    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_voting_capstone_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Header />
      
      <main className="container" style={{ paddingBottom: "120px" }}>
        
        {/* Header Asimetris */}
        <div className="asymmetric-header">
          <span className="badge">Panitia Only</span>
          <span className="bg-text-shadow">ADMIN BOARD</span>
          <h1 style={{ color: "var(--color-delft-blue)" }}>Live Dashboard & Monitoring</h1>
        </div>

        {/* Toolbar Aksi */}
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "flex-end", 
            gap: "12px",
            marginBottom: "24px"
          }}
        >
          <button onClick={handleExportCSV} className="btn btn-secondary" style={{ gap: "8px", fontSize: "0.85rem" }}>
            <Download size={16} />
            Ekspor Data (CSV)
          </button>
        </div>

        {/* Baris Stats Ringkasan */}
        <section 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
            gap: "20px",
            marginBottom: "40px"
          }}
        >
          {/* Stat 1 */}
          <div className="dashboard-stat-card">
            <div>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "rgba(29, 42, 98, 0.6)" }}>
                Total Suara Masuk
              </span>
              <div className="value">{totalVoteCount}</div>
            </div>
            <p style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "8px" }}>Suara terverifikasi sistem RLS</p>
          </div>

          {/* Stat 2 */}
          <div className="dashboard-stat-card" style={{ borderColor: "var(--color-fern-green)" }}>
            <div>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "rgba(29, 42, 98, 0.6)" }}>
                Partisipasi Booth
              </span>
              <div className="value" style={{ color: "var(--color-delft-blue)" }}>100%</div>
            </div>
            <p style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "8px" }}>5 dari 5 booth mendapatkan suara</p>
          </div>

          {/* Stat 3 */}
          <div className="dashboard-stat-card">
            <div>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "rgba(29, 42, 98, 0.6)" }}>
                Kecepatan Voting
              </span>
              <div className="value" style={{ color: "var(--color-carolina-blue)" }}>~4.2</div>
            </div>
            <p style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "8px" }}>Rata-rata suara per menit</p>
          </div>
        </section>

        {/* Grid Visual & Audit Logs */}
        <div className="split-layout">
          
          {/* Kolom Kiri: Bar Chart Visual */}
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "1.15rem", fontFamily: "var(--font-heading)" }}>
                Perolehan Suara Real-time
              </h3>
              <BarChart3 size={18} style={{ color: "var(--color-fern-green)" }} />
            </div>

            {/* Custom CSS Bar Chart (Earthy Muted Colors) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {groupsList
                .sort((a, b) => b.stats.votes - a.stats.votes)
                .map((group) => {
                  const percentage = totalVoteCount > 0 ? (group.stats.votes / totalVoteCount) * 100 : 0;
                  return (
                    <div key={group.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: "600" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>
                          {group.booth_number} &bull; {group.name}
                        </span>
                        <span>{group.stats.votes} suara</span>
                      </div>
                      
                      {/* Bar Container */}
                      <div 
                        style={{ 
                          width: "100%", 
                          height: "20px", 
                          border: "1px solid var(--color-delft-blue)", 
                          backgroundColor: "var(--color-beige)", 
                          borderRadius: "var(--radius-sm)",
                          overflow: "hidden"
                        }}
                      >
                        <div 
                          style={{ 
                            width: `${Math.max(percentage, 1)}%`, 
                            height: "100%", 
                            backgroundColor: "var(--color-fern-green)",
                            transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Kolom Kanan: Live Audit Logs */}
          <div className="card" style={{ padding: "28px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.15rem", fontFamily: "var(--font-heading)" }}>
                Audit Trails & Logs
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--color-fern-green)", fontWeight: 700 }}>
                <RefreshCw size={12} className="spin-animation" style={{ animation: "spin 4s linear infinite" }} />
                LIVE UPDATING
              </div>
            </div>

            {/* List Logs */}
            <div 
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "10px", 
                maxHeight: "350px", 
                overflowY: "auto",
                paddingRight: "4px"
              }}
            >
              {auditLogs.map((log) => (
                <div 
                  key={log.id} 
                  style={{ 
                    display: "flex", 
                    gap: "12px", 
                    padding: "10px 12px", 
                    border: "1px solid var(--color-delft-blue)", 
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--color-white)",
                    fontSize: "0.8rem"
                  }}
                >
                  {/* Status Icon */}
                  <div style={{ alignSelf: "flex-start", marginTop: "2px" }}>
                    {log.status === "success" && <ShieldCheck size={14} style={{ color: "#22c55e" }} />}
                    {log.status === "warning" && <Clock size={14} style={{ color: "#eab308" }} />}
                    {log.status === "error" && <AlertTriangle size={14} style={{ color: "#ef4444" }} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <strong style={{ textTransform: "uppercase", fontSize: "0.7rem", color: "var(--color-delft-blue)" }}>
                        {log.action}
                      </strong>
                      <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>{log.time}</span>
                    </div>
                    <p style={{ fontSize: "0.75rem", opacity: 0.8, color: "var(--color-delft-blue)" }}>
                      {log.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
