"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { useDataActions } from "@lib/client/hooks/store.hooks";
export default function ZodiacLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { initData } = useDataActions(); // ✅ Destructure clean action

  useEffect(() => {
    setMounted(true);
    initData();
  }, [initData]);

  // Prevent Hydration Mismatch
  if (!mounted) {
    return <div className="mobile-wrapper" style={{ visibility: "hidden" }} />;
  }

  return <div className="mobile-wrapper">{children}</div>;
}
