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

// 3. Cast Vote (Enforces max votes per visitor constraint)
router.post("/", async (req, res) => {
  const { visitorIdentifier, groupId } = req.body;
  const ipAddress = getClientIp(req);
  
  if (!visitorIdentifier || !groupId) {
    return res.status(400).json({ error: "Identitas pemilih dan pilihan kelompok wajib diisi" });
  }

  try {
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

    // 2. Enforce unique visitors count per IP to prevent spam (max 5 unique visitors per IP)
    const { data: ipVotes, error: ipvErr } = await supabase
      .from('votes')
      .select('*')
      .eq('ip', ipAddress);
    if (ipvErr) throw ipvErr;

    const uniqueVisitorsFromIp = new Set(ipVotes.map(v => v.visitor_identifier));
    if (uniqueVisitorsFromIp.size >= 5 && !uniqueVisitorsFromIp.has(visitorIdentifier)) {
      await addAuditLog("Duplicate IP Denied", `Mencegah vote ganda dari alamat IP: ${ipAddress} (batas 5 pengunjung unik terlampaui)`, "error");
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
      `Suara diberikan ke ${targetGroup.name} (${targetGroup.booth_number}) dari IP: ${ipAddress} (Suara ke-${visitorVotes.length + 1}/${maxVotes})`, 
      "success"
    );

    res.json(newVote);
  } catch (error) {
    console.error("POST /api/votes error:", error);
    res.status(500).json({ error: "Failed to cast vote" });
  }
});

module.exports = router;
