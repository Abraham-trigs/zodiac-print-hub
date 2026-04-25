"use client";

import { useState, useMemo } from "react";
import { shallow } from "zustand/shallow";
import { useDataStore } from "@store/core/useDataStore";
import { useZodiac } from "@store/zodiac.store";
import { ZodiacScreen } from "../types/screen.types";
import { selectPricesArray } from "@store/selectors/data.selectors";

/**
 * SERVICE_SEARCH SCREEN
 * Aligned with JobCartScreen aesthetic and Zodiac Navigation Engine
 */
export const ServiceSearchScreen: ZodiacScreen = {
  id: "SERVICE_SEARCH",
  layoutMode: "DETAIL",

  TopComponent: () => {
    /* -------------------------
       STATE & NAVIGATION
    --------------------------*/
    const { goBack } = useZodiac();
    const prices = useDataStore(selectPricesArray, shallow);
    const setDraft = useDataStore((s) => s.setDraft);
    const [searchQuery, setSearchQuery] = useState("");

    /* -------------------------
       LOGIC (Synced with Price Model)
    --------------------------*/
    const filtered = useMemo(() => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return prices;
      return prices.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }, [prices, searchQuery]);

    const handleSelect = (id: string) => {
      setDraft({ serviceId: id });
      goBack(); // Transitions back to the Draft in history
    };

    return (
      <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
        {/* 1. HEADER (Mirrored from Job Manager) */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Material Catalog</h2>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-black">
              {prices.length} Items Available
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-20">
            🔍
          </div>
        </div>

        {/* 2. SEARCH (Mirrored from Job Manager) */}
        <div className="relative">
          <input
            autoFocus
            type="text"
            placeholder="Filter by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-10 text-sm focus:border-cyan-400 outline-none transition-all placeholder:opacity-20 text-white"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xs">
            🔍
          </span>
        </div>

        {/* 3. LIST (Mirroring JobCart Item Styling) */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className="glass-card p-4 flex items-center justify-between border border-white/5 hover:border-cyan-400/30 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-cyan-400/10 text-cyan-400 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-400/20 uppercase tracking-tighter">
                      {p.unit}
                    </span>
                    <span className="text-sm font-bold truncate max-w-[150px] text-white">
                      {p.name}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">
                    {p.category}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-cyan-400 font-mono font-bold text-sm">
                    ₵{p.priceGHS.toFixed(2)}
                  </div>
                  <div className="text-[8px] uppercase font-black tracking-tighter opacity-0 group-hover:opacity-100 text-white/40 transition-opacity">
                    SELECT →
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <p className="text-xs uppercase tracking-widest font-bold">
                No Materials Found
              </p>
            </div>
          )}
        </div>

        {/* 4. FOOTER (Mirroring "Exit Workspace" Button) */}
        <div className="mt-auto pb-4">
          <button
            onClick={goBack}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase font-black tracking-[0.3em] hover:text-cyan-400 hover:border-cyan-400/30 transition-all"
          >
            ← Cancel Selection
          </button>
        </div>
      </div>
    );
  },

  DownComponent: undefined,
};
