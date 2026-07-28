"use client";

import { useState } from "react";
import { useVoter } from "@/components/VoterContext";
import { useRouter } from "next/navigation";
import { X, Trash2, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { getGroupImageUrl } from "@/lib/config";

export default function ShortlistDrawer() {
  const { shortlist, removeFromShortlist, isDrawerOpen, setIsDrawerOpen, groupsList, visitor } = useVoter();
  const router = useRouter();

  const shortlistedGroups = groupsList.filter((g) => shortlist.includes(g.id));
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const handleStartVote = () => {
    setIsDrawerOpen(false);
    if (visitor) {
      router.push("/vote");
    } else {
      router.push("/verifikasi");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`drawer-backdrop ${isDrawerOpen ? "open" : ""}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div className={`drawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Heart size={18} className="heart-active" />
            <h3 style={{ fontSize: "1.1rem", textTransform: "uppercase" }}>Shortlist Saya</h3>
            <span 
              style={{ 
                backgroundColor: "var(--color-delft-blue)", 
                color: "white", 
                fontSize: "0.75rem", 
                padding: "2px 8px", 
                borderRadius: "var(--radius-sm)",
                fontWeight: "700"
              }}
            >
              {shortlistedGroups.length}
            </span>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            style={{ 
              background: "none", 
              border: "none", 
              cursor: "pointer", 
              color: "var(--color-delft-blue)",
              display: "flex",
              alignItems: "center"
            }}
          >
            <X size={22} />
          </button>
        </div>

        <div className="drawer-body">
          {shortlistedGroups.length === 0 ? (
            <div 
              style={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "center", 
                alignItems: "center",
                textAlign: "center",
                color: "rgba(29, 42, 98, 0.6)",
                padding: "20px"
              }}
            >
              <Heart size={48} style={{ strokeWidth: "1.5px", marginBottom: "16px", color: "var(--color-carolina-blue)" }} />
              <p style={{ fontWeight: "600", marginBottom: "8px" }}>Belum ada kelompok tersimpan</p>
              <p style={{ fontSize: "0.85rem" }}>
                Jelajahi booth pameran, scan QR code di lokasi, atau tekan tombol hati pada kelompok yang Anda sukai.
              </p>
              <Link 
                href="/kelompok" 
                className="btn btn-secondary" 
                onClick={() => setIsDrawerOpen(false)}
                style={{ marginTop: "24px", fontSize: "0.8rem", padding: "10px 16px" }}
              >
                Mulai Jelajah
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "0.85rem", marginBottom: "10px", color: "rgba(29, 42, 98, 0.7)" }}>
                Kelompok-kelompok ini akan muncul sebagai opsi cepat saat Anda melakukan vote final.
              </p>
              {shortlistedGroups.map((group) => (
                <div 
                  key={group.id} 
                  style={{ 
                    display: "flex", 
                    gap: "12px", 
                    padding: "10px", 
                    border: "2px solid var(--color-delft-blue)", 
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "white",
                    position: "relative"
                  }}
                >
                  {/* Photo Thumbnail */}
                  {group.image && !failedImages[group.id] ? (
                    <div style={{ width: "60px", height: "60px", position: "relative", flexShrink: 0 }}>
                      {!loadedImages[group.id] && (
                        <div 
                          className="phantom-skeleton" 
                          style={{ 
                            position: "absolute", 
                            top: 0, 
                            left: 0, 
                            width: "60px", 
                            height: "60px", 
                            borderRadius: "var(--radius-sm)", 
                            border: "1px solid var(--color-delft-blue)" 
                          }} 
                        />
                      )}
                      <img 
                        src={getGroupImageUrl(group.image)} 
                        alt={group.name} 
                        onLoad={() => setLoadedImages(prev => ({ ...prev, [group.id]: true }))}
                        onError={() => setFailedImages(prev => ({ ...prev, [group.id]: true }))}
                        style={{ 
                          width: "60px", 
                          height: "60px", 
                          borderRadius: "var(--radius-sm)", 
                          objectFit: "cover",
                          border: "1px solid var(--color-delft-blue)",
                          opacity: loadedImages[group.id] ? 1 : 0,
                          transition: "opacity 0.2s ease",
                          position: loadedImages[group.id] ? "static" : "absolute",
                          top: 0,
                          left: 0
                        }} 
                      />
                    </div>
                  ) : (
                    <div 
                      style={{ 
                        width: "60px", 
                        height: "60px", 
                        borderRadius: "var(--radius-sm)", 
                        background: group.photoColor || "linear-gradient(135deg, var(--color-delft-blue), var(--color-pistachio))", 
                        flexShrink: 0,
                        border: "1px solid var(--color-delft-blue)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.7rem",
                        fontWeight: "700"
                      }}
                    >
                      {group.booth_number.replace("Booth ", "")}
                    </div>
                  )}
                  
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4px" }}>
                      <span style={{ fontSize: "0.65rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-fern-green)" }}>
                        {group.category}
                      </span>
                    </div>
                    <h4 
                      style={{ 
                        fontSize: "0.85rem", 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis",
                        color: "var(--color-delft-blue)",
                        marginTop: "2px"
                      }}
                    >
                      {group.name}
                    </h4>
                    <span style={{ fontSize: "0.75rem", color: "rgba(29, 42, 98, 0.7)" }}>
                      {group.booth_number}
                    </span>
                  </div>

                  {/* Action Delete */}
                  <button 
                    onClick={() => removeFromShortlist(group.id)}
                    style={{ 
                      background: "none", 
                      border: "none", 
                      cursor: "pointer", 
                      color: "#dc2626",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      alignSelf: "center"
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {shortlistedGroups.length > 0 && (
          <div className="drawer-footer">
            <button 
              className="btn btn-primary" 
              onClick={handleStartVote}
              style={{ width: "100%", gap: "10px" }}
            >
              Lanjut ke Vote Final
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
