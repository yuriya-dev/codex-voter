const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { mapGroup, mapVote, addAuditLog, getClientIp } = require("../utils/helpers");

// Helper to get max votes limit
async function getMaxVotesLimit() {
  try {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "max_votes")
      .single();
    return data && data.value ? parseInt(data.value) || 3 : 3;
  } catch (err) {
    return 3;
  }
}

// Helper to get voting status and end time
async function getVotingStatusAndEndTime() {
  try {
    const { data: statusData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "voting_status")
      .single();
    
    const { data: endTimeData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "voting_end_time")
      .single();
      
    return {
      status: statusData && statusData.value ? statusData.value : "not_started",
      endTime: endTimeData && endTimeData.value ? endTimeData.value : ""
    };
  } catch (err) {
    return { status: "not_started", endTime: "" };
  }
}

// 3. Cast Vote (Enforces max votes per visitor constraint)
router.post("/", async (req, res) => {
  const { visitorIdentifier, groupId } = req.body;
  const ipAddress = getClientIp(req);
  
  if (!visitorIdentifier || !groupId) {
    return res.status(400).json({ error: "Identitas pemilih dan pilihan kelompok wajib diisi" });
  }

  try {
    const { status, endTime } = await getVotingStatusAndEndTime();
    if (status === "not_started") {
      return res.status(403).json({ error: "Sesi voting belum dimulai oleh panitia!" });
    }
    
    if (status === "started" && endTime) {
      const now = new Date();
      const end = new Date(endTime);
      if (now > end) {
        return res.status(403).json({ error: "Waktu voting telah habis!" });
      }
    }
    
    if (status === "ended") {
      return res.status(403).json({ error: "Sesi voting telah selesai/ditutup!" });
    }

    const maxVotes = await getMaxVotesLimit();

    // 0. Verify visitor exists in the database
    const { data: visitorData, error: visitorErr } = await supabase
      .from('visitors')
      .select('identifier')
      .eq('identifier', visitorIdentifier);
    
    if (visitorErr) throw visitorErr;

    if (!visitorData || visitorData.length === 0) {
      return res.status(401).json({ 
        error: "Identitas pemilih tidak terdaftar di server. Silakan masuk/registrasi ulang.",
        code: "VISITOR_NOT_FOUND"
      });
    }

    // 1. Get all votes cast by this visitor
    const { data: visitorVotes, error: vvErr } = await supabase
      .from('votes')
      .select('*')
      .eq('visitor_identifier', visitorIdentifier);
    if (vvErr) throw vvErr;

    // Check if already voted for this specific group
    const alreadyVotedForGroup = visitorVotes.some(v => v.group_id === groupId);
    if (alreadyVotedForGroup) {
      return res.status(403).json({ error: "Anda sudah memberikan suara untuk kelompok ini!" });
    }

    // Check if visitor has reached the maximum vote limit
    if (visitorVotes.length >= maxVotes) {
      await addAuditLog("Vote Denied", `Mencegah vote tambahan dari identitas: ${visitorIdentifier} (batas ${maxVotes} tercapai)`, "error");
      return res.status(403).json({ error: `Anda sudah mencapai batas maksimum ${maxVotes} pilihan kelompok!` });
    }

    // 1.5 Enforce device fingerprint vote limit to prevent multiple registrations on the same device
    const userAgent = req.headers["user-agent"] || "Unknown UA";
    try {
      const { data: currentVisitor, error: cvErr } = await supabase
        .from('visitors')
        .select('device_fingerprint')
        .eq('identifier', visitorIdentifier)
        .single();
        
      if (!cvErr && currentVisitor && currentVisitor.device_fingerprint) {
        const { data: siblingVisitors } = await supabase
          .from('visitors')
          .select('identifier')
          .eq('device_fingerprint', currentVisitor.device_fingerprint);
          
        if (siblingVisitors && siblingVisitors.length > 0) {
          const siblingIdentifiers = siblingVisitors.map(v => v.identifier);
          const { data: siblingVotes } = await supabase
            .from('votes')
            .select('*')
            .in('visitor_identifier', siblingIdentifiers);
            
          // A single device fingerprint is allowed to cast at most maxVotes total votes in aggregate
          if (siblingVotes && siblingVotes.length >= maxVotes && !siblingVotes.some(v => v.visitor_identifier === visitorIdentifier)) {
            await addAuditLog("Vote Denied", `Device ${currentVisitor.device_fingerprint} mencoba memilih menggunakan identitas baru: ${visitorIdentifier} (kuota device habis)`, "error");
            return res.status(403).json({ error: "Perangkat ini sudah digunakan untuk memberikan suara!" });
          }
        }
      }
    } catch (err) {
      console.error("Gagal memvalidasi fingerprint perangkat:", err);
    }

    // 2. Enforce unique visitors count per IP to prevent spam (max 300 unique visitors per IP)
    const { data: ipVotes, error: ipvErr } = await supabase
      .from('votes')
      .select('*')
      .eq('ip', ipAddress);
    if (ipvErr) throw ipvErr;

    const uniqueVisitorsFromIp = new Set(ipVotes.map(v => v.visitor_identifier));
    if (uniqueVisitorsFromIp.size >= 300 && !uniqueVisitorsFromIp.has(visitorIdentifier)) {
      await addAuditLog("Duplicate IP Denied", `Mencegah vote ganda dari alamat IP: ${ipAddress} (batas 300 pengunjung unik terlampaui)`, "error");
      return res.status(403).json({ error: "Perangkat/IP ini sudah melebihi batas kuota pemilih unik pameran!" });
    }

    // 3. Verify group exists
    const { data: matchedGroups, error: gErr } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId);
    if (gErr) throw gErr;

    if (matchedGroups.length === 0) {
      return res.status(404).json({ error: "Kelompok tidak ditemukan" });
    }
    const targetGroup = mapGroup(matchedGroups[0]);

    // 4. Cast Vote
    const voteCode = `VOTE-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const newDbVote = {
      visitor_identifier: visitorIdentifier,
      group_id: groupId,
      vote_code: voteCode,
      voted_at: new Date().toISOString(),
      ip: ipAddress
    };

    const { data: insertedVote, error: insErr } = await supabase
      .from('votes')
      .insert([newDbVote])
      .select()
      .single();
    
    if (insErr) {
      // If the unique constraint in DB is not dropped yet, output a friendly error
      if (insErr.code === '23505') {
        return res.status(403).json({ 
          error: "Sistem mencatat Anda sudah pernah melakukan voting. (Admin: Harap jalankan migrasi SQL di Supabase untuk mengizinkan multi-voting)." 
        });
      }
      throw insErr;
    }
    const newVote = mapVote(insertedVote);

    await addAuditLog(
      "Vote Submitted", 
      `Suara diberikan ke ${targetGroup.name} (${targetGroup.booth_number}) dari IP: ${ipAddress} (Suara ke-${visitorVotes.length + 1}/${maxVotes}) (UA: ${userAgent.substring(0, 120)})`, 
      "success"
    );

    res.json(newVote);
  } catch (error) {
    console.error("POST /api/votes error:", error);
    res.status(500).json({ error: "Failed to cast vote" });
  }
});

module.exports = router;
