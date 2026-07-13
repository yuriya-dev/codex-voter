const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { addAuditLog } = require("../utils/helpers");

// Get settings (max_votes)
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "max_votes")
      .single();

    if (error) {
      // If table doesn't exist or setting is missing, return default
      return res.json({ max_votes: 3 });
    }

    res.json({ max_votes: parseInt(data.value) || 3 });
  } catch (err) {
    res.json({ max_votes: 3 });
  }
});

// Update settings (max_votes)
router.post("/", async (req, res) => {
  const { max_votes } = req.body;
  const limit = parseInt(max_votes);
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ error: "Batas voting harus berupa angka minimal 1" });
  }

  try {
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "max_votes", value: limit.toString() });

    if (error) {
      throw error;
    }

    await addAuditLog("Admin Action", `Mengubah batas maksimum voting menjadi ${limit} kelompok`, "warning");
    res.json({ success: true, max_votes: limit });
  } catch (err) {
    console.error("Gagal menyimpan pengaturan:", err.message);
    res.status(500).json({ error: "Gagal menyimpan pengaturan. Pastikan tabel 'settings' sudah dibuat di database." });
  }
});

module.exports = router;
