"use client";

import { useEffect, useState, Suspense } from "react";
import { useVoter } from "@/components/VoterContext";
import Header from "@/components/Header";
import AdminLayout from "@/components/AdminLayout";
import AdminLoginForm from "@/components/AdminLoginForm";
import Link from "next/link";
import { BarChart3, Download, RefreshCw, AlertTriangle, ShieldCheck, Clock, Settings, Trophy } from "lucide-react";
import { getBackendUrl } from "@/lib/config";

const BACKEND_URL = getBackendUrl();

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

function DashboardPageContent() {
  const { groupsList } = useVoter();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [detailedVotes, setDetailedVotes] = useState<any[]>([]);
  const [isExportingDetail, setIsExportingDetail] = useState(false);
  const [totalVoteCount, setTotalVoteCount] = useState(0);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Dynamic statistics states
  const [participationRate, setParticipationRate] = useState(0);
  const [votedBooths, setVotedBooths] = useState(0);
  const [totalBooths, setTotalBooths] = useState(0);
  const [votingSpeed, setVotingSpeed] = useState(0);

  // Cek token saat halaman dibuka
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setAdminToken(token);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
  };

  // Fetch real-time stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/dashboard/stats`);
        if (res.ok) {
          const data = await res.json();
          setTotalVoteCount(data.totalVotes);
          if (data.participation) {
            setParticipationRate(data.participation.rate);
            setVotedBooths(data.participation.votedBooths);
            setTotalBooths(data.participation.totalBooths);
          }
          setVotingSpeed(data.votingSpeed || 0);
        }
      } catch (err) {
        console.error("Gagal memuat statistik dashboard:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 4000); // refresh every 4 seconds
    return () => clearInterval(interval);
  }, []);

  // Calculate local fallback stats when backend isn't loaded yet
  useEffect(() => {
    if (totalBooths === 0 && groupsList.length > 0) {
      const total = groupsList.reduce((sum, g) => sum + g.stats.votes, 0);
      setTotalVoteCount(total);
      
      const count = groupsList.length;
      const voted = groupsList.filter(g => g.stats.votes > 0).length;
      setTotalBooths(count);
      setVotedBooths(voted);
      setParticipationRate(count > 0 ? Math.round((voted / count) * 100) : 0);
    }
  }, [groupsList, totalBooths]);

  // Fetch real audit logs and detailed votes periodically from backend
  useEffect(() => {
    if (!adminToken) return;

    const fetchLogsAndVotes = async () => {
      try {
        const headers = { "Authorization": `Bearer ${adminToken}` };
        
        // Fetch logs
        const logsPromise = fetch(`${BACKEND_URL}/api/dashboard/logs`, { headers });
        // Fetch detailed votes
        const votesPromise = fetch(`${BACKEND_URL}/api/dashboard/votes-detail`, { headers });

        const [logsRes, votesRes] = await Promise.all([logsPromise, votesPromise]);

        if (logsRes.status === 401 || votesRes.status === 401) {
          handleLogout();
          return;
        }

        if (logsRes.ok) {
          const logs = await logsRes.json();
          setAuditLogs(logs);
        }

        if (votesRes.ok) {
          const votes = await votesRes.json();
          setDetailedVotes(votes);
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard dari backend:", err);
      }
    };

    fetchLogsAndVotes();
    const interval = setInterval(() => {
      fetchLogsAndVotes();
    }, 4000); // refresh logs and detailed votes every 4 seconds

    return () => clearInterval(interval);
  }, [adminToken]);

  const handleExportCSV = () => {
    // Generate CSV content using Blob for safety & proper UTF-8 handling
    const headers = ["Booth", "Nama Proyek", "Kategori", "Jumlah Vote"];
    const rows = groupsList.map((g) => [g.booth_number, g.name, g.category, g.stats.votes]);
    
    const csvString = [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_voting_capstone_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportDetailCSV = async () => {
    if (!adminToken) return;
    try {
      setIsExportingDetail(true);
      const res = await fetch(`${BACKEND_URL}/api/dashboard/votes-detail`, {
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          alert("Sesi admin berakhir. Silakan login kembali.");
          return;
        }
        throw new Error("Gagal mengambil data detail vote");
      }
      const data = await res.json();
      
      const headers = [
        "Waktu Vote",
        "Kode Vote",
        "ID Voter / NIM",
        "Nama Voter",
        "Email Voter",
        "Kategori Voter",
        "ID Kelompok",
        "Booth Pilihan",
        "Nama Kelompok",
        "Kategori Proyek",
        "IP Address"
      ];
      
      const rows = data.map((v: any) => [
        v.votedAt ? new Date(v.votedAt).toLocaleString("id-ID") : "N/A",
        v.voteCode || "N/A",
        v.voter?.identifier || "N/A",
        v.voter?.name || "N/A",
        v.voter?.email || "N/A",
        v.voter?.category || "N/A",
        v.group?.id || "N/A",
        v.group?.boothNumber || "N/A",
        v.group?.name || "N/A",
        v.group?.category || "N/A",
        v.ip || "N/A"
      ]);
      
      const csvString = [headers.join(","), ...rows.map((e: any) => e.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `laporan_detail_vote_transparan_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh laporan detail vote.");
    } finally {
      setIsExportingDetail(false);
    }
  };

  // Hitung pemenang per kategori (perolehan terbanyak)
  const categoryWinners: { [key: string]: typeof groupsList[0] } = {};
  groupsList.forEach((group) => {
    const cat = group.category || "Umum";
    if (!categoryWinners[cat] || group.stats.votes > categoryWinners[cat].stats.votes) {
      categoryWinners[cat] = group;
    }
  });

  return (
    <AdminLayout>
      {!adminToken ? (
          <AdminLoginForm onLoginSuccess={(token) => setAdminToken(token)} />
        ) : (
          <>
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
                marginBottom: "24px",
                flexWrap: "wrap"
              }}
            >
              <button 
                onClick={handleExportCSV} 
                className="btn btn-secondary" 
                style={{ 
                  gap: "8px", 
                  fontSize: "0.85rem",
                  borderWidth: "2px",
                  boxShadow: "3px 3px 0px var(--color-delft-blue)"
                }}
              >
                <Download size={16} />
                Ekspor Ringkasan (CSV)
              </button>

              <button 
                onClick={handleExportDetailCSV} 
                disabled={isExportingDetail}
                className="btn btn-primary" 
                style={{ 
                  gap: "8px", 
                  fontSize: "0.85rem",
                  borderWidth: "2px",
                  boxShadow: "3px 3px 0px var(--color-delft-blue)",
                  backgroundColor: "var(--color-fern-green)",
                  color: "white"
                }}
              >
                <Download size={16} />
                {isExportingDetail ? "Mengunduh..." : "Ekspor Detail Vote - Transparan (CSV)"}
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
              <div className="value" style={{ color: "var(--color-delft-blue)" }}>{participationRate}%</div>
            </div>
            <p style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "8px" }}>{votedBooths} dari {totalBooths} booth mendapatkan suara</p>
          </div>

          {/* Stat 3 */}
          <div className="dashboard-stat-card">
            <div>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "rgba(29, 42, 98, 0.6)" }}>
                Kecepatan Voting
              </span>
              <div className="value" style={{ color: "var(--color-carolina-blue)" }}>~{votingSpeed}</div>
            </div>
            <p style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "8px" }}>Rata-rata suara per menit</p>
          </div>
        </section>

        {/* Perolehan Terbanyak Per Kategori */}
        {Object.keys(categoryWinners).length > 0 && (
          <section style={{ marginBottom: "40px" }}>
            <h3 style={{ 
              fontSize: "1.1rem", 
              fontFamily: "var(--font-heading)", 
              textTransform: "uppercase", 
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--color-delft-blue)"
            }}>
              <Trophy size={20} style={{ color: "var(--color-fern-green)" }} />
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
                  className="card"
                  style={{
                    padding: "20px",
                    backgroundColor: "white",
                    border: "2px solid var(--color-delft-blue)",
                    boxShadow: "3px 3px 0px var(--color-delft-blue)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
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
                    textTransform: "uppercase"
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
                      fontSize: "1rem", 
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
                      Perolehan
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--color-fern-green)" }}>
                        {group.stats.votes}
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

        {/* Detail Suara Masuk (Live Transparency) */}
        <section className="card" style={{ padding: "28px", marginTop: "40px", backgroundColor: "white", border: "2px solid var(--color-delft-blue)", boxShadow: "var(--shadow-organic)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontFamily: "var(--font-heading)", marginBottom: "4px", color: "var(--color-delft-blue)" }}>
                Detail Suara Masuk (Live Transparency)
              </h3>
              <p style={{ fontSize: "0.8rem", opacity: 0.7, color: "var(--color-delft-blue)" }}>
                Daftar lengkap suara yang masuk secara real-time beserta nama dan kategori pemilih.
              </p>
            </div>
            
            <button 
              onClick={handleExportDetailCSV} 
              disabled={isExportingDetail}
              className="btn btn-primary" 
              style={{ 
                gap: "8px", 
                fontSize: "0.85rem",
                borderWidth: "2px",
                boxShadow: "3px 3px 0px var(--color-delft-blue)",
                padding: "8px 16px",
                backgroundColor: "var(--color-fern-green)",
                color: "white"
              }}
            >
              <Download size={14} />
              {isExportingDetail ? "Mengunduh..." : "Ekspor Detail (CSV)"}
            </button>
          </div>

          <div style={{ overflowX: "auto", border: "2px solid var(--color-delft-blue)", borderRadius: "var(--radius-sm)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--color-beige)", borderBottom: "2px solid var(--color-delft-blue)" }}>
                  <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--color-delft-blue)" }}>Waktu</th>
                  <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--color-delft-blue)" }}>Kode Vote</th>
                  <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--color-delft-blue)" }}>Nama Pemilih</th>
                  <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--color-delft-blue)" }}>Kategori</th>
                  <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--color-delft-blue)" }}>Pilihan Kelompok (Booth)</th>
                  <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--color-delft-blue)" }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {detailedVotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "24px", textAlign: "center", opacity: 0.6 }}>
                      Belum ada suara masuk untuk sesi ini.
                    </td>
                  </tr>
                ) : (
                  detailedVotes.slice(0, 10).map((v) => (
                    <tr 
                      key={v.id} 
                      style={{ 
                        borderBottom: "1px solid rgba(29, 42, 98, 0.15)",
                        backgroundColor: "white",
                        transition: "background-color 0.2s"
                      }}
                    >
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        {v.votedAt ? new Date(v.votedAt).toLocaleTimeString("id-ID") : "N/A"}
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: "700", color: "var(--color-fern-green)" }}>
                        {v.voteCode}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: "600" }}>{v.voter.name}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          backgroundColor: v.voter.category === "mahasiswa" ? "rgba(34, 197, 94, 0.1)" : v.voter.category === "dosen" ? "rgba(59, 130, 246, 0.1)" : "rgba(107, 114, 128, 0.1)",
                          color: v.voter.category === "mahasiswa" ? "#16a34a" : v.voter.category === "dosen" ? "#2563eb" : "#4b5563",
                          border: `1px solid ${v.voter.category === "mahasiswa" ? "rgba(34, 197, 94, 0.3)" : v.voter.category === "dosen" ? "rgba(59, 130, 246, 0.3)" : "rgba(107, 114, 128, 0.3)"}`
                        }}>
                          {v.voter.category}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <strong style={{ color: "var(--color-delft-blue)" }}>{v.group.boothNumber}</strong> - {v.group.name}
                      </td>
                      <td style={{ padding: "12px 16px", opacity: 0.7, fontFamily: "monospace" }}>{v.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {detailedVotes.length > 10 && (
            <div style={{ marginTop: "12px", textAlign: "center", fontSize: "0.8rem", opacity: 0.7, color: "var(--color-delft-blue)" }}>
              Menampilkan 10 dari {detailedVotes.length} total suara masuk. Silakan ekspor ke CSV untuk melihat data lengkap.
            </div>
          )}
        </section>

      </>
    )}
    </AdminLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "40px", textAlign: "center" }}>Memuat dashboard...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}
