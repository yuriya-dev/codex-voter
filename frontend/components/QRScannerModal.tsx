"use client";

import { useEffect, useRef, useState } from "react";
import { useVoter } from "@/components/VoterContext";
import { X, Camera, Scan, CheckCircle, Loader2 } from "lucide-react";
import { Group } from "@/lib/data";

export default function QRScannerModal() {
  const { qrScannerOpen, setQrScannerOpen, addToShortlist, groupsList, unlockVoting } = useVoter();
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [simulatedScanResult, setSimulatedScanResult] = useState<Group | null>(null);
  const [simulatedUnlockResult, setSimulatedUnlockResult] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  const handleSimulateUnlock = () => {
    setSimulatedUnlockResult(true);
    unlockVoting();
    setTimeout(() => {
      setSimulatedUnlockResult(false);
      setQrScannerOpen(false);
    }, 1500);
  };

  // Menghentikan stream kamera jika ada yang aktif
  const stopCamera = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    setStream(null);
  };

  // Memulai stream kamera
  const startCamera = async () => {
    stopCamera();
    setCameraStatus('loading');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      activeStreamRef.current = s;
      setStream(s);
      setCameraStatus('granted');
    } catch (err) {
      console.warn("Kamera tidak diizinkan atau tidak tersedia:", err);
      setCameraStatus('denied');
    }
  };

  // Jalankan kamera saat scanner dibuka
  useEffect(() => {
    if (qrScannerOpen) {
      startCamera();
    } else {
      stopCamera();
      setCameraStatus('idle');
    }

    return () => {
      // Pastikan dibersihkan saat unmount
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
        activeStreamRef.current = null;
      }
    };
  }, [qrScannerOpen]);

  // Hubungkan stream ke elemen video setelah video dirender
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraStatus]);

  if (!qrScannerOpen) return null;

  const handleSimulateScan = (group: Group) => {
    setSimulatedScanResult(group);
    
    // Tambah ke shortlist
    addToShortlist(group.id);
    
    // Tutup scanner setelah 1.5 detik agar terlihat proses pemindaian
    setTimeout(() => {
      setSimulatedScanResult(null);
      setQrScannerOpen(false);
    }, 1500);
  };

  return (
    <div className="scanner-overlay">
      <div className="scanner-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Scan size={20} className="leaf-icon" style={{ color: "var(--color-pistachio)" }} />
          <h3 style={{ fontSize: "1.1rem", textTransform: "uppercase", fontFamily: "var(--font-heading)" }}>
            Scan QR Booth
          </h3>
        </div>
        <button 
          onClick={() => setQrScannerOpen(false)}
          style={{ 
            background: "rgba(255,255,255,0.1)", 
            border: "1px solid rgba(255,255,255,0.2)", 
            cursor: "pointer", 
            color: "white",
            padding: "8px",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center"
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div className="scanner-body">
        {simulatedScanResult ? (
          /* Tampilan Sukses Memindai */
          <div style={{ textAlign: "center", padding: "20px" }}>
            <CheckCircle size={64} style={{ color: "var(--color-pistachio)", marginBottom: "16px", animation: "heartPulse 0.4s" }} />
            <h4 style={{ fontSize: "1.25rem", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
              Berhasil Discan!
            </h4>
            <p style={{ color: "var(--color-carolina-blue)", fontWeight: "600", fontSize: "0.9rem" }}>
              {simulatedScanResult.booth_number} — {simulatedScanResult.name}
            </p>
            <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "8px" }}>
              Ditambahkan ke Shortlist Anda...
            </p>
          </div>
        ) : simulatedUnlockResult ? (
          /* Tampilan Sukses Unlock Pintu Keluar */
          <div style={{ textAlign: "center", padding: "20px" }}>
            <CheckCircle size={64} style={{ color: "var(--color-carolina-blue)", marginBottom: "16px", animation: "heartPulse 0.4s" }} />
            <h4 style={{ fontSize: "1.25rem", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
              Akses Voting Terbuka!
            </h4>
            <p style={{ color: "var(--color-pistachio)", fontWeight: "600", fontSize: "0.9rem" }}>
              QR Pintu Keluar Terdeteksi
            </p>
            <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "8px" }}>
              Membuka tombol vote final...
            </p>
          </div>
        ) : (
          /* Viewfinder Scan */
          <>
            <div className="scanner-viewfinder">
              {cameraStatus === 'granted' ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-md)" }}
                />
              ) : cameraStatus === 'loading' ? (
                <div 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "center", 
                    alignItems: "center",
                    padding: "20px",
                    textAlign: "center",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.8)"
                  }}
                >
                  <Loader2 
                    size={40} 
                    className="animate-spin"
                    style={{ color: "var(--color-pistachio)", marginBottom: "12px" }} 
                  />
                  <p style={{ fontWeight: "600", marginBottom: "4px" }}>Meminta akses kamera...</p>
                  <p style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                    Silakan izinkan akses kamera di browser Anda.
                  </p>
                </div>
              ) : (
                <div 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "center", 
                    alignItems: "center",
                    padding: "24px 20px",
                    textAlign: "center",
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.7)",
                    background: "rgba(255, 99, 99, 0.05)"
                  }}
                >
                  <Camera size={40} style={{ marginBottom: "12px", color: "#ff6b6b", opacity: 0.8 }} />
                  <p style={{ marginBottom: "6px", fontWeight: "600", color: "#ff6b6b", fontSize: "0.9rem" }}>
                    Akses Kamera Tidak Aktif
                  </p>
                  <p style={{ fontSize: "0.75rem", lineHeight: "1.4", marginBottom: "16px", opacity: 0.8 }}>
                    Izin kamera belum diberikan atau diblokir. Klik ikon gembok di sebelah alamat URL browser Anda untuk mengaktifkan izin kamera.
                  </p>
                  <button
                    onClick={startCamera}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "var(--transition-fast)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
                  >
                    🔄 Aktifkan Kamera
                  </button>
                </div>
              )}
            </div>
            
            <p style={{ marginTop: "24px", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", textAlign: "center", maxWidth: "280px" }}>
              Arahkan kamera ke QR Code kelompok yang terpasang di dinding booth pameran.
            </p>
          </>
        )}
      </div>

      {/* Simulator Panel (Untuk Testing Tanpa Kamera Fisik) */}
      <div 
        className="scanner-footer" 
        style={{ 
          background: "rgba(0,0,0,0.3)", 
          borderTop: "1px solid rgba(255,255,255,0.1)",
          maxHeight: "220px",
          overflowY: "auto",
          padding: "16px"
        }}
      >
        {/* Tombol Simulasi Exit QR */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <button
            onClick={handleSimulateUnlock}
            style={{
              background: "var(--color-pistachio)",
              border: "2px solid var(--color-delft-blue)",
              color: "var(--color-delft-blue)",
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8rem",
              fontWeight: "700",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "3px 3px 0 0 var(--color-delft-blue)",
              transition: "var(--transition-fast)"
            }}
          >
            🔒 Simulasi Scan QR Pintu Keluar
          </button>
        </div>

        <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-carolina-blue)", marginBottom: "12px", textAlign: "center" }}>
          Simulasi Scan QR Booth (Klik untuk Simulasi):
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
          {groupsList.map((group) => (
            <button
              key={group.id}
              onClick={() => handleSimulateScan(group)}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                cursor: "pointer",
                transition: "var(--transition-fast)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-fern-green)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            >
              {group.booth_number} ({group.slug.substring(0, 10)}...)
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
