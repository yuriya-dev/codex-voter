const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { addAuditLog, adminAuth } = require("../utils/helpers");

// 6. Admin - Upload/Import Groups via CSV/JSON
router.post("/upload-groups", adminAuth, async (req, res) => {
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

module.exports = router;
