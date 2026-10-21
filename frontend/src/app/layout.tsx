import type { Metadata } from "next";
import { Josefin_Sans, Ma_Shan_Zheng, Nunito } from "next/font/google";
import type { ReactNode } from "react";
import AppShell from "../components/AppShell";
import "../styles/global.css";

const heading = Josefin_Sans({ subsets: ["latin"], variable: "--next-font-heading" });
// Chinese headings: Josefin has no CJK glyphs, so Chinese characters fall through to this.
// Large CJK font: preload off so only the slices a page actually uses are fetched.
const headingZh = Ma_Shan_Zheng({ weight: "400", preload: false, variable: "--next-font-heading-zh" });
const body = Nunito({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--next-font-body" });

export const metadata: Metadata = {
  title: "Voice PDF Book",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${headingZh.variable} ${body.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
