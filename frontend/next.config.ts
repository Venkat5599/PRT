import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/_home/build/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
  // The landing page is a static build in public/ (landing.html, _home/, assets/).
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/landing.html" }], afterFiles: [], fallback: [] };
  },
};

export default config;
