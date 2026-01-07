import type { NextConfig } from "next";
const repo = "shopee_clone";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: isProd ? "export" : undefined,
  basePath: isProd ? `/${repo}` : undefined,
  assetPrefix: isProd ? `/${repo}/` : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
