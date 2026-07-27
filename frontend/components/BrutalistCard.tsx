"use client";

import React from "react";
import { useVoter } from "@/components/VoterContext";
import { Leaf, ShieldCheck, Heart, QrCode } from "lucide-react";

export default function BrutalistCard() {
  const { setQrScannerOpen, maxVotesLimit } = useVoter();

  return (
    <div className="brutalist-card">
      <div className="brutalist-card-pattern-grid" />
      <div className="brutalist-card-overlay-dots" />
      <div className="brutalist-bold-pattern">
        <svg viewBox="0 0 100 100">
          <path strokeDasharray="15 10" strokeWidth={10} stroke="var(--color-delft-blue)" fill="none" d="M0,0 L100,0 L100,100 L0,100 Z" />
        </svg>
      </div>
      <div className="brutalist-card-title-area">
        <span>CODEX Voter</span>
        <span className="brutalist-card-tag">Live Booths</span>
      </div>
      <div className="brutalist-card-body">
        <div className="brutalist-card-description">
          Gunakan handphone Anda untuk memindai QR Code di papan fisik setiap booth pameran, simpan kelompok ke daftar favorit, lalu kirim suara Anda saat selesai berkeliling.
        </div>
        <div className="brutalist-feature-grid">
          <div className="brutalist-feature-item">
            <div className="brutalist-feature-icon">
              <QrCode size={14} strokeWidth={2.5} />
            </div>
            <span className="brutalist-feature-text">Scan QR Booth</span>
          </div>
          <div className="brutalist-feature-item">
            <div className="brutalist-feature-icon">
              <Heart size={14} strokeWidth={2.5} />
            </div>
            <span className="brutalist-feature-text">Simpan Favorit</span>
          </div>
          <div className="brutalist-feature-item">
            <div className="brutalist-feature-icon">
              <ShieldCheck size={14} strokeWidth={2.5} />
            </div>
            <span className="brutalist-feature-text">Verifikasi Aman</span>
          </div>
          <div className="brutalist-feature-item">
            <div className="brutalist-feature-icon">
              <Leaf size={14} strokeWidth={2.5} />
            </div>
            <span className="brutalist-feature-text">Web & IoT Hijau</span>
          </div>
        </div>
        <div className="brutalist-card-actions">
          <div className="brutalist-price">
            <span className="brutalist-price-currency">{maxVotesLimit}</span> Suara
            <span className="brutalist-price-period">per pengunjung</span>
          </div>
          <button className="brutalist-card-button" onClick={() => setQrScannerOpen(true)}>
            Mulai Scan
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
