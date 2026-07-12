"use client";

import { useState } from "react";
import { useVoter } from "@/components/VoterContext";
import GroupCard from "@/components/GroupCard";
import Header from "@/components/Header";
import { Search, SlidersHorizontal } from "lucide-react";

const CATEGORIES = ["Semua", "IoT & Hardware", "Software & AI", "Software & Web"];

export default function KelompokPage() {
  const { groupsList } = useVoter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  // Filter groups
  const filteredGroups = groupsList.filter((group) => {
    const matchesSearch = 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.booth_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = 
      activeCategory === "Semua" || 
      group.category.toLowerCase().includes(activeCategory.split(" ")[0].toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header />
      
      <main className="container" style={{ paddingBottom: "100px" }}>
        
        {/* Header Asimetris */}
        <div className="asymmetric-header">
          <span className="badge">Teknologi Hijau</span>
          <span className="bg-text-shadow">BOOTH LIST</span>
          <h1 style={{ color: "var(--color-delft-blue)" }}>Daftar Kelompok Capstone</h1>
        </div>

        {/* Toolbar & Filter */}
        <div 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "16px",
            marginBottom: "32px"
          }}
        >
          {/* Input Search Asimetris */}
          <div style={{ position: "relative", width: "100%", maxWidth: "500px" }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Cari nama kelompok, booth, atau deskripsi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "42px", height: "48px" }}
            />
            <Search 
              size={18} 
              style={{ 
                position: "absolute", 
                left: "14px", 
                top: "15px", 
                color: "var(--color-delft-blue)",
                opacity: 0.6
              }} 
            />
          </div>

          {/* Filter Pills Category */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <SlidersHorizontal size={16} style={{ color: "var(--color-delft-blue)", marginRight: "8px" }} />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "6px 14px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  borderRadius: "var(--radius-sm)",
                  border: "2px solid var(--color-delft-blue)",
                  backgroundColor: activeCategory === cat ? "var(--color-fern-green)" : "white",
                  color: activeCategory === cat ? "white" : "var(--color-delft-blue)",
                  cursor: "pointer",
                  boxShadow: activeCategory === cat ? "2px 2px 0 0 var(--color-delft-blue)" : "1px 1px 0 0 var(--color-delft-blue)",
                  transition: "var(--transition-fast)"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List Groups */}
        {filteredGroups.length === 0 ? (
          <div 
            style={{ 
              textAlign: "center", 
              padding: "80px 20px", 
              border: "2px dashed var(--color-delft-blue)", 
              borderRadius: "var(--radius-sm)",
              backgroundColor: "white"
            }}
          >
            <p style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "8px" }}>Kelompok tidak ditemukan</p>
            <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>Coba bersihkan pencarian atau ganti filter kategori.</p>
          </div>
        ) : (
          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", 
              gap: "28px" 
            }}
          >
            {filteredGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}

      </main>
    </>
  );
}
