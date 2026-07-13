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
      voting_end_time: ""
    };

    if (!error && data) {
      data.forEach(item => {
        if (item.key === "max_votes") settings.max_votes = parseInt(item.value) || 3;
        if (item.key === "leaderboard_visible") settings.leaderboard_visible = item.value;
        if (item.key === "voting_status") settings.voting_status = item.value;
        if (item.key === "voting_end_time") settings.voting_end_time = item.value;
      });
    }

    res.json(settings);
  } catch (err) {
    res.json({
      max_votes: 3,
      leaderboard_visible: "false",
      voting_status: "not_started",
      voting_end_time: ""
    });
  }
});

// Update settings
router.post("/", adminAuth, async (req, res) => {
  const { max_votes, leaderboard_visible, voting_status, voting_end_time } = req.body;
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

module.exports = router;
