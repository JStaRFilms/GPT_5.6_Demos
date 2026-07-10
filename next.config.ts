import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/generated/transcripts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" }
        ]
      },
      {
        source: "/generated/demos/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=86400" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" }
        ]
      }
    ];
  }
};

export default nextConfig;
