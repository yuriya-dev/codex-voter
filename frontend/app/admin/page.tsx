"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useVoter } from "@/components/VoterContext";
import Link from "next/link";
import Header from "@/components/Header";
import AdminLayout from "@/components/AdminLayout";
import AdminLoginForm from "@/components/AdminLoginForm";
import { Upload, Plus, Trash2, Edit, CheckCircle2, FileText, AlertCircle, Users, LayoutDashboard, QrCode, Printer, Download, Play, Square, RotateCcw, Eye, EyeOff, AlertTriangle, Archive, History, Clock, Award } from "lucide-react";
import { getBackendUrl, getGroupImageUrl, EXIT_UNLOCK_TOKEN } from "@/lib/config";
import { compressImageClient } from "@/lib/imageCompressor";
import { useSearchParams } from "next/navigation";

const BACKEND_URL = getBackendUrl();

function AdminManagementContent() {
  const { groupsList, refreshGroupsList } = useVoter();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"groups" | "qr" | "voting">("groups");
  const [origin, setOrigin] = useState("http://localhost:3030");
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (tabParam === "groups" || tabParam === "qr" || tabParam === "voting") {
      setActiveTab(tabParam as "groups" | "qr" | "voting");
    }
  }, [tabParam]);

  const getQrUrl = (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;

  const printSingleQR = (title: string, subtitle: string, url: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    // Determine the type of QR
    const isWebsite = title.toLowerCase().includes("website");
    const isExitGate = title.toLowerCase().includes("pintu") || title.toLowerCase().includes("exit");
    
    let badgeText = "KARYA MAHASISWA";
    let ctaText = "TAMBAHKAN KE FAVORIT";
    let themeColor = "#437118"; // Fern Green
    let textThemeColor = "#ffffff";
    let cardTitle = subtitle;
    let cardSubtitle = "";
    let badgeClass = "group-badge";
    let categoryHtml = "";
    
    let mascotFile = "like.webp";
    if (isWebsite) {
      badgeText = "SISTEM VOTING";
      ctaText = "SCAN UNTUK VOTE";
      themeColor = "#1d2a62"; // Delft Blue
      textThemeColor = "#ffffff";
      cardTitle = "WEBSITE UTAMA";
      cardSubtitle = "Pindai untuk masuk ke sistem voting digital, daftarkan diri Anda, dan jelajahi karya.";
      badgeClass = "website-badge";
      mascotFile = "hero.webp";
    } else if (isExitGate) {
      badgeText = "VERIFIKASI FISIK";
      ctaText = "SCAN UNTUK MEMBUKA VOTE";
      themeColor = "#87aece"; // Carolina Blue
      textThemeColor = "#1d2a62";
      cardTitle = "PINTU KELUAR";
      cardSubtitle = "Pindai QR ini di gerbang keluar untuk membuka kunci tombol voting di handphone Anda.";
      badgeClass = "exit-badge";
      mascotFile = "exit.webp";
    } else {
      // It's a group
      cardTitle = subtitle; // Group Name
      cardSubtitle = "Project Showcase";
      badgeText = `BOOTH ${title}`;
      badgeClass = "group-badge";
      
      const groupItem = groupsList.find(g => g.booth_number === title || g.name === subtitle);
      if (groupItem && groupItem.category) {
        categoryHtml = `<div class="category">${groupItem.category}</div>`;
      }
    }

    const mascotUrl = `${origin}/${mascotFile}`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR - ${cardTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              text-align: center;
              background-color: #ffffff;
              color: #1d2a62;
            }
            .card {
              border: 2.5px solid #1d2a62;
              border-radius: 12px;
              padding: 30px 35px;
              width: 440px;
              box-shadow: 6px 6px 0px 0px #1d2a62;
              background-color: #ffffff;
              background-image: radial-gradient(rgba(29, 42, 98, 0.06) 1.5px, transparent 1.5px);
              background-size: 20px 20px;
              position: relative;
              box-sizing: border-box;
              margin: 50px auto;
            }
            
            /* Mascot Bottom Right Floating Illustration */
            .mascot-bottom-right {
              position: absolute;
              bottom: -60px; /* Floats over the bottom border! */
              right: -60px;  /* Floats over the right border! */
              height: 240px;
              z-index: 50;   /* On top of card borders and shadows! */
              display: flex;
              align-items: flex-end;
              justify-content: flex-end;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              pointer-events: none;
            }
            .mascot-bottom-right img {
              height: 100%;
              width: auto;
              object-fit: contain;
              display: block;
            }

            /* Mascot Top Left Floating Illustration */
            .mascot-top-left {
              position: absolute;
              top: -60px;   /* Floats over the top border! */
              left: -60px;  /* Floats over the left border! */
              height: 160px;
              z-index: 50;   /* On top of card borders and shadows! */
              display: flex;
              align-items: flex-start;
              justify-content: flex-start;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              pointer-events: none;
            }
            .mascot-top-left img {
              height: 100%;
              width: auto;
              object-fit: contain;
              display: block;
            }
            
            /* Tech corners */
            .tech-corner {
              position: absolute;
              width: 16px;
              height: 16px;
              border-color: #1d2a62;
              border-style: solid;
              pointer-events: none;
            }
            .tl { top: 12px; left: 12px; border-width: 3px 0 0 3px; }
            .tr { top: 12px; right: 12px; border-width: 3px 3px 0 0; }
            .bl { bottom: 12px; left: 12px; border-width: 0 0 3px 3px; }
            .br { bottom: 12px; right: 12px; border-width: 0 3px 3px 0; }
            
            .logo-container {
              margin-bottom: 16px;
              display: flex;
              justify-content: center;
            }
            .logo-container img {
              height: 34px;
              object-fit: contain;
            }
            
            .badge {
              font-family: 'Space Grotesk', sans-serif;
              font-weight: 700;
              font-size: 11px;
              letter-spacing: 2px;
              padding: 6px 14px;
              border-radius: 4px;
              display: inline-block;
              margin-bottom: 12px;
              border: 2px solid #1d2a62;
              text-transform: uppercase;
              box-shadow: 2px 2px 0px #1d2a62;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .website-badge {
              background-color: #87aece !important;
              color: #1d2a62 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .exit-badge {
              background-color: #f5f3d8 !important;
              color: #1d2a62 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .group-badge {
              background-color: #afd06e !important;
              color: #1d2a62 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            h1 {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 22px;
              font-weight: 700;
              margin: 0 0 8px 0;
              color: #1d2a62;
              text-transform: uppercase;
              letter-spacing: -0.5px;
              line-height: 1.2;
            }
            .category {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 11px;
              color: #437118;
              font-weight: 700;
              text-transform: uppercase;
              margin-top: 0px;
              margin-bottom: 15px;
              letter-spacing: 0.5px;
              opacity: 0.9;
            }
            .desc {
              font-size: 13px;
              line-height: 1.5;
              color: rgba(29, 42, 98, 0.85);
              margin: 0 0 16px 0;
              padding: 0 10px;
            }
            
            .qr-container {
              width: 220px;
              height: 220px;
              margin: 0 auto 20px auto;
              border: 1px solid rgba(29, 42, 98, 0.2);
              background: #ffffff;
              padding: 12px;
              position: relative;
              box-sizing: border-box;
            }
            .qr-container img {
              width: 100%;
              height: 100%;
              display: block;
            }
            
            .scanner-bracket {
              position: absolute;
              width: 12px;
              height: 12px;
              border-color: #1d2a62;
              border-style: solid;
            }
            .scanner-bracket.tl { top: 6px; left: 6px; border-width: 2px 0 0 2px; }
            .scanner-bracket.tr { top: 6px; right: 6px; border-width: 2px 2px 0 0; }
            .scanner-bracket.bl { bottom: 6px; left: 6px; border-width: 0 0 2px 2px; }
            .scanner-bracket.br { bottom: 6px; right: 6px; border-width: 0 2px 2px 0; }
            
            .cta-badge {
              font-family: 'Space Grotesk', sans-serif;
              font-weight: 700;
              font-size: 14px;
              padding: 10px 24px;
              border-radius: 4px;
              display: inline-block;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              border: 2px solid #1d2a62;
              box-shadow: 4px 4px 0px #1d2a62;
              background-color: ${themeColor} !important;
              color: ${textThemeColor} !important;
              margin-top: 5px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .tech-metadata {
              font-family: 'Space Grotesk', monospace;
              font-size: 9px;
              color: #87aece;
              letter-spacing: 2px;
              text-transform: uppercase;
              margin-top: 25px;
              display: flex;
              justify-content: center;
              gap: 8px;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <!-- Tech corners -->
            <div class="tech-corner tl"></div>
            <div class="tech-corner tr"></div>
            <div class="tech-corner bl"></div>
            <div class="tech-corner br"></div>
            
            <div class="logo-container">
              <img src="${origin}/logo.svg" alt="CODEX Logo" />
            </div>
            
            <div class="badge ${badgeClass}">${badgeText}</div>
            <h1>${cardTitle}</h1>
            ${categoryHtml}
            
            <p class="desc">${cardSubtitle}</p>
            
            <div class="qr-container">
              <div class="scanner-bracket tl"></div>
              <div class="scanner-bracket tr"></div>
              <div class="scanner-bracket bl"></div>
              <div class="scanner-bracket br"></div>
              <img src="${getQrUrl(url)}" alt="QR Code" />
            </div>
            
            <div class="cta-badge">${ctaText}</div>
            
            <div class="tech-metadata">
              <span>SYS: CODEX_V26</span>
              <span>•</span>
              <span>SECURE PORTAL</span>
              <span>•</span>
              <span>ID: ${Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
            </div>
            
            ${isExitGate ? `
            <!-- Mascot Top Left (Floating) -->
            <div class="mascot-top-left">
              <img src="${mascotUrl}" alt="Mascot" />
            </div>
            ` : `
            <!-- Mascot Bottom Right (Floating) -->
            <div class="mascot-bottom-right">
              <img src="${mascotUrl}" alt="Mascot" />
            </div>
            `}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printAllGroupQRs = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    let qrPagesHtml = groupsList.map(group => {
      const groupUrl = `${origin}/kelompok/${group.slug}?from=qr`;
      const cardHtml = `
        <div class="card">
          <!-- Tech corners -->
          <div class="tech-corner tl"></div>
          <div class="tech-corner tr"></div>
          <div class="tech-corner bl"></div>
          <div class="tech-corner br"></div>
          
          <div class="logo-container">
            <img src="${origin}/logo.svg" alt="CODEX Logo" />
          </div>
          
          <div class="badge group-badge">BOOTH ${group.booth_number}</div>
          <h2>${group.name}</h2>
          <div class="category">${group.category}</div>

          <div class="qr-container">
            <div class="scanner-bracket tl"></div>
            <div class="scanner-bracket tr"></div>
            <div class="scanner-bracket bl"></div>
            <div class="scanner-bracket br"></div>
            <img src="${getQrUrl(groupUrl)}" alt="QR Code" />
          </div>
          
          <div class="cta-badge">TAMBAHKAN KE FAVORIT</div>
          
          <div class="tech-metadata">
            <span>BOOTH ${group.booth_number}</span>
            <span>•</span>
            <span>SHOWCASE</span>
          </div>
          
          <!-- Mascot Bottom Right -->
          <div class="mascot-bottom-right">
            <img src="${origin}/like.webp" alt="Mascot" />
          </div>
        </div>
      `;
      
      return `
        <div class="group-container">
          ${cardHtml}
          <div class="cut-line"></div>
          ${cardHtml}
        </div>
      `;
    }).join("");
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Semua QR Kelompok</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              color: #1d2a62;
            }
            .group-container {
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-evenly;
              width: 100vw;
              height: 100vh;
              page-break-after: always;
              page-break-inside: avoid;
              box-sizing: border-box;
              padding: 0 30px;
            }
            .card {
              border: 2px solid #1d2a62;
              border-radius: 12px;
              padding: 20px 30px;
              width: 480px;
              height: 600px;
              box-shadow: 4px 4px 0px 0px #1d2a62;
              background-color: #ffffff;
              box-sizing: border-box;
              position: relative;
              background-image: radial-gradient(rgba(29, 42, 98, 0.05) 1.5px, transparent 1.5px);
              background-size: 18px 18px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            /* Mascot Bottom Right Illustration */
            .mascot-bottom-right {
              position: absolute;
              bottom: 12px;
              right: 12px;
              height: 120px;
              z-index: 10;
              display: flex;
              align-items: flex-end;
              justify-content: flex-end;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              pointer-events: none;
            }
            .mascot-bottom-right img {
              height: 100%;
              width: auto;
              object-fit: contain;
              display: block;
            }
            
            /* Tech corners */
            .tech-corner {
              position: absolute;
              width: 14px;
              height: 14px;
              border-color: #1d2a62;
              border-style: solid;
              pointer-events: none;
            }
            .tl { top: 10px; left: 10px; border-width: 3px 0 0 3px; }
            .tr { top: 10px; right: 10px; border-width: 3px 3px 0 0; }
            .bl { bottom: 10px; left: 10px; border-width: 0 0 3px 3px; }
            .br { bottom: 10px; right: 10px; border-width: 0 3px 3px 0; }
            
            .logo-container {
              display: flex;
              justify-content: center;
            }
            .logo-container img {
              height: 32px;
              object-fit: contain;
            }
            
            .badge {
              font-family: 'Space Grotesk', sans-serif;
              font-weight: 700;
              font-size: 11px;
              letter-spacing: 2px;
              padding: 6px 14px;
              border-radius: 4px;
              display: inline-block;
              border: 2px solid #1d2a62;
              text-transform: uppercase;
              box-shadow: 2px 2px 0px #1d2a62;
              background-color: #afd06e !important;
              color: #1d2a62 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            h2 {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 20px;
              margin: 0;
              text-transform: uppercase;
              color: #1d2a62;
              width: 100%;
              line-height: 1.25;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .category {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 11px;
              color: #437118;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              opacity: 0.9;
              width: 100%;
              line-height: 1.3;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            
            .qr-container {
              width: 200px;
              height: 200px;
              border: 1px solid rgba(29, 42, 98, 0.2);
              background: #ffffff;
              padding: 12px;
              position: relative;
              box-sizing: border-box;
            }
            .qr-container img {
              width: 100%;
              height: 100%;
              display: block;
            }
            
            .scanner-bracket {
              position: absolute;
              width: 12px;
              height: 12px;
              border-color: #1d2a62;
              border-style: solid;
            }
            .scanner-bracket.tl { top: 6px; left: 6px; border-width: 2px 0 0 2px; }
            .scanner-bracket.tr { top: 6px; right: 6px; border-width: 2px 2px 0 0; }
            .scanner-bracket.bl { bottom: 6px; left: 6px; border-width: 0 0 2px 2px; }
            .scanner-bracket.br { bottom: 6px; right: 6px; border-width: 0 2px 2px 0; }
            
            .cta-badge {
              font-family: 'Space Grotesk', sans-serif;
              font-weight: 700;
              font-size: 13px;
              padding: 8px 20px;
              border-radius: 4px;
              display: inline-block;
              letter-spacing: 1px;
              text-transform: uppercase;
              border: 2px solid #1d2a62;
              box-shadow: 3px 3px 0px #1d2a62;
              background-color: #437118 !important;
              color: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .tech-metadata {
              font-family: 'Space Grotesk', monospace;
              font-size: 8px;
              color: #87aece;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              display: flex;
              justify-content: center;
              gap: 6px;
              opacity: 0.7;
            }
            
            .cut-line {
              height: 85%;
              border-left: 1px dashed rgba(29, 42, 98, 0.3);
              margin: 0 15px;
              position: relative;
            }
            .cut-line::after {
              content: "✂";
              position: absolute;
              top: 10%;
              left: -7px;
              font-size: 12px;
              color: rgba(29, 42, 98, 0.4);
            }
            
            @media print {
              @page {
                size: landscape;
                margin: 0;
              }
              body {
                margin: 0;
              }
              .card {
                box-shadow: none;
              }
              .group-container {
                width: 100vw;
                height: 100vh;
                page-break-after: always;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${qrPagesHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Manual Form State
  const [name, setName] = useState("");
  const [boothNumber, setBoothNumber] = useState("");
  const [category, setCategory] = useState("Pertanian & Agribisnis (Smart Farming)");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [members, setMembers] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [overwrite, setOverwrite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [maxVotes, setMaxVotes] = useState(3);
  const [leaderboardVisible, setLeaderboardVisible] = useState("false");
  const [votingStatus, setVotingStatus] = useState("not_started");
  const [votingEndTime, setVotingEndTime] = useState("");
  const [showParticles, setShowParticles] = useState("false");
  const [timerMinutes, setTimerMinutes] = useState(60);
  const [adminTimeLeft, setAdminTimeLeft] = useState<string>("");
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [expandedSessions, setExpandedSessions] = useState<{[key: string]: boolean}>({});

  const toggleSessionExpand = (sessionId: string) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const handleExportSessionCSV = (session: any) => {
    const headers = ["ID Kelompok", "Booth", "Nama Kelompok", "Kategori", "Jumlah Vote"];
    const groupsData = session.groups || [];
    
    const rows = groupsData.length > 0 
      ? groupsData.map((g: any) => [g.id || "", g.booth_number || "", g.name || "", g.category || "", g.votes || 0])
      : [["", "", "Hanya ringkasan tersedia", "", session.topGroups || ""]];
      
    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map((e: any) => e.map((val: any) => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_sesi_${session.name.replace(/\s+/g, "_")}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [newSessionName, setNewSessionName] = useState("");
  const [archiving, setArchiving] = useState(false);

  // Edit State
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const startEditGroup = (group: any) => {
    setEditingGroupId(group.id);
    setName(group.name);
    setBoothNumber(group.booth_number);
    setCategory(group.category);
    setDescription(group.description || "");
    setFullDescription(group.fullDescription || group.description || "");
    setMembers(group.members ? group.members.join("; ") : "");
    setImageUrl(group.image || "");
  };

  const cancelEditGroup = () => {
    setEditingGroupId(null);
    setName("");
    setBoothNumber("");
    setCategory("Pertanian & Agribisnis (Smart Farming)");
    setDescription("");
    setFullDescription("");
    setMembers("");
    setImageUrl("");
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroupId || !name || !boothNumber || !category || !adminToken) return;

    // Auto convert Google Drive links to direct image source
    let finalImageUrl = imageUrl;
    if (imageUrl.includes("drive.google.com")) {
      const driveMatch = imageUrl.match(/\/file\/d\/(.+?)\/(view|edit|preview)/);
      if (driveMatch && driveMatch[1]) {
        finalImageUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/groups/${editingGroupId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name,
          booth_number: boothNumber,
          category,
          description,
          fullDescription: fullDescription || description,
          members,
          image: finalImageUrl
        })
      });

      if (response.status === 401) {
        handleLogout();
        setStatusMessage({ text: "Sesi admin kedaluwarsa atau tidak valid.", type: "error" });
        return;
      }

      if (response.ok) {
        setStatusMessage({ text: `Berhasil memperbarui kelompok: ${name}`, type: "success" });
        cancelEditGroup();
        refreshGroupsList();
      } else {
        const err = await response.json();
        setStatusMessage({ text: err.error || "Gagal memperbarui kelompok ke server.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Koneksi backend gagal.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Cek token saat halaman dibuka
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setAdminToken(token);
    }
  }, []);

  const handleArchiveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim() || !adminToken) return;

    if (!confirm("PENTING: Mengarsipkan sesi akan MENGHAPUS seluruh data pengunjung, IP, dan perolehan suara saat ini dari database untuk memulai sesi baru. Apakah Anda yakin?")) {
      return;
    }

    setArchiving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/settings/archive`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ sessionName: newSessionName })
      });

      if (res.status === 401) {
        handleLogout();
        setStatusMessage({ text: "Sesi admin kedaluwarsa atau tidak valid.", type: "error" });
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setStatusMessage({ text: `Sesi '${newSessionName}' berhasil diarsipkan dan database dibersihkan!`, type: "success" });
        setNewSessionName("");
        
        // Refresh groups list
        refreshGroupsList();
        
        // Refetch settings
        const settingsRes = await fetch(`${BACKEND_URL}/api/settings`);
        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          setMaxVotes(sData.max_votes || 3);
          setLeaderboardVisible(sData.leaderboard_visible || "false");
          setVotingStatus(sData.voting_status || "not_started");
          setVotingEndTime(sData.voting_end_time || "");
          setShowParticles(sData.show_particles || "false");
          try {
            const parsedHistory = JSON.parse(sData.session_history || "[]");
            setSessionHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
          } catch (e) {
            setSessionHistory([]);
          }
        }
      } else {
        const errData = await res.json();
        setStatusMessage({ text: errData.error || "Gagal mengarsipkan sesi.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Koneksi backend gagal saat mengarsipkan.", type: "error" });
    } finally {
      setArchiving(false);
    }
  };

  // Ambil data jika terautentikasi
  useEffect(() => {
    if (!adminToken) return;

    refreshGroupsList();
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          setMaxVotes(data.max_votes || 3);
          setLeaderboardVisible(data.leaderboard_visible || "false");
          setVotingStatus(data.voting_status || "not_started");
          setVotingEndTime(data.voting_end_time || "");
          setShowParticles(data.show_particles || "false");
          try {
            const parsedHistory = JSON.parse(data.session_history || "[]");
            setSessionHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
          } catch (e) {
            setSessionHistory([]);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil pengaturan:", err);
      }
    };
    fetchSettings();
  }, [adminToken]);

  // Timer countdown untuk tampilan admin
  useEffect(() => {
    if (votingStatus !== "started" || !votingEndTime) {
      setAdminTimeLeft("");
      return;
    }

    const calculateTime = () => {
      const diff = +new Date(votingEndTime) - +new Date();
      if (diff <= 0) {
        setAdminTimeLeft("Waktu Habis");
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setAdminTimeLeft(`${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [votingStatus, votingEndTime]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
  };

  const handleSaveSettings = async (updates: {
    max_votes?: number;
    leaderboard_visible?: string;
    voting_status?: string;
    voting_end_time?: string;
    show_particles?: string;
  }) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/settings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify(updates)
      });

      if (res.status === 401) {
        handleLogout();
        setStatusMessage({ text: "Sesi admin kedaluwarsa atau tidak valid.", type: "error" });
        return;
      }

      if (res.ok) {
        setStatusMessage({ text: "Pengaturan berhasil diperbarui!", type: "success" });
        if (updates.max_votes !== undefined) setMaxVotes(updates.max_votes);
        if (updates.leaderboard_visible !== undefined) setLeaderboardVisible(updates.leaderboard_visible);
        if (updates.voting_status !== undefined) setVotingStatus(updates.voting_status);
        if (updates.voting_end_time !== undefined) setVotingEndTime(updates.voting_end_time);
        if (updates.show_particles !== undefined) setShowParticles(updates.show_particles);
      } else {
        setStatusMessage({ text: "Gagal menyimpan pengaturan.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Koneksi backend gagal.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMaxVotes = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveSettings({ max_votes: maxVotes });
  };

  // CSV Parser
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];
    
    // Headers: name,booth_number,category,description,members,image
    const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, "").toLowerCase());
    
    const parsed: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const row: string[] = [];
      let inQuotes = false;
      let currentValue = "";
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentValue.replace(/^["']|["']$/g, "").trim());
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      row.push(currentValue.replace(/^["']|["']$/g, "").trim());
      
      const groupObj: any = {};
      headers.forEach((header, index) => {
        if (header) {
          groupObj[header] = row[index] || "";
        }
      });
      parsed.push(groupObj);
    }
    return parsed;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          const preview = parseCSV(text);
          setCsvPreview(preview);
          setStatusMessage({ text: `Berhasil memuat ${preview.length} baris data dari CSV.`, type: "success" });
        } catch (err) {
          setStatusMessage({ text: "Gagal memproses file CSV. Pastikan format kolom benar.", type: "error" });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatusMessage({ text: "Sedang mengompresi gambar...", type: "info" });

    try {
      // Compress the image client-side to keep it HD but extremely lightweight
      const { base64, fileName } = await compressImageClient(file);
      
      setStatusMessage({ text: "Mengunggah gambar terkompresi...", type: "info" });
      const res = await fetch(`${BACKEND_URL}/api/admin/upload-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          fileData: base64,
          fileName: fileName
        })
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.imageUrl);
        setStatusMessage({ text: `Berhasil mengunggah gambar ${file.name}!`, type: "success" });
      } else {
        const err = await res.json();
        setStatusMessage({ text: err.error || "Gagal mengunggah gambar.", type: "error" });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: err?.message || "Gagal memproses atau mengunggah gambar.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (csvPreview.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/upload-groups`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ groups: csvPreview, overwrite })
      });

      if (res.status === 401) {
        handleLogout();
        setStatusMessage({ text: "Sesi admin kedaluwarsa atau tidak valid.", type: "error" });
        return;
      }

      if (res.ok) {
        setStatusMessage({ text: `Sukses mengimpor ${csvPreview.length} kelompok!`, type: "success" });
        setCsvFile(null);
        setCsvPreview([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        refreshGroupsList();
      } else {
        setStatusMessage({ text: "Gagal mengimpor data ke server.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Koneksi backend gagal.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Add manual group
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !boothNumber || !category) return;

    // Auto convert Google Drive links to direct image source
    let finalImageUrl = imageUrl;
    if (imageUrl.includes("drive.google.com")) {
      const driveMatch = imageUrl.match(/\/file\/d\/(.+?)\/(view|edit|preview)/);
      if (driveMatch && driveMatch[1]) {
        finalImageUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/groups`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name,
          booth_number: boothNumber,
          category,
          description,
          fullDescription: fullDescription || description,
          members,
          image: finalImageUrl
        })
      });

      if (response.status === 401) {
        handleLogout();
        setStatusMessage({ text: "Sesi admin kedaluwarsa atau tidak valid.", type: "error" });
        return;
      }

      if (response.ok) {
        setStatusMessage({ text: `Berhasil menambahkan kelompok: ${name}`, type: "success" });
        setName("");
        setBoothNumber("");
        setDescription("");
        setFullDescription("");
        setMembers("");
        setImageUrl("");
        refreshGroupsList();
      } else {
        setStatusMessage({ text: "Gagal menambahkan kelompok ke server.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Koneksi backend gagal.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Delete Group
  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kelompok ini? Seluruh vote terasosiasi juga akan dihapus.")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/groups/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });

      if (res.status === 401) {
        handleLogout();
        setStatusMessage({ text: "Sesi admin kedaluwarsa atau tidak valid.", type: "error" });
        return;
      }

      if (res.ok) {
        setStatusMessage({ text: "Kelompok berhasil dihapus.", type: "success" });
        refreshGroupsList();
      } else {
        setStatusMessage({ text: "Gagal menghapus kelompok dari backend.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Koneksi backend gagal.", type: "error" });
    }
  };

  return (
    <AdminLayout>
      {!adminToken ? (
          <AdminLoginForm onLoginSuccess={(token) => setAdminToken(token)} />
        ) : (
          <>
            {/* Header Asimetris */}
            <div className="asymmetric-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
              <div>
                <span className="badge">Data Management</span>
                <span className="bg-text-shadow">MANAGE</span>
                <h1 style={{ color: "var(--color-delft-blue)" }}>Manajemen Kelompok Capstone</h1>
              </div>
            </div>

        {/* Notifikasi Status */}
        {statusMessage.text && (
          <div 
            style={{ 
              padding: "16px 20px", 
              border: "2px solid var(--color-delft-blue)",
              borderRadius: "var(--radius-sm)",
              backgroundColor: statusMessage.type === "success" ? "rgba(67, 113, 24, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: "var(--color-delft-blue)",
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
            }}
          >
            {statusMessage.type === "success" ? <CheckCircle2 size={20} style={{ color: "var(--color-fern-green)" }} /> : <AlertCircle size={20} style={{ color: "#ef4444" }} />}
            <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div 
          className="admin-tab-switcher"
          style={{ 
            display: "flex", 
            gap: "12px", 
            marginBottom: "32px",
            borderBottom: "2px solid var(--color-delft-blue)",
            paddingBottom: "1px",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={() => setActiveTab("groups")}
            style={{
              padding: "12px 20px",
              fontSize: "0.9rem",
              fontWeight: "700",
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              border: "2px solid var(--color-delft-blue)",
              borderBottom: activeTab === "groups" ? "2px solid white" : "2px solid var(--color-delft-blue)",
              backgroundColor: activeTab === "groups" ? "white" : "var(--color-beige)",
              color: "var(--color-delft-blue)",
              cursor: "pointer",
              borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
              marginBottom: "-2px",
              zIndex: activeTab === "groups" ? 2 : 1,
              boxShadow: activeTab === "groups" ? "none" : "3px 3px 0 0 var(--color-delft-blue)",
              transition: "all 0.2s ease"
            }}
          >
            📁 Manajemen Kelompok
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            style={{
              padding: "12px 20px",
              fontSize: "0.9rem",
              fontWeight: "700",
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              border: "2px solid var(--color-delft-blue)",
              borderBottom: activeTab === "qr" ? "2px solid white" : "2px solid var(--color-delft-blue)",
              backgroundColor: activeTab === "qr" ? "white" : "var(--color-beige)",
              color: "var(--color-delft-blue)",
              cursor: "pointer",
              borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
              marginBottom: "-2px",
              zIndex: activeTab === "qr" ? 2 : 1,
              boxShadow: activeTab === "qr" ? "none" : "3px 3px 0 0 var(--color-delft-blue)",
              transition: "all 0.2s ease"
            }}
          >
            📷 Manajemen QR Code
          </button>
          <button
            onClick={() => setActiveTab("voting")}
            style={{
              padding: "12px 20px",
              fontSize: "0.9rem",
              fontWeight: "700",
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              border: "2px solid var(--color-delft-blue)",
              borderBottom: activeTab === "voting" ? "2px solid white" : "2px solid var(--color-delft-blue)",
              backgroundColor: activeTab === "voting" ? "white" : "var(--color-beige)",
              color: "var(--color-delft-blue)",
              cursor: "pointer",
              borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
              marginBottom: "-2px",
              zIndex: activeTab === "voting" ? 2 : 1,
              boxShadow: activeTab === "voting" ? "none" : "3px 3px 0 0 var(--color-delft-blue)",
              transition: "all 0.2s ease"
            }}
          >
            🗳️ Manajemen Voting
          </button>
        </div>

        {activeTab === "groups" && (
          <div className="split-layout">
          
          {/* Kolom Kiri: Upload CSV & Form Manual */}
          <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
            
            {/* 1. Uploader CSV */}
            <div className="card">
              <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "16px", textTransform: "uppercase" }}>
                Import Kelompok via CSV
              </h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "20px" }}>
                Unggah berkas `.csv` berisi daftar kelompok secara massal. Pastikan baris pertama memiliki nama kolom berikut: <br />
                <code style={{ fontSize: "0.75rem", background: "var(--color-beige)", padding: "2px 6px", borderRadius: "4px" }}>
                  name, booth_number, category, description, members, image
                </code>
              </p>

              <form onSubmit={handleCSVUpload} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed var(--color-delft-blue)",
                    borderRadius: "var(--radius-sm)",
                    padding: "32px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: csvFile ? "rgba(135, 174, 206, 0.05)" : "var(--color-white)",
                    transition: "var(--transition-fast)"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-beige)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = csvFile ? "rgba(135, 174, 206, 0.05)" : "var(--color-white)"}
                >
                  <Upload size={32} style={{ margin: "0 auto 12px auto", color: "var(--color-fern-green)" }} />
                  <p style={{ fontWeight: "700", fontSize: "0.9rem" }}>
                    {csvFile ? csvFile.name : "Pilih atau Seret Berkas CSV ke Sini"}
                  </p>
                  <p style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "4px" }}>
                    Ukuran maksimum 5MB (.csv)
                  </p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".csv" 
                    style={{ display: "none" }} 
                  />
                </div>

                {csvPreview.length > 0 && (
                  <div style={{ padding: "12px", border: "1px dashed var(--color-delft-blue)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--color-beige)", fontSize: "0.8rem" }}>
                    <strong>Pratinjau Data:</strong> Menerima {csvPreview.length} baris kelompok. Contoh baris pertama: <em>{csvPreview[0].name || "Nama tidak terbaca"} ({csvPreview[0].booth_number || "Booth tidak terbaca"})</em>
                  </div>
                )}

                {/* Overwrite Checkbox */}
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={overwrite} 
                    onChange={(e) => setOverwrite(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "var(--color-fern-green)" }}
                  />
                  <span>Ganti / Bersihkan seluruh data lama di server (Overwrite)</span>
                </label>

                <button 
                  type="submit" 
                  disabled={loading || csvPreview.length === 0} 
                  className="btn btn-primary"
                  style={{ gap: "10px", height: "48px", justifyContent: "center" }}
                >
                  <FileText size={18} />
                  {loading ? "Mengimpor..." : "Proses & Simpan CSV"}
                </button>
              </form>
            </div>

            {/* 2. Tambah / Edit Kelompok Manual */}
            <div className="card" style={{ border: editingGroupId ? "3px solid var(--color-fern-green)" : "3px solid var(--color-delft-blue)" }}>
              <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "16px", textTransform: "uppercase", color: editingGroupId ? "var(--color-fern-green)" : "var(--color-delft-blue)" }}>
                {editingGroupId ? "✏️ Edit Kelompok" : "Tambah Kelompok Manual"}
              </h3>
              
              <form onSubmit={editingGroupId ? handleUpdateGroup : handleAddManual} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="name">Nama Proyek / Kelompok</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="form-control" 
                    placeholder="contoh: Arboris: Sensor Kelembaban..." 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="booth">Nomor Booth</label>
                    <input 
                      type="text" 
                      id="booth" 
                      className="form-control" 
                      placeholder="contoh: Booth A03" 
                      value={boothNumber} 
                      onChange={(e) => setBoothNumber(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="category">Kategori Proyek</label>
                    <select 
                      id="category" 
                      className="form-control" 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ height: "48px", backgroundColor: "white" }}
                    >
                      <option value="Pertanian & Agribisnis (Smart Farming)">Pertanian & Agribisnis (Smart Farming)</option>
                      <option value="Kesehatan & Perawatan Lansia">Kesehatan & Perawatan Lansia</option>
                      <option value="Keamanan & Pengawasan (Smart Security)">Keamanan & Pengawasan (Smart Security)</option>
                      <option value="Smart Home, Otomasi & Robotika">Smart Home, Otomasi & Robotika</option>
                      <option value="Lingkungan, Konservasi & Mitigasi Bencana">Lingkungan, Konservasi & Mitigasi Bencana</option>
                      <option value="Aksesibilitas & Asistif">Aksesibilitas & Asistif</option>
                      <option value="Keuangan (Fintech)">Keuangan (Fintech)</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="members">Nama Anggota (Pisahkan dengan titik koma ';')</label>
                  <input 
                    type="text" 
                    id="members" 
                    className="form-control" 
                    placeholder="contoh: Andi; Budi; Citra" 
                    value={members} 
                    onChange={(e) => setMembers(e.target.value)} 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="imageUrl">Gambar Kelompok (Tautan URL / Upload File)</label>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <input 
                      type="text" 
                      id="imageUrl" 
                      className="form-control" 
                      placeholder="Masukkan URL Gambar (atau tautan Google Drive)" 
                      value={imageUrl} 
                      onChange={(e) => setImageUrl(e.target.value)} 
                      style={{ flex: 1 }}
                    />
                    <input 
                      type="file" 
                      id="imageFile" 
                      accept="image/*" 
                      onChange={handleImageFileUpload}
                      style={{ display: "none" }}
                      ref={imageFileInputRef}
                    />
                    <button
                      type="button"
                      onClick={() => imageFileInputRef.current?.click()}
                      className="btn btn-secondary"
                      style={{ height: "48px", whiteSpace: "nowrap", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      Unggah File
                    </button>
                  </div>
                  
                  {/* Google Drive Link Converter Helper / Warning */}
                  {imageUrl.includes("drive.google.com") && (
                    <div style={{ fontSize: "0.75rem", color: "var(--color-fern-green)", marginTop: "6px", backgroundColor: "rgba(175, 208, 110, 0.1)", padding: "10px", borderRadius: "4px", border: "1px dashed var(--color-fern-green)", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div>💡 <strong>Tautan Google Drive terdeteksi.</strong> Kami akan mengonversinya secara otomatis agar gambar dapat ditampilkan langsung.</div>
                      <div style={{ color: "#e63946", fontWeight: "600" }}>⚠️ PENTING: Pastikan hak akses file di Google Drive sudah diatur ke "Siapa saja yang memiliki link dapat melihat" (Anyone with the link can view).</div>
                    </div>
                  )}

                  {/* Image Preview */}
                  {imageUrl && (
                    <div style={{ marginTop: "12px", position: "relative", width: "100%", height: "150px", border: "2px solid var(--color-delft-blue)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                      <img 
                        src={getGroupImageUrl(imageUrl)} 
                        alt="Pratinjau Unggahan" 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(239, 68, 68, 0.9)", color: "white", border: "2px solid var(--color-delft-blue)", borderRadius: "var(--radius-sm)", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", boxShadow: "2px 2px 0 0 var(--color-delft-blue)" }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="description">Deskripsi Singkat</label>
                  <textarea 
                    id="description" 
                    className="form-control" 
                    placeholder="Deskripsi singkat proyek untuk kartu utama..." 
                    rows={3} 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    style={{ fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button 
                    type="submit" 
                    disabled={loading || !name || !boothNumber} 
                    className="btn btn-primary"
                    style={{ 
                      flex: 2, 
                      gap: "10px", 
                      height: "48px", 
                      justifyContent: "center",
                      backgroundColor: editingGroupId ? "var(--color-fern-green)" : "var(--color-delft-blue)",
                      color: "white",
                      boxShadow: editingGroupId ? "3px 3px 0 0 var(--color-delft-blue)" : "3px 3px 0 0 var(--color-delft-blue)"
                    }}
                  >
                    {!editingGroupId && <Plus size={18} />}
                    {loading ? (editingGroupId ? "Menyimpan..." : "Menambahkan...") : (editingGroupId ? "Simpan Perubahan" : "Tambah Kelompok")}
                  </button>

                  {editingGroupId && (
                    <button 
                      type="button" 
                      onClick={cancelEditGroup} 
                      className="btn btn-secondary"
                      style={{ flex: 1, height: "48px", justifyContent: "center" }}
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

          </div>

          {/* Kolom Kanan: Daftar Kelompok Saat Ini & Statistik Hapus */}
          <div className="card" style={{ display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "20px", textTransform: "uppercase" }}>
              Daftar Kelompok Aktif ({groupsList.length})
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "800px", overflowY: "auto", paddingRight: "4px" }}>
              {groupsList.map((group) => (
                <div 
                  key={group.id} 
                  style={{ 
                    border: "2px solid var(--color-delft-blue)", 
                    borderRadius: "var(--radius-sm)", 
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "var(--color-white)"
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "white", backgroundColor: "var(--color-delft-blue)", padding: "1px 6px", borderRadius: "2px" }}>
                        {group.booth_number}
                      </span>
                      <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--color-fern-green)" }}>
                        {group.category}
                      </span>
                    </div>
                    <h4 style={{ fontSize: "0.95rem", color: "var(--color-delft-blue)", marginTop: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {group.name}
                    </h4>
                    <p style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Users size={12} />
                      {group.members.join(", ") || "Belum ada anggota"}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={() => startEditGroup(group)}
                      style={{
                        background: "rgba(175, 208, 110, 0.1)",
                        border: "1px solid var(--color-fern-green)",
                        color: "var(--color-fern-green)",
                        padding: "10px",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "var(--transition-fast)"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(175, 208, 110, 0.2)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(175, 208, 110, 0.1)"}
                      title="Edit Kelompok"
                    >
                      <Edit size={16} />
                    </button>

                    <button 
                      onClick={() => handleDeleteGroup(group.id)}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid #ef4444",
                        color: "#ef4444",
                        padding: "10px",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "var(--transition-fast)"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#ef4444" + "22"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                      title="Hapus Kelompok"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

        {activeTab === "voting" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "36px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
            
            {/* 0. Pengaturan Kuota Voting */}
            <div className="card" style={{ border: "2px solid var(--color-delft-blue)" }}>
              <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "12px", textTransform: "uppercase" }}>
                Pengaturan Kuota Voting Pengunjung
              </h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "20px" }}>
                Tentukan jumlah maksimum kelompok terfavorit yang boleh dipilih oleh setiap pengunjung pameran.
              </p>

              <form onSubmit={handleSaveMaxVotes} style={{ display: "flex", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
                <div className="form-group" style={{ flex: 1, minWidth: "150px", margin: 0 }}>
                  <label htmlFor="maxVotesLimitInput" style={{ marginBottom: "8px", display: "block" }}>Batas Maksimum Pilihan:</label>
                  <input 
                    id="maxVotesLimitInput"
                    type="number" 
                    min={1} 
                    max={10}
                    className="form-control" 
                    value={maxVotes} 
                    onChange={(e) => setMaxVotes(parseInt(e.target.value) || 1)}
                    style={{ height: "48px" }}
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary" 
                  style={{ height: "48px", padding: "0 24px", whiteSpace: "nowrap" }}
                >
                  {loading ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </form>
            </div>

            {/* 0.1 Pengaturan Sesi Voting & Live Leaderboard */}
            <div className="card" style={{ border: "2px solid var(--color-delft-blue)", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "4px", textTransform: "uppercase" }}>
                  Kontrol Sesi Voting & Live Leaderboard
                </h3>
                <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  Kelola status mulai/selesai voting, timer mundur, dan status penampilan leaderboard publik.
                </p>
              </div>

              {/* Status Sesi & Timer Info */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: "16px",
                background: "var(--color-beige)",
                padding: "16px",
                border: "2px solid var(--color-delft-blue)",
                borderRadius: "var(--radius-sm)",
                boxShadow: "2px 2px 0 0 var(--color-delft-blue)"
              }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.7 }}>Status Voting:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <span style={{ 
                      width: "12px", 
                      height: "12px", 
                      borderRadius: "50%", 
                      backgroundColor: votingStatus === "started" ? "#afd06e" : votingStatus === "ended" ? "#ff6b6b" : "var(--color-carolina-blue)" 
                    }} />
                    <strong style={{ fontSize: "1rem", textTransform: "uppercase" }}>
                      {votingStatus === "started" ? "Sesi Berjalan" : votingStatus === "ended" ? "Sesi Selesai" : "Belum Dimulai"}
                    </strong>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.7 }}>Timer Sesi:</span>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", marginTop: "4px", fontFamily: "monospace" }}>
                    {votingStatus === "started" ? (adminTimeLeft || "Menghitung...") : votingStatus === "ended" ? "Waktu Habis" : "Timer Nonaktif"}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.7 }}>Leaderboard Publik:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <strong style={{ fontSize: "1rem", textTransform: "uppercase", color: leaderboardVisible === "true" ? "var(--color-fern-green)" : "#ff6b6b" }}>
                      {leaderboardVisible === "true" ? "Ditampilkan" : "Disembunyikan"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Kontrol Sesi */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-delft-blue)" }}>Kelola Sesi</span>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
                  {votingStatus !== "started" ? (
                    <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "240px", alignItems: "flex-end", flexWrap: "wrap" }}>
                      <div className="form-group" style={{ flex: 1, minWidth: "100px", margin: 0 }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "bold", marginBottom: "8px", display: "block" }}>Durasi (Menit):</label>
                        <input 
                          type="number" 
                          min={1} 
                          max={360} 
                          value={timerMinutes} 
                          onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 1)}
                          className="form-control"
                          style={{ height: "48px" }}
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const endTime = new Date(Date.now() + timerMinutes * 60 * 1000).toISOString();
                          handleSaveSettings({ voting_status: "started", voting_end_time: endTime });
                        }}
                        className="btn btn-primary"
                        style={{ height: "48px", flex: 1.5, justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "8px" }}
                      >
                        <Play size={18} fill="currentColor" /> Mulai Voting
                      </button>
                      <button 
                        onClick={() => {
                          const endTime = new Date(Date.now() + 10 * 1000).toISOString();
                          handleSaveSettings({ voting_status: "started", voting_end_time: endTime });
                        }}
                        className="btn"
                        style={{ 
                          height: "48px", 
                          flex: 1, 
                          backgroundColor: "var(--color-pistachio)",
                          color: "var(--color-delft-blue)",
                          border: "2px solid var(--color-delft-blue)",
                          boxShadow: "3px 3px 0 0 var(--color-delft-blue)",
                          fontWeight: "bold",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px"
                        }}
                      >
                        <Clock size={18} /> Picu Hitung Mundur (10s)
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "12px", flex: 1.5, flexWrap: "wrap" }}>
                      <button 
                        onClick={() => handleSaveSettings({ voting_status: "ended" })}
                        className="btn"
                        style={{ 
                          flex: 1, 
                          minWidth: "150px", 
                          height: "48px", 
                          backgroundColor: "#ff6b6b", 
                          color: "white",
                          border: "2px solid var(--color-delft-blue)",
                          boxShadow: "3px 3px 0 0 var(--color-delft-blue)",
                          fontWeight: "bold",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px"
                        }}
                      >
                        <Square size={18} fill="currentColor" /> Hentikan Voting
                      </button>
                      <button 
                        onClick={() => {
                          const endTime = new Date(Date.now() + 10 * 1000).toISOString();
                          handleSaveSettings({ voting_status: "started", voting_end_time: endTime });
                        }}
                        className="btn"
                        style={{ 
                          flex: 1, 
                          minWidth: "180px", 
                          height: "48px", 
                          backgroundColor: "var(--color-pistachio)", 
                          color: "var(--color-delft-blue)",
                          border: "2px solid var(--color-delft-blue)",
                          boxShadow: "3px 3px 0 0 var(--color-delft-blue)",
                          fontWeight: "bold",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px"
                        }}
                      >
                        <Clock size={18} /> Picu Hitung Mundur (10s)
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={() => handleSaveSettings({ voting_status: "not_started", voting_end_time: "" })}
                    className="btn btn-secondary"
                    style={{ flex: 1, minWidth: "150px", height: "48px", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    <RotateCcw size={18} /> Reset Sesi
                  </button>
                </div>
              </div>

              {/* Kontrol Leaderboard */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px dashed var(--color-delft-blue)", paddingTop: "16px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-delft-blue)" }}>Tampilkan/Sembunyikan Hasil Leaderboard</span>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button 
                    onClick={() => handleSaveSettings({ leaderboard_visible: "true" })}
                    className="btn btn-primary"
                    style={{ 
                      flex: 1, 
                      minWidth: "160px",
                      height: "44px", 
                      backgroundColor: leaderboardVisible === "true" ? "var(--color-fern-green)" : "",
                      justifyContent: "center",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <Eye size={18} /> Buka Leaderboard
                  </button>
                  <button 
                    onClick={() => handleSaveSettings({ leaderboard_visible: "false" })}
                    className="btn btn-secondary"
                    style={{ 
                      flex: 1, 
                      minWidth: "160px",
                      height: "44px", 
                      backgroundColor: leaderboardVisible === "false" ? "#ff6b6b" : "",
                      color: leaderboardVisible === "false" ? "white" : "",
                      justifyContent: "center",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <EyeOff size={18} /> Sembunyikan Leaderboard
                  </button>
                </div>
              </div>

              {/* Kontrol Partikel Perayaan */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px dashed var(--color-delft-blue)", paddingTop: "16px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-delft-blue)" }}>Picu Partikel Perayaan (Confetti)</span>
                <p style={{ fontSize: "0.8rem", opacity: 0.8, margin: 0 }}>
                  Aktifkan efek hujan daun/partikel perayaan pada leaderboard utama. Partikel hanya akan muncul jika timer/sesi voting telah selesai.
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button 
                    onClick={() => handleSaveSettings({ show_particles: "true" })}
                    className="btn btn-primary"
                    style={{ 
                      flex: 1, 
                      minWidth: "160px",
                      height: "44px", 
                      backgroundColor: showParticles === "true" ? "var(--color-fern-green)" : "",
                      justifyContent: "center",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <Award size={18} /> Aktifkan Partikel
                  </button>
                  <button 
                    onClick={() => handleSaveSettings({ show_particles: "false" })}
                    className="btn btn-secondary"
                    style={{ 
                      flex: 1, 
                      minWidth: "160px",
                      height: "44px", 
                      backgroundColor: showParticles === "false" ? "#ff6b6b" : "",
                      color: showParticles === "false" ? "white" : "",
                      justifyContent: "center",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <EyeOff size={18} /> Nonaktifkan Partikel
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Arsipkan Sesi & Hard Reset */}
            <div className="card" style={{ border: "2px solid var(--color-delft-blue)", borderColor: "#ff6b6b" }}>
              <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "12px", textTransform: "uppercase", color: "#ff6b6b", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={20} /> Arsipkan Sesi & Bersihkan Database
              </h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "20px" }}>
                Gunakan fitur ini untuk menyelesaikan sesi pameran saat ini, menyimpan ringkasan suaranya ke dalam riwayat, dan membersihkan seluruh data pemilih (IP, Device Fingerprint, & Suara) untuk memulai sesi pemilu baru yang bersih.
              </p>

              <form onSubmit={handleArchiveSession} style={{ display: "flex", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
                <div className="form-group" style={{ flex: 1, minWidth: "240px", margin: 0 }}>
                  <label htmlFor="sessionNameInput" style={{ marginBottom: "8px", display: "block" }}>Nama Sesi Arsip (contoh: Hari 1 - Pagi):</label>
                  <input 
                    id="sessionNameInput"
                    type="text" 
                    placeholder="Masukkan nama sesi arsip..."
                    className="form-control" 
                    value={newSessionName} 
                    onChange={(e) => setNewSessionName(e.target.value)}
                    style={{ height: "48px" }}
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={archiving || !newSessionName.trim()}
                  className="btn" 
                  style={{ 
                    height: "48px", 
                    padding: "0 24px", 
                    whiteSpace: "nowrap",
                    backgroundColor: "#ff6b6b",
                    color: "white",
                    border: "2px solid var(--color-delft-blue)",
                    boxShadow: "3px 3px 0 0 var(--color-delft-blue)",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center"
                  }}
                >
                  {archiving ? "Mengarsipkan..." : <><Archive size={18} /> Arsipkan & Mulai Baru</>}
                </button>
              </form>
            </div>

            {/* Card 4: Riwayat Sesi */}
            <div className="card" style={{ border: "2px solid var(--color-delft-blue)" }}>
              <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", marginBottom: "16px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px" }}>
                <History size={20} /> Riwayat Sesi Terarsipkan
              </h3>
              
              {sessionHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px", border: "2px dashed var(--color-delft-blue)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--color-beige)" }}>
                  <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>Belum ada riwayat sesi yang diarsipkan.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {sessionHistory.map((session, idx) => (
                    <div 
                      key={session.id || idx}
                      style={{
                        padding: "16px",
                        border: "2px solid var(--color-delft-blue)",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--color-beige)",
                        boxShadow: "3px 3px 0 0 var(--color-delft-blue)",
                        textAlign: "left"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", borderBottom: "1px dashed var(--color-delft-blue)", paddingBottom: "10px", marginBottom: "10px" }}>
                        <strong style={{ fontSize: "1.05rem", color: "var(--color-delft-blue)" }}>
                          📁 {session.name}
                        </strong>
                        <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                          Diarsipkan: {new Date(session.archivedAt).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", fontSize: "0.85rem" }}>
                        <div>
                          <strong>Total Pengunjung:</strong> {session.totalVisitors} perangkat
                        </div>
                        <div>
                          <strong>Total Suara:</strong> {session.totalVotes} suara (kuota: {session.maxVotes})
                        </div>
                      </div>
                      <div style={{ marginTop: "12px", fontSize: "0.85rem", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "10px" }}>
                        <strong>3 Besar Pemenang Sesi:</strong>
                        <div style={{ marginTop: "4px", fontWeight: "600", color: "var(--color-fern-green)" }}>
                          {session.topGroups || "Tidak ada suara"}
                        </div>
                      </div>

                      {/* Detail Suara Kelompok & Ekspor CSV */}
                      <div style={{ 
                        marginTop: "16px", 
                        paddingTop: "12px", 
                        borderTop: "1px dashed var(--color-delft-blue)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button 
                            type="button"
                            onClick={() => toggleSessionExpand(session.id)}
                            className="btn"
                            style={{ 
                              fontSize: "0.75rem", 
                              padding: "6px 12px", 
                              height: "auto", 
                              backgroundColor: expandedSessions[session.id] ? "var(--color-pistachio)" : "var(--color-beige)",
                              color: "var(--color-delft-blue)",
                              border: "2px solid var(--color-delft-blue)",
                              boxShadow: "2px 2px 0 var(--color-delft-blue)",
                              cursor: "pointer",
                              fontWeight: "bold"
                            }}
                          >
                            {expandedSessions[session.id] ? "📁 Sembunyikan Rincian Suara" : "📂 Lihat Seluruh Suara Kelompok"}
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleExportSessionCSV(session)}
                            className="btn"
                            style={{ 
                              fontSize: "0.75rem", 
                              padding: "6px 12px", 
                              height: "auto", 
                              display: "inline-flex", 
                              alignItems: "center", 
                              gap: "4px",
                              backgroundColor: "var(--color-fern-green)",
                              color: "white",
                              border: "2px solid var(--color-delft-blue)",
                              boxShadow: "2px 2px 0 var(--color-delft-blue)",
                              cursor: "pointer",
                              fontWeight: "bold"
                            }}
                          >
                            <Download size={12} /> Ekspor Sesi (CSV)
                          </button>
                        </div>

                        {expandedSessions[session.id] && (
                          <div style={{ 
                            marginTop: "8px", 
                            backgroundColor: "white", 
                            border: "2px solid var(--color-delft-blue)", 
                            borderRadius: "var(--radius-sm)", 
                            padding: "12px",
                            maxHeight: "300px",
                            overflowY: "auto"
                          }}>
                            {(!session.groups || session.groups.length === 0) ? (
                              <p style={{ fontSize: "0.8rem", opacity: 0.7, margin: 0, fontStyle: "italic" }}>
                                Detail data kelompok untuk sesi ini tidak tersedia (sesi lama).
                              </p>
                            ) : (
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                                <thead>
                                  <tr style={{ borderBottom: "2px solid var(--color-delft-blue)" }}>
                                    <th style={{ padding: "6px 4px", fontWeight: "700" }}>Booth</th>
                                    <th style={{ padding: "6px 4px", fontWeight: "700" }}>Kelompok</th>
                                    <th style={{ padding: "6px 4px", fontWeight: "700" }}>Kategori</th>
                                    <th style={{ padding: "6px 4px", fontWeight: "700", textAlign: "right" }}>Suara</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {session.groups.map((group: any, gIdx: number) => (
                                    <tr key={group.id || gIdx} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                                      <td style={{ padding: "6px 4px", fontWeight: "600", color: "var(--color-fern-green)" }}>{group.booth_number}</td>
                                      <td style={{ padding: "6px 4px", fontWeight: "500" }}>{group.name}</td>
                                      <td style={{ padding: "6px 4px", opacity: 0.8 }}>{group.category}</td>
                                      <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: "700" }}>{group.votes}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "qr" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
            {/* Row 1: Web Utama & Pintu Keluar QR Codes */}
            <div className="split-layout" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
              {/* Card 1: QR Web Utama */}
              <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
                <span className="badge" style={{ backgroundColor: "var(--color-carolina-blue)" }}>Web Utama</span>
                <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>QR Website Utama</h3>
                <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  Ditempatkan di meja registrasi agar pengunjung dapat langsung membuka situs web voting.
                </p>
                <div style={{ 
                  border: "3px solid var(--color-delft-blue)", 
                  padding: "12px", 
                  borderRadius: "var(--radius-sm)", 
                  backgroundColor: "white",
                  boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
                }}>
                  <img 
                    src={getQrUrl(`${origin}/`)} 
                    alt="QR Web Utama" 
                    style={{ width: "200px", height: "200px", display: "block" }} 
                  />
                </div>
                <div style={{ fontSize: "0.75rem", fontFamily: "monospace", wordBreak: "break-all", background: "var(--color-beige)", padding: "4px 8px", border: "1px dashed var(--color-delft-blue)" }}>
                  {origin}/
                </div>
                <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                  <button 
                    onClick={() => printSingleQR("Website Utama", "Scan untuk masuk ke sistem voting", `${origin}/`)}
                    className="btn btn-primary" 
                    style={{ flex: 1, gap: "8px", justifyContent: "center", height: "42px" }}
                  >
                    <Printer size={16} /> Print
                  </button>
                  <a 
                    href={getQrUrl(`${origin}/`)} 
                    download="qr_web_utama.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary" 
                    style={{ flex: 1, gap: "8px", justifyContent: "center", height: "42px", display: "inline-flex", alignItems: "center" }}
                  >
                    <Download size={16} /> Unduh
                  </a>
                </div>
              </div>

              {/* Card 2: QR Pintu Keluar */}
              <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
                <span className="badge" style={{ backgroundColor: "#ff6b6b", color: "white" }}>Exit Gate Only</span>
                <h3 style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>QR Pintu Keluar (Exit Gate)</h3>
                <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  Ditempatkan di pintu keluar. Wajib dipindai pengunjung untuk membuka kunci tombol kirim suara.
                </p>
                <div style={{ 
                  border: "3px solid var(--color-delft-blue)", 
                  padding: "12px", 
                  borderRadius: "var(--radius-sm)", 
                  backgroundColor: "white",
                  boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
                }}>
                  <img 
                    src={getQrUrl(`${origin}/?unlock=${EXIT_UNLOCK_TOKEN}`)} 
                    alt="QR Pintu Keluar" 
                    style={{ width: "200px", height: "200px", display: "block" }} 
                  />
                </div>
                <div style={{ fontSize: "0.75rem", fontFamily: "monospace", wordBreak: "break-all", background: "var(--color-beige)", padding: "4px 8px", border: "1px dashed var(--color-delft-blue)" }}>
                  {origin}/?unlock={EXIT_UNLOCK_TOKEN}
                </div>
                <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                  <button 
                    onClick={() => printSingleQR("Pintu Keluar (Exit Gate)", "Pindai untuk membuka kunci tombol voting", `${origin}/?unlock=${EXIT_UNLOCK_TOKEN}`)}
                    className="btn btn-primary" 
                    style={{ flex: 1, gap: "8px", justifyContent: "center", height: "42px" }}
                  >
                    <Printer size={16} /> Print
                  </button>
                  <a 
                    href={getQrUrl(`${origin}/?unlock=${EXIT_UNLOCK_TOKEN}`)} 
                    download="qr_pintu_keluar.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary" 
                    style={{ flex: 1, gap: "8px", justifyContent: "center", height: "42px", display: "inline-flex", alignItems: "center" }}
                  >
                    <Download size={16} /> Unduh
                  </a>
                </div>
              </div>
            </div>

            {/* Row 2: Kelompok QR Codes Grid */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "1.3rem", fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>QR Code Kelompok Capstone ({groupsList.length})</h3>
                  <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "4px" }}>
                    QR Code otomatis dibuat untuk setiap kelompok baru. Tempelkan di booth kelompok fisik agar pengunjung dapat memindai untuk menambahkannya ke shortlist.
                  </p>
                </div>
                <button 
                  onClick={printAllGroupQRs}
                  className="btn btn-primary"
                  style={{ gap: "8px", height: "44px", boxShadow: "4px 4px 0 0 var(--color-delft-blue)" }}
                  disabled={groupsList.length === 0}
                >
                  <Printer size={18} /> Print Semua QR Kelompok (Grid)
                </button>
              </div>

              {groupsList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", border: "2px dashed var(--color-delft-blue)", borderRadius: "var(--radius-sm)" }}>
                  <p style={{ fontWeight: 600 }}>Belum ada data kelompok.</p>
                  <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>Tambahkan kelompok di tab "Kelompok & Pengaturan" terlebih dahulu.</p>
                </div>
              ) : (
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
                  gap: "20px" 
                }}>
                  {groupsList.map((group) => {
                    const groupUrl = `${origin}/kelompok/${group.slug}?from=qr`;
                    return (
                      <div 
                        key={group.id} 
                        style={{ 
                          border: "2px solid var(--color-delft-blue)", 
                          borderRadius: "var(--radius-sm)", 
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          backgroundColor: "var(--color-white)",
                          boxShadow: "3px 3px 0 0 var(--color-delft-blue)",
                          gap: "12px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "white", backgroundColor: "var(--color-delft-blue)", padding: "2px 8px", borderRadius: "2px" }}>
                            {group.booth_number}
                          </span>
                        </div>
                        <h4 style={{ fontSize: "0.9rem", color: "var(--color-delft-blue)", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                          {group.name}
                        </h4>
                        <div style={{ 
                          border: "1px solid var(--color-delft-blue)",
                          padding: "6px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "white"
                        }}>
                          <img 
                            src={getQrUrl(groupUrl)} 
                            alt={`QR ${group.booth_number}`} 
                            style={{ width: "120px", height: "120px", display: "block" }} 
                          />
                        </div>
                        <div style={{ display: "flex", gap: "8px", width: "100%", marginTop: "auto" }}>
                          <button 
                            onClick={() => printSingleQR(group.booth_number, group.name, groupUrl)}
                            className="btn btn-secondary" 
                            style={{ flex: 1, padding: "0", height: "36px", fontSize: "0.8rem", gap: "4px", justifyContent: "center" }}
                          >
                            <Printer size={14} /> Print
                          </button>
                          <a 
                            href={getQrUrl(groupUrl)} 
                            download={`qr_${group.booth_number}.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn" 
                            style={{ 
                              flex: 1, 
                              padding: "0", 
                              height: "36px", 
                              fontSize: "0.8rem", 
                              gap: "4px", 
                              justifyContent: "center", 
                              display: "inline-flex", 
                              alignItems: "center",
                              border: "1px solid var(--color-delft-blue)",
                              backgroundColor: "var(--color-white)",
                              color: "var(--color-delft-blue)"
                            }}
                          >
                            <Download size={14} /> Unduh
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </>
    )}
    </AdminLayout>
  );
}

export default function AdminManagementPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "40px", textAlign: "center" }}>Memuat halaman admin...</div>}>
      <AdminManagementContent />
    </Suspense>
  );
}
