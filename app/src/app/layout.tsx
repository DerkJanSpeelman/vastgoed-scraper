import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/styles/global.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vastgoed Scraper",
  description: "Dutch real estate listing scraper",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
