const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const supabase = require("../config/supabase");

/**
 * Downloads an image from a URL and returns its buffer and original file extension.
 * Handles Google Drive links by resolving them to direct download links.
 */
async function downloadImage(url) {
  try {
    let targetUrl = url;

    // Convert Google Drive link to direct download link if needed
    if (url.includes("drive.google.com")) {
      const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileDMatch && fileDMatch[1]) {
        targetUrl = `https://drive.google.com/uc?export=download&id=${fileDMatch[1]}`;
      } else {
        const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
          targetUrl = `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
        }
      }
    }

    console.log(`[ImageProcessor] Downloading image from: ${targetUrl}`);
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download image: HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.startsWith("image/") && !url.includes("drive.google.com")) {
      console.warn(`[ImageProcessor] Content-Type is not image: ${contentType}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine extension from content-type or URL
    let ext = ".jpg";
    if (contentType) {
      if (contentType.includes("png")) ext = ".png";
      else if (contentType.includes("webp")) ext = ".webp";
      else if (contentType.includes("gif")) ext = ".gif";
    } else {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;
      const parsedExt = path.extname(pathname);
      if (parsedExt) ext = parsedExt;
    }

    return { buffer, ext };
  } catch (error) {
    console.error(`[ImageProcessor] Error downloading image from ${url}:`, error.message);
    return null;
  }
}

/**
 * Compresses an image buffer using sharp:
 * - Resizes to max 1200px width/height while preserving aspect ratio (without enlargement).
 * - Converts to optimized progressive JPEG with quality 80.
 */
async function compressImage(buffer) {
  try {
    console.log("[ImageProcessor] Compressing image with sharp...");
    const compressedBuffer = await sharp(buffer)
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true
      })
      .jpeg({
        quality: 80,
        progressive: true,
        force: true // Force conversion to JPEG
      })
      .toBuffer();
    
    return compressedBuffer;
  } catch (error) {
    console.error("[ImageProcessor] Sharp compression failed. Buffer is likely not a valid image:", error.message);
    throw error;
  }
}

/**
 * Saves processed buffer to Supabase Storage or local disk fallback.
 * Returns the public URL / local path.
 */
async function saveImage(buffer, fileName) {
  const cleanExt = ".jpg"; // Since we force convert to JPEG
  const baseName = path.basename(fileName, path.extname(fileName));
  const uniqueName = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}${cleanExt}`;

  // 1. Try uploading to Supabase Storage
  try {
    console.log(`[ImageProcessor] Uploading ${uniqueName} to Supabase bucket 'group-images'...`);
    const { data, error } = await supabase.storage
      .from("group-images")
      .upload(uniqueName, buffer, {
        contentType: "image/jpeg",
        upsert: true
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from("group-images")
      .getPublicUrl(uniqueName);

    if (publicUrlData && publicUrlData.publicUrl) {
      console.log(`[ImageProcessor] Successfully uploaded to Supabase: ${publicUrlData.publicUrl}`);
      return publicUrlData.publicUrl;
    }
  } catch (storageError) {
    console.warn("[ImageProcessor] Supabase Storage upload failed, falling back to local storage:", storageError.message);
  }

  // 2. Fallback: Save locally
  try {
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(filePath, buffer);
    console.log(`[ImageProcessor] Saved locally (fallback): /uploads/${uniqueName}`);
    return `/uploads/${uniqueName}`;
  } catch (fsError) {
    console.error("[ImageProcessor] Failed to save image locally:", fsError.message);
    throw fsError;
  }
}

/**
 * Main function to process any image input (URL, base64 data URL, or raw base64)
 * downloads it if URL, compresses it, and saves it.
 */
async function processAndSaveImage(input, defaultFileName = "image.png") {
  if (!input || typeof input !== "string") return "";

  try {
    let buffer;
    let fileName = defaultFileName;

    // Check if input is base64 Data URL or raw base64
    if (input.startsWith("data:image/") || /^[a-zA-Z0-9+/=]+$/.test(input.replace(/^data:image\/\w+;base64,/, ""))) {
      const base64Data = input.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
    } 
    // Check if input is a web URL
    else if (input.startsWith("http://") || input.startsWith("https://")) {
      const downloadResult = await downloadImage(input);
      if (!downloadResult) {
        // If download fails, return original URL as fallback
        console.warn(`[ImageProcessor] Could not download image from URL, falling back to original URL: ${input}`);
        return input;
      }
      buffer = downloadResult.buffer;
      fileName = path.basename(new URL(input).pathname) || defaultFileName;
    } 
    // Otherwise, it might be a local path that is already processed
    else {
      return input;
    }

    // Compress buffer
    let compressedBuffer;
    try {
      compressedBuffer = await compressImage(buffer);
    } catch (compressError) {
      console.warn(`[ImageProcessor] Image compression failed for ${fileName}. Returning original input.`);
      return input;
    }

    // Save and return path/URL
    return await saveImage(compressedBuffer, fileName);
  } catch (error) {
    console.error("[ImageProcessor] processAndSaveImage error:", error.message);
    return input; // Fallback to original input
  }
}

module.exports = {
  downloadImage,
  compressImage,
  saveImage,
  processAndSaveImage
};
