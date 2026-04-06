import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "蘑菇計時器",
  description: "皮克敏蘑菇倒數計時工具",
  // 這段是讓 iOS 存到桌面時使用的圖示
  icons: {
    apple: '/apple-icon.png', // 指向你放在 public 資料夾裡的圖示
  },
  // 這段可以讓網頁存成桌面捷徑時，隱藏瀏覽器的上下網址列，看起來更像 App
  appleWebApp: {
    capable: true,
    title: "蘑菇計時器",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}