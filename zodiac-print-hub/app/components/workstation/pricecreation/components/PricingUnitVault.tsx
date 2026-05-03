"use client";

import { useState, useMemo } from "react";
import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { ServiceUnitEnum } from "@lib/shared/schema/job.schema";

/**
 * PRICING_UNIT_VAULT
 * Isolated modal specifically for the Pricing Workstation.
 */
export function PricingUnitVault() {
  const { closeModal } = useModalStore();
  const setPricingDraft = useDataStore((s) => s.setPricingDraft);
  const [q, setQ] = useState("");

  const units = ServiceUnitEnum.options;

  const filtered = useMemo(
    () => units.filter((u) => u.toLowerCase().includes(q.toLowerCase())),
    [q, units],
  );

  const handleSelect = (unit: string) => {
    // ✅ Targets only the pricing bucket
    setPricingDraft({ unit });
    closeModal("GLOBAL"); // Closes itself
  };

  return (
    <div className="flex flex-col h-full w-full p-8 animate-in zoom-in-95 duration-300 bg-black text-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black italic tracking-tighter">
          PRICING UNITS
        </h2>
        <button
          onClick={() => closeModal("GLOBAL")}
          className="opacity-20 hover:opacity-100"
        >
          ✕
        </button>
      </div>

      <input
        autoFocus
        placeholder="Filter measurement units..."
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 mb-6 outline-none focus:border-cyan-400"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pr-1 custom-scrollbar">
        {filtered.map((unit) => (
          <button
            key={unit}
            onClick={() => handleSelect(unit)}
            className="p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:border-cyan-400 transition-all active:scale-95 text-[10px] font-black uppercase"
          >
            {unit}
          </button>
        ))}
      </div>
    </div>
  );
}
