const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { mapVisitor, mapVote, addAuditLog, getClientIp } = require("../utils/helpers");

// 2. Verify & Register Visitor using Name & Category
router.post("/verify", async (req, res) => {
  const { name, category, deviceFingerprint } = req.body;
  const ipAddress = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "Unknown UA";

  if (!name || !category) {
    return res.status(400).json({ error: "Nama Lengkap dan Kategori wajib diisi" });
  }

  try {
    // Check if this device fingerprint has already voted under ANY identifier
    if (deviceFingerprint) {
      const { data: siblingVisitors, error: sibErr } = await supabase
        .from('visitors')
        .select('identifier')
        .eq('device_fingerprint', deviceFingerprint);
      
      if (!sibErr && siblingVisitors && siblingVisitors.length > 0) {
        const siblingIdentifiers = siblingVisitors.map(v => v.identifier);
        const { data: siblingVotes, error: sibVotesErr } = await supabase
          .from('votes')
          .select('*')
          .in('visitor_identifier', siblingIdentifiers);
          
        if (!sibVotesErr && siblingVotes && siblingVotes.length > 0) {
          await addAuditLog("Access Denied", `Device ${deviceFingerprint} mencoba mendaftar dengan nama '${name}' tapi device ini sudah pernah melakukan vote. IP: ${ipAddress} (UA: ${userAgent})`, "error");
          return res.status(403).json({ error: "Perangkat ini sudah digunakan untuk memberikan suara!" });
        }
      }
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
        device_fingerprint: deviceFingerprint || ("fingerprint_" + Math.random().toString(36).substr(2, 9)),
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
      // Update IP or device_fingerprint if empty or changed
      if (existingVisitors[0].ip !== ipAddress || (deviceFingerprint && existingVisitors[0].device_fingerprint !== deviceFingerprint)) {
        await supabase
          .from('visitors')
          .update({ 
            ip: ipAddress, 
            device_fingerprint: deviceFingerprint || existingVisitors[0].device_fingerprint 
          })
          .eq('identifier', identifierHash);
      }
    }

    await addAuditLog("Registration Success", `Pengunjung '${name}' (${category}) terdaftar dari IP: ${ipAddress} (UA: ${userAgent.substring(0, 120)})`, "success");
    
    // Check if visitor has already voted by identifier
    const { data: visitorVotes, error: visitorVotesErr } = await supabase
      .from('votes')
      .select('*')
      .eq('visitor_identifier', identifierHash);
      
    if (visitorVotesErr) throw visitorVotesErr;

    // Get max votes limit
    let maxVotes = 3;
    try {
      const { data: settingsData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "max_votes")
        .single();
      if (settingsData && settingsData.value) {
        maxVotes = parseInt(settingsData.value) || 3;
      }
    } catch (err) {}

    const mappedVotes = visitorVotes.map(mapVote);
    const hasVotedAll = mappedVotes.length >= maxVotes;

    res.json({
      visitor,
      hasVoted: hasVotedAll,
      activeVotes: mappedVotes,
      maxVotes
    });
  } catch (error) {
    console.error("POST /api/auth/verify error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// 3. Validate Visitor status (used by client to check if session was reset)
router.get("/visitor/:identifier", async (req, res) => {
  const { identifier } = req.params;
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('identifier')
      .eq('identifier', identifier);
    
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ valid: false, error: "Visitor not found (session reset)" });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error("GET /api/auth/visitor/:identifier error:", error);
    res.status(500).json({ error: "Failed to validate visitor" });
  }
});

// Admin Login verification
router.post("/admin-login", (req, res) => {
  const { username, password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const expectedUsername = "panitiacodex";

  if (!username) {
    return res.status(400).json({ error: "Username wajib diisi" });
  }

  if (!password) {
    return res.status(400).json({ error: "Password wajib diisi" });
  }

  if (username !== expectedUsername) {
    return res.status(401).json({ error: "Username admin salah" });
  }

  if (password === adminPassword) {
    return res.json({ success: true, token: adminPassword });
  } else {
    return res.status(401).json({ error: "Password admin salah" });
  }
});

module.exports = router;
