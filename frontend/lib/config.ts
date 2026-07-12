export const getBackendUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Check if we are on localhost/127.0.0.1
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5050";
    }
    // For Vercel production deployment, route via Vercel rewrites to backend service
    return "/api/backend";
  }
  return "http://localhost:5050";
};
