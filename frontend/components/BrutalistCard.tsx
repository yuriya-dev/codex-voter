"use client";

import React from "react";
import { useVoter } from "@/components/VoterContext";
import { Leaf, ShieldCheck, Heart, QrCode } from "lucide-react";

export default function BrutalistCard() {
  const { setQrScannerOpen, maxVotesLimit } = useVoter();

  return (
    <div 
      className="brutalist-card" 
      style={{ 
        overflow: "visible", 
        marginTop: "40px"
      }}
    >
      <div className="brutalist-card-pattern-grid" />
      <div className="brutalist-card-overlay-dots" />
      <div className="brutalist-bold-pattern">
        <svg viewBox="0 0 100 100">
          <path strokeDasharray="15 10" strokeWidth={10} stroke="var(--color-delft-blue)" fill="none" d="M0,0 L100,0 L100,100 L0,100 Z" />
        </svg>
      </div>
      <div className="brutalist-card-title-area" style={{ position: "relative", zIndex: 5 }}>
        <span>CODEX Voter</span>
        <span className="brutalist-card-tag">Live Booths</span>
      </div>
      <div className="brutalist-card-body" style={{ padding: 0, position: "relative", zIndex: 10 }}>
        {/* Mascot Container */}
        <div style={{ 
          width: "100%", 
          height: "240px", 
          backgroundColor: "var(--color-beige)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          borderBottom: "0.35em solid var(--color-delft-blue)",
          position: "relative",
          overflow: "visible"
        }}>
          <img 
            src="/hero.webp" 
            alt="Tech Jungle Mascot" 
            style={{ 
              height: "520px", 
              width: "auto", 
              objectFit: "contain",
              position: "absolute",
              bottom: "-150px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 5,
              filter: "drop-shadow(6px 6px 0px var(--color-delft-blue))",
              pointerEvents: "none"
            }}
          />
        </div>

        {/* Action Row */}
        <div style={{ 
          padding: "20px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "12px",
          position: "relative",
          zIndex: 10,
          backgroundColor: "var(--bg, #ffffff)",
          borderBottomLeftRadius: "0.35em",
          borderBottomRightRadius: "0.35em"
        }}>
          <p style={{ 
            fontSize: "0.85rem", 
            opacity: 0.95, 
            margin: 0, 
            fontWeight: "700", 
            lineHeight: "1.4",
            color: "var(--color-delft-blue)"
          }}>
            Pindai QR Code kelompok proyek di area pameran untuk menyimpannya ke favorit Anda, lalu kirim suara pilihan Anda sebelum keluar.
          </p>
          <button 
            className="brutalist-card-button" 
            onClick={() => setQrScannerOpen(true)}
            style={{ 
              width: "100%", 
              display: "flex", 
              justifyContent: "center", 
              gap: "8px", 
              fontSize: "1rem", 
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              position: "relative",
              zIndex: 12
            }}
          >
            Mulai Scan QR
          </button>
        </div>
      </div>
      <div className="brutalist-dots-pattern">
        <svg viewBox="0 0 80 40">
          <circle fill="var(--color-delft-blue)" r={3} cy={10} cx={10} />
          <circle fill="var(--color-delft-blue)" r={3} cy={10} cx={30} />
          <circle fill="var(--color-delft-blue)" r={3} cy={10} cx={50} />
          <circle fill="var(--color-delft-blue)" r={3} cy={10} cx={70} />
          <circle fill="var(--color-delft-blue)" r={3} cy={20} cx={20} />
          <circle fill="var(--color-delft-blue)" r={3} cy={20} cx={40} />
          <circle fill="var(--color-delft-blue)" r={3} cy={20} cx={60} />
          <circle fill="var(--color-delft-blue)" r={3} cy={30} cx={10} />
          <circle fill="var(--color-delft-blue)" r={3} cy={30} cx={30} />
          <circle fill="var(--color-delft-blue)" r={3} cy={30} cx={50} />
          <circle fill="var(--color-delft-blue)" r={3} cy={30} cx={70} />
        </svg>
      </div>
      <div className="brutalist-accent-shape" />
      <div className="brutalist-corner-slice" />
      <div className="brutalist-stamp">
        <span className="brutalist-stamp-text">Wild Tech</span>
      </div>
    </div>
  );
}
