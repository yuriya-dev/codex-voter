"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useVoter } from "@/components/VoterContext";
import Link from "next/link";
import Header from "@/components/Header";
import AdminLoginForm from "@/components/AdminLoginForm";
import { Upload, Plus, Trash2, Edit, CheckCircle2, FileText, AlertCircle, Users, LayoutDashboard, QrCode, Printer, Download } from "lucide-react";
import { getBackendUrl, EXIT_UNLOCK_TOKEN } from "@/lib/config";
import { useSearchParams } from "next/navigation";

const BACKEND_URL = getBackendUrl();

function AdminManagementContent() {
  const { groupsList, refreshGroupsList } = useVoter();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"groups" | "qr" | "voting">("groups");
  const [origin, setOrigin] = useState("http://localhost:3030");
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (tabParam === "groups" || tabParam === "qr" || tabParam === "voting") {
      setActiveTab(tabParam as "groups" | "qr" | "voting");
    }
  }, [tabParam]);

  const getQrUrl = (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;

  const printSingleQR = (title: string, subtitle: string, url: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR - ${title}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
              color: #1d2a62;
              background-color: #ffffff;
            }
            .card {
              border: 3px solid #1d2a62;
              border-radius: 8px;
              padding: 40px;
              max-width: 400px;
              box-shadow: 6px 6px 0px 0px #1d2a62;
              background-color: #ffffff;
              display: inline-block;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 5px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            p {
              font-size: 14px;
              opacity: 0.8;
              margin-top: 0;
              margin-bottom: 25px;
            }
            img {
              width: 250px;
              height: 250px;
              border: 2px solid #1d2a62;
              padding: 10px;
              border-radius: 4px;
            }
            .footer-text {
              margin-top: 25px;
              font-size: 12px;
              font-weight: bold;
              opacity: 0.6;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${title}</h1>
            <p>${subtitle}</p>
            <img src="${getQrUrl(url)}" alt="QR Code" />
            <div class="footer-text">SCAN UNTUK MENGAKSES</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printAllGroupQRs = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    let qrCardsHtml = groupsList.map(group => {
      const groupUrl = `${origin}/kelompok/${group.slug}?from=qr`;
      return `
        <div class="card">
          <div class="booth-number">${group.booth_number}</div>
          <h2>${group.name}</h2>
          <p class="category">${group.category}</p>
          <img src="${getQrUrl(groupUrl)}" alt="QR Code" />
          <div class="footer-text">SCAN BOOTH UNTUK SHORTLIST</div>
        </div>
      `;
    }).join("");
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Semua QR Kelompok</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              background-color: #fff;
              color: #1d2a62;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 30px;
            }
            .card {
              border: 3px solid #1d2a62;
              border-radius: 8px;
              padding: 25px;
              text-align: center;
              background-color: #ffffff;
              box-shadow: 4px 4px 0px 0px #1d2a62;
              page-break-inside: avoid;
              position: relative;
            }
            .booth-number {
              background-color: #afd06e;
              color: #1d2a62;
              border: 2px solid #1d2a62;
              display: inline-block;
              padding: 4px 12px;
              font-weight: bold;
              font-size: 14px;
              border-radius: 4px;
              margin-bottom: 10px;
            }
            h2 {
              font-size: 16px;
              margin: 5px 0;
              text-transform: uppercase;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .category {
              font-size: 12px;
              opacity: 0.7;
              margin: 0 0 15px 0;
            }
            img {
              width: 180px;
              height: 180px;
              border: 2px solid #1d2a62;
              padding: 8px;
              border-radius: 4px;
            }
            .footer-text {
              margin-top: 15px;
              font-size: 11px;
              font-weight: bold;
              opacity: 0.6;
            }
            @media print {
              body {
                margin: 0;
              }
              .card {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 30px; text-transform: uppercase;">Daftar QR Code Kelompok Capstone</h1>
          <div class="grid">
            ${qrCardsHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Manual Form State
  const [name, setName] = useState("");
  const [boothNumber, setBoothNumber] = useState("");
  const [category, setCategory] = useState("IoT & Hardware");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [members, setMembers] = useState("");
  
  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [overwrite, setOverwrite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [maxVotes, setMaxVotes] = useState(3);
  const [leaderboardVisible, setLeaderboardVisible] = useState("false");
  const [votingStatus, setVotingStatus] = useState("not_started");
  const [votingEndTime, setVotingEndTime] = useState("");
  const [timerMinutes, setTimerMinutes] = useState(60);
  const [adminTimeLeft, setAdminTimeLeft] = useState<string>("");
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [newSessionName, setNewSessionName] = useState("");
  const [archiving, setArchiving] = useState(false);

  // Edit State
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const startEditGroup = (group: any) => {
    setEditingGroupId(group.id);
    setName(group.name);
    setBoothNumber(group.booth_number);
    setCategory(group.category);
    setDescription(group.description || "");
    setFullDescription(group.fullDescription || group.description || "");
    setMembers(group.members ? group.members.join("; ") : "");
  };

  const cancelEditGroup = () => {
    setEditingGroupId(null);
    setName("");
    setBoothNumber("");
    setCategory("IoT & Hardware");
    setDescription("");
    setFullDescription("");
    setMembers("");
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroupId || !name || !boothNumber || !category || !adminToken) return;

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/groups/${editingGroupId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name,
          booth_number: boothNumber,
          category,
          description,
          fullDescription: fullDescription || description,
          members
        })
      });

      if (response.status === 401) {
        handleLogout();
        setStatusMessage({ text: "Sesi admin kedaluwarsa atau tidak valid.", type: "error" });
        return;
      }

      if (response.ok) {
        setStatusMessage({ text: `Berhasil memperbarui kelompok: ${name}`, type: "success" });
        cancelEditGroup();
        refreshGroupsList();
      } else {
        const err = await response.json();
        setStatusMessage({ text: err.error || "Gagal memperbarui kelompok ke server.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Koneksi backend gagal.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Cek token saat halaman dibuka
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setAdminToken(token);
    }
  }, []);

  const handleArchiveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim() || !adminToken) return;

    if (!confirm("PENTING: Mengarsipkan sesi akan MENGHAPUS seluruh data pengunjung, IP, dan perolehan suara saat ini dari database untuk memulai sesi baru. Apakah Anda yakin?")) {
      return;
    }

    setArchiving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/settings/archive`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ sessionName: newSessionName })
      });

      if (res.status === 401) {
        handleLogout();
        setStatusMessage({ text: "Sesi admin kedaluwarsa atau tidak valid.", type: "error" });
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setStatusMessage({ text: `Sesi '${newSessionName}' berhasil diarsipkan dan database dibersihkan!`, type: "success" });
        setNewSessionName("");
        
        // Refresh groups list
        refreshGroupsList();
        
        // Refetch settings
        const settingsRes = await fetch(`${BACKEND_URL}/api/settings`);
        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          setMaxVotes(sData.max_votes || 3);
          setLeaderboardVisible(sData.leaderboard_visible || "false");
          setVotingStatus(sData.voting_status || "not_started");
          setVotingEndTime(sData.voting_end_time || "");
          try {
            const parsedHistory = JSON.parse(sData.session_history || "[]");
            setSessionHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
          } catch (e) {
            setSessionHistory([]);
          }
        }
      } else {
        const errData = await res.json();
        setStatusMessage({ text: errData.error || "Gagal mengarsipkan sesi.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Koneksi backend gagal saat mengarsipkan.", type: "error" });
    } finally {
      setArchiving(false);
    }
  };

  // Ambil data jika terautentikasi
  useEffect(() => {
    if (!adminToken) return;

    refreshGroupsList();
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          setMaxVotes(data.max_votes || 3);
          setLeaderboardVisible(data.leaderboard_visible || "false");
          setVotingStatus(data.voting_status || "not_started");
          setVotingEndTime(data.voting_end_time || "");
          try {
            const parsedHistory = JSON.parse(data.session_history || "[]");
            setSessionHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
          } catch (e) {
            setSessionHistory([]);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil pengaturan:", err);
      }
    };
    fetchSettings();
  }, [adminToken]);

  // Timer countdown untuk tampilan admin
  useEffect(() => {
    if (votingStatus !== "started" || !votingEndTime) {
      setAdminTimeLeft("");
      return;
    }

    const calculateTime = () => {
      const diff = +new Date(votingEndTime) - +new Date();
      if (diff <= 0) {
        setAdminTimeLeft("Waktu Habis");
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setAdminTimeLeft(`${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [votingStatus, votingEndTime]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
  };

  const handleSaveSettings = async (updates: {
    max_votes?: number;
    leaderboard_visible?: string;
    voting_status?: string;
    voting_end_time?: string;
  }) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/settings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify(updates)
      });

      if (res.status === 401) {
        handleLogout();
        setStatusMessage({ text: "Sesi admin kedaluwarsa atau tidak valid.", type: "error" });
        return;
      }

      if (res.ok) {
        setStatusMessage({ text: "Pengaturan berhasil diperbarui!", type: "success" });
        if (updates.max_votes !== undefined) setMaxVotes(updates.max_votes);
        if (updates.leaderboard_visible !== undefined) setLeaderboardVisible(updates.leaderboard_visible);
        if (updates.voting_status !== undefined) setVotingStatus(updates.voting_status);
        if (updates.voting_end_time !== undefined) setVotingEndTime(updates.voting_end_time);
      } else {
        setStatusMessage({ text: "Gagal menyimpan pengaturan.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Koneksi backend gagal.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMaxVotes = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveSettings({ max_votes: maxVotes });
  };

  // CSV Parser
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];
    
    // Headers: name,booth_number,category,description,members,photoColor
    const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, "").toLowerCase());
    
    const parsed: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const row: string[] = [];
      let inQuotes = false;
      let currentValue = "";
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentValue.replace(/^["']|["']$/g, "").trim());
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      row.push(currentValue.replace(/^["']|["']$/g, "").trim());
      
      const groupObj: any = {};
      headers.forEach((header, index) => {
        if (header) {
          groupObj[header] = row[index] || "";
        }
      });
      parsed.push(groupObj);
    }
    return parsed;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          const preview = parseCSV(text);
          setCsvPreview(preview);
          setStatusMessage({ text: `Berhasil memuat ${preview.length} baris data dari CSV.`, type: "success" });
        } catch (err) {
          setStatusMessage({ text: "Gagal memproses file CSV. Pastikan format kolom benar.", type: "error" });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (csvPreview.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/upload-groups`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ groups: csvPreview, overwrite })
      });

      if (res.status === 401) {
        handleLogout();
        setStatusMessage({ text: "Sesi admin kedaluwarsa atau tidak valid.", type: "error" });
        return;
      }

      if (res.ok) {
        setStatusMessage({ text: `Sukses mengimpor ${csvPreview.length} kelompok!`, type: "success" });
        setCsvFile(null);
        setCsvPreview([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        refreshGroupsList();
      } else {
        setStatusMessage({ text: "Gagal mengimpor data ke server.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Koneksi backend gagal.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Add manual group
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !boothNumber || !category) return;

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/groups`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name,
          booth_number: boothNumber,
          category,
          description,
          fullDescription: fullDescription || description,
          members
        })
      });

      if (response.status === 401) {
        handleLogout();
        setStatusMessage({ text: "Sesi admin kedaluwarsa atau tidak valid.", type: "error" });
        return;
      }

      if (response.ok) {
        setStatusMessage({ text: `Berhasil menambahkan kelompok: ${name}`, type: "success" });
        setName("");
        setBoothNumber("");
        setDescription("");
        setFullDescription("");
        setMembers("");
        refreshGroupsList();
      } else {
        setStatusMessage({ text: "Gagal menambahkan kelompok ke server.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Koneksi backend gagal.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Delete Group
  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kelompok ini? Seluruh vote terasosiasi juga akan dihapus.")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/groups/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });

      if (res.status === 401) {
        handleLogout();
        setStatusMessage({ text: "Sesi admin kedaluwarsa atau tidak valid.", type: "error" });
        return;
      }

      if (res.ok) {
        setStatusMessage({ text: "Kelompok berhasil dihapus.", type: "success" });
        refreshGroupsList();
      } else {
        setStatusMessage({ text: "Gagal menghapus kelompok dari backend.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Koneksi backend gagal.", type: "error" });
    }
  };

  return (
    <>
      <Header />
      
      <main className="container" style={{ paddingBottom: "120px" }}>
        {!adminToken ? (
          <AdminLoginForm onLoginSuccess={(token) => setAdminToken(token)} />
        ) : (
          <>
            {/* Header Asimetris */}
            <div className="asymmetric-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
              <div>
                <span className="badge">Data Management</span>
                <span className="bg-text-shadow">MANAGE</span>
                <h1 style={{ color: "var(--color-delft-blue)" }}>Manajemen Kelompok Capstone</h1>
              </div>
            </div>

        {/* Notifikasi Status */}
        {statusMessage.text && (
          <div 
            style={{ 
              padding: "16px 20px", 
              border: "2px solid var(--color-delft-blue)",
              borderRadius: "var(--radius-sm)",
              backgroundColor: statusMessage.type === "success" ? "rgba(67, 113, 24, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: "var(--color-delft-blue)",
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
            }}
          >
            {statusMessage.type === "success" ? <CheckCircle2 size={20} style={{ color: "var(--color-fern-green)" }} /> : <AlertCircle size={20} style={{ color: "#ef4444" }} />}
            <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div 
          className="admin-tab-switcher"
          style={{ 
            display: "flex", 
            gap: "12px", 
            marginBottom: "32px",
            borderBottom: "2px solid var(--color-delft-blue)",
            paddingBottom: "1px",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={() => setActiveTab("groups")}
            style={{
              padding: "12px 20px",
              fontSize: "0.9rem",
              fontWeight: "700",
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              border: "2px solid var(--color-delft-blue)",
              borderBottom: activeTab === "groups" ? "2px solid white" : "2px solid var(--color-delft-blue)",
              backgroundColor: activeTab === "groups" ? "white" : "var(--color-beige)",
              color: "var(--color-delft-blue)",
              cursor: "pointer",
              borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
              marginBottom: "-2px",
              zIndex: activeTab === "groups" ? 2 : 1,
              boxShadow: activeTab === "groups" ? "none" : "3px 3px 0 0 var(--color-delft-blue)",
              transition: "all 0.2s ease"
            }}
          >
            📁 Manajemen Kelompok
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            style={{
              padding: "12px 20px",
              fontSize: "0.9rem",
              fontWeight: "700",
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              border: "2px solid var(--color-delft-blue)",
              borderBottom: activeTab === "qr" ? "2px solid white" : "2px solid var(--color-delft-blue)",
              backgroundColor: activeTab === "qr" ? "white" : "var(--color-beige)",
              color: "var(--color-delft-blue)",
              cursor: "pointer",
              borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
              marginBottom: "-2px",
              zIndex: activeTab === "qr" ? 2 : 1,
              boxShadow: activeTab === "qr" ? "none" : "3px 3px 0 0 var(--color-delft-blue)",
              transition: "all 0.2s ease"
            }}
          >
            📷 Manajemen QR Code
          </button>
          <button
            onClick={() => setActiveTab("voting")}
            style={{
              padding: "12px 20px",
              fontSize: "0.9rem",
              fontWeight: "700",
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              border: "2px solid var(--color-delft-blue)",
              borderBottom: activeTab === "voting" ? "2px solid white" : "2px solid var(--color-delft-blue)",
              backgroundColor: activeTab === "voting" ? "white" : "var(--color-beige)",
              color: "var(--color-delft-blue)",
              cursor: "pointer",
              borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
              marginBottom: "-2px",
              zIndex: activeTab === "voting" ? 2 : 1,
              boxShadow: activeTab === "voting" ? "none" : "3px 3px 0 0 var(--color-delft-blue)",
              transition: "all 0.2s ease"
            }}
          >
            🗳️ Manajemen Voting
          </button>
        </div>

        {activeTab === "groups" && (
          <div className="split-layout">
          
          {/* Kolom Kiri: Upload CSV & Form Manual */}
          <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
            
            {/* 1. Uploader CSV */}
            <div className="card">
              <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "16px", textTransform: "uppercase" }}>
                Import Kelompok via CSV
              </h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "20px" }}>
                Unggah berkas `.csv` berisi daftar kelompok secara massal. Pastikan baris pertama memiliki nama kolom berikut: <br />
                <code style={{ fontSize: "0.75rem", background: "var(--color-beige)", padding: "2px 6px", borderRadius: "4px" }}>
                  name, booth_number, category, description, members, photoColor
                </code>
              </p>

              <form onSubmit={handleCSVUpload} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed var(--color-delft-blue)",
                    borderRadius: "var(--radius-sm)",
                    padding: "32px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: csvFile ? "rgba(135, 174, 206, 0.05)" : "var(--color-white)",
                    transition: "var(--transition-fast)"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-beige)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = csvFile ? "rgba(135, 174, 206, 0.05)" : "var(--color-white)"}
                >
                  <Upload size={32} style={{ margin: "0 auto 12px auto", color: "var(--color-fern-green)" }} />
                  <p style={{ fontWeight: "700", fontSize: "0.9rem" }}>
                    {csvFile ? csvFile.name : "Pilih atau Seret Berkas CSV ke Sini"}
                  </p>
                  <p style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "4px" }}>
                    Ukuran maksimum 5MB (.csv)
                  </p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".csv" 
                    style={{ display: "none" }} 
                  />
                </div>

                {csvPreview.length > 0 && (
                  <div style={{ padding: "12px", border: "1px dashed var(--color-delft-blue)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--color-beige)", fontSize: "0.8rem" }}>
                    <strong>Pratinjau Data:</strong> Menerima {csvPreview.length} baris kelompok. Contoh baris pertama: <em>{csvPreview[0].name || "Nama tidak terbaca"} ({csvPreview[0].booth_number || "Booth tidak terbaca"})</em>
                  </div>
                )}

                {/* Overwrite Checkbox */}
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={overwrite} 
                    onChange={(e) => setOverwrite(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "var(--color-fern-green)" }}
                  />
                  <span>Ganti / Bersihkan seluruh data lama di server (Overwrite)</span>
                </label>

                <button 
                  type="submit" 
                  disabled={loading || csvPreview.length === 0} 
                  className="btn btn-primary"
                  style={{ gap: "10px", height: "48px", justifyContent: "center" }}
                >
                  <FileText size={18} />
                  {loading ? "Mengimpor..." : "Proses & Simpan CSV"}
                </button>
              </form>
            </div>

            {/* 2. Tambah / Edit Kelompok Manual */}
            <div className="card" style={{ border: editingGroupId ? "3px solid var(--color-fern-green)" : "3px solid var(--color-delft-blue)" }}>
              <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "16px", textTransform: "uppercase", color: editingGroupId ? "var(--color-fern-green)" : "var(--color-delft-blue)" }}>
                {editingGroupId ? "✏️ Edit Kelompok" : "Tambah Kelompok Manual"}
              </h3>
              
              <form onSubmit={editingGroupId ? handleUpdateGroup : handleAddManual} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="name">Nama Proyek / Kelompok</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="form-control" 
                    placeholder="contoh: Arboris: Sensor Kelembaban..." 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="booth">Nomor Booth</label>
                    <input 
                      type="text" 
                      id="booth" 
                      className="form-control" 
                      placeholder="contoh: Booth A03" 
                      value={boothNumber} 
                      onChange={(e) => setBoothNumber(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="category">Kategori Proyek</label>
                    <select 
                      id="category" 
                      className="form-control" 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ height: "48px", backgroundColor: "white" }}
                    >
                      <option value="IoT & Hardware">IoT & Hardware</option>
                      <option value="Software & AI">Software & AI</option>
                      <option value="Software & Web">Software & Web</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="members">Nama Anggota (Pisahkan dengan titik koma ';')</label>
                  <input 
                    type="text" 
                    id="members" 
                    className="form-control" 
                    placeholder="contoh: Andi; Budi; Citra" 
                    value={members} 
                    onChange={(e) => setMembers(e.target.value)} 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="description">Deskripsi Singkat</label>
                  <textarea 
                    id="description" 
                    className="form-control" 
                    placeholder="Deskripsi singkat proyek untuk kartu utama..." 
                    rows={3} 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    style={{ fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button 
                    type="submit" 
                    disabled={loading || !name || !boothNumber} 
                    className="btn btn-primary"
                    style={{ 
                      flex: 2, 
                      gap: "10px", 
                      height: "48px", 
                      justifyContent: "center",
                      backgroundColor: editingGroupId ? "var(--color-fern-green)" : "var(--color-delft-blue)",
                      color: "white",
                      boxShadow: editingGroupId ? "3px 3px 0 0 var(--color-delft-blue)" : "3px 3px 0 0 var(--color-delft-blue)"
                    }}
                  >
                    {!editingGroupId && <Plus size={18} />}
                    {loading ? (editingGroupId ? "Menyimpan..." : "Menambahkan...") : (editingGroupId ? "Simpan Perubahan" : "Tambah Kelompok")}
                  </button>

                  {editingGroupId && (
                    <button 
                      type="button" 
                      onClick={cancelEditGroup} 
                      className="btn btn-secondary"
                      style={{ flex: 1, height: "48px", justifyContent: "center" }}
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

          </div>

          {/* Kolom Kanan: Daftar Kelompok Saat Ini & Statistik Hapus */}
          <div className="card" style={{ display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "20px", textTransform: "uppercase" }}>
              Daftar Kelompok Aktif ({groupsList.length})
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "800px", overflowY: "auto", paddingRight: "4px" }}>
              {groupsList.map((group) => (
                <div 
                  key={group.id} 
                  style={{ 
                    border: "2px solid var(--color-delft-blue)", 
                    borderRadius: "var(--radius-sm)", 
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "var(--color-white)"
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "white", backgroundColor: "var(--color-delft-blue)", padding: "1px 6px", borderRadius: "2px" }}>
                        {group.booth_number}
                      </span>
                      <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--color-fern-green)" }}>
                        {group.category}
                      </span>
                    </div>
                    <h4 style={{ fontSize: "0.95rem", color: "var(--color-delft-blue)", marginTop: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {group.name}
                    </h4>
                    <p style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Users size={12} />
                      {group.members.join(", ") || "Belum ada anggota"}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={() => startEditGroup(group)}
                      style={{
                        background: "rgba(175, 208, 110, 0.1)",
                        border: "1px solid var(--color-fern-green)",
                        color: "var(--color-fern-green)",
                        padding: "10px",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "var(--transition-fast)"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(175, 208, 110, 0.2)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(175, 208, 110, 0.1)"}
                      title="Edit Kelompok"
                    >
                      <Edit size={16} />
                    </button>

                    <button 
                      onClick={() => handleDeleteGroup(group.id)}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid #ef4444",
                        color: "#ef4444",
                        padding: "10px",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "var(--transition-fast)"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#ef4444" + "22"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                      title="Hapus Kelompok"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

        {activeTab === "voting" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "36px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
            
            {/* 0. Pengaturan Kuota Voting */}
            <div className="card" style={{ border: "2px solid var(--color-delft-blue)" }}>
              <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "12px", textTransform: "uppercase" }}>
                Pengaturan Kuota Voting Pengunjung
              </h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "20px" }}>
                Tentukan jumlah maksimum kelompok terfavorit yang boleh dipilih oleh setiap pengunjung pameran.
              </p>

              <form onSubmit={handleSaveMaxVotes} style={{ display: "flex", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
                <div className="form-group" style={{ flex: 1, minWidth: "150px", margin: 0 }}>
                  <label htmlFor="maxVotesLimitInput" style={{ marginBottom: "8px", display: "block" }}>Batas Maksimum Pilihan:</label>
                  <input 
                    id="maxVotesLimitInput"
                    type="number" 
                    min={1} 
                    max={10}
                    className="form-control" 
                    value={maxVotes} 
                    onChange={(e) => setMaxVotes(parseInt(e.target.value) || 1)}
                    style={{ height: "48px" }}
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary" 
                  style={{ height: "48px", padding: "0 24px", whiteSpace: "nowrap" }}
                >
                  {loading ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </form>
            </div>

            {/* 0.1 Pengaturan Sesi Voting & Live Leaderboard */}
            <div className="card" style={{ border: "2px solid var(--color-delft-blue)", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "4px", textTransform: "uppercase" }}>
                  Kontrol Sesi Voting & Live Leaderboard
                </h3>
                <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  Kelola status mulai/selesai voting, timer mundur, dan status penampilan leaderboard publik.
                </p>
              </div>

              {/* Status Sesi & Timer Info */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: "16px",
                background: "var(--color-beige)",
                padding: "16px",
                border: "2px solid var(--color-delft-blue)",
                borderRadius: "var(--radius-sm)",
                boxShadow: "2px 2px 0 0 var(--color-delft-blue)"
              }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.7 }}>Status Voting:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <span style={{ 
                      width: "12px", 
                      height: "12px", 
                      borderRadius: "50%", 
                      backgroundColor: votingStatus === "started" ? "#afd06e" : votingStatus === "ended" ? "#ff6b6b" : "var(--color-carolina-blue)" 
                    }} />
                    <strong style={{ fontSize: "1rem", textTransform: "uppercase" }}>
                      {votingStatus === "started" ? "Sesi Berjalan" : votingStatus === "ended" ? "Sesi Selesai" : "Belum Dimulai"}
                    </strong>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.7 }}>Timer Sesi:</span>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", marginTop: "4px", fontFamily: "monospace" }}>
                    {votingStatus === "started" ? (adminTimeLeft || "Menghitung...") : votingStatus === "ended" ? "Waktu Habis" : "Timer Nonaktif"}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.7 }}>Leaderboard Publik:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <strong style={{ fontSize: "1rem", textTransform: "uppercase", color: leaderboardVisible === "true" ? "var(--color-fern-green)" : "#ff6b6b" }}>
                      {leaderboardVisible === "true" ? "Ditampilkan" : "Disembunyikan"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Kontrol Sesi */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-delft-blue)" }}>Kelola Sesi</span>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
                  {votingStatus !== "started" ? (
                    <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "240px", alignItems: "flex-end", flexWrap: "wrap" }}>
                      <div className="form-group" style={{ flex: 1, minWidth: "100px", margin: 0 }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "bold", marginBottom: "8px", display: "block" }}>Durasi (Menit):</label>
                        <input 
                          type="number" 
                          min={1} 
                          max={360} 
                          value={timerMinutes} 
                          onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 1)}
                          className="form-control"
                          style={{ height: "48px" }}
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const endTime = new Date(Date.now() + timerMinutes * 60 * 1000).toISOString();
                          handleSaveSettings({ voting_status: "started", voting_end_time: endTime });
                        }}
                        className="btn btn-primary"
                        style={{ height: "48px", flex: 1.5, justifyContent: "center" }}
                      >
                        ▶️ Mulai Voting
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleSaveSettings({ voting_status: "ended" })}
                      className="btn"
                      style={{ 
                        flex: 1, 
                        minWidth: "150px", 
                        height: "48px", 
                        backgroundColor: "#ff6b6b", 
                        color: "white",
                        border: "2px solid var(--color-delft-blue)",
                        boxShadow: "3px 3px 0 0 var(--color-delft-blue)",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      ⏹️ Hentikan Voting
                    </button>
                  )}

                  <button 
                    onClick={() => handleSaveSettings({ voting_status: "not_started", voting_end_time: "" })}
                    className="btn btn-secondary"
                    style={{ flex: 1, minWidth: "150px", height: "48px", justifyContent: "center" }}
                  >
                    🔄 Reset Sesi
                  </button>
                </div>
              </div>

              {/* Kontrol Leaderboard */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px dashed var(--color-delft-blue)", paddingTop: "16px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-delft-blue)" }}>Tampilkan/Sembunyikan Hasil Leaderboard</span>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button 
                    onClick={() => handleSaveSettings({ leaderboard_visible: "true" })}
                    className="btn btn-primary"
                    style={{ 
                      flex: 1, 
                      minWidth: "160px",
                      height: "44px", 
                      backgroundColor: leaderboardVisible === "true" ? "var(--color-fern-green)" : "",
                      justifyContent: "center"
                    }}
                  >
                    👁️ Buka Leaderboard
                  </button>
                  <button 
                    onClick={() => handleSaveSettings({ leaderboard_visible: "false" })}
                    className="btn btn-secondary"
                    style={{ 
                      flex: 1, 
                      minWidth: "160px",
                      height: "44px", 
                      backgroundColor: leaderboardVisible === "false" ? "#ff6b6b" : "",
                      color: leaderboardVisible === "false" ? "white" : "",
                      justifyContent: "center"
                    }}
                  >
                    🙈 Sembunyikan Leaderboard
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Arsipkan Sesi & Hard Reset */}
            <div className="card" style={{ border: "2px solid var(--color-delft-blue)", borderColor: "#ff6b6b" }}>
              <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "12px", textTransform: "uppercase", color: "#ff6b6b" }}>
                ⚠️ Arsipkan Sesi & Bersihkan Database
              </h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "20px" }}>
                Gunakan fitur ini untuk menyelesaikan sesi pameran saat ini, menyimpan ringkasan suaranya ke dalam riwayat, dan membersihkan seluruh data pemilih (IP, Device Fingerprint, & Suara) untuk memulai sesi pemilu baru yang bersih.
              </p>

              <form onSubmit={handleArchiveSession} style={{ display: "flex", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
                <div className="form-group" style={{ flex: 1, minWidth: "240px", margin: 0 }}>
                  <label htmlFor="sessionNameInput" style={{ marginBottom: "8px", display: "block" }}>Nama Sesi Arsip (contoh: Hari 1 - Pagi):</label>
                  <input 
                    id="sessionNameInput"
                    type="text" 
                    placeholder="Masukkan nama sesi arsip..."
                    className="form-control" 
                    value={newSessionName} 
                    onChange={(e) => setNewSessionName(e.target.value)}
                    style={{ height: "48px" }}
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={archiving || !newSessionName.trim()}
                  className="btn" 
                  style={{ 
                    height: "48px", 
                    padding: "0 24px", 
                    whiteSpace: "nowrap",
                    backgroundColor: "#ff6b6b",
                    color: "white",
                    border: "2px solid var(--color-delft-blue)",
                    boxShadow: "3px 3px 0 0 var(--color-delft-blue)",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  {archiving ? "Mengarsipkan..." : "📦 Arsipkan & Mulai Baru"}
                </button>
              </form>
            </div>

            {/* Card 4: Riwayat Sesi */}
            <div className="card" style={{ border: "2px solid var(--color-delft-blue)" }}>
              <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "16px", textTransform: "uppercase" }}>
                📜 Riwayat Sesi Terarsipkan
              </h3>
              
              {sessionHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px", border: "2px dashed var(--color-delft-blue)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--color-beige)" }}>
                  <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>Belum ada riwayat sesi yang diarsipkan.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {sessionHistory.map((session, idx) => (
                    <div 
                      key={session.id || idx}
                      style={{
                        padding: "16px",
                        border: "2px solid var(--color-delft-blue)",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--color-beige)",
                        boxShadow: "3px 3px 0 0 var(--color-delft-blue)",
                        textAlign: "left"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", borderBottom: "1px dashed var(--color-delft-blue)", paddingBottom: "10px", marginBottom: "10px" }}>
                        <strong style={{ fontSize: "1.05rem", color: "var(--color-delft-blue)" }}>
                          📁 {session.name}
                        </strong>
                        <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                          Diarsipkan: {new Date(session.archivedAt).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", fontSize: "0.85rem" }}>
                        <div>
                          <strong>Total Pengunjung:</strong> {session.totalVisitors} perangkat
                        </div>
                        <div>
                          <strong>Total Suara:</strong> {session.totalVotes} suara (kuota: {session.maxVotes})
                        </div>
                      </div>
                      <div style={{ marginTop: "12px", fontSize: "0.85rem", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "10px" }}>
                        <strong>3 Besar Pemenang Sesi:</strong>
                        <div style={{ marginTop: "4px", fontWeight: "600", color: "var(--color-fern-green)" }}>
                          {session.topGroups || "Tidak ada suara"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "qr" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
            {/* Row 1: Web Utama & Pintu Keluar QR Codes */}
            <div className="split-layout" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
              {/* Card 1: QR Web Utama */}
              <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
                <span className="badge" style={{ backgroundColor: "var(--color-carolina-blue)" }}>Web Utama</span>
                <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>QR Website Utama</h3>
                <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  Ditempatkan di meja registrasi agar pengunjung dapat langsung membuka situs web voting.
                </p>
                <div style={{ 
                  border: "3px solid var(--color-delft-blue)", 
                  padding: "12px", 
                  borderRadius: "var(--radius-sm)", 
                  backgroundColor: "white",
                  boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
                }}>
                  <img 
                    src={getQrUrl(`${origin}/`)} 
                    alt="QR Web Utama" 
                    style={{ width: "200px", height: "200px", display: "block" }} 
                  />
                </div>
                <div style={{ fontSize: "0.75rem", fontFamily: "monospace", wordBreak: "break-all", background: "var(--color-beige)", padding: "4px 8px", border: "1px dashed var(--color-delft-blue)" }}>
                  {origin}/
                </div>
                <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                  <button 
                    onClick={() => printSingleQR("Website Utama", "Scan untuk masuk ke sistem voting", `${origin}/`)}
                    className="btn btn-primary" 
                    style={{ flex: 1, gap: "8px", justifyContent: "center", height: "42px" }}
                  >
                    <Printer size={16} /> Print
                  </button>
                  <a 
                    href={getQrUrl(`${origin}/`)} 
                    download="qr_web_utama.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary" 
                    style={{ flex: 1, gap: "8px", justifyContent: "center", height: "42px", display: "inline-flex", alignItems: "center" }}
                  >
                    <Download size={16} /> Unduh
                  </a>
                </div>
              </div>

              {/* Card 2: QR Pintu Keluar */}
              <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
                <span className="badge" style={{ backgroundColor: "#ff6b6b", color: "white" }}>Exit Gate Only</span>
                <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>QR Pintu Keluar (Exit Gate)</h3>
                <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  Ditempatkan di pintu keluar. Wajib dipindai pengunjung untuk membuka kunci tombol kirim suara.
                </p>
                <div style={{ 
                  border: "3px solid var(--color-delft-blue)", 
                  padding: "12px", 
                  borderRadius: "var(--radius-sm)", 
                  backgroundColor: "white",
                  boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
                }}>
                  <img 
                    src={getQrUrl(`${origin}/?unlock=${EXIT_UNLOCK_TOKEN}`)} 
                    alt="QR Pintu Keluar" 
                    style={{ width: "200px", height: "200px", display: "block" }} 
                  />
                </div>
                <div style={{ fontSize: "0.75rem", fontFamily: "monospace", wordBreak: "break-all", background: "var(--color-beige)", padding: "4px 8px", border: "1px dashed var(--color-delft-blue)" }}>
                  {origin}/?unlock={EXIT_UNLOCK_TOKEN}
                </div>
                <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                  <button 
                    onClick={() => printSingleQR("Pintu Keluar (Exit Gate)", "Pindai untuk membuka kunci tombol voting", `${origin}/?unlock=${EXIT_UNLOCK_TOKEN}`)}
                    className="btn btn-primary" 
                    style={{ flex: 1, gap: "8px", justifyContent: "center", height: "42px" }}
                  >
                    <Printer size={16} /> Print
                  </button>
                  <a 
                    href={getQrUrl(`${origin}/?unlock=${EXIT_UNLOCK_TOKEN}`)} 
                    download="qr_pintu_keluar.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary" 
                    style={{ flex: 1, gap: "8px", justifyContent: "center", height: "42px", display: "inline-flex", alignItems: "center" }}
                  >
                    <Download size={16} /> Unduh
                  </a>
                </div>
              </div>
            </div>

            {/* Row 2: Kelompok QR Codes Grid */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "1.3rem", fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>QR Code Kelompok Capstone ({groupsList.length})</h3>
                  <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "4px" }}>
                    QR Code otomatis dibuat untuk setiap kelompok baru. Tempelkan di booth kelompok fisik agar pengunjung dapat memindai untuk menambahkannya ke shortlist.
                  </p>
                </div>
                <button 
                  onClick={printAllGroupQRs}
                  className="btn btn-primary"
                  style={{ gap: "8px", height: "44px", boxShadow: "4px 4px 0 0 var(--color-delft-blue)" }}
                  disabled={groupsList.length === 0}
                >
                  <Printer size={18} /> Print Semua QR Kelompok (Grid)
                </button>
              </div>

              {groupsList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", border: "2px dashed var(--color-delft-blue)", borderRadius: "var(--radius-sm)" }}>
                  <p style={{ fontWeight: 600 }}>Belum ada data kelompok.</p>
                  <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>Tambahkan kelompok di tab "Kelompok & Pengaturan" terlebih dahulu.</p>
                </div>
              ) : (
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
                  gap: "20px" 
                }}>
                  {groupsList.map((group) => {
                    const groupUrl = `${origin}/kelompok/${group.slug}?from=qr`;
                    return (
                      <div 
                        key={group.id} 
                        style={{ 
                          border: "2px solid var(--color-delft-blue)", 
                          borderRadius: "var(--radius-sm)", 
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          backgroundColor: "var(--color-white)",
                          boxShadow: "3px 3px 0 0 var(--color-delft-blue)",
                          gap: "12px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "white", backgroundColor: "var(--color-delft-blue)", padding: "2px 8px", borderRadius: "2px" }}>
                            {group.booth_number}
                          </span>
                        </div>
                        <h4 style={{ fontSize: "0.9rem", color: "var(--color-delft-blue)", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                          {group.name}
                        </h4>
                        <div style={{ 
                          border: "1px solid var(--color-delft-blue)",
                          padding: "6px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "white"
                        }}>
                          <img 
                            src={getQrUrl(groupUrl)} 
                            alt={`QR ${group.booth_number}`} 
                            style={{ width: "120px", height: "120px", display: "block" }} 
                          />
                        </div>
                        <div style={{ display: "flex", gap: "8px", width: "100%", marginTop: "auto" }}>
                          <button 
                            onClick={() => printSingleQR(group.booth_number, group.name, groupUrl)}
                            className="btn btn-secondary" 
                            style={{ flex: 1, padding: "0", height: "36px", fontSize: "0.8rem", gap: "4px", justifyContent: "center" }}
                          >
                            <Printer size={14} /> Print
                          </button>
                          <a 
                            href={getQrUrl(groupUrl)} 
                            download={`qr_${group.booth_number}.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn" 
                            style={{ 
                              flex: 1, 
                              padding: "0", 
                              height: "36px", 
                              fontSize: "0.8rem", 
                              gap: "4px", 
                              justifyContent: "center", 
                              display: "inline-flex", 
                              alignItems: "center",
                              border: "1px solid var(--color-delft-blue)",
                              backgroundColor: "var(--color-white)",
                              color: "var(--color-delft-blue)"
                            }}
                          >
                            <Download size={14} /> Unduh
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </>
    )}
      </main>
    </>
  );
}

export default function AdminManagementPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "40px", textAlign: "center" }}>Memuat halaman admin...</div>}>
      <AdminManagementContent />
    </Suspense>
  );
}
