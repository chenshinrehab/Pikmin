import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 設定行動裝置的視窗行為 (PWA 必要)
export const viewport: Viewport = {
  themeColor: "#0f172a", // 狀態列顏色
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 避免手機版意外縮放影響 App 體感
};

export const metadata: Metadata = {
  title: "陳醫師的社群 AI 中控台",
  description: "林醫師專屬社群內容生成器，針對竹科人、旅遊族、店家精準選題",
  manifest: "/manifest.json", // 連結 PWA 身份證
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.png", // iOS 桌面圖示
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // 讓 App 頂部與系統狀態列融合
    title: "AI 小編",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        {/* 這裡可以包裹你未來的 Navbar 或其他全域組件 */}
        {children}
      </body>
    </html>
  );
}