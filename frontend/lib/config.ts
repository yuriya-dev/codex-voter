export const getBackendUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    
    // Detect local networks/IPs to dynamically target backend port 5050
    const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      isIP ||
      hostname.endsWith(".local")
    ) {
      return `http://${hostname}:5050`;
    }
    
    // For Vercel production deployment, route via Vercel rewrites to backend service
    return "/api/backend";
  }
  return "http://localhost:5050";
};

export const getGroupImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return "";
  
  // If it's already an absolute URL (http/https) or data URI, return as-is
  if (
    imagePath.startsWith("http://") || 
    imagePath.startsWith("https://") || 
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  
  // Auto-convert Google Drive viewer/sharing links to direct renderable source
  if (imagePath.includes("drive.google.com")) {
    const fileDMatch = imagePath.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
    }
    const idMatch = imagePath.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
  }

  // Prepend backend URL for relative paths (e.g. /uploads/...)
  const backendUrl = getBackendUrl();
  const base = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  
  return `${base}${path}`;
};

export const EXIT_UNLOCK_TOKEN = "jt-exit-gate-auth-9f82d7c5";


