const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { mapGroup, adminAuth } = require("../utils/helpers");

// 4. Admin Dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const { data: dbGroups, error: groupsErr } = await supabase.from('groups').select('*');
    if (groupsErr) throw groupsErr;

    const { data: dbVotes, error: votesErr } = await supabase.from('votes').select('group_id, voted_at, created_at');
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

    // Calculate highest votes per category
    const categoryWinners = {};
    groupStats.forEach(g => {
      const cat = g.category || "Umum";
      if (!categoryWinners[cat] || g.votes > categoryWinners[cat].votes) {
        categoryWinners[cat] = g;
      }
    });

    // Calculate booth participation dynamically
    const totalBooths = dbGroups.length;
    const boothsWithVotes = dbGroups.filter(g => {
      const liveVotesCount = dbVotes.filter(v => v.group_id === g.id).length;
      return (g.votes + liveVotesCount) > 0;
    }).length;
    const participationRate = totalBooths > 0 ? Math.round((boothsWithVotes / totalBooths) * 100) : 0;

    // Calculate live voting speed (average votes per minute)
    let votingSpeed = 0;
    if (dbVotes.length > 1) {
      const timestamps = dbVotes.map(v => new Date(v.voted_at || v.created_at).getTime());
      const minTime = Math.min(...timestamps);
      const maxTime = Math.max(...timestamps);
      const diffMinutes = (maxTime - minTime) / 60000;
      const duration = Math.max(1, diffMinutes);
      votingSpeed = parseFloat((dbVotes.length / duration).toFixed(1));
    } else if (dbVotes.length === 1) {
      votingSpeed = 1.0;
    }

    res.json({
      totalVotes,
      groupStats,
      highestVotesByCategory: Object.entries(categoryWinners).map(([category, group]) => ({
        category,
        group
      })),
      participation: {
        rate: participationRate,
        votedBooths: boothsWithVotes,
        totalBooths: totalBooths
      },
      votingSpeed
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

// GET /api/dashboard/votes-detail
router.get("/votes-detail", adminAuth, async (req, res) => {
  try {
    // Fetch all live votes from DB and join with visitors and groups
    const { data: votes, error } = await supabase
      .from('votes')
      .select(`
        id,
        vote_code,
        voted_at,
        ip,
        visitor_identifier,
        visitors (
          name,
          category,
          email,
          universitas,
          sekolah,
          instansi
        ),
        group_id,
        groups (
          name,
          booth_number,
          category
        )
      `)
      .order('voted_at', { ascending: false });

    if (error) throw error;

    // Map output to a clean flat format
    const detailedVotes = (votes || []).map(v => {
      const visitorObj = Array.isArray(v.visitors) ? v.visitors[0] : v.visitors;
      const groupObj = Array.isArray(v.groups) ? v.groups[0] : v.groups;
      
      return {
        id: v.id,
        voteCode: v.vote_code,
        votedAt: v.voted_at,
        ip: v.ip,
        voter: {
          identifier: v.visitor_identifier,
          name: visitorObj ? visitorObj.name : "N/A",
          category: visitorObj ? visitorObj.category : "Umum",
          email: visitorObj ? visitorObj.email : "N/A",
          universitas: visitorObj ? visitorObj.universitas : "",
          sekolah: visitorObj ? visitorObj.sekolah : "",
          instansi: visitorObj ? visitorObj.instansi : ""
        },
        group: {
          id: v.group_id,
          name: groupObj ? groupObj.name : "Kelompok Terhapus",
          boothNumber: groupObj ? groupObj.booth_number : "N/A",
          category: groupObj ? groupObj.category : "N/A"
        }
      };
    });

    res.json(detailedVotes);
  } catch (error) {
    console.error("GET /api/dashboard/votes-detail error:", error);
    res.status(500).json({ error: "Failed to fetch detailed votes list" });
  }
});

// GET /api/dashboard/visitors-detail
router.get("/visitors-detail", adminAuth, async (req, res) => {
  try {
    // Fetch all registered visitors from DB
    const { data: visitors, error } = await supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(visitors || []);
  } catch (error) {
    console.error("GET /api/dashboard/visitors-detail error:", error);
    res.status(500).json({ error: "Failed to fetch detailed visitors list" });
  }
});

module.exports = router;
