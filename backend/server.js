require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 5050;

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-project") || supabaseKey.includes("your-anon-public-key")) {
  console.warn("⚠️ WARNING: Supabase URL or Anon Key is missing or using default placeholders in .env! Backend operations will fail.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors({ origin: "http://localhost:3030" }));
app.use(express.json());

// OTP Store (identifier -> code) - Maintained for backwards compatibility
const otpStore = new Map();

// Helper to map DB snake_case schemas to camelCase for the API
function mapGroup(dbGroup) {
  if (!dbGroup) return null;
  return {
    id: dbGroup.id,
    name: dbGroup.name,
    slug: dbGroup.slug,
    booth_number: dbGroup.booth_number,
    category: dbGroup.category,
    description: dbGroup.description,
    fullDescription: dbGroup.full_description,
    members: dbGroup.members || [],
    photoColor: dbGroup.photo_color,
    votes: dbGroup.votes || 0
  };
}

function mapVisitor(dbVisitor) {
  if (!dbVisitor) return null;
  return {
    identifier: dbVisitor.identifier,
    name: dbVisitor.name,
    category: dbVisitor.category,
    verifiedAt: dbVisitor.verified_at,
    deviceFingerprint: dbVisitor.device_fingerprint,
    ip: dbVisitor.ip
  };
}

function mapVote(dbVote) {
  if (!dbVote) return null;
  return {
    visitorIdentifier: dbVote.visitor_identifier,
    groupId: dbVote.group_id,
    voteCode: dbVote.vote_code,
    votedAt: dbVote.voted_at,
    ip: dbVote.ip
  };
}

// Helper to push audit logs to Supabase
async function addAuditLog(action, detail, status = "success") {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  try {
    const { error } = await supabase.from('audit_logs').insert([
      { id, time: timeStr, action, detail, status }
    ]);
    if (error) throw error;
  } catch (err) {
    console.error(`Error saving audit log to Supabase:`, err.message);
  }
  console.log(`[AUDIT LOG] [${status.toUpperCase()}] ${action}: ${detail}`);
}

// Helper to format client IP
function getClientIp(req) {
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    return "127.0.0.1";
  }
  return ip;
}

// REST Endpoints

// 1. GET all groups with vote counts
app.get("/api/groups", async (req, res) => {
  try {
    const { data: dbGroups, error: groupsErr } = await supabase.from('groups').select('*');
    if (groupsErr) throw groupsErr;

    const { data: dbVotes, error: votesErr } = await supabase.from('votes').select('group_id');
    if (votesErr) throw votesErr;

    const responseGroups = dbGroups.map(dbG => {
      const g = mapGroup(dbG);
      const extraVotes = dbVotes.filter(v => v.group_id === g.id).length;
      return {
        ...g,
        stats: { votes: g.votes + extraVotes }
      };
    });

    res.json(responseGroups);
  } catch (error) {
    console.error("GET /api/groups error:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

// 2. Verify & Register Visitor using Name & Category
app.post("/api/auth/verify", async (req, res) => {
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

// 3. Cast Vote (Enforces 1 vote per visitor and 1 vote per IP)
app.post("/api/votes", async (req, res) => {
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

// 4. Admin Dashboard stats
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const { data: dbGroups, error: groupsErr } = await supabase.from('groups').select('*');
    if (groupsErr) throw groupsErr;

    const { data: dbVotes, error: votesErr } = await supabase.from('votes').select('group_id');
    if (votesErr) throw votesErr;

    const groupsList = dbGroups.map(mapGroup);

    const groupStats = groupsList.map(g => {
      const extraVotes = dbVotes.filter(v => v.group_id === g.id).length;
      return {
        id: g.id,
        name: g.name,
        booth_number: g.booth_number,
        category: g.category,
        votes: g.votes + extraVotes
      };
    });

    const totalVotes = groupsList.reduce((sum, g) => sum + g.votes, 0) + dbVotes.length;

    res.json({
      totalVotes,
      groupStats
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// 5. Admin Dashboard logs
app.get("/api/dashboard/logs", async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    res.json(logs || []);
  } catch (error) {
    console.error("GET /api/dashboard/logs error:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// 6. Admin - Upload/Import Groups via CSV/JSON
app.post("/api/admin/upload-groups", async (req, res) => {
  const { groups: newGroups, overwrite } = req.body;
  if (!Array.isArray(newGroups)) {
    return res.status(400).json({ error: "Data kelompok tidak valid" });
  }

  try {
    const formattedDbGroups = newGroups.map((g, idx) => {
      const id = g.id || `g-${Date.now()}-${idx}`;
      const name = g.name || `Kelompok Tanpa Nama ${idx + 1}`;
      const booth_number = g.booth_number || `Booth ${idx + 1}`;
      const category = g.category || "Umum";
      const description = g.description || "";
      const full_description = g.fullDescription || description;
      const members = Array.isArray(g.members) ? g.members : (g.members ? g.members.split(";").map(m => m.trim()) : []);
      const slug = g.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const photo_color = g.photoColor || `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`;
      const votesVal = parseInt(g.votes) || 0;

      return {
        id,
        name,
        slug,
        booth_number,
        category,
        description,
        full_description,
        members,
        photo_color,
        votes: votesVal
      };
    });

    if (overwrite) {
      // Delete all groups (this will cascade delete votes in DB)
      const { error: delErr } = await supabase.from('groups').delete().neq('id', 'dummy_nonexistent_id');
      if (delErr) throw delErr;

      // Insert new ones
      const { error: insErr } = await supabase.from('groups').insert(formattedDbGroups);
      if (insErr) throw insErr;

      await addAuditLog("Admin Action", `Mengimpor ${formattedDbGroups.length} kelompok baru (menghapus data lama)`, "warning");
    } else {
      // Upsert: insert or update on conflict on id
      const { error: upsertErr } = await supabase
        .from('groups')
        .upsert(formattedDbGroups, { onConflict: 'id' });
        
      if (upsertErr) throw upsertErr;

      await addAuditLog("Admin Action", `Menambahkan/memperbarui ${formattedDbGroups.length} kelompok dari CSV`, "success");
    }

    res.json({ message: "Data kelompok berhasil diimpor", count: formattedDbGroups.length });
  } catch (error) {
    console.error("POST /api/admin/upload-groups error:", error);
    res.status(500).json({ error: "Failed to import groups" });
  }
});

// 7. Admin - Add Single Group Manually
app.post("/api/groups", async (req, res) => {
  const { name, booth_number, category, description, fullDescription, members, photoColor } = req.body;
  if (!name || !booth_number || !category) {
    return res.status(400).json({ error: "Nama, Booth, dan Kategori wajib diisi" });
  }

  try {
    const id = `g-${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    const dbGroup = {
      id,
      name,
      slug,
      booth_number,
      category,
      description: description || "",
      full_description: fullDescription || description || "",
      members: Array.isArray(members) ? members : (members ? members.split(";").map(m => m.trim()) : []),
      photo_color: photoColor || "linear-gradient(135deg, #1B4D3E, #4B8B3B)",
      votes: 0
    };

    const { data: insertedGroup, error } = await supabase
      .from('groups')
      .insert([dbGroup])
      .select()
      .single();
      
    if (error) throw error;
    const newGroup = mapGroup(insertedGroup);

    await addAuditLog("Admin Action", `Menambahkan kelompok manual: ${name} (${booth_number})`, "success");
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("POST /api/groups error:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// 8. Admin - Delete Group by ID
app.delete("/api/groups/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Check if exists
    const { data, error: fetchErr } = await supabase.from('groups').select('*').eq('id', id);
    if (fetchErr) throw fetchErr;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Kelompok tidak ditemukan" });
    }

    // Delete group (associated votes are cascade deleted in DB)
    const { error: delErr } = await supabase.from('groups').delete().eq('id', id);
    if (delErr) throw delErr;

    await addAuditLog("Admin Action", `Menghapus kelompok dengan ID: ${id}`, "warning");
    res.json({ message: "Kelompok berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/groups/:id error:", error);
    res.status(500).json({ error: "Failed to delete group" });
  }
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🟢 BACKEND SERVER IS RUNNING ON http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
