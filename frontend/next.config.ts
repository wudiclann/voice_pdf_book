import type { NextConfig } from "next";

// Backend routes proxied to FastAPI on :8000, so the frontend can call relative
// /documents, /chat, /audio, etc. paths without hardcoding a backend origin.
// Page routes (/library, /books/[id], /preferences) must not overlap these -- a
// matching page would be served instead of the proxied backend response, which is
// why the Settings page lives at /preferences rather than /settings.
const BACKEND_PATHS = ["documents", "conversations", "chat", "ask", "transcribe", "audio", "settings"];

const nextConfig: NextConfig = {
  experimental: {
    // /ask runs ASR + RAG + TTS in one request; the 30s default proxy timeout is too short.
    proxyTimeout: 180_000,
    // The proxy truncates request bodies at 10MB by default, which hangs PDF uploads.
    // The backend caps uploads at 50MB (documents.py MAX_UPLOAD_BYTES); leave headroom
    // so oversized files still get the backend's own error rather than a truncated body.
    proxyClientMaxBodySize: "60mb",
  },
  async rewrites() {
    return BACKEND_PATHS.flatMap((path) => [
      { source: `/${path}`, destination: `http://localhost:8000/${path}` },
      { source: `/${path}/:rest*`, destination: `http://localhost:8000/${path}/:rest*` },
    ]);
  },
};

export default nextConfig;
