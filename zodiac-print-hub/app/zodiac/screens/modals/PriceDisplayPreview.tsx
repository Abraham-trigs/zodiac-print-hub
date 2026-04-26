"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { shallow } from "zustand/shallow";
import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";

export function PriceDisplayPreview() {
  /* -------------------------
     STATE & SELECTORS
  --------------------------*/
  const draft = useDataStore((s) => s.draftState?.draft, shallow);
  const setDraft = (updates: any) => useDataStore.getState().setDraft(updates);
  const { swapModal, closeModal } = useModalStore();

  const [sliderIndex, setSliderIndex] = useState<number | null>(null);

  /* -------------------------
     QUICK EDIT LOGIC
  --------------------------*/
  const openQuickEdit = (field: string, label: string, current: any) => {
    swapModal("GLOBAL", () => (
      <div className="absolute bottom-0 w-full p-10 bg-black/90 backdrop-blur-2xl border-t border-cyan-400/30 rounded-t-[3rem] animate-in slide-in-from-bottom duration-300 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-2 block">
            Quick Edit: {label.replace(":", "")}
          </span>
          <input
            autoFocus
            className="w-full bg-transparent text-5xl font-black text-white outline-none py-4 border-b border-white/10 focus:border-cyan-400 transition-all"
            defaultValue={current === "---" ? "" : current}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = e.currentTarget.value;
                setDraft({
                  [field]: isNaN(Number(val)) || val === "" ? val : Number(val),
                });
                closeModal("GLOBAL");
              }
              if (e.key === "Escape") closeModal("GLOBAL");
            }}
          />
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => closeModal("GLOBAL")}
              className="text-[10px] text-white/20 hover:text-white uppercase font-black transition-colors"
            >
              Cancel
            </button>
            <span className="text-[9px] text-cyan-400/40 font-black italic">
              HIT ENTER TO COMMIT
            </span>
          </div>
        </div>
      </div>
    ));
  };

  /* -------------------------
     DATA MAPPING
  --------------------------*/
  const allLines = [
    { key: "category", label: "Category:", value: draft?.category || "---" },
    { key: "name", label: "Product Name:", value: draft?.name || "---" },
    {
      key: "priceGHS",
      label: "Selling Price:",
      value: draft?.priceGHS ? `₵${draft.priceGHS}` : "---",
    },
    { key: "unit", label: "Unit Type:", value: draft?.unit || "---" },
    {
      key: "costPrice",
      label: "Buying Cost:",
      value: draft?.costPrice ? `₵${draft.costPrice}` : "---",
    },
    { key: "minOrder", label: "Min. Order:", value: draft?.minOrder || "1" },
  ];

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(allLines.length / ITEMS_PER_PAGE);
  const page = sliderIndex !== null ? sliderIndex : 0;
  const visibleLines = allLines.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );

  const next = () => page < totalPages - 1 && setSliderIndex(page + 1);
  const prev = () => page > 0 && setSliderIndex(page - 1);

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-700">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-2 px-2">
        <span className="text-[10px] text-cyan-400 font-black tracking-widest bg-cyan-400/10 px-2 py-1 rounded">
          LIVE DRAFT
        </span>
        <span className="text-[9px] text-white/20 uppercase font-black tracking-tighter">
          Tap Line to Edit
        </span>
      </div>

      {/* Glass Card */}
      <div className="glass-card w-full max-w-[320px] p-8 rounded-[3rem] bg-white/10 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden min-h-[340px] flex flex-col">
        <div className="flex flex-col gap-4 text-[12px] font-medium text-white flex-1">
          {visibleLines.map((line, i) => (
            <div
              key={i}
              onClick={() => openQuickEdit(line.key, line.label, line.value)}
              className="flex justify-between items-end gap-4 border-b border-white/5 pb-2 cursor-pointer group hover:border-cyan-400/30 transition-all"
            >
              <span className="opacity-40 group-hover:opacity-100 group-hover:text-cyan-400 transition-all">
                {line.label}
              </span>
              <span className="font-bold text-right truncate max-w-[140px] group-hover:scale-105 transition-transform">
                {line.value}
              </span>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={prev} className="nav-btn">
            ←
          </button>
          <div className="relative flex items-center justify-between w-[64px]">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full ${page === i ? "bg-cyan-400 scale-125" : "bg-white/20"}`}
              />
            ))}
          </div>
          <button onClick={next} className="nav-btn">
            →
          </button>
        </div>
      </div>

      <style jsx>{`
        .nav-btn {
          @apply w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white disabled:opacity-10 active:scale-90 transition-all hover:bg-white/10;
        }
      `}</style>
    </div>
  );
}
