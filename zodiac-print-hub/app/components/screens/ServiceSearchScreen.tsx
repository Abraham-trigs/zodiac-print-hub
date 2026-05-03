"use client";

import { useState, useMemo } from "react";
import { shallow } from "zustand/shallow";
import { useDataStore } from "@store/core/useDataStore";
import { useZodiac } from "@store/zodiac.store";
import { ZodiacScreen } from "../../types/screen.types";
import { selectPricesArray } from "@store/selectors/data.selectors";

/**
 * SERVICE_SEARCH SCREEN (V2)
 * High-speed catalog selection for the Job Draft.
 */
export const ServiceSearchScreen: ZodiacScreen = {
  id: "SERVICE_SEARCH",
  layoutMode: "DETAIL",

  TopComponent: () => {
    /* -------------------------
       STATE & NAVIGATION
    --------------------------*/
    const { goBack } = useZodiac();
    // ✅ Prices now contain PriceListFull (nested Material/Service)
    const prices = useDataStore(selectPricesArray, shallow);
    const setDraft = useDataStore((s) => s.setDraft);
    const [searchQuery, setSearchQuery] = useState("");

    /* -------------------------
       LOGIC: V2 Recipe Filtering
    --------------------------*/
    const filtered = useMemo(() => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return prices;

      return prices.filter((p) => {
        const nameMatch = p.displayName?.toLowerCase().includes(q);
        const catMatch = (p.materialCategory || p.serviceCategory || "")
          .toLowerCase()
          .includes(q);
        return nameMatch || catMatch;
      });
    }, [prices, searchQuery]);

    const handleSelect = (id: string) => {
      // 🔥 ALIGNMENT: Commit the master priceListId to the Job Draft
      setDraft({ priceListId: id });
      goBack();
    };

    return (
      <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
        {/* 1. HEADER */}
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">
              Product Vault
            </h2>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-black">
              {prices.length} Recipe-Ready Items
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-20">
            🔍
          </div>
        </div>

        {/* 2. SEARCH */}
        <div className="relative">
          <input
            autoFocus
            type="text"
            placeholder="Search products, materials, or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-sm focus:border-cyan-400 outline-none transition-all placeholder:opacity-20 text-white font-bold"
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 text-xs">
            🔍
          </span>
        </div>

        {/* 3. LIST (V2 Aligned Styling) */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className="glass-card p-5 flex items-center justify-between border border-white/5 hover:border-cyan-400/30 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-white/10 text-white/60 text-[9px] font-black px-2 py-0.5 rounded border border-white/10 uppercase tracking-tighter">
                      {p.material?.unit || p.service?.calcType || "UNIT"}
                    </span>
                    <span className="text-sm font-black truncate max-w-[160px] text-white uppercase tracking-tight">
                      {p.displayName}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-40 font-black uppercase tracking-widest">
                    {p.materialCategory || p.serviceCategory || "General"}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-cyan-400 font-mono font-black text-sm">
                    ₵{p.salePrice.toFixed(2)}
                  </div>
                  <div className="text-[8px] uppercase font-black tracking-tighter opacity-0 group-hover:opacity-100 text-white/40 transition-opacity mt-1">
                    SELECT →
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <p className="text-[10px] uppercase tracking-[0.4em] font-black">
                Catalog Empty
              </p>
            </div>
          )}
        </div>

        {/* 4. FOOTER */}
        <div className="mt-auto pb-6">
          <button
            onClick={goBack}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/20 text-[10px] uppercase font-black tracking-[0.3em] hover:text-cyan-400 hover:border-cyan-400/30 transition-all"
          >
            ← Cancel Selection
          </button>
        </div>
      </div>
    );
  },

  DownComponent: undefined,
};
