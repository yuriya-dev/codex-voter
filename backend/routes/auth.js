const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { mapVisitor, mapVote, addAuditLog, getClientIp } = require("../utils/helpers");

// 2. Verify & Register Visitor using Name & Category & Google Auth Token
router.post("/verify", async (req, res) => {
  const { name, category, deviceFingerprint } = req.body;
  const ipAddress = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "Unknown UA";

  if (!name || !category) {
    return res.status(400).json({ error: "Nama Lengkap dan Kategori wajib diisi" });
  }

  // Google Auth JWT Verification
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Sesi otentikasi Google tidak ditemukan. Silakan login kembali." });
  }

  const token = authHeader.split(" ")[1];
  let user;
  try {
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !supabaseUser) {
      return res.status(401).json({ error: "Sesi Google Auth tidak valid atau telah kedaluwarsa. Silakan login kembali." });
    }
    user = supabaseUser;
  } catch (err) {
    console.error("Gagal melakukan getUser dari token:", err);
    return res.status(401).json({ error: "Gagal memverifikasi token Google Auth." });
  }

  const identifierHash = user.id; // Stable UUID from Google/Supabase Auth

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
          const votedByOther = siblingVotes.some(v => v.visitor_identifier !== identifierHash);
          if (votedByOther) {
            await addAuditLog("Access Denied", `Device ${deviceFingerprint} mencoba mendaftar dengan nama '${name}' tapi device ini sudah pernah digunakan untuk vote oleh akun lain. IP: ${ipAddress} (UA: ${userAgent})`, "error");
            return res.status(403).json({ error: "Perangkat ini sudah digunakan oleh akun lain untuk memberikan suara!" });
          }
        }
      }
    }

    // Check if visitor exists
    const { data: existingVisitors, error: visitorErr } = await supabase
      .from('visitors')
      .select('*')
      .eq('identifier', identifierHash);
    
    if (visitorErr) throw visitorErr;
    
    let visitor;
    if (existingVisitors.length === 0) {
      // IP-based Rate Limiting per Hour: Max 3 new registrations per IP per hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentVisitorsFromIp, error: ripErr } = await supabase
        .from('visitors')
        .select('identifier')
        .eq('ip', ipAddress)
        .gte('created_at', oneHourAgo);

      if (!ripErr && recentVisitorsFromIp && recentVisitorsFromIp.length >= 3) {
        await addAuditLog(
          "IP Rate Limit Exceeded",
          `Mencegah registrasi akun baru '${name}' (Email: ${user.email}) dari IP: ${ipAddress}. Batas maks 3 akun baru per IP per jam terlampaui.`,
          "error"
        );
        return res.status(429).json({
          error: "Batas pendaftaran tercapai. Maksimum 3 akun Google baru yang dapat mendaftar dari koneksi IP yang sama dalam 1 jam."
        });
      }

      const newVisitor = {
        identifier: identifierHash,
        name: name.trim(),
        category,
        email: user.email,
        verified_at: new Date().toISOString(),
        device_fingerprint: deviceFingerprint || ("fingerprint_" + Math.random().toString(36).substr(2, 9)),
        ip: ipAddress,
        is_flagged: false,
        flag_reason: ""
      };
      
      const { data: insertedVisitor, error: insertErr } = await supabase
        .from('visitors')
        .insert([newVisitor])
        .select()
        .single();
        
      if (insertErr) {
        // Fallback if schema migration has not been run (missing columns is_flagged, flag_reason, or email)
        if (insertErr.message && (insertErr.message.includes("is_flagged") || insertErr.message.includes("flag_reason") || insertErr.message.includes("email"))) {
          const fallbackVisitor = { ...newVisitor };
          delete fallbackVisitor.is_flagged;
          delete fallbackVisitor.flag_reason;
          delete fallbackVisitor.email;
          
          const { data: fbVisitor, error: fbErr } = await supabase
            .from('visitors')
            .insert([fallbackVisitor])
            .select()
            .single();
            
          if (fbErr) throw fbErr;
          visitor = mapVisitor(fbVisitor);
        } else {
          throw insertErr;
        }
      } else {
        visitor = mapVisitor(insertedVisitor);
      }
    } else {
      visitor = mapVisitor(existingVisitors[0]);
      // Update IP, name, category, email, or device_fingerprint if empty or changed
      if (
        existingVisitors[0].ip !== ipAddress || 
        existingVisitors[0].name !== name.trim() || 
        existingVisitors[0].category !== category || 
        existingVisitors[0].email !== user.email ||
        (deviceFingerprint && existingVisitors[0].device_fingerprint !== deviceFingerprint)
      ) {
        const updateData = { 
          name: name.trim(),
          category,
          email: user.email,
          ip: ipAddress, 
          device_fingerprint: deviceFingerprint || existingVisitors[0].device_fingerprint 
        };
        
        const { error: updErr } = await supabase
          .from('visitors')
          .update(updateData)
          .eq('identifier', identifierHash);
          
        if (updErr && updErr.message && updErr.message.includes("email")) {
          // Fallback if email column not present in visitors
          delete updateData.email;
          await supabase
            .from('visitors')
            .update(updateData)
            .eq('identifier', identifierHash);
        }
      }
    }

    await addAuditLog("Registration Success", `Pengunjung '${name}' (${category}) terdaftar dari IP: ${ipAddress} (Email: ${user.email})`, "success");
    
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
