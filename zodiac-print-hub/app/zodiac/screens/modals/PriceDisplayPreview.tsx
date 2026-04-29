"use client";

import { useState } from "react";
import { shallow } from "zustand/shallow";
import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";

// ✅ Core Navigation
import { ClassificationHub } from "./ClassificationHub";

// ✅ Specialized Quick-Edit Modals
import { QuickEditName } from "./pricelistmodals/QuickEditName";
import { QuickEditUnits } from "./pricelistmodals/QuickEditUnits";
import { QuickEditCurrency } from "./pricelistmodals/QuickEditCurrency";
import { QuickEditDimensions } from "./pricelistmodals/QuickEditDimensions";
import { QuickEditCategory } from "./pricelistmodals/QuickEditCategory";

/**
 * PRICE_DISPLAY_PREVIEW (The TOP Zone Component)
 * Acts as the persistent "MaterialDraftCard" in the TOP zone.
 */
export function PriceDisplayPreview() {
  const draft = useDataStore((s) => s.draftState?.draft, shallow);
  const { swapModal } = useModalStore();

  const [sliderIndex, setSliderIndex] = useState<number>(0);

  /**
   * OPEN QUICK EDIT
   * Maps specific fields to their respective specialized modal components.
   */
  const openQuickEdit = (field: string, label: string, current: any) => {
    switch (field) {
      case "name":
        // Wrap in arrow function () => ...
        swapModal("DOWN", () => <QuickEditName current={current} />);
        break;
      case "unit":
        swapModal("DOWN", () => <QuickEditUnits current={current} />);
        break;
      case "costPrice":
      case "priceGHS":
        swapModal("DOWN", () => (
          <QuickEditCurrency field={field} label={label} current={current} />
        ));
        break;
      case "width":
      case "height":
        swapModal("DOWN", () => <QuickEditDimensions />);
        break;
      case "category":
        swapModal("DOWN", () => <QuickEditCategory current={current} />);
        break;
      default:
        swapModal("DOWN", () => (
          <QuickEditCurrency field={field} label={label} current={current} />
        ));
        break;
    }
  };

  /* =========================================================
     DYNAMIC LINES (Material vs. Service)
  ========================================================= */
  const getLines = () => {
    const common = [
      { key: "name", label: "Name:", value: draft?.name || "---" },
      { key: "unit", label: "Unit:", value: draft?.unit || "---" },
    ];

    if (draft?.isPhysical) {
      return [
        ...common,
        {
          key: "costPrice",
          label: "Buying Cost:",
          value: draft?.costPrice ? `₵${draft.costPrice}` : "---",
        },
        {
          key: "priceGHS",
          label: "Selling Rate:",
          value: draft?.priceGHS ? `₵${draft.priceGHS}` : "---",
        },
        { key: "width", label: "Width:", value: draft?.width || "0" },
        { key: "height", label: "Height:", value: draft?.height || "0" },
      ];
    }

    return [
      ...common,
      { key: "category", label: "Category:", value: draft?.category || "---" },
      {
        key: "priceGHS",
        label: "Service Rate:",
        value: draft?.priceGHS ? `₵${draft.priceGHS}` : "---",
      },
      { key: "minOrder", label: "Min. Order:", value: draft?.minOrder || "1" },
      { label: "Type:", value: "Labor/Service" },
    ];
  };

  const allLines = getLines();
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(allLines.length / ITEMS_PER_PAGE);
  const visibleLines = allLines.slice(
    sliderIndex * ITEMS_PER_PAGE,
    (sliderIndex + 1) * ITEMS_PER_PAGE,
  );

  const next = () =>
    sliderIndex < totalPages - 1 && setSliderIndex((s) => s + 1);
  const prev = () => sliderIndex > 0 && setSliderIndex((s) => s - 1);

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-700">
      <div className="w-full flex justify-between items-center mb-4 px-6">
        <span className="text-[10px] text-cyan-400 font-black tracking-widest bg-cyan-400/10 px-2 py-1 rounded">
          {draft?.isPhysical ? "MATERIAL PREVIEW" : "SERVICE PREVIEW"}
        </span>
        <span className="text-[9px] text-white/20 uppercase font-black tracking-tighter">
          {sliderIndex + 1} / {totalPages}
        </span>
      </div>

      <div className="glass-card w-full max-w-[320px] p-8 rounded-[3rem] bg-white/10 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden min-h-[360px] flex flex-col">
        <div className="flex flex-col gap-4 text-[12px] font-medium text-white flex-1">
          {visibleLines.map((line, i) => (
            <div
              key={i}
              onClick={() =>
                line.key && openQuickEdit(line.key, line.label, line.value)
              }
              className={`flex justify-between items-end gap-4 border-b border-white/5 pb-2 transition-all ${
                line.key
                  ? "cursor-pointer group hover:border-cyan-400/30"
                  : "opacity-40"
              }`}
            >
              <span className="opacity-40 group-hover:opacity-100 group-hover:text-cyan-400 transition-all uppercase text-[9px] font-black">
                {line.label}
              </span>
              <span className="font-bold text-right truncate max-w-[140px] group-hover:scale-105 transition-transform text-white">
                {line.value}
              </span>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prev}
            disabled={sliderIndex === 0}
            className="nav-btn"
          >
            ←
          </button>
          <div className="relative flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full transition-all ${sliderIndex === i ? "bg-cyan-400 scale-150" : "bg-white/10"}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            disabled={sliderIndex >= totalPages - 1}
            className="nav-btn"
          >
            →
          </button>
        </div>
      </div>

      <style jsx>{`
        .nav-btn {
          @apply w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white disabled:opacity-5 active:scale-90 transition-all border border-white/10 hover:bg-white/10;
        }
      `}</style>
    </div>
  );
}
