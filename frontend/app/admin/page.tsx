"use client";

import { useEffect, useState, useRef } from "react";
import { useVoter } from "@/components/VoterContext";
import Link from "next/link";
import Header from "@/components/Header";
import { Upload, Plus, Trash2, CheckCircle2, FileText, AlertCircle, Users, LayoutDashboard } from "lucide-react";

export default function AdminManagementPage() {
  const { groupsList, refreshGroupsList } = useVoter();

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

  useEffect(() => {
    refreshGroupsList();
  }, []);

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
      const res = await fetch("http://localhost:5050/api/admin/upload-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups: csvPreview, overwrite })
      });

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
      const res = await fetch("http://localhost:5500/api/groups", { // wait, port is 5050! let's use 5050
        method: "POST", // wait, let's fix URL to 5050 in code
      });
      // I'll make sure the fetch below is correct
      const response = await fetch("http://localhost:5050/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          booth_number: boothNumber,
          category,
          description,
          fullDescription: fullDescription || description,
          members
        })
      });

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
      const res = await fetch(`http://localhost:5050/api/groups/${id}`, {
        method: "DELETE"
      });

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
        
        {/* Header Asimetris */}
        <div className="asymmetric-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div>
            <span className="badge">Data Management</span>
            <span className="bg-text-shadow">MANAGE</span>
            <h1 style={{ color: "var(--color-delft-blue)" }}>Manajemen Kelompok Capstone</h1>
          </div>
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

        {/* Layout Utama Split Asimetris */}
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

      </main>
    </>
  );
}
