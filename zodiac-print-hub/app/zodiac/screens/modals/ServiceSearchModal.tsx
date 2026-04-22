"use client";

import { useState, useMemo } from "react";
import { shallow } from "zustand/shallow";
import { useDataStore } from "../../store/core/useDataStore";
import { useModalStore } from "../../store/useModalStore";
import { selectPricesArray } from "../../store/selectors/data.selectors";

export function ServiceSearchModal() {
  /* =========================================================
     STABLE SELECTOR SUBSCRIPTIONS
  ========================================================= */

  // Use the memoized array selector to ensure a stable reference
  const prices = useDataStore(selectPricesArray, shallow);
  const setDraft = useDataStore((s) => s.setDraft);

  const { closeModal } = useModalStore();
  const [query, setQuery] = useState("");

  /* =========================================================
     MEMOIZED FILTERING (Performance & Stability)
  ========================================================= */

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return prices;

    return prices.filter(
      (p) =>
        p.service.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [prices, query]);

  const handleSelect = (id: string) => {
    setDraft({ serviceId: id });
    closeModal("DETAIL");
  };

  return (
    <div className="flex flex-col h-full bg-black/60 backdrop-blur-3xl animate-in slide-in-from-bottom duration-500 overflow-hidden">
      {/* 1. Glassmorphic Search Bar */}
      <div className="p-6 pt-12 pb-8">
        <div className="relative group">
          <input
            autoFocus
            placeholder="Search Job, Paper or Material..."
            className="w-full py-5 px-8 rounded-full bg-white/10 border border-white/20 text-white text-lg outline-none focus:border-cyan-500 focus:bg-white/15 transition-all shadow-2xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-cyan-400 font-black text-xs tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">
            SEARCH
          </span>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-orange-500 font-black text-3xl uppercase italic tracking-tighter">
          Select Paper
        </h2>
      </div>

      {/* 2. Interactive Selection List */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 flex flex-col gap-3 custom-scrollbar">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelect(p.id)}
            className="w-full p-8 bg-cyan-500 text-black font-black uppercase text-xl text-left rounded-[2.5rem] active:scale-95 transition-all flex justify-between items-center shadow-lg shadow-cyan-500/10 group"
          >
            <div className="flex flex-col">
              <span className="truncate max-w-[200px]">{p.service}</span>
              <span className="text-[10px] opacity-40 tracking-widest mt-1">
                {p.category}
              </span>
            </div>
            <span className="text-sm opacity-0 group-active:opacity-100">
              →
            </span>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="py-20 text-center opacity-20">
            <p className="font-black uppercase tracking-widest text-xs">
              No Materials Found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
