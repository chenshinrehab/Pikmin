import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public", // Service Worker 生成的目錄
  cacheOnFrontEndNav: true, // 開啟前端導航快取
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swMinify: true, // 壓縮 Service Worker
  disable: process.env.NODE_ENV === "development", // 開發環境下停用 PWA 以便除錯
  workboxOptions: {
    expiration: {
      maxEntries: 64,
      maxAgeSeconds: 24 * 60 * 60, // 24 hours
    },
  },
});

const nextConfig: NextConfig = {
  /* 在這裡放入你原本的其他設定選項 */
  reactStrictMode: true,
};

export default withPWA(nextConfig);