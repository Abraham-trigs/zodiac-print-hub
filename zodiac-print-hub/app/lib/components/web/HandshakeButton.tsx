"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface Props {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}

/**
 * HANDSHAKE_BUTTON
 * The primary interaction node for the Zodiac Website.
 * Features a CSS-driven scanline animation on hover.
 */
export function HandshakeButton({
  label,
  onClick,
  variant = "primary",
  className = "",
}: Props) {
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={onClick}
      className={`
        group relative overflow-hidden transition-all duration-300 active:scale-95
        px-8 py-3 rounded-xl font-mono text-[10px] font-black uppercase tracking-[0.2em]
        flex items-center gap-3
        ${
          isPrimary
            ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            : "bg-white/5 text-white/40 border border-white/10 hover:border-white/20 hover:text-white"
        }
        ${className}
      `}
    >
      {/* ⚡ THE SCANLINE EFFECT */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[30deg] group-hover:left-[150%] transition-all duration-700 ease-in-out" />
      </div>

      <span className="relative z-10">{label}</span>

      <ChevronRight
        size={14}
        className={`relative z-10 transition-transform duration-300 group-hover:translate-x-1 ${isPrimary ? "text-black" : "text-cyan-400"}`}
      />

      {/* BACKGROUND GLOW (Primary Only) */}
      {isPrimary && (
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      )}
    </button>
  );
}
