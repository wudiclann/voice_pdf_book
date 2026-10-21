import type { Metadata } from "next";
import { Cormorant_Garamond, Nunito } from "next/font/google";
import type { ReactNode } from "react";
import AppShell from "../components/AppShell";
import "../styles/global.css";

const heading = Cormorant_Garamond({ weight: "600", subsets: ["latin"], variable: "--next-font-heading" });
const body = Nunito({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--next-font-body" });

export const metadata: Metadata = {
  title: "Voice PDF Book",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
