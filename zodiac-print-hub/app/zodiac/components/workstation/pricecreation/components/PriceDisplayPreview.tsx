"use client";

import { useState, useCallback } from "react";
import { shallow } from "zustand/shallow";
import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { MeasurementCalculator } from "@lib/utils/measurement-calculator";

// Internal Quick-Edit Modals
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

  // =========================
  // FSM STATE
  // =========================
  const isIdle = mode === "idle";
  const isSelectType = mode === "select_type";
  const isDraft = mode === "draft";
  const isReview = mode === "review";
  const isSubmitting = mode === "submitting";

  const isLocked = isReview || isSubmitting;

  const isMaterial = type === "material";

  const hasValue = (val: any) =>
    val !== undefined &&
    val !== null &&
    val !== "" &&
    val !== "---" &&
    val !== 0;

  const openQuickEdit = useCallback(
    (field: string, label: string) => {
      if (isLocked) return; // 🔒 prevent edits in review/submitting

      const rawCurrent = (draft as any)[field];

      const baseProps = {
        key: field + Date.now(),
        field,
        label,
        current: rawCurrent,
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
        case "minOrder":
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

  const getLines = () => {
    if (isIdle || isSelectType) return [];

    const unitCategory = MeasurementCalculator.getCategory(draft?.unit as any);
    const needsDimensions =
      unitCategory === "AREA" || unitCategory === "DIMENSION";

    const common = [
      {
        key: "name",
        label: isMaterial ? "Material Name:" : "Service Name:",
        value: draft?.name || "---",
        isComplete: hasValue(draft?.name),
      },
      {
        key: "unit",
        label: "Unit:",
        value: draft?.unit || "---",
        isComplete: hasValue(draft?.unit),
      },
    ];

    if (isMaterial) {
      const lines = [
        ...common,
        {
          key: "costPrice",
          label: "Material Cost:",
          value: draft?.costPrice ? `₵${draft.costPrice}` : "---",
          isComplete: hasValue(draft?.costPrice),
        },
        {
          key: "priceGHS",
          label: "Unit Cost:",
          value: draft?.priceGHS ? `₵${draft.priceGHS}` : "---",
          isComplete: hasValue(draft?.priceGHS),
        },
      ];

      if (needsDimensions) {
        lines.push(
          {
            key: "width",
            label: "Width:",
            value: draft?.width || "0",
            isComplete: hasValue(draft?.width),
          },
          {
            key: "height",
            label: "Height:",
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
        value: draft?.category || "---",
        isComplete: hasValue(draft?.category),
      },
      {
        key: "costPrice",
        label: "Service Cost:",
        value: draft?.costPrice ? `₵${draft.costPrice}` : "---",
        isComplete: hasValue(draft?.costPrice),
      },
      {
        key: "priceGHS",
        label: "Unit Cost:",
        value: draft?.priceGHS ? `₵${draft.priceGHS}` : "---",
        isComplete: hasValue(draft?.priceGHS),
      },
      {
        key: "minOrder",
        label: "Min. Order:",
        value: draft?.minOrder || "1",
        isComplete: true,
      },
    ];
  };

  const allLines = getLines();
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(allLines.length / ITEMS_PER_PAGE));

  const visibleLines = allLines.slice(
    sliderIndex * ITEMS_PER_PAGE,
    (sliderIndex + 1) * ITEMS_PER_PAGE,
  );

  // =========================
  // UI GUARDS
  // =========================
  if (isIdle || isSelectType) {
    return (
      <div className="inner-ui-content inner-ui-top modalOpen flex flex-col items-center w-full h-full">
        <div className="flex flex-col items-center justify-center text-center opacity-40">
          <div className="text-xl">🛰️</div>
          <p className="text-[10px] uppercase">Select type to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inner-ui-content inner-ui-top modalOpen flex flex-col items-center w-full h-full">
      {/* HEADER */}
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <div className="flex flex-col">
          <span className="text-[7px] text-white/30 uppercase font-black tracking-[0.3em]">
            Workstation
          </span>

          <span
            className={`text-[9px] font-black uppercase ${
              isMaterial ? "text-emerald-400" : "text-cyan-400"
            }`}
          >
            {isDraft && (isMaterial ? "Material Draft" : "Service Draft")}
            {isReview && "Review Mode"}
            {isSubmitting && "Submitting..."}
          </span>
        </div>

        <div className="px-2 py-0.5 bg-white/5 rounded-full border border-white/10">
          <span className="text-[8px] text-white/40 font-black">
            {sliderIndex + 1} / {totalPages}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="glass-card w-full flex-1 flex flex-col justify-center p-6">
        <div className="flex flex-col gap-4 text-white text-[12px]">
          {visibleLines.map((line, i) => (
            <div
              key={i}
              onClick={() => openQuickEdit(line.key, line.label)}
              className={`flex justify-between border-b pb-2 ${
                isLocked ? "pointer-events-none opacity-60" : "cursor-pointer"
              }`}
            >
              <span className="text-[8px] uppercase opacity-60">
                {line.label}
              </span>
              <span>{line.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 text-[8px] text-center opacity-30">
          {allLines.every((l) => l.isComplete) ? "✓ Ready" : "Incomplete"}
        </div>
      </div>
    </div>
  );
}
