import type { NextConfig } from "next";
import { env } from "./src/common/config/env.config";
const repo = "shopee_clone";

const nextConfig: NextConfig = {
  output: env.isProd ? "export" : undefined,
  basePath: env.isProd ? `/${repo}` : undefined,
  assetPrefix: env.isProd ? `/${repo}/` : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
