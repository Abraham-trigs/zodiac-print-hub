"use client";

import { useWebModal } from "@/store/webModalStore";
import { HandshakeButton } from "./lib/components/web/HandshakeButton";
import {
  Zap,
  Activity,
  ShieldCheck,
  ArrowRight,
  Terminal,
  Globe,
} from "lucide-react";

/**
 * ZODIAC_GLOBAL_TERMINAL
 * The primary public node for the Industrial Operating System.
 * Designed for conversion via high-octane visual validation.
 */
export default function LandingPage() {
  const { openModal } = useWebModal();

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden selection:bg-cyan-500/30">
      {/* --- ATMOSPHERIC LAYERS (The Nebula Loop) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Top-Right Purple Engine */}
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-purple-600/10 blur-[150px] rounded-full opacity-60 animate-pulse" />
        {/* Bottom-Left Cyan Engine */}
        <div className="absolute bottom-[5%] left-[-5%] w-[60vw] h-[60vw] bg-cyan-500/10 blur-[150px] rounded-full opacity-40" />
        {/* The Grid Infrastructure */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] opacity-[0.03]" />
      </div>

      {/* --- NAVIGATION (Terminal Glass) --- */}
      <nav className="w-full h-20 border-b border-white/5 flex items-center justify-between px-8 md:px-16 backdrop-blur-2xl sticky top-0 z-50 bg-[#020617]/40">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-black text-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] group-hover:scale-110 transition-all duration-500">
            Z
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-black uppercase tracking-[0.2em] text-[10px] leading-none">
              Zodiac Node
            </span>
            <span className="text-[7px] text-cyan-400 font-bold uppercase tracking-[0.4em] mt-1 opacity-60">
              Industrial OS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8 md:gap-12">
          <div className="hidden md:flex items-center gap-10">
            {["Solutions", "Pricing"].map((item) => (
              <button
                key={item}
                onClick={() => openModal(item.toUpperCase() as any)}
                className="font-mono text-[9px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 hover:text-cyan-400 transition-all relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-cyan-400 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>
          <HandshakeButton
            label="Terminal Access"
            className="scale-90 md:scale-100"
          />
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 md:pt-40 pb-20 px-6 text-center max-w-6xl z-10">
        {/* Status Badge (Skeuomorphic) */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">
            Handshake: <span className="text-emerald-400">Authenticated</span>
          </span>
          <div className="w-[1px] h-3 bg-white/10 mx-1" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 font-mono">
            v2.0-PROD
          </span>
        </div>

        {/* Main Heading (Nebula Typography) */}
        <h1 className="text-6xl md:text-[9.5rem] font-black italic tracking-[calc(-0.06em)] uppercase leading-[0.75] mb-10 text-white">
          The Industrial <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-glow-cyan">
            Operating System
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base md:text-xl font-medium text-white/30 mb-16 leading-relaxed px-4">
          Eliminate material leakage, automate your supply chain, and
          orchestrate high-velocity production from a single, unified command
          center.
        </p>

        {/* Action Node (High-Contrast Interaction) */}
        <div className="flex flex-col md:flex-row justify-center gap-5 px-4 mb-24">
          <button
            onClick={() => openModal("ACCESS_REQUEST")}
            className="selection-pill px-14 py-7 text-xs flex items-center justify-center gap-3 group active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.05)]"
          >
            Authorize Node Access
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1.5 transition-transform"
            />
          </button>

          <button
            onClick={() => openModal("WASTE_AUDIT")}
            className="px-14 py-7 bg-white/5 border border-white/10 text-white font-black uppercase text-xs rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95 backdrop-blur-xl group"
          >
            <Activity
              size={18}
              className="text-cyan-400 group-hover:scale-110 transition-transform"
            />
            Launch Leakage Audit
          </button>
        </div>
      </section>

      {/* --- LIVE SYSTEM FOOTER --- */}
      <footer className="w-full py-6 border-t border-white/5 mt-auto flex flex-col md:flex-row items-center justify-between px-12 bg-[#020617]/80 backdrop-blur-2xl font-mono text-[9px] text-white/20 gap-6">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="uppercase tracking-[0.2em] font-black">
              Network Node: Stable
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Globe size={10} className="opacity-40" />
            <span className="uppercase tracking-[0.2em] font-black">
              Region: GHANA_WEST_01
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 py-1.5 px-4 bg-white/5 rounded-xl border border-white/5 group hover:border-cyan-400/20 transition-all cursor-default">
          <Terminal size={10} className="text-cyan-400" />
          <p className="tracking-[0.4em] uppercase font-black">
            System_ID:{" "}
            <span className="text-white/60 group-hover:text-cyan-400 transition-colors">
              ZODIAC_CORE_v2.0
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
