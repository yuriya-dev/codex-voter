const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { addAuditLog, adminAuth } = require("../utils/helpers");

// Get settings
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("*");

    const settings = {
      max_votes: 3,
      leaderboard_visible: "false",
      voting_status: "not_started",
      voting_end_time: "",
      session_history: "[]"
    };

    if (!error && data) {
      data.forEach(item => {
        if (item.key === "max_votes") settings.max_votes = parseInt(item.value) || 3;
        if (item.key === "leaderboard_visible") settings.leaderboard_visible = item.value;
        if (item.key === "voting_status") settings.voting_status = item.value;
        if (item.key === "voting_end_time") settings.voting_end_time = item.value;
        if (item.key === "session_history") settings.session_history = item.value;
      });
    }

    res.json(settings);
  } catch (err) {
    res.json({
      max_votes: 3,
      leaderboard_visible: "false",
      voting_status: "not_started",
      voting_end_time: "",
      session_history: "[]"
    });
  }
});

// Update settings
router.post("/", adminAuth, async (req, res) => {
  const { max_votes, leaderboard_visible, voting_status, voting_end_time, session_history } = req.body;
  const updates = [];

  if (max_votes !== undefined) {
    const limit = parseInt(max_votes);
    if (!isNaN(limit) && limit >= 1) {
      updates.push({ key: "max_votes", value: limit.toString() });
    }
  }

  if (leaderboard_visible !== undefined) {
    updates.push({ key: "leaderboard_visible", value: leaderboard_visible.toString() });
  }

  if (voting_status !== undefined) {
    updates.push({ key: "voting_status", value: voting_status.toString() });
  }

  if (voting_end_time !== undefined) {
    updates.push({ key: "voting_end_time", value: voting_end_time.toString() });
  }

  if (session_history !== undefined) {
    updates.push({ key: "session_history", value: session_history.toString() });
  }

  try {
    if (updates.length > 0) {
      for (const update of updates) {
        const { error } = await supabase
          .from("settings")
          .upsert(update);
        if (error) throw error;
      }
      await addAuditLog("Admin Action", `Mengubah pengaturan admin: ${updates.map(u => `${u.key}=${u.value}`).join(", ")}`, "warning");
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Gagal menyimpan pengaturan:", err.message);
    res.status(500).json({ error: "Gagal menyimpan pengaturan." });
  }
});

// Archive current session and reset all votes, visitors, and group vote counts (Solusi B+)
router.post("/archive", adminAuth, async (req, res) => {
  const { sessionName } = req.body;
  if (!sessionName) {
    return res.status(400).json({ error: "Nama sesi wajib diisi" });
  }

  try {
    // 1. Dapatkan statistik saat ini sebelum data dibersihkan
    const { count: totalVisitors, error: visErr } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true });
    if (visErr) throw visErr;

    const { count: totalVotes, error: voteErr } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true });
    if (voteErr) throw voteErr;

    const { data: settingsData } = await supabase.from('settings').select('*');
    let maxVotes = "3";
    let historyStr = "[]";

    if (settingsData) {
      settingsData.forEach(item => {
        if (item.key === "max_votes") maxVotes = item.value;
        if (item.key === "session_history") historyStr = item.value;
      });
    }

    // 2. Dapatkan seluruh data kelompok dan data suara untuk menghitung perolehan suara riil
    const { data: dbVotes, error: dbVotesErr } = await supabase
      .from('votes')
      .select('group_id');
    if (dbVotesErr) throw dbVotesErr;

    const { data: dbGroups, error: gErr } = await supabase
      .from('groups')
      .select('id, name, booth_number, category, votes');
    if (gErr) throw gErr;

    const actualGroups = dbGroups.map(g => {
      const extraVotes = dbVotes.filter(v => v.group_id === g.id).length;
      return {
        id: g.id,
        name: g.name,
        booth_number: g.booth_number,
        category: g.category,
        votes: g.votes + extraVotes
      };
    });

    // Urutkan berdasarkan suara terbanyak
    actualGroups.sort((a, b) => b.votes - a.votes);

    // 3 Besar pemenang sesi sebagai ringkasan singkat
    const summary = actualGroups && actualGroups.length > 0
      ? actualGroups.slice(0, 3).map(g => `${g.booth_number}: ${g.name} (${g.votes} suara)`).join(" | ")
      : "Tidak ada data suara";

    // 3. Buat item riwayat sesi baru (menyimpan seluruh suara kelompok)
    const historyItem = {
      id: `session-${Date.now()}`,
      name: sessionName.trim(),
      archivedAt: new Date().toISOString(),
      totalVisitors: totalVisitors || 0,
      totalVotes: totalVotes || 0,
      maxVotes: parseInt(maxVotes) || 3,
      topGroups: summary,
      groups: actualGroups // Menyimpan seluruh kelompok dan suaranya untuk dilihat & diekspor oleh admin
    };

    let history = [];
    try {
      history = JSON.parse(historyStr);
      if (!Array.isArray(history)) history = [];
    } catch (e) {
      history = [];
    }
    history.push(historyItem);

    // 4. Simpan riwayat sesi yang diperbarui ke tabel settings
    const { error: histErr } = await supabase
      .from('settings')
      .upsert({ key: "session_history", value: JSON.stringify(history) });
    if (histErr) throw histErr;

    // 5. Hard Reset Database: Hapus seluruh data vote & visitor (membersihkan pembatasan IP/Device)
    const { error: delVotesErr } = await supabase.from('votes').delete().neq('id', -1);
    if (delVotesErr) throw delVotesErr;

    const { error: delVisitorsErr } = await supabase.from('visitors').delete().neq('identifier', 'dummy');
    if (delVisitorsErr) throw delVisitorsErr;

    // 6. Reset perolehan suara seluruh kelompok ke 0
    const { error: resetGroupsErr } = await supabase.from('groups').update({ votes: 0 }).neq('id', 'dummy');
    if (resetGroupsErr) throw resetGroupsErr;

    // 7. Reset status sesi voting yang sedang aktif
    await supabase.from('settings').upsert({ key: "voting_status", value: "not_started" });
    await supabase.from('settings').upsert({ key: "voting_end_time", value: "" });

    await addAuditLog("Session Archived", `Sesi '${sessionName}' diarsipkan. Data pengunjung, IP, dan suara berhasil dibersihkan untuk sesi baru.`, "warning");

    res.json({ success: true, historyItem });
  } catch (err) {
    console.error("Gagal mengarsipkan sesi:", err);
    res.status(500).json({ error: "Gagal mengarsipkan sesi: " + err.message });
  }
});

module.exports = router;
