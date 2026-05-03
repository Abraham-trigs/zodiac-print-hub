"use client";

import { useState, useCallback, useMemo } from "react";
import { shallow } from "zustand/shallow";
import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
// ✅ Updated to use the correct name
import { ProductionCalculator } from "@/lib/utils/production-calculator";

// Quick-Edit Components
import { QuickEditName } from "./QuickEditName";
import { QuickEditUnits } from "./QuickEditUnits";
import { QuickEditCurrency } from "./QuickEditCurrency";
import { QuickEditDimensions } from "./QuickEditDimensions";
import { QuickEditCategory } from "./QuickEditCategory";

export function PriceDisplayPreview() {
  const draft = useDataStore((s) => s.pricingDraft, shallow);
  const mode = useDataStore((s) => s.mode);
  const type = useDataStore((s) => s.type);

  const { swapModal } = useModalStore();
  const [sliderIndex, setSliderIndex] = useState(0);

  // --- FSM STATUS ---
  const isLocked = mode === "review" || mode === "submitting";
  const isMaterial = type === "material";

  const hasValue = (val: any) =>
    val !== undefined &&
    val !== null &&
    val !== "" &&
    val !== "---" &&
    val !== 0;

  /**
   * QUICK EDIT HANDLER
   */
  const openQuickEdit = useCallback(
    (field: string, label: string) => {
      if (isLocked) return;

      const baseProps = {
        key: field + Date.now(),
        field,
        label,
        current: (draft as any)[field],
      };

      switch (field) {
        case "name":
          swapModal("DOWN", QuickEditName, baseProps);
          break;
        case "unit":
          swapModal("DOWN", QuickEditUnits, baseProps);
          break;
        case "costPrice":
        case "priceGHS":
          swapModal("DOWN", QuickEditCurrency, baseProps);
          break;
        case "width":
        case "height":
          swapModal("DOWN", QuickEditDimensions, baseProps);
          break;
        case "category":
          swapModal("DOWN", QuickEditCategory, baseProps);
          break;
        default:
          swapModal("DOWN", QuickEditCurrency, baseProps);
          break;
      }
    },
    [draft, swapModal, isLocked],
  );

  /**
   * DATA LINE GENERATOR
   */
  const allLines = useMemo(() => {
    if (mode === "idle" || !type) return [];

    // 🔥 THE PRODUCTION LOGIC: Check if we need W & H based on Calc Types
    const needsDimensions =
      draft?.calcType === "DIMENSIONAL" ||
      draft?.calcType === "AREA_BASED" ||
      draft?.mCalcType === "DIMENSIONAL" ||
      draft?.sCalcType === "AREA_BASED";

    const common = [
      {
        key: "name",
        label: isMaterial ? "Mat. Name:" : "Svc. Name:",
        value: draft?.name || "---",
        isComplete: hasValue(draft?.name),
      },
      {
        key: "unit",
        label: "Unit:",
        value: draft?.unit || "---",
        isComplete: hasValue(draft?.unit),
      },
      {
        key: "calcType",
        label: "Logic:",
        value: draft?.calcType || draft?.mCalcType || draft?.sCalcType || "---",
        isComplete: hasValue(
          draft?.calcType || draft?.mCalcType || draft?.sCalcType,
        ),
      },
    ];

    if (isMaterial) {
      const lines = [
        ...common,
        {
          key: "costPrice",
          label: "Buy Price:",
          value: draft?.costPrice ? `₵${draft.costPrice}` : "---",
          isComplete: hasValue(draft?.costPrice),
        },
        {
          key: "priceGHS",
          label: "Sell Rate:",
          value: draft?.priceGHS ? `₵${draft.priceGHS}` : "---",
          isComplete: hasValue(draft?.priceGHS),
        },
      ];

      if (needsDimensions) {
        lines.push(
          {
            key: "width",
            label: "Fixed Width:",
            value: draft?.width || "0",
            isComplete: hasValue(draft?.width),
          },
          {
            key: "height",
            label: "Fixed Height:",
            value: draft?.height || "0",
            isComplete: hasValue(draft?.height),
          },
        );
      }
      return lines;
    }

    return [
      ...common,
      {
        key: "category",
        label: "Category:",
        value: draft?.category || "General",
        isComplete: true,
      },
      {
        key: "priceGHS",
        label: "Rate:",
        value: draft?.priceGHS ? `₵${draft.priceGHS}` : "---",
        isComplete: hasValue(draft?.priceGHS),
      },
    ];
  }, [draft, type, mode, isMaterial]);

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(allLines.length / ITEMS_PER_PAGE));
  const visibleLines = allLines.slice(
    sliderIndex * ITEMS_PER_PAGE,
    (sliderIndex + 1) * ITEMS_PER_PAGE,
  );

  if (mode === "idle" || !type) {
    return (
      <div className="inner-ui-content inner-ui-top flex flex-col items-center justify-center w-full h-full opacity-20">
        <p className="text-[8px] font-black uppercase tracking-[0.4em]">
          Awaiting Classification
        </p>
      </div>
    );
  }

  return (
    <div className="inner-ui-content inner-ui-top modalOpen flex flex-col items-center w-full h-full">
      {/* HUD */}
      <div className="w-full flex justify-between items-center mb-3 px-2">
        <div className="flex flex-col">
          <span className="text-[7px] text-white/30 uppercase font-black tracking-[0.3em]">
            Status
          </span>
          <span
            className={`text-[9px] font-black uppercase tracking-tighter ${isMaterial ? "text-emerald-400" : "text-cyan-400"}`}
          >
            {mode === "draft" ? `${type} Draft` : mode.replace("_", " ")}
          </span>
        </div>
        <div className="px-2 py-0.5 bg-white/5 rounded-full border border-white/10">
          <span className="text-[7px] text-white/40 font-black tracking-widest">
            {sliderIndex + 1}/{totalPages}
          </span>
        </div>
      </div>

      {/* PREVIEW CARD */}
      <div className="glass-card w-full flex-1 flex flex-col justify-center p-6 border-white/5">
        <div className="flex flex-col gap-3">
          {visibleLines.map((line, i) => (
            <div
              key={line.key}
              onClick={() => openQuickEdit(line.key, line.label)}
              className={`flex justify-between items-baseline border-b border-white/5 pb-2 group transition-all ${
                isLocked
                  ? "pointer-events-none opacity-40"
                  : "cursor-pointer hover:border-cyan-400/30"
              }`}
            >
              <span className="text-[7px] uppercase font-black text-white/40 group-hover:text-cyan-400">
                {line.label}
              </span>
              <span className="text-[11px] font-bold text-white tracking-tight">
                {line.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <div
            className={`h-1 w-1 rounded-full ${allLines.every((l) => l.isComplete) ? "bg-emerald-400" : "bg-zodiac-orange animate-pulse"}`}
          />
          <span className="text-[7px] uppercase font-black tracking-widest opacity-30">
            {allLines.every((l) => l.isComplete)
              ? "Recipe Valid"
              : "Incomplete Recipe"}
          </span>
        </div>
      </div>
    </div>
  );
}
