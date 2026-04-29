"use client";

import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { ClassificationHub } from "../ClassificationHub";
import { UnitVaultScreen } from "@screens/UnitVaultScreen"; // Adjust path as needed

/**
 * QUICK_EDIT_UNITS
 * Simplified to a single "Open Vault" trigger to ensure
 * data consistency for the calculator.
 */
export function QuickEditUnits({ current }: { current: string }) {
  const { openModal, swapModal } = useModalStore();

  const handleOpenVault = () => {
    // We open the Vault globally to provide the full search experience
    openModal("GLOBAL", UnitVaultScreen.TopComponent);
  };

  return (
    <div className="flex flex-col h-full w-full p-6 text-white animate-in slide-in-from-bottom duration-500">
      <div className="max-w-md mx-auto w-full text-center flex flex-col items-center">
        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-10 block">
          Measurement Basis
        </span>

        {/* THE UNIT BUTTON: The only way to select a unit */}
        <button
          onClick={handleOpenVault}
          className="w-full py-12 border-2 border-dashed border-cyan-400/20 rounded-[2.5rem] bg-cyan-400/5 group hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all active:scale-[0.98] flex flex-col items-center gap-2"
        >
          <span className="text-4xl font-black italic text-white group-hover:text-cyan-400 transition-colors uppercase">
            {current || "Choose Unit"}
          </span>
          <span className="text-[7px] opacity-30 font-black uppercase tracking-[0.3em]">
            Click to Open Unit Vault
          </span>
        </button>

        <p className="mt-8 px-8 text-[8px] text-white/20 uppercase font-black tracking-widest leading-relaxed">
          Standardized units ensure accurate <br />
          Pricing & Stock calculations
        </p>

        {/* Back Button */}
        <button
          onClick={() => swapModal("DOWN", ClassificationHub)}
          className="mt-auto pb-4 text-[10px] text-white/20 uppercase font-black hover:text-white transition-colors"
        >
          ← Return to Hub
        </button>
      </div>
    </div>
  );
}
