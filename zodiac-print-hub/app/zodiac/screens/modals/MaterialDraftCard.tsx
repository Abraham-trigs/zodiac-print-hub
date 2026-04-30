"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { shallow } from "zustand/shallow";
import { useDataStore } from "@store/core/useDataStore";

/* =========================================================
   STABLE SELECTORS
========================================================= */
import {
  selectPricesMap,
  selectClientsMap,
} from "@store/selectors/data.selectors";

export function JobDisplayModal() {
  /* -------------------------
     STATE & SELECTORS
  --------------------------*/
  const draft = useDataStore((s) => s.draftState?.draft, shallow);
  const prices = useDataStore(selectPricesMap, shallow);
  const clients = useDataStore(selectClientsMap, shallow);

  /* -------------------------
     DERIVED DATA
  --------------------------*/
  const selectedService = draft?.serviceId
    ? prices[draft.serviceId]
    : undefined;
  const selectedClient = draft?.clientId ? clients[draft.clientId] : undefined;

  const [sliderIndex, setSliderIndex] = useState<number | null>(null);

  // 🔥 6 CORE LINES
  const allLines = [
    { label: "Job type:", value: selectedService?.category || "---" },
    { label: "Material:", value: selectedService?.name || "---" },
    { label: "Client:", value: selectedClient?.name || "- UNNAMED -" },
    {
      label: "Size:",
      value:
        draft?.width && draft?.width > 0
          ? `${draft.width}x${draft.height}${selectedService?.unit || "ft"}`
          : "N/A",
    },
    { label: "Quantity:", value: draft?.quantity || "0" },
    {
      label: "Logistics:",
      value: draft?.deliveryType === "PRINTER_DELIVERY" ? "Delivery" : "Pickup",
    },
  ];

  // 🔥 UPDATED: Set to 6 to show all lines at once in the current view
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(allLines.length / ITEMS_PER_PAGE);
  const page = sliderIndex !== null ? sliderIndex : 0;

  const visibleLines = allLines.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );

  // Sensitive navigation based on actual page count
  const canGoNext = page < totalPages - 1;
  const canGoPrev = page > 0;

  const next = () => {
    if (canGoNext) setSliderIndex(page + 1);
  };

  const prev = () => {
    if (canGoPrev) setSliderIndex(page - 1);
  };

  const getX = () => {
    // Maps the glowing dot position to the current active dot index
    return page * 19.3;
  };

  return (
    <div className="flex flex-col items-center w-full px-6  animate-in fade-in duration-700">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <span className="text-[10px] text-cyan-400 font-black tracking-widest bg-cyan-400/10 px-2 py-1 rounded">
          REF: {draft?.id || "---"}
        </span>
        <span className="text-[9px] text-white/20 uppercase font-black tracking-tighter">
          Job Preview
        </span>
      </div>

      {/* Glass Card */}
      <div className="glass-card w-full max-w-[320px] p-8 rounded-[3rem] bg-white/10 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden min-h-[320px] flex flex-col">
        {/* 🔥 Displaying 6 lines here */}
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

        {/* Slider Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prev}
            disabled={!canGoPrev}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white disabled:opacity-10 active:scale-90 transition-transform"
          >
            ←
          </button>

          <div className="relative flex items-center justify-between w-[64px]">
            {/* Dots are now sensitive to the actual page count */}
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
