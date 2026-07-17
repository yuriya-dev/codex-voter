"use client";

import { useEffect, useState } from "react";
import { useVoter } from "@/components/VoterContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { CheckCircle2, Copy, Check, Leaf, Heart, ArrowRight, Lock, Unlock } from "lucide-react";

export default function VotePage() {
  const router = useRouter();
  const { visitor, shortlist, groupsList, submitVote, activeVotes, maxVotesLimit, isVoteUnlocked, setQrScannerOpen, votingStatus, votingEndTime, refreshSettings } = useVoter();

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [confetti, setConfetti] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Load settings on mount
  useEffect(() => {
    refreshSettings();
  }, []);

  // Redirect if visitor not verified
  useEffect(() => {
    if (!visitor) {
      router.push("/verifikasi");
    }
  }, [visitor, router]);

  // Countdown timer hook
  useEffect(() => {
    if (votingStatus !== "started" || !votingEndTime) {
      setTimeLeft("");
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(votingEndTime) - +new Date();
      if (difference <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const pad = (num: number) => String(num).padStart(2, "0");
      setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [votingStatus, votingEndTime]);

  // Compute voting state
  const votedGroupIds = activeVotes.map((v) => v.groupId);
  const hasFinishedVoting = activeVotes.length >= maxVotesLimit;

  // Generate leaf confetti particles on success (when user has completed all votes)
  useEffect(() => {
    if (hasFinishedVoting) {
      const particles = Array.from({ length: 30 }, (_, idx) => idx);
      setConfetti(particles);
    }
  }, [hasFinishedVoting]);

  // Pre-fill selected group if only 1 item in shortlist (and they haven't voted for it yet)
  useEffect(() => {
    const votedIds = activeVotes.map((v) => v.groupId);
    const unvotedShortlist = shortlist.filter(id => !votedIds.includes(id));
    if (unvotedShortlist.length === 1) {
      setSelectedGroupId(unvotedShortlist[0]);
    }
  }, [shortlist, activeVotes.length]);

  if (!visitor) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 20px" }}>
        <p>Mengalihkan ke halaman verifikasi...</p>
      </div>
    );
  }

  // Filter groups in shortlist that haven't been voted for yet
  const shortlistedGroups = groupsList.filter((g) => shortlist.includes(g.id) && !votedGroupIds.includes(g.id));
  
  // Filter all groups that haven't been voted for yet
  const unvotedGroups = groupsList.filter((g) => !votedGroupIds.includes(g.id));

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;

    setSubmitting(true);
    try {
      const code = await submitVote(selectedGroupId);
      if (code) {
        setSelectedGroupId(""); // Clear selection for next vote
      }
    } catch (err) {
      console.error("Gagal mengirim suara:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // 0.5 Check if Voting has not started
  if (votingStatus === "not_started" && activeVotes.length === 0) {
    return (
      <>
        <Header />
        <main className="container" style={{ paddingBottom: "120px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
          <div className="card" style={{ maxWidth: "500px", width: "100%", padding: "40px", textAlign: "center", border: "3px solid var(--color-delft-blue)", borderRadius: "var(--radius-md)", backgroundColor: "white", boxShadow: "6px 6px 0px var(--color-delft-blue)", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "var(--radius-sm)",
              border: "2px solid var(--color-delft-blue)",
              background: "var(--color-beige)",
              color: "var(--color-delft-blue)",
              boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
            }}>
              <Lock size={32} />
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>Voting Belum Dimulai</h2>
            <p style={{ fontSize: "0.95rem", opacity: 0.8, lineHeight: 1.6 }}>
              Sesi voting belum dibuka oleh panitia. Silakan tunggu informasi dari panitia pameran untuk mulai memberikan suara kelompok terfavorit Anda.
            </p>
          </div>
        </main>
      </>
    );
  }

  // 0.6 Check if Voting has ended and user has no votes
  if (votingStatus === "ended" && activeVotes.length === 0) {
    return (
      <>
        <Header />
        <main className="container" style={{ paddingBottom: "120px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
          <div className="card" style={{ maxWidth: "500px", width: "100%", padding: "40px", textAlign: "center", border: "3px solid var(--color-delft-blue)", borderRadius: "var(--radius-md)", backgroundColor: "white", boxShadow: "6px 6px 0px var(--color-delft-blue)", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "var(--radius-sm)",
              border: "2px solid var(--color-delft-blue)",
              background: "#ff6b6b",
              color: "white",
              boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
            }}>
              <Lock size={32} />
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>Sesi Voting Selesai</h2>
            <p style={{ fontSize: "0.95rem", opacity: 0.8, lineHeight: 1.6 }}>
              Sesi voting telah ditutup oleh panitia. Terima kasih atas partisipasi Anda dalam pameran Capstone Tech Jungle.
            </p>
          </div>
        </main>
      </>
    );
  }

  // 1. Tampilan Sukses Setelah Semua Vote Selesai ATAU Sesi Berakhir tapi sudah pernah vote
  if (hasFinishedVoting || (votingStatus === "ended" && activeVotes.length > 0)) {
    return (
      <>
        <Header />
        
        {/* Leaf Confetti Simulation (hanya jika memang berhasil selesai voting penuh) */}
        {hasFinishedVoting && (
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
        )}

        <main className="container" style={{ paddingBottom: "120px" }}>
          
          <div className="card success-card" style={{ border: "3px solid var(--color-delft-blue)", maxWidth: "680px", margin: "40px auto" }}>
            <div 
              style={{ 
                width: "70px", 
                height: "70px", 
                borderRadius: "50%", 
                backgroundColor: votingStatus === "ended" ? "#ff6b6b" : "var(--color-pistachio)", 
                border: "3px solid var(--color-delft-blue)",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                margin: "0 auto 24px auto",
                animation: "heartPulse 0.4s ease"
              }}
            >
              {votingStatus === "ended" ? (
                <Lock size={32} style={{ color: "white" }} />
              ) : (
                <CheckCircle2 size={36} style={{ color: "var(--color-delft-blue)" }} />
              )}
            </div>

            <h1 style={{ fontSize: "2rem", fontFamily: "var(--font-heading)", marginBottom: "8px", textTransform: "uppercase" }}>
              {votingStatus === "ended" ? "Sesi Voting Telah Ditutup" : "Seluruh Hak Suara Tercatat!"}
            </h1>
            <p style={{ fontSize: "0.95rem", opacity: 0.8, maxWidth: "480px", margin: "0 auto 28px auto" }}>
              {votingStatus === "ended" 
                ? "Sesi voting telah berakhir. Berikut adalah bukti hak suara yang berhasil Anda kirimkan sebelum sesi ditutup:"
                : `Terima kasih telah berpartisipasi. Anda telah memberikan suara untuk ${maxVotesLimit} kelompok capstone terfavorit Anda.`}
            </p>

            {/* List Rincian Pilihan */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left", marginTop: "24px" }}>
              {activeVotes.map((vote, idx) => {
                const votedGroup = groupsList.find((g) => g.id === vote.groupId);
                return (
                  <div 
                    key={vote.groupId}
                    style={{ 
                      padding: "16px 20px", 
                      border: "2px solid var(--color-delft-blue)",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--color-beige)",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <span style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-fern-green)" }}>
                          Pilihan Ke-{idx + 1}: {votedGroup?.booth_number}
                        </span>
                        <h3 style={{ fontSize: "1.05rem", fontFamily: "var(--font-heading)", marginTop: "2px", color: "var(--color-delft-blue)" }}>
                          {votedGroup?.name}
                        </h3>
                        <p style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "2px" }}>
                          Dicatat pada {new Date(vote.votedAt).toLocaleTimeString("id-ID")}
                        </p>
                      </div>
                      
                      <div style={{ textAlign: "right", minWidth: "120px" }}>
                        <span style={{ fontSize: "0.65rem", textTransform: "uppercase", fontWeight: "700", color: "var(--color-fern-green)", display: "block" }}>
                          Kode Bukti:
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                          <code style={{ fontSize: "0.85rem", fontWeight: "700", fontFamily: "monospace", color: "var(--color-delft-blue)" }}>
                            {vote.voteCode}
                          </code>
                          <button 
                            type="button"
                            onClick={() => handleCopyCode(vote.voteCode)}
                            style={{ 
                              background: "none", 
                              border: "none", 
                              cursor: "pointer", 
                              color: "var(--color-delft-blue)",
                              display: "inline-flex",
                              alignItems: "center",
                              padding: 0
                            }}
                            title="Salin Kode"
                          >
                            {copiedCode === vote.voteCode ? <Check size={14} style={{ color: "var(--color-fern-green)" }} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "36px" }}>
              <Link href="/dashboard-publik" className="btn btn-secondary" style={{ gap: "8px" }}>
                Lihat Hasil Live Leaderboard
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>

        </main>
      </>
    );
  }

  // 1.5 Tampilan Terkunci (Belum scan QR pintu keluar)
  if (!isVoteUnlocked) {
    return (
      <>
        <Header />
        <main className="container" style={{ paddingBottom: "120px" }}>
          
          <div className="card" style={{ maxWidth: "600px", margin: "var(--space-2xl) auto", textAlign: "center", padding: "48px var(--space-lg)" }}>
            <div 
              style={{ 
                width: "70px", 
                height: "70px", 
                borderRadius: "50%", 
                backgroundColor: "var(--color-beige)", 
                border: "3px solid var(--color-delft-blue)",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                margin: "0 auto 24px auto"
              }}
            >
              <Lock size={32} style={{ color: "var(--color-delft-blue)" }} />
            </div>

            <span className="badge" style={{ backgroundColor: "#ef4444", color: "white", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Voting Terkunci <Lock size={12} />
            </span>
            
            <h2 style={{ fontSize: "1.75rem", fontFamily: "var(--font-heading)", marginTop: "16px", marginBottom: "12px", textTransform: "uppercase" }}>
              Scan QR Pintu Keluar
            </h2>
            
            <p style={{ fontSize: "0.95rem", opacity: 0.9, lineHeight: "1.6", color: "var(--color-delft-blue)", maxWidth: "460px", margin: "0 auto 28px auto" }}>
              Untuk memastikan Anda telah meninjau dan mengunjungi booth pameran, silakan memindai QR Code khusus yang disediakan panitia di **Pintu Keluar (Exit Gate)** sebelum mengirimkan suara Anda.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "320px", margin: "0 auto" }}>
              <button 
                type="button"
                onClick={() => setQrScannerOpen(true)}
                className="btn btn-primary" 
                style={{ gap: "10px", justifyContent: "center" }}
              >
                <Unlock size={18} />
                Pindai QR Pintu Keluar
              </button>
            </div>

          </div>

        </main>
      </>
    );
  }

  // 2. Form Pemilihan Suara Final (Bila masih memiliki kuota vote)
  return (
    <>
      <Header />
      
      <main className="container" style={{ paddingBottom: "120px" }}>
        
        {/* Header Asimetris */}
        <div className="asymmetric-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div>
            <span className="badge">Verified Session</span>
            <span className="bg-text-shadow">CAST VOTE</span>
            <h1 style={{ color: "var(--color-delft-blue)" }}>Kirim Suara Anda</h1>
          </div>
          {timeLeft && (
            <div 
              style={{ 
                backgroundColor: "var(--color-pistachio)", 
                border: "2px solid var(--color-delft-blue)", 
                padding: "8px 16px", 
                borderRadius: "var(--radius-sm)",
                fontWeight: 700,
                fontSize: "0.9rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "3px 3px 0 0 var(--color-delft-blue)",
                marginBottom: "10px"
              }}
            >
              ⏱️ SISA WAKTU: <span style={{ fontFamily: "monospace", fontSize: "1.05rem" }}>{timeLeft}</span>
            </div>
          )}
        </div>

        <div className="split-layout" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          
          {/* Sisi Form */}
          <form onSubmit={handleSubmit} className="card" style={{ padding: "36px" }}>
            
            {/* Status Kuota Hak Suara */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.25rem", fontFamily: "var(--font-heading)" }}>
                Pilih Kelompok Capstone
              </h3>
              <span className="badge" style={{ backgroundColor: "var(--color-fern-green)", color: "white", fontSize: "0.8rem", padding: "4px 10px" }}>
                Kuota: {activeVotes.length} / {maxVotesLimit} Suara
              </span>
            </div>

            {/* Notifikasi Sukses Parsial */}
            {activeVotes.length > 0 && (
              <div 
                style={{ 
                  padding: "12px 16px", 
                  backgroundColor: "rgba(34, 197, 94, 0.1)", 
                  border: "2px solid #22c55e",
                  borderRadius: "var(--radius-sm)",
                  color: "#15803d",
                  marginBottom: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "500"
                }}
              >
                ✓ Suara ke-{activeVotes.length} berhasil dikirim! Silakan pilih kelompok berikutnya (Sisa kuota: {maxVotesLimit - activeVotes.length} suara).
              </div>
            )}
            
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
              /* Jika Shortlist Kosong / Semua Shortlist sudah di-vote */
              <div 
                style={{ 
                  padding: "16px", 
                  border: "2px dashed var(--color-delft-blue)", 
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-beige)",
                  marginBottom: "24px"
                }}
              >
                <p style={{ fontSize: "0.85rem", fontWeight: "700" }}>
                  {shortlist.length > 0 ? "Seluruh shortlist Anda sudah diberikan suara." : "Daftar favorit Anda kosong."}
                </p>
                <p style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "4px" }}>
                  Anda bisa memilih langsung melalui menu pilihan di bawah, atau kembali ke halaman utama untuk mengeksplorasi kelompok lainnya.
                </p>
                <Link href="/kelompok" style={{ fontSize: "0.8rem", color: "var(--color-fern-green)", fontWeight: 700, display: "inline-block", marginTop: "8px", textDecoration: "underline" }}>
                  Cari Kelompok Baru
                </Link>
              </div>
            )}

            {/* Pemilih Semua Kelompok (Dropdown Alternatif) */}
            <div className="form-group" style={{ marginTop: "24px" }}>
              <label htmlFor="allGroupsSelect">Pilih dari Semua Kelompok (Belum Anda Pilih):</label>
              <select
                id="allGroupsSelect"
                className="form-control"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                style={{ 
                  height: "52px", 
                  backgroundColor: "white", 
                  fontWeight: "500",
                  cursor: "pointer" 
                }}
              >
                <option value="">-- Pilih Kelompok Capstone --</option>
                {unvotedGroups.map((group) => (
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
              {submitting ? "Mengirim Suara..." : `Kirim Suara ke-${activeVotes.length + 1}`}
              <CheckCircle2 size={20} />
            </button>

            {/* Daftar Suara yang sudah diberikan di bagian bawah form */}
            {activeVotes.length > 0 && (
              <div style={{ marginTop: "32px", borderTop: "2px solid rgba(29, 42, 98, 0.1)", paddingTop: "24px" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--color-delft-blue)", marginBottom: "12px", textTransform: "uppercase" }}>
                  Kelompok yang Sudah Anda Beri Suara:
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {activeVotes.map((vote, idx) => {
                    const group = groupsList.find(g => g.id === vote.groupId);
                    return (
                      <div 
                        key={vote.groupId} 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          padding: "10px 14px", 
                          backgroundColor: "var(--color-white)", 
                          border: "1px solid var(--color-delft-blue)", 
                          borderRadius: "var(--radius-sm)",
                          opacity: 0.95
                        }}
                      >
                        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-delft-blue)" }}>
                          {idx + 1}. {group?.booth_number} &bull; {group?.name}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.75rem", fontFamily: "monospace", padding: "2px 6px", backgroundColor: "var(--color-beige)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "2px" }}>
                            {vote.voteCode}
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleCopyCode(vote.voteCode)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            title="Salin Kode"
                          >
                            {copiedCode === vote.voteCode ? <Check size={14} style={{ color: "var(--color-fern-green)" }} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </form>

          {/* Sisi Informasi Samping */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "12px" }}>
              Informasi Pengiriman Suara
            </h3>
            <p style={{ fontSize: "0.85rem", opacity: 0.9, lineHeight: "1.6" }}>
              Terima kasih telah berpartisipasi dalam pameran Capstone! Silakan pilih kelompok terfavorit Anda melalui menu pilihan di samping.
            </p>
            <ul style={{ fontSize: "0.85rem", opacity: 0.9, lineHeight: "1.6", marginTop: "12px", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}>Setiap pengunjung diperbolehkan memberikan suara hingga <strong>{maxVotesLimit} kelompok terfavorit</strong> yang berbeda.</li>
              <li style={{ marginBottom: "8px" }}>Pilihan Anda bersifat permanen dan tidak dapat diubah setelah dikirim.</li>
              <li>Sistem memverifikasi identitas dan jaringan untuk menjamin keabsahan hasil pemungutan suara.</li>
            </ul>
            
            <div 
              style={{ 
                marginTop: "24px", 
                padding: "16px", 
                borderLeft: "4px solid var(--color-fern-green)", 
                backgroundColor: "rgba(67, 113, 24, 0.05)",
                borderRadius: "var(--radius-sm)"
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-delft-blue)" }}>
                Identitas Pemilih
              </span>
              <p style={{ fontSize: "0.9rem", fontWeight: "600", marginTop: "4px", color: "var(--color-delft-blue)" }}>
                {visitor.name}
              </p>
              <p style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "2px", color: "var(--color-delft-blue)" }}>
                Kategori: {visitor.category}
              </p>
            </div>
          </div>

        </div>

      </main>
    </>
  );
}

