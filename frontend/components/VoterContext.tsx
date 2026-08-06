"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getBackendUrl, EXIT_UNLOCK_TOKEN } from "@/lib/config";
import { supabase } from "@/lib/supabase";

const BACKEND_URL = getBackendUrl();

// Generate a stable hardware/canvas-based fingerprint
function generateStableFingerprint(): string {
  if (typeof window === "undefined") return "server_side";
  
  try {
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const language = window.navigator.language || "";
    const userAgent = window.navigator.userAgent || "";
    
    let canvasHash = "";
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.fillText("CodexVoter-Secure-FP! 😃", 2, 15);
        canvasHash = canvas.toDataURL().slice(-150); // take a small slice of rendering data
      }
    } catch (e) {
      canvasHash = "canvas_blocked";
    }
    
    const rawString = `${screenInfo}|${timeZone}|${language}|${userAgent}|${canvasHash}`;
    
    // Compute simple string hash
    let hash = 0;
    for (let i = 0; i < rawString.length; i++) {
      const char = rawString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Return a stable hash identifier
    return `hw_${Math.abs(hash).toString(36)}_${window.screen.width}x${window.screen.height}`;
  } catch (err) {
    // Fallback if everything else fails
    return "hw_fallback_" + Math.random().toString(36).substring(2, 9);
  }
}


export interface Group {
  id: string;
  name: string;
  slug: string;
  booth_number: string;
  category: string;
  description: string;
  fullDescription: string;
  members: string[];
  photoColor: string;
  image?: string;
  stats: {
    votes: number;
  };
}

interface Visitor {
  identifier: string;
  name: string;
  category: string;
  verifiedAt: string;
  deviceFingerprint: string;
  universitas?: string;
  sekolah?: string;
  instansi?: string;
}

interface Vote {
  visitorIdentifier: string;
  groupId: string;
  voteCode: string;
  votedAt: string;
}

interface VoterContextType {
  shortlist: string[];
  addToShortlist: (id: string) => void;
  removeFromShortlist: (id: string) => void;
  isShortlisted: (id: string) => boolean;
  visitor: Visitor | null;
  activeVote: Vote | null; // Keep for backward compatibility (last cast vote)
  activeVotes: Vote[];
  maxVotesLimit: number;
  votingStatus: string;
  votingEndTime: string;
  verifyOTP: (name: string, category: string, extraFields?: { universitas?: string; sekolah?: string; instansi?: string }) => Promise<boolean>;
  submitVote: (groupId: string | string[]) => Promise<any>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  qrScannerOpen: boolean;
  setQrScannerOpen: (open: boolean) => void;
  groupsList: Group[];
  refreshGroupsList: () => Promise<void>;
  isVoteUnlocked: boolean;
  unlockVoting: () => void;
  refreshSettings: () => Promise<void>;
  googleUser: any;
  loginWithGoogle: () => Promise<void>;
  logoutGoogle: () => Promise<void>;
}

const VoterContext = createContext<VoterContextType | undefined>(undefined);

export function VoterProvider({ children }: { children: React.ReactNode }) {
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [activeVote, setActiveVote] = useState<Vote | null>(null);
  const [activeVotes, setActiveVotes] = useState<Vote[]>([]);
  const [maxVotesLimit, setMaxVotesLimit] = useState<number>(3);
  const [votingStatus, setVotingStatus] = useState<string>("not_started");
  const [votingEndTime, setVotingEndTime] = useState<string>("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [groupsList, setGroupsList] = useState<Group[]>([]);
  const [isVoteUnlocked, setIsVoteUnlocked] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);

  // Google OAuth Login
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/verifikasi`,
      },
    });
    if (error) {
      console.error("Gagal login dengan Google:", error.message);
      alert("Gagal login dengan Google: " + error.message);
    }
  };

  // Google OAuth Logout
  const logoutGoogle = async () => {
    await supabase.auth.signOut();
    setGoogleUser(null);
    setVisitor(null);
    setActiveVote(null);
    setActiveVotes([]);
    localStorage.removeItem("voter_visitor");
    localStorage.removeItem("voter_active_vote");
    localStorage.removeItem("voter_active_votes");
    localStorage.removeItem("voter_shortlist");
    localStorage.removeItem("voter_is_unlocked");
  };

  // Fetch groups list from Backend API
  const refreshGroupsList = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/groups`);
      if (res.ok) {
        let data = await res.json();
        
        // Normalisasi URL gambar agar siap pakai di frontend
        if (Array.isArray(data)) {
          data = data.map((g: any) => {
            if (g.image && !g.image.startsWith("http") && !g.image.startsWith("data:")) {
              g.image = `${BACKEND_URL}${g.image}`;
            }
            return g;
          });
        }

        setGroupsList(data);

        // Bersihkan ID kelompok yang tidak valid dari shortlist (misal setelah reset data admin)
        if (Array.isArray(data)) {
          const savedShortlist = localStorage.getItem("voter_shortlist");
          if (savedShortlist) {
            try {
              const parsed = JSON.parse(savedShortlist);
              if (Array.isArray(parsed)) {
                const valid = parsed.filter(id => data.some(g => g.id === id));
                if (valid.length !== parsed.length) {
                  setShortlist(valid);
                  localStorage.setItem("voter_shortlist", JSON.stringify(valid));
                }
              }
            } catch (e) {
              console.error("Gagal memproses parsing shortlist dari localStorage:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Gagal memuat daftar kelompok dari backend:", err);
    }
  };

  // Fetch settings from Backend API
  const refreshSettings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setMaxVotesLimit(data.max_votes || 3);
        setVotingStatus(data.voting_status || "not_started");
        setVotingEndTime(data.voting_end_time || "");
      }
    } catch (err) {
      console.error("Gagal memuat batas voting dari backend:", err);
    }
  };

  const unlockVoting = () => {
    setIsVoteUnlocked(true);
    localStorage.setItem("voter_is_unlocked", "true");
  };

  // Load from localStorage & fetch groups on mount
  useEffect(() => {
    refreshGroupsList();
    refreshSettings();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setGoogleUser(session.user);
        
        // Redirect if they just returned from Google login to the home page instead of /verifikasi
        if (typeof window !== "undefined" && window.location.pathname === "/") {
          const hasAuthParams = window.location.hash.includes("access_token") || window.location.search.includes("code=");
          if (hasAuthParams) {
            window.location.href = "/verifikasi";
          }
        }
      } else {
        setGoogleUser(null);
      }
    });

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setGoogleUser(session.user);
        
        // Redirect if they just returned from Google login to the home page instead of /verifikasi
        if (typeof window !== "undefined" && window.location.pathname === "/") {
          const hasAuthParams = window.location.hash.includes("access_token") || window.location.search.includes("code=");
          if (hasAuthParams) {
            window.location.href = "/verifikasi";
          }
        }
      }
    });
    
    if (typeof window !== "undefined") {
      const savedShortlist = localStorage.getItem("voter_shortlist");
      const savedVisitor = localStorage.getItem("voter_visitor");
      const savedVote = localStorage.getItem("voter_active_vote");
      const savedVotes = localStorage.getItem("voter_active_votes");
      const savedUnlocked = localStorage.getItem("voter_is_unlocked");

      if (savedShortlist) {
        try {
          const parsed = JSON.parse(savedShortlist);
          if (Array.isArray(parsed)) {
            setShortlist(parsed.filter(id => id && typeof id === "string" && id.trim() !== ""));
          }
        } catch (e) {
          console.error("Gagal parse voter_shortlist pada mount:", e);
        }
      }
      if (savedVisitor) {
        const parsedVisitor = JSON.parse(savedVisitor);
        setVisitor(parsedVisitor);
        
        // Cek validasi ke backend secara asinkron untuk mendeteksi reset sesi
        fetch(`${BACKEND_URL}/api/auth/visitor/${parsedVisitor.identifier}`)
          .then((res) => {
            if (res.status === 404) {
              console.log("Visitor no longer valid (session reset). Clearing storage...");
              localStorage.removeItem("voter_visitor");
              localStorage.removeItem("voter_active_vote");
              localStorage.removeItem("voter_active_votes");
              localStorage.removeItem("voter_shortlist");
              localStorage.removeItem("voter_is_unlocked");
              setVisitor(null);
              setActiveVote(null);
              setActiveVotes([]);
              setIsVoteUnlocked(false);
              // Arahkan ke halaman verifikasi untuk mendaftar kembali
              window.location.href = "/verifikasi";
            }
          })
          .catch((err) => {
            console.error("Gagal memvalidasi status pengunjung:", err);
          });
      }
      if (savedUnlocked === "true") setIsVoteUnlocked(true);

      if (savedVotes) {
        const parsedVotes = JSON.parse(savedVotes);
        setActiveVotes(parsedVotes);
        setActiveVote(parsedVotes[parsedVotes.length - 1] || null);
      } else if (savedVote) {
        const parsedVote = JSON.parse(savedVote);
        setActiveVote(parsedVote);
        setActiveVotes([parsedVote]);
        localStorage.setItem("voter_active_votes", JSON.stringify([parsedVote]));
      }

      // Check URL query parameters for exit gate unlock QR link
      const params = new URLSearchParams(window.location.search);
      if (params.get("unlock") === EXIT_UNLOCK_TOKEN) {
        setIsVoteUnlocked(true);
        localStorage.setItem("voter_is_unlocked", "true");
        alert("🔒 Akses Voting Berhasil Dibuka! Anda sekarang dapat mengirimkan suara final.");
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helpers
  const isShortlisted = (id: string) => shortlist.includes(id);

  const addToShortlist = (id: string) => {
    if (!id || typeof id !== "string" || id.trim() === "") return;
    if (shortlist.includes(id)) return;
    const newShortlist = [...shortlist, id];
    setShortlist(newShortlist);
    localStorage.setItem("voter_shortlist", JSON.stringify(newShortlist));
  };

  const removeFromShortlist = (id: string) => {
    const newShortlist = shortlist.filter((item) => item !== id);
    setShortlist(newShortlist);
    localStorage.setItem("voter_shortlist", JSON.stringify(newShortlist));
  };

  // Register Visitor using Name & Category via Backend API
  const verifyOTP = async (
    name: string,
    category: string,
    extraFields?: { universitas?: string; sekolah?: string; instansi?: string }
  ): Promise<boolean> => {
    try {
      let fingerprint = "";
      if (typeof window !== "undefined") {
        fingerprint = localStorage.getItem("voter_device_fingerprint") || "";
        if (!fingerprint) {
          fingerprint = generateStableFingerprint();
          localStorage.setItem("voter_device_fingerprint", fingerprint);
        }
      }

      // Ambil Google Auth token jika tersedia
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert("Otentikasi Google diperlukan. Silakan login dengan Google terlebih dahulu.");
        return false;
      }

      const res = await fetch(`${BACKEND_URL}/api/auth/verify`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name, 
          category, 
          deviceFingerprint: fingerprint,
          ...extraFields 
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        setVisitor(data.visitor);
        localStorage.setItem("voter_visitor", JSON.stringify(data.visitor));

        if (data.activeVotes) {
          setActiveVotes(data.activeVotes);
          localStorage.setItem("voter_active_votes", JSON.stringify(data.activeVotes));
          if (data.activeVotes.length > 0) {
            setActiveVote(data.activeVotes[data.activeVotes.length - 1]);
            localStorage.setItem("voter_active_vote", JSON.stringify(data.activeVotes[data.activeVotes.length - 1]));
          } else {
            setActiveVote(null);
            localStorage.removeItem("voter_active_vote");
          }
        } else {
          setActiveVotes([]);
          localStorage.removeItem("voter_active_votes");
          setActiveVote(null);
          localStorage.removeItem("voter_active_vote");
        }

        if (data.maxVotes) {
          setMaxVotesLimit(data.maxVotes);
        }

        return true;
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Gagal mendaftarkan identitas");
        return false;
      }
    } catch (err) {
      console.error("Gagal registrasi/verifikasi:", err);
      return false;
    }
  };

  // Submit vote to Backend API
  const submitVote = async (groupId: string | string[]): Promise<any> => {
    if (!visitor) return null;
    
    try {
      // Ambil Google Auth token jika tersedia
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert("Sesi Google Auth tidak ditemukan. Silakan login kembali.");
        return null;
      }

      const bodyData = Array.isArray(groupId) 
        ? { visitorIdentifier: visitor.identifier, groupIds: groupId }
        : { visitorIdentifier: visitor.identifier, groupId };

      const res = await fetch(`${BACKEND_URL}/api/votes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        const voteResult = await res.json();
        
        let newVotes = [];
        if (Array.isArray(voteResult)) {
          newVotes = voteResult;
        } else {
          newVotes = [voteResult];
        }

        const updatedVotes = [...activeVotes, ...newVotes];
        setActiveVotes(updatedVotes);
        localStorage.setItem("voter_active_votes", JSON.stringify(updatedVotes));
        
        if (newVotes.length > 0) {
          setActiveVote(newVotes[newVotes.length - 1]);
          localStorage.setItem("voter_active_vote", JSON.stringify(newVotes[newVotes.length - 1]));
        }
        
        // Refresh counts
        refreshGroupsList();
        
        return Array.isArray(groupId) ? newVotes.map((v: any) => v.voteCode) : newVotes[0].voteCode;
      } else {
        const errorData = await res.json();
        if (res.status === 401 || errorData.code === "VISITOR_NOT_FOUND") {
          alert("Identitas Anda tidak terdaftar atau telah direset di server. Halaman akan dimuat ulang untuk mendaftar kembali.");
          localStorage.removeItem("voter_visitor");
          localStorage.removeItem("voter_active_vote");
          localStorage.removeItem("voter_active_votes");
          localStorage.removeItem("voter_shortlist");
          localStorage.removeItem("voter_is_unlocked");
          window.location.reload();
          return null;
        }
        alert(errorData.error || "Gagal melakukan voting");
        return null;
      }
    } catch (err) {
      console.error("Gagal mengirim vote:", err);
      return null;
    }
  };

  return (
    <VoterContext.Provider
      value={{
        shortlist,
        addToShortlist,
        removeFromShortlist,
        isShortlisted,
        visitor,
        activeVote,
        activeVotes,
        maxVotesLimit,
        votingStatus,
        votingEndTime,
        verifyOTP,
        submitVote,
        isDrawerOpen,
        setIsDrawerOpen,
        qrScannerOpen,
        setQrScannerOpen,
        groupsList,
        refreshGroupsList,
        isVoteUnlocked,
        unlockVoting,
        refreshSettings,
        googleUser,
        loginWithGoogle,
        logoutGoogle
      }}
    >
      {children}
    </VoterContext.Provider>
  );
}

export function useVoter() {
  const context = useContext(VoterContext);
  if (context === undefined) {
    throw new Error("useVoter must be used within a VoterProvider");
  }
  return context;
}
