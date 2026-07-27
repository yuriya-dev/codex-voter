const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const supabase = require("../config/supabase");

async function migrate() {
  console.log("🚀 Starting migration of local uploads to Supabase Storage...");
  console.log("Supabase URL:", process.env.SUPABASE_URL);

  try {
    // 1. Fetch all groups from Supabase
    const { data: groups, error } = await supabase.from("groups").select("*");
    if (error) {
      console.error("❌ Error fetching groups from database:", error.message);
      return;
    }

    console.log(`Found ${groups.length} groups in database.`);

    for (const group of groups) {
      if (group.image && group.image.startsWith("/uploads/")) {
        const localFileName = group.image.replace("/uploads/", "");
        const localFilePath = path.join(__dirname, "..", "uploads", localFileName);

        console.log(`Checking local file for group "${group.name}": ${localFilePath}`);

        if (fs.existsSync(localFilePath)) {
          const buffer = fs.readFileSync(localFilePath);
          const ext = path.extname(localFileName) || ".png";
          const mimeType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : `image/${ext.replace(".", "")}`;

          console.log(`Uploading ${localFileName} to Supabase Storage...`);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("group-images")
            .upload(localFileName, buffer, {
              contentType: mimeType,
              upsert: true
            });

          if (uploadError) {
            console.error(`❌ Failed to upload ${localFileName}:`, uploadError.message);
            continue;
          }

          const { data: publicUrlData } = supabase.storage
            .from("group-images")
            .getPublicUrl(localFileName);

          const newImageUrl = publicUrlData.publicUrl;
          console.log(`✅ Uploaded! New URL: ${newImageUrl}`);

          // Update database record
          const { error: updateError } = await supabase
            .from("groups")
            .update({ image: newImageUrl })
            .eq("id", group.id);

          if (updateError) {
            console.error(`❌ Failed to update database for group ${group.id}:`, updateError.message);
          } else {
            console.log(`🎉 Database updated for group "${group.name}".`);
          }
        } else {
          console.warn(`⚠️ Local file not found: ${localFilePath}`);
        }
      } else {
        console.log(`Skipping group "${group.name}" (already absolute URL or no image).`);
      }
    }

    console.log("🏁 Migration process finished.");
  } catch (err) {
    console.error("❌ Migration exception:", err);
  }
}

migrate();
