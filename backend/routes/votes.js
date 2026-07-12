const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { mapGroup, mapVote, addAuditLog, getClientIp } = require("../utils/helpers");

// 3. Cast Vote (Enforces 1 vote per visitor and 1 vote per IP)
router.post("/", async (req, res) => {
  const { visitorIdentifier, groupId } = req.body;
  const ipAddress = getClientIp(req);
  
  if (!visitorIdentifier || !groupId) {
    return res.status(400).json({ error: "Identitas pemilih dan pilihan kelompok wajib diisi" });
  }

  try {
    // 1. Enforce 1 visitor = 1 vote constraint
    const { data: visitorVotes, error: vvErr } = await supabase
      .from('votes')
      .select('*')
      .eq('visitor_identifier', visitorIdentifier);
    if (vvErr) throw vvErr;

    if (visitorVotes.length > 0) {
      await addAuditLog("Double Vote Denied", `Mencegah vote ganda dari identitas: ${visitorIdentifier}`, "error");
      return res.status(403).json({ error: "Nama Anda sudah tercatat memberikan suara!" });
    }

    // 2. Enforce 1 IP = 1 vote constraint (Duplicate IP prevention)
    const { data: ipVotes, error: ipvErr } = await supabase
      .from('votes')
      .select('*')
      .eq('ip', ipAddress);
    if (ipvErr) throw ipvErr;

    if (ipVotes.length > 0) {
      await addAuditLog("Duplicate IP Denied", `Mencegah vote ganda dari alamat IP: ${ipAddress}`, "error");
      return res.status(403).json({ error: "Perangkat/IP ini sudah digunakan untuk memberikan suara!" });
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
    
    if (insErr) throw insErr;
    const newVote = mapVote(insertedVote);

    await addAuditLog(
      "Vote Submitted", 
      `Suara diberikan ke ${targetGroup.name} (${targetGroup.booth_number}) dari IP: ${ipAddress}`, 
      "success"
    );

    res.json(newVote);
  } catch (error) {
    console.error("POST /api/votes error:", error);
    res.status(500).json({ error: "Failed to cast vote" });
  }
});

module.exports = router;
