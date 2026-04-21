"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import {
  useDraft,
  usePrices,
  useSelectedService,
  useLiveEstimate,
} from "@zodiac/store/selectors/data.selectors";

export function JobDisplayModal() {
  const draft = useDraft();
  const prices = usePrices();

  const selectedService = useSelectedService();
  const total = useLiveEstimate();

  const [sliderIndex, setSliderIndex] = useState<number | null>(null);

  const allLines = [
    { label: "Job type:", value: selectedService?.category || "---" },
    { label: "Material:", value: selectedService?.service || "---" },
    { label: "Client:", value: draft.clientName || "- UNNAMED -" },
    {
      label: "Size:",
      value: draft.width > 0 ? `${draft.width}x${draft.height}ft` : "N/A",
    },
    { label: "Quantity:", value: draft.quantity || "0" },
    { label: "Destination:", value: draft.deliveryType || "- PENDING -" },
  ];

  const ITEMS_PER_PAGE = 4;

  const page = sliderIndex !== null && sliderIndex >= 2 ? 1 : 0;

  const visibleLines = allLines.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );

  const canGoNext = sliderIndex === null || sliderIndex < 3;
  const canGoPrev = sliderIndex === null || sliderIndex > 0;

  const next = () => {
    if (sliderIndex === null) return setSliderIndex(3);
    if (sliderIndex < 3) return setSliderIndex((s) => (s as number) + 1);
  };

  const prev = () => {
    if (sliderIndex === null) return setSliderIndex(0);
    if (sliderIndex > 0) return setSliderIndex((s) => (s as number) - 1);

    setSliderIndex(null);
  };

  const getX = () => {
    if (sliderIndex === null) return 1.5 * 16;
    return sliderIndex * 16;
  };

  return (
    <div className="flex flex-col items-center w-full px-6 py-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <span className="text-[10px] text-cyan-400 font-black tracking-widest bg-cyan-400/10 px-2 py-1 rounded">
          REF: {draft.id || "---"}
        </span>

        <span className="text-[9px] text-white/20 uppercase font-black tracking-tighter">
          Draft Receiver
        </span>
      </div>

      {/* Card */}
      <div className="glass-card w-full max-w-[320px] p-8 rounded-[3rem] bg-white/15 backdrop-blur-3xl shadow-2xl relative overflow-hidden min-h-[300px] flex flex-col">
        <div className="flex flex-col gap-3 text-[12px] font-medium text-blue-900/70 flex-1">
          {visibleLines.map((line, i) => (
            <div
              key={i}
              className="flex justify-between items-end gap-4 border-b border-black/5 pb-1"
            >
              <span>{line.label}</span>
              <span className="font-black text-black text-right truncate">
                {line.value}
              </span>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prev}
            disabled={!canGoPrev}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 disabled:opacity-10"
          >
            ←
          </button>

          <div className="relative flex items-center justify-between w-[64px]">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  sliderIndex === i ? "bg-orange-400 scale-125" : "bg-white/20"
                }`}
              />
            ))}

            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"
              animate={{
                x: getX(),
                scale: 1.4,
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 22,
              }}
            />
          </div>

          <button
            onClick={next}
            disabled={!canGoNext}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 disabled:opacity-10"
          >
            →
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="mt-8">
        <span className="text-white font-black text-4xl">
          Gh₵ {total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
