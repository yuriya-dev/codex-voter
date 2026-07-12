"use client";

import { useVoter } from "@/components/VoterContext";
import { useRouter } from "next/navigation";
import { X, Trash2, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

export default function ShortlistDrawer() {
  const { shortlist, removeFromShortlist, isDrawerOpen, setIsDrawerOpen, groupsList, visitor } = useVoter();
  const router = useRouter();

  const shortlistedGroups = groupsList.filter((g) => shortlist.includes(g.id));

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
                  <div 
                    style={{ 
                      width: "60px", 
                      height: "60px", 
                      borderRadius: "var(--radius-sm)", 
                      background: group.photoColor, 
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
