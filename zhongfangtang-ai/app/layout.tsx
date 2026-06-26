import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "中芳堂 AI 智能客服",
  description: "中医养生 · 芳香疗法 · 精准养生",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        {children}
      </body>
    </html>
  );
}
