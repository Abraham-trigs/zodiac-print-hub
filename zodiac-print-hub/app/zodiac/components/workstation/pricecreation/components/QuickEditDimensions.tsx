"use client";

import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { ClassificationHub } from "./ClassificationHub";
import { MaterialServiceCatalog } from "./MaterialServiceCatalog"; // 🚀 Target Element
import { shallow } from "zustand/shallow";
import { Search } from "lucide-react";

export function QuickEditDimensions() {
  const draft = useDataStore((s) => s.pricingDraft, shallow);
  const setPricingDraft = useDataStore((s) => s.setPricingDraft);
  const { swapModal } = useModalStore();

  /**
   * OPEN SPECIFIC ELEMENT: CATALOG
   * Satisfies the rule: Jump to Resource Vault to verify specs
   */
  const handleOpenCatalog = () => {
    swapModal("DETAIL", MaterialServiceCatalog);
  };

  return (
    <div className="flex flex-col h-full w-full p-6 text-white animate-in slide-in-from-bottom duration-500">
      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] text-center mb-10">
        Material Physical Size
      </span>

      <div className="flex items-center justify-center gap-6 max-w-md mx-auto w-full">
        {/* WIDTH */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[8px] font-black opacity-20 uppercase tracking-widest">
            Width
          </span>
          <input
            autoFocus
            type="number"
            className="w-24 bg-transparent text-center text-5xl font-black border-b border-white/10 focus:border-cyan-400 outline-none pb-2 transition-all"
            defaultValue={draft?.width || ""}
            onChange={(e) => setPricingDraft({ width: Number(e.target.value) })}
          />
        </div>

        <span className="text-3xl font-black text-white/10 mt-6">×</span>

        {/* HEIGHT */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[8px] font-black opacity-20 uppercase tracking-widest">
            Height
          </span>
          <input
            type="number"
            className="w-24 bg-transparent text-center text-5xl font-black border-b border-white/10 focus:border-cyan-400 outline-none pb-2 transition-all"
            defaultValue={draft?.height || ""}
            onChange={(e) =>
              setPricingDraft({ height: Number(e.target.value) })
            }
            onKeyDown={(e) =>
              e.key === "Enter" && swapModal("DOWN", ClassificationHub)
            }
          />
        </div>
      </div>

      {/* 🚀 THE RULE: BUTTON TO OPEN SPECIFIC ELEMENT */}
      <button
        onClick={handleOpenCatalog}
        className="mt-8 mx-auto flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group"
      >
        <Search
          size={10}
          className="text-cyan-400 opacity-40 group-hover:opacity-100"
        />
        <span className="text-[8px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">
          Verify via Resource Catalog
        </span>
      </button>

      <button
        onClick={() => swapModal("DOWN", ClassificationHub)}
        className="mt-auto py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
      >
        Confirm Dimensions →
      </button>
    </div>
  );
}
