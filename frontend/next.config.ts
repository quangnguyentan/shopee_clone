import type { NextConfig } from "next";

const repo = "shopee_clone";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: isProd ? "export" : undefined,

  basePath: isProd ? `/${repo}` : undefined,
  assetPrefix: isProd ? `/${repo}/` : undefined,

  images: {
    unoptimized: true, //
  },

  experimental: {},

  env: {
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  },

  reactStrictMode: true,
};

export default nextConfig;
