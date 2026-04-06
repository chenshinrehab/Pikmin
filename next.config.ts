import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    expiration: {
      maxEntries: 64,
      maxAgeSeconds: 24 * 60 * 60,
    },
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 修正點：加入空的 turbopack 設定，以允許 next-pwa 使用 webpack
  experimental: {
    turbopack: {
      // 這裡留空即可，目的是告訴 Next.js 我們知道正在使用自定義配置
    },
  },
};

export default withPWA(nextConfig);