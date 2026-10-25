import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default config;
