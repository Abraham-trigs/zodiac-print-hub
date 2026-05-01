"use client";

import { useModalStore } from "@store/useModalStore";
import { ClassificationHub } from "./ClassificationHub";
import { PricingUnitVault } from "./PricingUnitVault";
import { Settings2 } from "lucide-react"; // 🚀 Icon for Logic Jump

/**
 * QUICK_EDIT_UNITS
 * Simplified trigger for the specialized Pricing Unit Vault.
 */
export function QuickEditUnits({ current }: { current: string }) {
  const { openModal, swapModal } = useModalStore();

  const handleOpenVault = () => {
    openModal("GLOBAL", PricingUnitVault);
  };

  /**
   * 🚀 THE RULE: BUTTON TO OPEN SPECIFIC ELEMENT (Logic Hub)
   * This allows the user to jump back to classify 'Calculation Type'
   * if they realize the unit requires a different pricing brain.
   */
  const handleJumpToLogic = () => {
    swapModal("DOWN", ClassificationHub);
  };

  return (
    <div className="flex flex-col h-full w-full p-6 text-white animate-in slide-in-from-bottom duration-500">
      <div className="max-w-md mx-auto w-full text-center flex-1 flex flex-col items-center justify-center">
        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-10 block">
          Measurement Basis
        </span>

        {/* THE UNIT BUTTON: Standardised selection point */}
        <button
          onClick={handleOpenVault}
          className="w-full py-12 border-2 border-dashed border-cyan-400/20 rounded-[2.5rem] bg-cyan-400/5 group hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all active:scale-[0.98] flex flex-col items-center gap-2"
        >
          <span className="text-4xl font-black italic text-white group-hover:text-cyan-400 transition-colors uppercase">
            {current || "---"}
          </span>
          <span className="text-[7px] opacity-30 font-black uppercase tracking-[0.3em]">
            Open Unit Vault
          </span>
        </button>

        {/* 🚀 THE JUMP BUTTON: Go to Logic classification */}
        <button
          onClick={handleJumpToLogic}
          className="mt-8 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group"
        >
          <Settings2
            size={10}
            className="text-cyan-400 opacity-40 group-hover:opacity-100"
          />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">
            Verify Calculation Logic
          </span>
        </button>

        <p className="mt-6 px-8 text-[7px] text-white/20 uppercase font-black tracking-widest leading-relaxed">
          Standardized units ensure accurate <br />
          Pricing & Stock deduction
        </p>
      </div>

      {/* Back Button */}
      <button
        onClick={() => swapModal("DOWN", ClassificationHub)}
        className="mt-auto pb-4 text-[9px] text-white/10 uppercase font-black hover:text-white transition-colors tracking-widest"
      >
        ← Return to Hub
      </button>
    </div>
  );
}
