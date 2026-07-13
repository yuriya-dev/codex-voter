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
  name: string;
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
  activeVote: Vote | null; // Keep for backward compatibility (last cast vote)
  activeVotes: Vote[];
  maxVotesLimit: number;
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
  refreshSettings: () => Promise<void>;
}

const VoterContext = createContext<VoterContextType | undefined>(undefined);

export function VoterProvider({ children }: { children: React.ReactNode }) {
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [activeVote, setActiveVote] = useState<Vote | null>(null);
  const [activeVotes, setActiveVotes] = useState<Vote[]>([]);
  const [maxVotesLimit, setMaxVotesLimit] = useState<number>(3);
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

  // Fetch settings from Backend API
  const refreshSettings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setMaxVotesLimit(data.max_votes || 3);
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
    
    if (typeof window !== "undefined") {
      const savedShortlist = localStorage.getItem("voter_shortlist");
      const savedVisitor = localStorage.getItem("voter_visitor");
      const savedVote = localStorage.getItem("voter_active_vote");
      const savedVotes = localStorage.getItem("voter_active_votes");
      const savedUnlocked = localStorage.getItem("voter_is_unlocked");

      if (savedShortlist) setShortlist(JSON.parse(savedShortlist));
      if (savedVisitor) setVisitor(JSON.parse(savedVisitor));
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
        
        const updatedVotes = [...activeVotes, vote];
        setActiveVotes(updatedVotes);
        localStorage.setItem("voter_active_votes", JSON.stringify(updatedVotes));
        
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
        activeVotes,
        maxVotesLimit,
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
        refreshSettings
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
