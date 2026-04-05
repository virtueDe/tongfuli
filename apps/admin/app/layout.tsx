import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Tongfuli Admin",
  description: "Tongfuli 后台管理台",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
