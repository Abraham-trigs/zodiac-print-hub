"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { shallow } from "zustand/shallow";
import { useDataStore } from "@store/core/useDataStore";

/* =========================================================
   STABLE SELECTORS
========================================================= */
import { selectPricesMap } from "@store/selectors/data.selectors";

export function PriceDisplayPreview() {
  /* -------------------------
     STATE & SELECTORS
  --------------------------*/
  // Accessing the current price draft state
  const draft = useDataStore((s) => s.draftState?.draft, shallow);
  const prices = useDataStore(selectPricesMap, shallow);

  /* -------------------------
     DERIVED DATA
  --------------------------*/
  const [sliderIndex, setSliderIndex] = useState<number | null>(null);

  // 🔥 6 CORE LINES (Tailored for Price Creation)
  const allLines = [
    { label: "Category:", value: draft?.category || "---" },
    { label: "Product Name:", value: draft?.name || "---" },
    {
      label: "Base Price:",
      value: draft?.basePrice ? `$${draft.basePrice}` : "---",
    },
    { label: "Unit Type:", value: draft?.unit || "sqft" },
    { label: "Min. Order:", value: draft?.minOrder || "1" },
    {
      label: "Status:",
      value: draft?.isActive ? "Active" : "Draft Mode",
    },
  ];

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(allLines.length / ITEMS_PER_PAGE);
  const page = sliderIndex !== null ? sliderIndex : 0;

  const visibleLines = allLines.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );

  const canGoNext = page < totalPages - 1;
  const canGoPrev = page > 0;

  const next = () => {
    if (canGoNext) setSliderIndex(page + 1);
  };
  const prev = () => {
    if (canGoPrev) setSliderIndex(page - 1);
  };

  const getX = () => page * 19.3;

  return (
    <div className="flex flex-col items-center w-full px-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <span className="text-[10px] text-cyan-400 font-black tracking-widest bg-cyan-400/10 px-2 py-1 rounded">
          PRICE ID: {draft?.id?.substring(0, 8) || "NEW_TEMP"}
        </span>
        <span className="text-[9px] text-white/20 uppercase font-black tracking-tighter">
          Price Preview
        </span>
      </div>

      {/* Glass Card */}
      <div className="glass-card w-full max-w-[320px] p-8 rounded-[3rem] bg-white/10 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden min-h-[320px] flex flex-col">
        <div className="flex flex-col gap-3 text-[12px] font-medium text-white flex-1">
          {visibleLines.map((line, i) => (
            <div
              key={i}
              className="flex justify-between items-end gap-4 border-b border-white/5 pb-1"
            >
              <span className="opacity-40">{line.label}</span>
              <span className="font-bold text-right truncate max-w-[140px]">
                {line.value}
              </span>
            </div>
          ))}
        </div>

        {/* Slider Navigation (Matches the "Dot" UI) */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prev}
            disabled={!canGoPrev}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white disabled:opacity-10 active:scale-90 transition-transform"
          >
            ←
          </button>

          <div className="relative flex items-center justify-between w-[64px]">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full transition-all ${page === i ? "bg-cyan-400 scale-125" : "bg-white/20"}`}
              />
            ))}
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
              animate={{ x: getX(), scale: 1.4 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
            />
          </div>

          <button
            onClick={next}
            disabled={!canGoNext}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white disabled:opacity-10 active:scale-90 transition-transform"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
