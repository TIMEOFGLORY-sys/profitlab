import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProfitLab — Marketplace Profit Control",
  description: "Profit control system untuk seller Shopee dan TikTok Shop Indonesia."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
