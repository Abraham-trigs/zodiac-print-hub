import "./globals.css";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { WebModalContainer } from "./lib/components/web/modals/WebModalContainer";
import type { Metadata } from "next";

const inter = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zodiac Node | Industrial Operating System",
  description:
    "Eliminate material leakage and automate high-velocity print production.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} scroll-smooth`}
    >
      <body className="bg-[#020617] font-sans text-white antialiased selection:bg-cyan-500/30 overflow-x-hidden">
        {/* --- 🌌 NEBULA ATMOSPHERE (Root Level) --- */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Top Right Purple Glow */}
          <div className="absolute top-[-10%] right-[-5%] w-[80vw] h-[80vw] bg-purple-600/10 blur-[150px] rounded-full opacity-60" />

          {/* Bottom Left Cyan Glow */}
          <div className="absolute bottom-[0%] left-[-10%] w-[60vw] h-[60vw] bg-cyan-500/10 blur-[150px] rounded-full opacity-40" />

          {/* Industrial Grid Mask */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_100%)] opacity-[0.03]" />

          {/* Global Scanline Utility */}
          <div className="scanline absolute inset-0 opacity-[0.05]" />
        </div>

        {/* --- 🛰️ MAIN VIEWPORT NODE --- */}
        <main className="relative z-10 min-h-screen flex flex-col">
          {children}
        </main>

        {/* --- 🧪 GLOBAL OVERLAY LAYER --- */}
        {/* This container listens to webModalStore and slides over everything */}
        <WebModalContainer />

        {/* --- 🛠️ DEVELOPMENT TOOLS (Optional) --- */}
        {/* Add Vercel Analytics, Speed Insights, etc here */}
      </body>
    </html>
  );
}
