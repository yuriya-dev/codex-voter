const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const supabase = require("../config/supabase");
const { processAndSaveImage } = require("./imageProcessor");

async function run() {
  console.log("🚀 Starting database-wide image optimization...");
  console.log("Supabase URL:", process.env.SUPABASE_URL);

  try {
    // 1. Fetch all groups from Supabase
    const { data: groups, error } = await supabase.from("groups").select("*");
    if (error) {
      console.error("❌ Error fetching groups from database:", error.message);
      return;
    }

    console.log(`Found ${groups.length} groups in database.`);

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (const group of groups) {
      const currentImage = group.image || "";
      
      if (!currentImage) {
        console.log(`Skipping group "${group.name}" (no image).`);
        skipCount++;
        continue;
      }

      // Check if it's already an optimized/compressed image in Supabase storage
      const isAlreadyOptimized = 
        currentImage.includes("supabase.co") && 
        currentImage.includes("group-images") && 
        (currentImage.endsWith(".jpg") || currentImage.includes("-compressed") || currentImage.includes("img-"));

      if (isAlreadyOptimized) {
        console.log(`Skipping group "${group.name}" (already optimized: ${currentImage}).`);
        skipCount++;
        continue;
      }

      console.log(`--------------------------------------------------`);
      console.log(`Optimizing image for group "${group.name}"...`);
      console.log(`Current image: ${currentImage}`);

      try {
        const newImageUrl = await processAndSaveImage(currentImage, `${group.slug}.jpg`);

        if (newImageUrl && newImageUrl !== currentImage) {
          console.log(`✅ Processed successfully. New URL/Path: ${newImageUrl}`);

          // Update database record
          const { error: updateError } = await supabase
            .from("groups")
            .update({ image: newImageUrl })
            .eq("id", group.id);

          if (updateError) {
            console.error(`❌ Failed to update database for group ${group.id}:`, updateError.message);
            failCount++;
          } else {
            console.log(`🎉 Database updated for group "${group.name}".`);
            successCount++;
          }
        } else {
          console.log(`⚠️ Image stayed the same or failed to process: ${newImageUrl}`);
          skipCount++;
        }
      } catch (err) {
        console.error(`❌ Error processing group "${group.name}":`, err.message);
        failCount++;
      }
    }

    console.log(`==================================================`);
    console.log(`🏁 Image optimization finished!`);
    console.log(`Successful updates: ${successCount}`);
    console.log(`Skipped: ${skipCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`==================================================`);
  } catch (err) {
    console.error("❌ Exception during optimization run:", err);
  }
}

run();
