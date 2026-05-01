"use client";

import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { ClassificationHub } from "./ClassificationHub";

export function QuickEditCategory({ current }: { current: string }) {
  const setPricingDraft = useDataStore((s) => s.setPricingDraft);
  const type = useDataStore((s) => s.type); // 🚀 NEW: Get the current path (material or service)
  const { swapModal } = useModalStore();

  // Optimized for the Print Industry
  const categories = [
    "Printing",
    "Design",
    "Install",
    "Logistics",
    "Finishing",
    "Substrate",
  ];

  return (
    <div className="flex flex-col h-full w-full p-6 text-white animate-in slide-in-from-bottom duration-500">
      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] text-center mb-8">
        Assign {type === "material" ? "Material" : "Service"} Category
      </span>

      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              // 🧠 THE PRODUCTION HANDSHAKE:
              // We set the generic 'category' for the UI, but prepare
              // the specific enum field for the Backend Junction.
              setPricingDraft({
                category: cat,
                ...(type === "material"
                  ? { materialCategory: cat }
                  : { serviceCategory: cat }),
              });

              swapModal("DOWN", ClassificationHub);
            }}
            className={`px-6 py-3 rounded-full font-black uppercase text-[9px] border transition-all active:scale-95 ${
              current === cat
                ? "bg-cyan-400 border-cyan-400 text-black shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <button
        onClick={() => swapModal("DOWN", ClassificationHub)}
        className="mt-auto mx-auto text-[8px] text-white/20 uppercase font-black tracking-widest pb-4 hover:text-white transition-colors"
      >
        ← Back to Hub
      </button>
    </div>
  );
}
