/**
 * Compresses an image file on the client side before uploading.
 * - Resizes so that width and height do not exceed maxWidth and maxHeight (default: 1200px)
 * - Outputs as progressive JPEG with the specified quality (default: 0.8)
 */
export const compressImageClient = (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<{ base64: string; fileName: string }> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File yang dipilih bukan gambar"));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio-preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Gagal menginisialisasi canvas untuk kompresi gambar"));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas contents to JPEG base64 string with specified quality
        const base64 = canvas.toDataURL("image/jpeg", quality);
        
        // Generate new file name with .jpg extension
        const lastDot = file.name.lastIndexOf(".");
        const baseName = lastDot !== -1 ? file.name.substring(0, lastDot) : file.name;
        const fileName = `${baseName}-compressed.jpg`;

        resolve({ base64, fileName });
      };

      img.onerror = (error) => {
        reject(error);
      };
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};
