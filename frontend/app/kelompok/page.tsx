"use client";

import { useState, useRef, useEffect } from "react";
import { useVoter } from "@/components/VoterContext";
import GroupCard from "@/components/GroupCard";
import Header from "@/components/Header";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { value: "Semua", label: "Semua" },
  { value: "Pertanian & Agribisnis (Smart Farming)", label: "Smart Farming" },
  { value: "Kesehatan & Perawatan Lansia", label: "Kesehatan & Lansia" },
  { value: "Keamanan & Pengawasan (Smart Security)", label: "Smart Security" },
  { value: "Smart Home, Otomasi & Robotika", label: "Smart Home & Robotika" },
  { value: "Lingkungan, Konservasi & Mitigasi Bencana", label: "Lingkungan & Bencana" },
  { value: "Aksesibilitas & Asistif", label: "Aksesibilitas" },
  { value: "Keuangan (Fintech)", label: "Fintech" }
];

export default function KelompokPage() {
  const { groupsList } = useVoter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 2);
      setShowRightArrow(scrollWidth - scrollLeft - clientWidth > 2);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      const resizeObserver = new ResizeObserver(() => checkScroll());
      resizeObserver.observe(el);
      
      el.addEventListener("scroll", checkScroll);
      return () => {
        resizeObserver.disconnect();
        el.removeEventListener("scroll", checkScroll);
      };
    }
  }, [groupsList]);

  useEffect(() => {
    // Re-check scroll buttons when active category or search query changes
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

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
          <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
            <SlidersHorizontal size={16} style={{ color: "var(--color-delft-blue)", flexShrink: 0 }} />
            
            <div className="filter-scroll-wrapper">
              {/* Tombol Scroll Kiri */}
              {showLeftArrow && (
                <button
                  onClick={() => handleScroll("left")}
                  className="filter-scroll-btn filter-scroll-btn-left"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              {/* Efek Fade Kiri */}
              {showLeftArrow && <div className="filter-scroll-fade filter-scroll-fade-left" />}

              {/* Container Horizontal Scroll */}
              <div ref={scrollRef} className="filter-scroll-container">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    style={{
                      flexShrink: 0,
                      padding: "6px 14px",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      borderRadius: "var(--radius-sm)",
                      border: "2px solid var(--color-delft-blue)",
                      backgroundColor: activeCategory === cat.value ? "var(--color-fern-green)" : "white",
                      color: activeCategory === cat.value ? "white" : "var(--color-delft-blue)",
                      cursor: "pointer",
                      boxShadow: activeCategory === cat.value ? "2px 2px 0 0 var(--color-delft-blue)" : "1px 1px 0 0 var(--color-delft-blue)",
                      transition: "var(--transition-fast)"
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Efek Fade Kanan */}
              {showRightArrow && <div className="filter-scroll-fade filter-scroll-fade-right" />}

              {/* Tombol Scroll Kanan */}
              {showRightArrow && (
                <button
                  onClick={() => handleScroll("right")}
                  className="filter-scroll-btn filter-scroll-btn-right"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
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
