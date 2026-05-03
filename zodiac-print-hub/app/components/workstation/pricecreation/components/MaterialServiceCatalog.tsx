"use client";

import { useState, useMemo } from "react";
import { shallow } from "zustand/shallow";
import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import {
  selectInventoryArray,
  selectPricesArray,
} from "@store/selectors/data.selectors";

export function MaterialServiceCatalog() {
  const { closeModal } = useModalStore();
  const setPricingDraft = useDataStore((s) => s.setPricingDraft);
  const setType = useDataStore((s) => s.setType);

  // --- DATA SOURCES ---
  const inventory = useDataStore(selectInventoryArray, shallow); // Materials
  const prices = useDataStore(selectPricesArray, shallow); // PriceList items

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "MATERIAL" | "SERVICE">(
    "ALL",
  );

  /* -------------------------
     LOGIC: Merged Search
  --------------------------*/
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    // We map existing data to our new "Recipe" expectations
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

  /**
   * HANDLE SELECT
   * Commits an existing resource to the Workstation Draft.
   * This is the "Bridge" to creating a new PriceList entry.
   */
  const handleSelect = (item: any) => {
    if (item.type === "MATERIAL") {
      setType("material"); // Lock the workstation to Material Path
      setPricingDraft({
        name: item.name,
        unit: item.unit,
        costPrice: item.purchasePrice || 0,
        calcType: item.calcType, // 🚀 NEW: Sync the logic (DIMENSIONAL, FLAT, etc.)
        category: item.category,
        stockThreshold: item.lowStockThreshold || 0,
      });
    } else {
      setType("service"); // Lock the workstation to Service Path
      setPricingDraft({
        name: item.displayName || item.name,
        category: item.serviceCategory || item.category,
        unit: item.material?.unit || "piece",
        priceGHS: item.salePrice || 0,
        calcType: item.service?.calcType || item.sCalcType, // 🚀 NEW: Sync the logic
      });
    }

    closeModal("DETAIL");
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in zoom-in-95 duration-500 bg-black p-6">
      {/* 1. HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">
            Resource Vault
          </h2>
          <div className="flex gap-2 mt-1">
            {["ALL", "MATERIAL", "SERVICE"].map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m as any)}
                className={`text-[8px] font-black px-2 py-1 rounded transition-all uppercase tracking-widest ${
                  filterMode === m
                    ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                    : "bg-white/5 text-white/40"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => closeModal("DETAIL")}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* 2. SEARCH */}
      <div className="relative">
        <input
          autoFocus
          type="text"
          placeholder="Search materials, services, or specs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-12 text-sm focus:border-cyan-400 outline-none transition-all placeholder:opacity-20 text-white font-bold"
        />
        <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 text-xs">
          🔍
        </span>
      </div>

      {/* 3. SCROLLABLE LIST */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-white/10 italic text-xs uppercase tracking-widest">
            No matching resources found
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item)}
              className="glass-card p-5 flex items-center justify-between border border-white/5 hover:border-cyan-400/30 hover:bg-white/5 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded border border-white/10 uppercase tracking-tighter ${
                      item.type === "MATERIAL"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-cyan-400/10 text-cyan-400"
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-sm font-black text-white truncate max-w-[180px]">
                    {item.name || item.displayName}
                  </span>
                </div>
                <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">
                  {item.unit || "N/A"} • {(item as any).calcType || "FLAT"} •{" "}
                  {(item as any).category || "General"}
                </span>
              </div>
              <div className="text-right">
                <div className="text-cyan-400 font-black text-sm">
                  {item.type === "SERVICE"
                    ? `₵${(item as any).salePrice?.toFixed(2) || (item as any).priceGHS?.toFixed(2)}`
                    : "IN STOCK"}
                </div>
                <div className="text-[8px] uppercase font-black tracking-tighter opacity-0 group-hover:opacity-100 text-white/40 transition-opacity">
                  SELECT →
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. FOOTER */}
      <div className="mt-auto pb-4">
        <button
          onClick={() => closeModal("DETAIL")}
          className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/20 text-[10px] uppercase font-black tracking-[0.3em] hover:text-cyan-400 transition-all"
        >
          ← Cancel Selection
        </button>
      </div>
    </div>
  );
}
