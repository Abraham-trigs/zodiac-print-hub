"use client";

import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { ClassificationHub } from "../ClassificationHub";

export function QuickEditCategory({ current }: { current: string }) {
  const setDraft = useDataStore((s) => s.setDraft);
  const { swapModal } = useModalStore();

  const categories = ["Printing", "Design", "Install", "Delivery", "Finish"];

  return (
    <div className="flex flex-col h-full w-full p-6 text-white animate-in slide-in-from-bottom duration-500">
      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] text-center mb-8">
        Service Category
      </span>

      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setDraft({ category: cat });
              swapModal("DOWN", ClassificationHub);
            }}
            className={`px-6 py-3 rounded-full font-black uppercase text-[9px] border transition-all ${
              current === cat
                ? "bg-cyan-400 border-cyan-400 text-black"
                : "bg-white/5 border-white/10 text-white/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
