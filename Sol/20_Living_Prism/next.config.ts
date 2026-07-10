import type { NextConfig } from "next";

const observatoryBasePath = (process.env.NEXT_PUBLIC_OBSERVATORY_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "export",
  basePath: observatoryBasePath,
  images: { unoptimized: true },
};

export default nextConfig;
