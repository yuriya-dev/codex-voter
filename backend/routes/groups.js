const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { mapGroup, addAuditLog, adminAuth } = require("../utils/helpers");

// 1. GET all groups with vote counts
router.get("/", async (req, res) => {
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

// 7. Admin - Add Single Group Manually
router.post("/", adminAuth, async (req, res) => {
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
router.delete("/:id", adminAuth, async (req, res) => {
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

// 9. Admin - Update Group by ID
router.put("/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { name, booth_number, category, description, fullDescription, members, photoColor } = req.body;
  if (!name || !booth_number || !category) {
    return res.status(400).json({ error: "Nama, Booth, dan Kategori wajib diisi" });
  }

  try {
    // Check if exists
    const { data: existing, error: fetchErr } = await supabase.from('groups').select('*').eq('id', id);
    if (fetchErr) throw fetchErr;

    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "Kelompok tidak ditemukan" });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const updatedDbGroup = {
      name,
      slug,
      booth_number,
      category,
      description: description || "",
      full_description: fullDescription || description || "",
      members: Array.isArray(members) ? members : (members ? members.split(";").map(m => m.trim()) : []),
      photo_color: photoColor || existing[0].photo_color || "linear-gradient(135deg, #1B4D3E, #4B8B3B)"
    };

    const { data: updatedGroup, error: updateErr } = await supabase
      .from('groups')
      .update(updatedDbGroup)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    const mapped = mapGroup(updatedGroup);

    await addAuditLog("Admin Action", `Mengedit kelompok: ${name} (${booth_number})`, "success");
    res.json(mapped);
  } catch (error) {
    console.error("PUT /api/groups/:id error:", error);
    res.status(500).json({ error: "Failed to update group" });
  }
});

module.exports = router;
