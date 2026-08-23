import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小兔咻 · 番茄钟",
  description: "一只陪你专注、休息与完成计划的小兔番茄钟。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN"><body>{children}</body></html>
  );
}
