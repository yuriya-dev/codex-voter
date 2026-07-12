"use client";

import { useEffect, useState } from "react";
import { useVoter } from "@/components/VoterContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { CheckCircle2, Copy, Check, Leaf, Heart, ArrowRight } from "lucide-react";

export default function VotePage() {
  const router = useRouter();
  const { visitor, shortlist, groupsList, submitVote, activeVote } = useVoter();

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confetti, setConfetti] = useState<number[]>([]);

  // Redirect if visitor not verified
  useEffect(() => {
    if (!visitor) {
      router.push("/verifikasi");
    }
  }, [visitor, router]);

  // Generate leaf confetti particles on success
  useEffect(() => {
    if (activeVote) {
      const particles = Array.from({ length: 30 }, (_, idx) => idx);
      setConfetti(particles);
    }
  }, [activeVote]);

  // Pre-fill selected group if only 1 item in shortlist
  useEffect(() => {
    if (shortlist.length === 1) {
      setSelectedGroupId(shortlist[0]);
    }
  }, [shortlist]);

  if (!visitor) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 20px" }}>
        <p>Mengalihkan ke halaman verifikasi...</p>
      </div>
    );
  }

  // Filter groups in shortlist
  const shortlistedGroups = groupsList.filter((g) => shortlist.includes(g.id));

  const handleCopyCode = () => {
    if (activeVote) {
      navigator.clipboard.writeText(activeVote.voteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;

    setSubmitting(true);
    try {
      await submitVote(selectedGroupId);
    } catch (err) {
      console.error("Gagal mengirim suara:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Tampilan Sukses Setelah Vote
  if (activeVote) {
    const votedGroup = groupsList.find((g) => g.id === activeVote.groupId);

    return (
      <>
        <Header />
        
        {/* Leaf Confetti Simulation */}
        <div className="confetti-container">
          {confetti.map((idx) => (
            <div
              key={idx}
              className="leaf-particle"
              style={{
                left: `${Math.random() * 100}vw`,
                animationDelay: `${Math.random() * 3}s`,
                transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random()})`,
                backgroundColor: idx % 2 === 0 ? "var(--color-fern-green)" : "var(--color-pistachio)"
              }}
            />
          ))}
        </div>

        <main className="container" style={{ paddingBottom: "120px" }}>
          
          <div className="card success-card" style={{ border: "3px solid var(--color-delft-blue)" }}>
            <div 
              style={{ 
                width: "70px", 
                height: "70px", 
                borderRadius: "50%", 
                backgroundColor: "var(--color-pistachio)", 
                border: "3px solid var(--color-delft-blue)",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                margin: "0 auto 24px auto",
                animation: "heartPulse 0.4s ease"
              }}
            >
              <CheckCircle2 size={36} style={{ color: "var(--color-delft-blue)" }} />
            </div>

            <h1 style={{ fontSize: "2rem", fontFamily: "var(--font-heading)", marginBottom: "8px", textTransform: "uppercase" }}>
              Suara Anda Tercatat!
            </h1>
            <p style={{ fontSize: "0.95rem", opacity: 0.8, maxWidth: "420px", margin: "0 auto 28px auto" }}>
              Terima kasih telah berpartisipasi. Hak pilih Anda berhasil diverifikasi dan dimasukkan ke dalam basis data.
            </p>

            {/* Kode Bukti Vote */}
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em", color: "var(--color-fern-green)" }}>
              Kode Bukti Voting (Simpan / Salin):
            </p>
            <div className="vote-code-box">
              <span>{activeVote.voteCode}</span>
              <button 
                onClick={handleCopyCode}
                style={{ 
                  background: "none", 
                  border: "none", 
                  cursor: "pointer", 
                  color: "var(--color-delft-blue)",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Salin Kode"
              >
                {copied ? <Check size={18} style={{ color: "var(--color-fern-green)" }} /> : <Copy size={18} />}
              </button>
            </div>

            {/* Rincian Pilihan */}
            <div 
              style={{ 
                marginTop: "32px", 
                padding: "16px 24px", 
                border: "2px solid var(--color-delft-blue)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-beige)",
                textAlign: "left"
              }}
            >
              <span style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-fern-green)" }}>
                Pilihan Anda
              </span>
              <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-heading)", marginTop: "4px", color: "var(--color-delft-blue)" }}>
                {votedGroup?.name}
              </h3>
              <p style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "2px" }}>
                {votedGroup?.booth_number} &bull; Dicatat pada {new Date(activeVote.votedAt).toLocaleTimeString("id-ID")}
              </p>
            </div>

            <div style={{ marginTop: "36px" }}>
              <Link href="/dashboard" className="btn btn-secondary" style={{ gap: "8px" }}>
                Lihat Hasil Live Dashboard
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>

        </main>
      </>
    );
  }

  // 2. Form Pemilihan Suara Final
  return (
    <>
      <Header />
      
      <main className="container" style={{ paddingBottom: "120px" }}>
        
        {/* Header Asimetris */}
        <div className="asymmetric-header" style={{ marginBottom: "24px" }}>
          <span className="badge">Verified Session</span>
          <span className="bg-text-shadow">CAST VOTE</span>
          <h1 style={{ color: "var(--color-delft-blue)" }}>Kirim Suara Anda</h1>
        </div>

        <div className="split-layout" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          
          {/* Sisi Form */}
          <form onSubmit={handleSubmit} className="card" style={{ padding: "36px" }}>
            <h3 style={{ fontSize: "1.25rem", fontFamily: "var(--font-heading)", marginBottom: "16px" }}>
              Pilih Proyek Capstone Terfavorit
            </h3>
            
            {/* Opsi dari Shortlist */}
            {shortlistedGroups.length > 0 ? (
              <div className="form-group">
                <label style={{ marginBottom: "12px", color: "var(--color-fern-green)" }}>
                  Pilihan Cepat dari Shortlist Anda:
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {shortlistedGroups.map((group) => (
                    <label 
                      key={group.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "16px",
                        border: `2px solid ${selectedGroupId === group.id ? "var(--color-fern-green)" : "var(--color-delft-blue)"}`,
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        backgroundColor: selectedGroupId === group.id ? "rgba(67, 113, 24, 0.05)" : "white",
                        boxShadow: selectedGroupId === group.id ? "3px 3px 0px var(--color-fern-green)" : "3px 3px 0px var(--color-delft-blue)",
                        transition: "var(--transition-fast)",
                        position: "relative"
                      }}
                    >
                      <input
                        type="radio"
                        name="voteGroup"
                        value={group.id}
                        checked={selectedGroupId === group.id}
                        onChange={() => setSelectedGroupId(group.id)}
                        style={{ width: "20px", height: "20px", accentColor: "var(--color-fern-green)" }}
                        required
                      />
                      <div>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-fern-green)" }}>
                          {group.booth_number}
                        </span>
                        <h4 style={{ fontSize: "0.95rem", color: "var(--color-delft-blue)", marginTop: "2px", fontWeight: "700" }}>
                          {group.name}
                        </h4>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              /* Jika Shortlist Kosong */
              <div 
                style={{ 
                  padding: "16px", 
                  border: "2px dashed var(--color-delft-blue)", 
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-beige)",
                  marginBottom: "24px"
                }}
              >
                <p style={{ fontSize: "0.85rem", fontWeight: "700" }}>Daftar favorit Anda kosong.</p>
                <p style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "4px" }}>
                  Anda bisa memilih langsung melalui pemilih semua kelompok di bawah, atau kembali ke halaman utama untuk memfavoritkan terlebih dahulu.
                </p>
                <Link href="/kelompok" style={{ fontSize: "0.8rem", color: "var(--color-fern-green)", fontWeight: 700, display: "inline-block", marginTop: "8px", textDecoration: "underline" }}>
                  Cari Kelompok
                </Link>
              </div>
            )}

            {/* Pemilih Semua Kelompok (Dropdown Alternatif) */}
            <div className="form-group" style={{ marginTop: "24px" }}>
              <label htmlFor="allGroupsSelect">Pilih dari Semua Kelompok Pameran:</label>
              <select
                id="allGroupsSelect"
                className="form-control"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                required
                style={{ 
                  height: "52px", 
                  backgroundColor: "white", 
                  fontWeight: "500",
                  cursor: "pointer" 
                }}
              >
                <option value="">-- Pilih Kelompok Capstone --</option>
                {groupsList.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.booth_number} &bull; {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedGroupId}
              className="btn btn-primary"
              style={{ width: "100%", height: "52px", marginTop: "20px", fontSize: "1rem", gap: "10px" }}
            >
              {submitting ? "Mengirim Suara..." : "Kirim Suara Final"}
              <CheckCircle2 size={20} />
            </button>
          </form>

          {/* Sisi Informasi Samping */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "12px" }}>
              Verifikasi Sidik Perangkat
            </h3>
            <p style={{ fontSize: "0.85rem", opacity: 0.9, lineHeight: "1.6" }}>
              Sesi verifikasi Anda aktif dengan identitas hash pengunjung. Database Supabase kami menerapkan <strong>Row Level Security (RLS)</strong> yang akan secara otomatis menolak vote kedua dari identitas atau browser yang sama.
            </p>
            
            <div 
              style={{ 
                marginTop: "24px", 
                padding: "16px", 
                borderLeft: "4px solid var(--color-carolina-blue)", 
                backgroundColor: "rgba(135, 174, 206, 0.1)"
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-delft-blue)" }}>
                ID Sesi Aktif
              </span>
              <p style={{ fontFamily: "monospace", fontSize: "0.8rem", marginTop: "4px", color: "var(--color-delft-blue)" }}>
                {visitor.identifier} ({visitor.category})
              </p>
            </div>
          </div>

        </div>

      </main>
    </>
  );
}
