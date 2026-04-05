import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Tongfuli",
  description: "《武林外传》AI 对话主站",
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
