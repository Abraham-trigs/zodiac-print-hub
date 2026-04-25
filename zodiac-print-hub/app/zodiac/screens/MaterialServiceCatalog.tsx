"use client";

import { useState, useMemo } from "react";
import { shallow } from "zustand/shallow";
import { useDataStore } from "@store/core/useDataStore";
import { useZodiac } from "@store/zodiac.store";
import { ZodiacScreen } from "../types/screen.types";
import {
  selectInventoryArray,
  selectPricesArray,
} from "@store/selectors/data.selectors";

/**
 * MATERIAL_SERVICE_CATALOG
 * Following the exact leverage pattern of ServiceSearchScreen.
 * Registered in the screen registry as MATERIAL_SERVICE_CATALOG.
 */
export const MaterialServiceCatalog: ZodiacScreen = {
  id: "MATERIAL_SERVICE_CATALOG",
  layoutMode: "DETAIL",

  TopComponent: () => {
    /* -------------------------
       STATE & NAVIGATION
    --------------------------*/
    const { goBack } = useZodiac();
    const setDraft = useDataStore((s) => s.setDraft);

    const inventory = useDataStore(selectInventoryArray, shallow);
    const prices = useDataStore(selectPricesArray, shallow);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterMode, setFilterMode] = useState<
      "ALL" | "MATERIAL" | "SERVICE"
    >("ALL");

    /* -------------------------
       LOGIC: Merged Search
    --------------------------*/
    const filteredItems = useMemo(() => {
      const q = searchQuery.toLowerCase().trim();

      const merged = [
        ...inventory.map((i) => ({ ...i, type: "MATERIAL" as const })),
        ...prices.map((p) => ({ ...p, type: "SERVICE" as const })),
      ];

      return merged.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(q) ||
          (item as any).category?.toLowerCase().includes(q);

        const matchesFilter = filterMode === "ALL" || item.type === filterMode;
        return matchesSearch && matchesFilter;
      });
    }, [inventory, prices, searchQuery, filterMode]);

    const handleSelect = (item: any) => {
      // Identity Sync logic
      if (item.type === "MATERIAL") {
        setDraft({
          name: item.name,
          unit: item.unit,
          costPrice: item.unitCost || 0,
          stockRefId: item.id,
          isPhysical: true,
        });
      } else {
        setDraft({
          name: item.name,
          category: item.category,
          unit: item.unit,
          priceGHS: item.priceGHS,
          costPrice: item.costPrice,
          stockRefId: item.stockRefId,
          isPhysical: !!item.stockRefId,
        });
      }

      // 🔥 NAVIGATE BACK: This pops the screen off the stack
      // The PriceEntryStepModal underneath will automatically react to the draft change
      goBack();
    };

    return (
      <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
        {/* 1. HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Catalog</h2>
            <div className="flex gap-2 mt-1">
              {["ALL", "MATERIAL", "SERVICE"].map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMode(m as any)}
                  className={`text-[8px] font-black px-2 py-0.5 rounded transition-all ${
                    filterMode === m
                      ? "bg-cyan-400 text-black"
                      : "bg-white/5 text-white/40"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
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
            placeholder="Search material or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-10 text-sm focus:border-cyan-400 outline-none transition-all placeholder:opacity-20 text-white"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xs">
            🔍
          </span>
        </div>

        {/* 3. LIST */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item)}
                className="glass-card p-4 flex items-center justify-between border border-white/5 hover:border-cyan-400/30 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 uppercase tracking-tighter ${
                        item.type === "MATERIAL"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-blue-400/10 text-blue-400"
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-sm font-bold text-white truncate max-w-[150px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">
                    {item.unit} • {(item as any).category || "General"}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-cyan-400 font-mono font-bold text-sm">
                    {item.type === "SERVICE"
                      ? `₵${(item as any).priceGHS.toFixed(2)}`
                      : "STOCK"}
                  </div>
                  <div className="text-[8px] uppercase font-black tracking-tighter opacity-0 group-hover:opacity-100 text-white/40 transition-opacity">
                    SELECT →
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <p className="text-xs uppercase tracking-widest font-bold text-white/40">
                No results found
              </p>
            </div>
          )}
        </div>

        {/* 4. FOOTER */}
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
