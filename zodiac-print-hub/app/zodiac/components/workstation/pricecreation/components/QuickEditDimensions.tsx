"use client";

import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { ClassificationHub } from "./ClassificationHub";
import { shallow } from "zustand/shallow";

export function QuickEditDimensions() {
  // ✅ Switch to isolated Pricing state and setter
  const draft = useDataStore((s) => s.pricingDraft, shallow);
  const setPricingDraft = useDataStore((s) => s.setPricingDraft);
  const { swapModal } = useModalStore();

  return (
    <div className="flex flex-col h-full w-full p-6 text-white animate-in slide-in-from-bottom duration-500">
      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] text-center mb-10">
        Material Physical Size
      </span>

      <div className="flex items-center justify-center gap-6 max-w-md mx-auto w-full">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[8px] font-black opacity-20 uppercase tracking-widest">
            Width
          </span>
          <input
            autoFocus
            type="number"
            className="w-24 bg-transparent text-center text-5xl font-black border-b border-white/10 focus:border-cyan-400 outline-none pb-2 transition-all"
            defaultValue={draft?.width || ""}
            // ✅ Commit to pricingDraft
            onChange={(e) => setPricingDraft({ width: Number(e.target.value) })}
          />
        </div>

        <span className="text-3xl font-black text-white/10 mt-6">×</span>

        <div className="flex flex-col items-center gap-2">
          <span className="text-[8px] font-black opacity-20 uppercase tracking-widest">
            Height
          </span>
          <input
            type="number"
            className="w-24 bg-transparent text-center text-5xl font-black border-b border-white/10 focus:border-cyan-400 outline-none pb-2 transition-all"
            defaultValue={draft?.height || ""}
            // ✅ Commit to pricingDraft
            onChange={(e) =>
              setPricingDraft({ height: Number(e.target.value) })
            }
            onKeyDown={(e) =>
              e.key === "Enter" && swapModal("DOWN", ClassificationHub)
            }
          />
        </div>
      </div>

      <button
        onClick={() => swapModal("DOWN", ClassificationHub)}
        className="mt-auto py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
      >
        Confirm Dimensions →
      </button>
    </div>
  );
}
