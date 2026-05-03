"use client";

import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { useZodiac } from "@store/zodiac.store";
import { Zap, ShieldCheck, Database, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

export function WelcomeHandshake() {
  const { closeModal } = useModalStore();
  const { setScreen } = useZodiac();
  const [isDeploying, setIsDeploying] = useState(false);

  const handleStartShift = async () => {
    setIsDeploying(true);
    // 🧠 SYSTEM LOGIC: Simulate the "Node Spin-up"
    await new Promise((r) => setTimeout(r, 1500));
    setIsDeploying(false);

    closeModal();
    // Redirect directly to the Price Config to add their first roll
    setScreen("PRICE_ENTRY_CENTER");
  };

  return (
    <div className="p-12 text-center max-w-xl mx-auto animate-in zoom-in-95 duration-500">
      {/* --- ICON NODE --- */}
      <div className="w-24 h-24 bg-cyan-400/10 rounded-[2.5rem] border border-cyan-400/20 flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-cyan-400/10 relative">
        <Zap className="text-cyan-400" size={40} />
        <div className="absolute inset-0 rounded-[2.5rem] border border-cyan-400/40 animate-ping opacity-20" />
      </div>

      <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4 text-white">
        Initialize Node
      </h2>
      <p className="text-white/40 text-sm font-bold uppercase tracking-widest leading-relaxed mb-12">
        Authorization Successful. You are now deploying{" "}
        <span className="text-cyan-400">Scalable Power</span> to your workshop
        floor.
      </p>

      {/* --- SYSTEM PRE-CHECKS --- */}
      <div className="space-y-4 mb-12">
        <div className="flex items-center gap-5 p-5 bg-white/5 border border-white/5 rounded-3xl text-left hover:border-cyan-400/20 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 transition-all">
            <ShieldCheck
              size={24}
              className="text-emerald-500 group-hover:text-black"
            />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-white">
              Identity Verified
            </p>
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">
              Secure Session: 0x7x2a
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-5 bg-white/5 border border-white/5 rounded-3xl text-left hover:border-cyan-400/20 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-400/20 group-hover:bg-cyan-400 transition-all">
            <Database
              size={24}
              className="text-cyan-400 group-hover:text-black"
            />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-white">
              Cloud Sync Active
            </p>
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">
              Ledger Ready for Intake
            </p>
          </div>
        </div>
      </div>

      {/* --- CALL TO ACTION --- */}
      <button
        onClick={handleStartShift}
        disabled={isDeploying}
        className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-3 shadow-2xl hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-50"
      >
        {isDeploying ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            Start First Shift <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="mt-8 text-[8px] font-black uppercase text-white/10 tracking-[0.6em]">
        Zodiac Industrial OS • V2.0 Sovereign
      </p>
    </div>
  );
}
