// File: app/layout.tsx
// Purpose: Root layout for 3-AMS-CELMS using Tailwind, CSS variables, and TopBar

import "./globals.css";
import Header from "@/app/components/home/Header";
import Footer from "@/app/components/home/Footer";
import TopBar from "@/app/components/home/TopBar";
import React, { ReactNode } from "react";
import { Inter } from "next/font/google"; // ✅ fixed import
import YearTag from "./components/home/YearTag";

// Load Inter font
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className="flex flex-col min-h-screen font-sans"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Top thin bar with contact info and social icons */}
        {/* <TopBar /> */}

        {/* Main header/navigation */}
        {/* <Header /> */}

        {/* Page content */}
        <main className="flex-1 w-full">{children}</main>

        {/* Footer */}
        {/* <Footer />
        <YearTag /> */}
      </body>
    </html>
  );
}

/*
Design reasoning
- Inter chosen for corporate readability and modern clean look.
- Applied globally via Tailwind `font-sans` and CSS variable --font-sans.
- Ensures consistent typography across TopBar, Header, content, Footer.

Structure
- <html lang="en" className={inter.variable}> → applies font CSS variable globally.
- <body className="font-sans"> → all text inherits Inter.

Implementation guidance
- Tailwind classes like `font-sans` now map to Inter.
- Easy to swap corporate fonts by changing Next.js font import and CSS variable.

Scalability insight
- Adding other fonts for headings/monospace remains simple using same Next.js font loader.
- Supports dynamic theme switching without breaking typography consistency.
*/
