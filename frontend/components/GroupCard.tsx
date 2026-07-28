"use client";

import { useState } from "react";
import Link from "next/link";
import { useVoter } from "@/components/VoterContext";
import { Heart, ArrowUpRight } from "lucide-react";
import { Group } from "@/lib/data";
import { getGroupImageUrl } from "@/lib/config";

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  const { isShortlisted, addToShortlist, removeFromShortlist } = useVoter();
  const active = isShortlisted(group.id);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (active) {
      removeFromShortlist(group.id);
    } else {
      addToShortlist(group.id);
    }
  };

  return (
    <div className="card">
      {/* Category Tag */}
      <span className="card-tag">{group.category}</span>
      
      {/* Photo Wrapper with Sepia/Grayscale overlay */}
      <div className="card-image-wrapper">
        {group.image && !imageError ? (
          <>
            {!imageLoaded && (
              <div 
                className="phantom-skeleton" 
                style={{ 
                  position: "absolute", 
                  top: 0, 
                  left: 0, 
                  width: "100%", 
                  height: "100%" 
                }} 
              />
            )}
            <img 
              src={getGroupImageUrl(group.image)} 
              alt={group.name} 
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.3s ease",
                position: imageLoaded ? "static" : "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          </>
        ) : (
          <div 
            style={{ 
              width: "100%", 
              height: "100%", 
              background: group.photoColor || "linear-gradient(135deg, var(--color-delft-blue), var(--color-pistachio))",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontFamily: "var(--font-heading)",
              fontWeight: "700",
              fontSize: "2.5rem",
              textShadow: "2px 2px 0 var(--color-delft-blue)"
            }}
          >
            {group.booth_number.replace("Booth ", "")}
          </div>
        )}
        <span className="card-booth">{group.booth_number}</span>
      </div>

      {/* Content */}
      <h3 style={{ fontSize: "1.15rem", marginBottom: "8px", color: "var(--color-delft-blue)", fontFamily: "var(--font-heading)" }}>
        {group.name}
      </h3>
      
      <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "20px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "3.8rem" }}>
        {group.description}
      </p>

      {/* Action Footer */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <Link 
          href={`/kelompok/${group.slug}`} 
          className="btn btn-secondary" 
          style={{ 
            flex: 1, 
            fontSize: "0.8rem", 
            padding: "10px 14px",
            justifyContent: "center" 
          }}
        >
          Detail Kelompok
          <ArrowUpRight size={14} />
        </Link>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          className="btn"
          style={{
            padding: "10px",
            width: "42px",
            height: "42px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: active ? "var(--color-pistachio)" : "white",
            borderColor: "var(--color-delft-blue)",
            transition: "var(--transition-fast)"
          }}
          title={active ? "Hapus dari Shortlist" : "Simpan ke Shortlist"}
        >
          <Heart 
            size={18} 
            className={active ? "heart-active" : ""} 
            fill={active ? "#e63946" : "none"} 
            stroke={active ? "#e63946" : "var(--color-delft-blue)"} 
          />
        </button>
      </div>
    </div>
  );
}
