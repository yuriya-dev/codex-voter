"use client";

import { useState, useEffect } from "react";
import { useVoter } from "@/components/VoterContext";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { GraduationCap, School, Award, User, ArrowRight, ShieldCheck, Mail } from "lucide-react";

export default function VerifikasiPage() {
  const router = useRouter();
  const { verifyOTP, visitor, maxVotesLimit, googleUser, loginWithGoogle, logoutGoogle } = useVoter();

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

  // Prefill name from Google Metadata if available
  useEffect(() => {
    if (googleUser && googleUser.user_metadata?.full_name && !name) {
      setName(googleUser.user_metadata.full_name);
    }
  }, [googleUser]);

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
          
          {/* Kolom Form Kiri */}
          {!googleUser ? (
            /* Tampilan Belum Login Google */
            <div className="card" style={{ padding: "36px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
              <div style={{ marginBottom: "24px" }}>
                <ShieldCheck size={48} style={{ color: "var(--color-fern-green)", margin: "0 auto 12px" }} />
                <h2 style={{ fontSize: "1.35rem", fontFamily: "var(--font-heading)", color: "var(--color-delft-blue)" }}>
                  Otentikasi Akun Diperlukan
                </h2>
                <p style={{ fontSize: "0.9rem", color: "var(--color-delft-blue)", opacity: 0.8, marginTop: "8px", lineHeight: "1.6" }}>
                  Untuk menjamin keamanan pemilu kompetisi dan menghindari kecurangan vote ganda, Anda wajib memverifikasi akun Google terlebih dahulu sebelum memberikan suara.
                </p>
              </div>
              
              <button
                onClick={loginWithGoogle}
                className="btn btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  width: "100%",
                  height: "54px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  backgroundColor: "#ffffff",
                  color: "#3c4043",
                  border: "2px solid #dadce0",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                  e.currentTarget.style.borderColor = "#bee3f8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.borderColor = "#dadce0";
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Masuk dengan Google
              </button>
            </div>
          ) : (
            /* Tampilan Sudah Login Google, Lengkapi Form */
            <div className="card" style={{ padding: "36px" }}>
              
              {/* Google User Status */}
              <div 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: "var(--color-sand)",
                  border: "1px solid var(--color-delft-blue)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "24px",
                  fontSize: "0.85rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail size={16} style={{ color: "var(--color-fern-green)" }} />
                  <div>
                    <span style={{ display: "block", color: "var(--color-delft-blue)", opacity: 0.7, fontSize: "0.75rem" }}>Login Google Aktif</span>
                    <strong>{googleUser.email}</strong>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={logoutGoogle} 
                  className="btn btn-secondary" 
                  style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                >
                  Ganti Akun
                </button>
              </div>

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
          )}

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
                Keamanan & Integritas Vote
              </h3>
            </div>
            
            <p style={{ fontSize: "0.9rem", color: "var(--color-delft-blue)", opacity: 0.9, lineHeight: "1.6", marginBottom: "12px" }}>
              Sistem ini menggunakan metode validasi keamanan terintegrasi guna menjamin keadilan pemungutan suara dengan ketentuan sebagai berikut:
            </p>
            <ul style={{ fontSize: "0.85rem", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "12px", opacity: 0.9 }}>
              <li>
                <strong>Login Google Wajib:</strong> Tiap pemilih wajib masuk menggunakan akun Google yang terverifikasi. Satu akun Google hanya berhak memberikan suara sesuai kuota pameran.
              </li>
              <li>
                <strong>Verifikasi Alamat IP:</strong> Setiap perangkat/koneksi IP hanya diizinkan mengirimkan <b>{maxVotesLimit} suara final</b>. Percobaan pendaftaran banyak akun Google baru dari IP yang sama dalam waktu singkat akan diblokir otomatis.
              </li>
              <li>
                <strong>Audit Logs & Deteksi Kecurangan:</strong> Setiap pengiriman suara dicatat di log keamanan admin secara transparan. Akun Google yang baru didaftarkan sesaat sebelum vote akan secara otomatis ditandai (flagged) untuk direview secara manual oleh panitia.
              </li>
            </ul>
          </div>

        </div>

      </main>
    </>
  );
}
