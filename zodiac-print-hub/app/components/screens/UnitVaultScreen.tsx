// app/view/screens/UnitVaultScreen.tsx
"use client";

import { useState, useMemo } from "react";
import { useZodiac } from "@store/zodiac.store";
import { useDataStore } from "@store/core/useDataStore";
import { ZodiacScreen } from "../../lib/shared/types/screen.types";
// 🔥 PULLING DIRECTLY FROM SCHEMA
import { ServiceUnitEnum } from "@lib/shared/schema/job.schema";

export const UnitVaultScreen: ZodiacScreen = {
  id: "UNIT_VAULT",
  layoutMode: "DETAIL",

  TopComponent: () => {
    const { goBack } = useZodiac();
    const setDraft = useDataStore((s) => s.setDraft);
    const [q, setQ] = useState("");

    // ✅ NO HARDCODING: Pulling the options from the Zod Enum
    const units = ServiceUnitEnum.options;

    const filtered = useMemo(
      () => units.filter((u) => u.toLowerCase().includes(q.toLowerCase())),
      [q, units],
    );

    const handleSelect = (unit: string) => {
      setDraft({ unit });
      goBack();
    };

    return (
      <div className="flex flex-col h-full p-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-4xl font-black italic text-white">
              UNIT VAULT
            </h2>
            <p className="text-[7px] text-cyan-400 font-black uppercase tracking-[0.4em]">
              Dynamic Measurement Source
            </p>
          </div>
          <button
            onClick={goBack}
            className="text-white/20 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="relative mb-8">
          <input
            autoFocus
            placeholder="Filter units..."
            className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-14 text-sm focus:border-cyan-400 outline-none transition-all text-white"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <span className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30">
            🔍
          </span>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pr-2 custom-scrollbar">
          {filtered.map((unit) => (
            <button
              key={unit}
              onClick={() => handleSelect(unit)}
              className="group flex flex-col items-center justify-center p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] hover:border-cyan-400 hover:bg-cyan-400/5 transition-all active:scale-95"
            >
              <span className="text-[10px] font-black text-white/40 group-hover:text-cyan-400 uppercase tracking-widest text-center">
                {unit}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  },
};
