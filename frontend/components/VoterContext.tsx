"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getBackendUrl } from "@/lib/config";

const BACKEND_URL = getBackendUrl();


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
  stats: {
    votes: number;
  };
}

interface Visitor {
  identifier: string;
  category: string;
  verifiedAt: string;
  deviceFingerprint: string;
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
  activeVote: Vote | null;
  verifyOTP: (name: string, category: string) => Promise<boolean>;
  submitVote: (groupId: string) => Promise<string | null>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  qrScannerOpen: boolean;
  setQrScannerOpen: (open: boolean) => void;
  groupsList: Group[];
  refreshGroupsList: () => Promise<void>;
  isVoteUnlocked: boolean;
  unlockVoting: () => void;
}

const VoterContext = createContext<VoterContextType | undefined>(undefined);

export function VoterProvider({ children }: { children: React.ReactNode }) {
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [activeVote, setActiveVote] = useState<Vote | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [groupsList, setGroupsList] = useState<Group[]>([]);
  const [isVoteUnlocked, setIsVoteUnlocked] = useState(false);

  // Fetch groups list from Backend API
  const refreshGroupsList = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/groups`);
      if (res.ok) {
        const data = await res.json();
        setGroupsList(data);
      }
    } catch (err) {
      console.error("Gagal memuat daftar kelompok dari backend:", err);
    }
  };

  const unlockVoting = () => {
    setIsVoteUnlocked(true);
    localStorage.setItem("voter_is_unlocked", "true");
  };

  // Load from localStorage & fetch groups on mount
  useEffect(() => {
    refreshGroupsList();
    
    if (typeof window !== "undefined") {
      const savedShortlist = localStorage.getItem("voter_shortlist");
      const savedVisitor = localStorage.getItem("voter_visitor");
      const savedVote = localStorage.getItem("voter_active_vote");
      const savedUnlocked = localStorage.getItem("voter_is_unlocked");

      if (savedShortlist) setShortlist(JSON.parse(savedShortlist));
      if (savedVisitor) setVisitor(JSON.parse(savedVisitor));
      if (savedVote) setActiveVote(JSON.parse(savedVote));
      if (savedUnlocked === "true") setIsVoteUnlocked(true);

      // Check URL query parameters for exit gate unlock QR link
      const params = new URLSearchParams(window.location.search);
      if (params.get("unlock") === "exit") {
        setIsVoteUnlocked(true);
        localStorage.setItem("voter_is_unlocked", "true");
        alert("🔒 Akses Voting Berhasil Dibuka! Anda sekarang dapat mengirimkan suara final.");
      }
    }
  }, []);

  // Helpers
  const isShortlisted = (id: string) => shortlist.includes(id);

  const addToShortlist = (id: string) => {
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
  const verifyOTP = async (name: string, category: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category })
      });

      if (res.ok) {
        const data = await res.json();
        
        setVisitor(data.visitor);
        localStorage.setItem("voter_visitor", JSON.stringify(data.visitor));

        if (data.activeVote) {
          setActiveVote(data.activeVote);
          localStorage.setItem("voter_active_vote", JSON.stringify(data.activeVote));
        } else {
          setActiveVote(null);
          localStorage.removeItem("voter_active_vote");
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
  const submitVote = async (groupId: string): Promise<string | null> => {
    if (!visitor) return null;
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          visitorIdentifier: visitor.identifier, 
          groupId 
        })
      });

      if (res.ok) {
        const vote = await res.json();
        
        setActiveVote(vote);
        localStorage.setItem("voter_active_vote", JSON.stringify(vote));
        
        // Refresh counts
        refreshGroupsList();
        
        return vote.voteCode;
      } else {
        const errorData = await res.json();
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
        verifyOTP,
        submitVote,
        isDrawerOpen,
        setIsDrawerOpen,
        qrScannerOpen,
        setQrScannerOpen,
        groupsList,
        refreshGroupsList,
        isVoteUnlocked,
        unlockVoting
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
