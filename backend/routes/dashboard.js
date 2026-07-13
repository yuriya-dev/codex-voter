const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { mapGroup, adminAuth } = require("../utils/helpers");

// 4. Admin Dashboard stats
router.get("/stats", async (req, res) => {
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
router.get("/logs", adminAuth, async (req, res) => {
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

module.exports = router;
