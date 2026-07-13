"use client";

import { useEffect, useState, useRef } from "react";
import { useVoter } from "@/components/VoterContext";
import Link from "next/link";
import Header from "@/components/Header";
import AdminLoginForm from "@/components/AdminLoginForm";
import { Upload, Plus, Trash2, CheckCircle2, FileText, AlertCircle, Users, LayoutDashboard, QrCode, Printer, Download } from "lucide-react";
import { getBackendUrl } from "@/lib/config";

const BACKEND_URL = getBackendUrl();

export default function AdminManagementPage() {
  const { groupsList, refreshGroupsList } = useVoter();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"groups" | "qr">("groups");
  const [origin, setOrigin] = useState("http://localhost:3030");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

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

  // Cek token saat halaman dibuka
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setAdminToken(token);
    }
  }, []);

  // Ambil data jika terautentikasi
  useEffect(() => {
    if (!adminToken) return;

    refreshGroupsList();
    const fetchMaxVotes = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          setMaxVotes(data.max_votes || 3);
        }
      } catch (err) {
        console.error("Gagal mengambil limit voting:", err);
      }
    };
    fetchMaxVotes();
  }, [adminToken]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
  };

  const handleSaveMaxVotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/settings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ max_votes: maxVotes })
      });

      if (res.status === 401) {
        handleLogout();
        setStatusMessage({ text: "Sesi admin kedaluwarsa atau tidak valid.", type: "error" });
        return;
      }

      if (res.ok) {
        setStatusMessage({ text: `Batas voting berhasil diubah menjadi ${maxVotes} kelompok!`, type: "success" });
      } else {
        const errData = await res.json();
        setStatusMessage({ text: errData.error || "Gagal mengubah batas voting.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Koneksi backend gagal.", type: "error" });
    } finally {
      setLoading(false);
    }
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
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Link 
                  href="/dashboard" 
                  className="btn btn-secondary"
                  style={{ 
                    marginBottom: "10px", 
                    gap: "8px", 
                    height: "44px", 
                    borderWidth: "2px", 
                    boxShadow: "3px 3px 0px var(--color-delft-blue)" 
                  }}
                >
                  <LayoutDashboard size={16} />
                  Dashboard Panitia (Logs & Ekspor)
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn"
                  style={{
                    marginBottom: "10px",
                    background: "#ff6b6b",
                    color: "white",
                    border: "2px solid var(--color-delft-blue)",
                    boxShadow: "3px 3px 0px var(--color-delft-blue)",
                    height: "44px",
                    cursor: "pointer",
                    fontWeight: "700"
                  }}
                >
                  Logout
                </button>
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
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          marginBottom: "32px",
          borderBottom: "2px solid var(--color-delft-blue)",
          paddingBottom: "1px"
        }}>
          <button
            onClick={() => setActiveTab("groups")}
            style={{
              padding: "12px 24px",
              fontSize: "0.95rem",
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
            📁 Kelompok & Pengaturan
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            style={{
              padding: "12px 24px",
              fontSize: "0.95rem",
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
        </div>

        {activeTab === "groups" && (
          <div className="split-layout">
          
          {/* Kolom Kiri: Upload CSV & Form Manual */}
          <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
            
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

            {/* 2. Tambah Kelompok Manual */}
            <div className="card">
              <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "16px", textTransform: "uppercase" }}>
                Tambah Kelompok Manual
              </h3>
              
              <form onSubmit={handleAddManual} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

                <button 
                  type="submit" 
                  disabled={loading || !name || !boothNumber} 
                  className="btn btn-primary"
                  style={{ gap: "10px", height: "48px", justifyContent: "center", marginTop: "8px" }}
                >
                  <Plus size={18} />
                  {loading ? "Menambahkan..." : "Tambah Kelompok"}
                </button>
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
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
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
                    src={getQrUrl(`${origin}/?unlock=exit`)} 
                    alt="QR Pintu Keluar" 
                    style={{ width: "200px", height: "200px", display: "block" }} 
                  />
                </div>
                <div style={{ fontSize: "0.75rem", fontFamily: "monospace", wordBreak: "break-all", background: "var(--color-beige)", padding: "4px 8px", border: "1px dashed var(--color-delft-blue)" }}>
                  {origin}/?unlock=exit
                </div>
                <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                  <button 
                    onClick={() => printSingleQR("Pintu Keluar (Exit Gate)", "Pindai untuk membuka kunci tombol voting", `${origin}/?unlock=exit`)}
                    className="btn btn-primary" 
                    style={{ flex: 1, gap: "8px", justifyContent: "center", height: "42px" }}
                  >
                    <Printer size={16} /> Print
                  </button>
                  <a 
                    href={getQrUrl(`${origin}/?unlock=exit`)} 
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
