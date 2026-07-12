const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { mapVisitor, mapVote, addAuditLog, getClientIp } = require("../utils/helpers");

// 2. Verify & Register Visitor using Name & Category
router.post("/verify", async (req, res) => {
  const { name, category } = req.body;
  const ipAddress = getClientIp(req);

  if (!name || !category) {
    return res.status(400).json({ error: "Nama Lengkap dan Kategori wajib diisi" });
  }

  try {
    // Check if this IP address has already voted
    const { data: ipVotes, error: ipVotesErr } = await supabase
      .from('votes')
      .select('*')
      .eq('ip', ipAddress);
    
    if (ipVotesErr) throw ipVotesErr;
    const ipHasVoted = ipVotes.length > 0;

    if (ipHasVoted) {
      await addAuditLog("Access Denied", `IP ${ipAddress} mencoba masuk kembali tapi sudah pernah melakukan vote.`, "error");
      return res.status(403).json({ error: "Perangkat dengan alamat IP ini sudah digunakan untuk memberikan suara!" });
    }

    // Create hash from name for visitor identifier
    const identifierHash = Buffer.from(name.trim()).toString("base64").substring(0, 12);
    
    // Check if visitor exists
    const { data: existingVisitors, error: visitorErr } = await supabase
      .from('visitors')
      .select('*')
      .eq('identifier', identifierHash);
    
    if (visitorErr) throw visitorErr;
    
    let visitor;
    if (existingVisitors.length === 0) {
      const newVisitor = {
        identifier: identifierHash,
        name: name.trim(),
        category,
        verified_at: new Date().toISOString(),
        device_fingerprint: "fingerprint_" + Math.random().toString(36).substr(2, 9),
        ip: ipAddress
      };
      
      const { data: insertedVisitor, error: insertErr } = await supabase
        .from('visitors')
        .insert([newVisitor])
        .select()
        .single();
        
      if (insertErr) throw insertErr;
      visitor = mapVisitor(insertedVisitor);
    } else {
      visitor = mapVisitor(existingVisitors[0]);
    }

    await addAuditLog("Registration Success", `Pengunjung '${name}' (${category}) terdaftar dari IP: ${ipAddress}`, "success");
    
    // Check if visitor has already voted by identifier
    const { data: visitorVotes, error: visitorVotesErr } = await supabase
      .from('votes')
      .select('*')
      .eq('visitor_identifier', identifierHash);
      
    if (visitorVotesErr) throw visitorVotesErr;
    const existingVote = visitorVotes.length > 0 ? mapVote(visitorVotes[0]) : null;

    res.json({
      visitor,
      hasVoted: !!existingVote || ipHasVoted,
      activeVote: existingVote || null
    });
  } catch (error) {
    console.error("POST /api/auth/verify error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

module.exports = router;
