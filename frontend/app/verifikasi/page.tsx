"use client";

import { useState, useEffect } from "react";
import { useVoter } from "@/components/VoterContext";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { GraduationCap, School, Award, User, ArrowRight, ShieldCheck } from "lucide-react";

export default function VerifikasiPage() {
  const router = useRouter();
  const { verifyOTP, visitor, maxVotesLimit } = useVoter();

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("mahasiswa");
  const [loading, setLoading] = useState(false);

  // Redirect if already verified
  useEffect(() => {
    if (visitor) {
      router.push("/vote");
    }
  }, [visitor, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const success = await verifyOTP(name.trim(), category);
      if (success) {
        router.push("/vote");
      }
    } catch (err) {
      console.error("Registrasi gagal:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      
      <main className="container" style={{ paddingBottom: "120px" }}>
        
        {/* Header Asimetris */}
        <div className="asymmetric-header" style={{ marginBottom: "24px" }}>
          <span className="badge">Registrasi Pemilih</span>
          <span className="bg-text-shadow">REGISTER</span>
          <h1 style={{ color: "var(--color-delft-blue)" }}>Identitas Pengunjung</h1>
        </div>

        <div className="split-layout" style={{ margin: "0 auto", maxWidth: "950px" }}>
          
          {/* Form Card (Asimetris) */}
          <div className="card" style={{ padding: "36px" }}>
            
            <form onSubmit={handleSubmit}>
              
              {/* 1. Pilih Kategori */}
              <div className="form-group">
                <label style={{ marginBottom: "12px", display: "block" }}>Pilih Kategori Pemilih</label>
                <div className="category-tabs" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
                  
                  {/* Mahasiswa */}
                  <button
                    type="button"
                    className={`category-tab ${category === "mahasiswa" ? "active" : ""}`}
                    onClick={() => setCategory("mahasiswa")}
                    style={{ height: "100%" }}
                  >
                    <GraduationCap size={22} />
                    <span className="category-tab-title" style={{ marginTop: "4px" }}>Mahasiswa</span>
                  </button>

                  {/* Siswa */}
                  <button
                    type="button"
                    className={`category-tab ${category === "siswa" ? "active" : ""}`}
                    onClick={() => setCategory("siswa")}
                    style={{ height: "100%" }}
                  >
                    <School size={22} />
                    <span className="category-tab-title" style={{ marginTop: "4px" }}>Siswa</span>
                  </button>

                  {/* Dosen/Karyawan */}
                  <button
                    type="button"
                    className={`category-tab ${category === "dosen_karyawan" ? "active" : ""}`}
                    onClick={() => setCategory("dosen_karyawan")}
                    style={{ height: "100%" }}
                  >
                    <Award size={22} />
                    <span className="category-tab-title" style={{ marginTop: "4px" }}>Dosen / Staf</span>
                  </button>

                  {/* Umum */}
                  <button
                    type="button"
                    className={`category-tab ${category === "umum" ? "active" : ""}`}
                    onClick={() => setCategory("umum")}
                    style={{ height: "100%" }}
                  >
                    <User size={22} />
                    <span className="category-tab-title" style={{ marginTop: "4px" }}>Umum</span>
                  </button>

                </div>
              </div>

              {/* 2. Input Nama Lengkap */}
              <div className="form-group" style={{ marginTop: "24px" }}>
                <label htmlFor="fullName">Nama Lengkap Anda</label>
                <input
                  type="text"
                  id="fullName"
                  className="form-control"
                  placeholder="Masukkan nama lengkap sesuai identitas..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ height: "52px" }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || !name.trim()} 
                className="btn btn-primary"
                style={{ width: "100%", height: "52px", marginTop: "20px", gap: "10px" }}
              >
                {loading ? "Mendaftarkan Perangkat..." : "Lanjut ke Halaman Voting"}
                <ArrowRight size={18} />
              </button>
            </form>

          </div>

          {/* Kolom Informasi di Samping Form (Earthy/Minimalist) */}
          <div 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "center",
              padding: "20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <ShieldCheck size={32} style={{ color: "var(--color-fern-green)" }} />
              <h3 style={{ fontSize: "1.25rem", fontFamily: "var(--font-heading)" }}>
                Validasi Vote Berbasis IP
              </h3>
            </div>
            
            <p style={{ fontSize: "0.9rem", color: "var(--color-delft-blue)", opacity: 0.9, lineHeight: "1.6", marginBottom: "12px" }}>
              Sistem ini menggunakan metode validasi keamanan terintegrasi guna menjamin keadilan pemungutan suara dengan ketentuan sebagai berikut:
            </p>
            <ul style={{ fontSize: "0.85rem", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "12px", opacity: 0.9 }}>
              <li>
                <strong>Verifikasi Alamat IP:</strong> Setiap perangkat/koneksi IP hanya diizinkan mengirimkan <b>{maxVotesLimit} suara final</b>. Percobaan pengiriman ganda dari perangkat yang sama akan diblokir otomatis oleh server.
              </li>
              <li>
                <strong>Kategori Pemilih Akurat:</strong> Kami menggunakan kategori suara untuk Mahasiswa, Siswa, Dosen/Staf, dan Umum untuk analisis data pameran yang komprehensif.
              </li>
              <li>
                <strong>Audit Logs Transparan:</strong> Setiap pengiriman suara dicatat di log keamanan admin secara transparan guna mendeteksi kecurangan.
              </li>
            </ul>
          </div>

        </div>

      </main>
    </>
  );
}
