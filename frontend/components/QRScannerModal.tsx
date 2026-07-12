"use client";

import { useEffect, useRef, useState } from "react";
import { useVoter } from "@/components/VoterContext";
import { X, Camera, Scan, CheckCircle } from "lucide-react";
import { Group } from "@/lib/data";

export default function QRScannerModal() {
  const { qrScannerOpen, setQrScannerOpen, addToShortlist, groupsList } = useVoter();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [simulatedScanResult, setSimulatedScanResult] = useState<Group | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Jalankan kamera saat scanner dibuka
  useEffect(() => {
    if (qrScannerOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          setHasCameraPermission(true);
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn("Kamera tidak diizinkan atau tidak tersedia:", err);
          setHasCameraPermission(false);
        });
    }

    return () => {
      // Matikan kamera saat modal ditutup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [qrScannerOpen]);

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
        ) : (
          /* Viewfinder Scan */
          <>
            <div className="scanner-viewfinder">
              {hasCameraPermission ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-md)" }}
                />
              ) : (
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
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.6)"
                  }}
                >
                  <Camera size={40} style={{ marginBottom: "12px", opacity: 0.5 }} />
                  <p style={{ marginBottom: "8px" }}>Akses kamera tidak aktif.</p>
                  <p style={{ fontSize: "0.75rem" }}>Gunakan simulasi scan di bawah untuk mencoba fitur ini.</p>
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
          overflowY: "auto"
        }}
      >
        <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-carolina-blue)", marginBottom: "12px" }}>
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
