"use client";

import { useRef, useEffect, useState } from "react";
import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { ClassificationHub } from "./ClassificationHub";
import { ExcelImportVault } from "./ExcelImportVault"; // 🚀 The specific target
import { ZodiacInput } from "@components/common/ZodiacInput";
import { Database } from "lucide-react";

interface Props {
  field: string;
  label: string;
  current: any;
}

export function QuickEditCurrency({ field, label, current }: Props) {
  const setPricingDraft = useDataStore((s) => s.setPricingDraft);
  const setMode = useDataStore((s) => s.setMode);
  const { swapModal } = useModalStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState(() => {
    if (current === "---" || current == null) return "";
    return String(current).replace(/[₵,]/g, "");
  });

  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
      const el = inputRef.current;
      if (el) {
        const len = el.value.length;
        el.setSelectionRange?.(len, len);
      }
    }, 120);
    return () => clearTimeout(t);
  }, []);

  const displayLabel = label?.replace(":", "") || "Value";

  const commit = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, "");
    const num = Number(clean);
    setPricingDraft({ [field]: Number.isFinite(num) ? num : 0 });
    setMode("draft");
    swapModal("DOWN", ClassificationHub);
  };

  /**
   * OPEN SPECIFIC ELEMENT: EXCEL VAULT
   * This satisfies your rule: Allow jumping to the bulk tool from the manual modal.
   */
  const handleOpenBulkTool = () => {
    swapModal("DETAIL", ExcelImportVault);
  };

  return (
    <div className="inner-ui-content inner-ui-down modalOpen p-6 text-white flex flex-col h-full">
      <div className="max-w-md mx-auto w-full text-center flex-1 flex flex-col justify-center">
        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-4 block">
          Set {displayLabel}
        </span>

        <div className="relative flex flex-col items-center">
          <div className="flex items-baseline gap-3 w-full">
            <span className="text-3xl font-black text-white/10 italic">₵</span>
            <ZodiacInput
              ref={inputRef}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={value}
              onChange={(e) => {
                const next = e.target.value;
                if (!/^[0-9.]*$/.test(next)) return;
                if ((next.match(/\./g) || []).length > 1) return;
                setValue(next);
              }}
              className="bg-transparent text-center text-7xl font-black text-white outline-none py-4 w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") commit(e.currentTarget.value);
                if (e.key === "Escape") {
                  setMode("draft");
                  swapModal("DOWN", ClassificationHub);
                }
              }}
            />
          </div>
        </div>

        {/* 🚀 THE RULE: BUTTON TO OPEN SPECIFIC ELEMENT */}
        <button
          onClick={handleOpenBulkTool}
          className="mt-8 mx-auto flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-zodiac-orange hover:border-zodiac-orange transition-all group"
        >
          <Database
            size={10}
            className="text-zodiac-orange group-hover:text-white"
          />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">
            Switch to Bulk Excel Vault
          </span>
        </button>

        <p className="mt-4 text-[7px] text-white/10 uppercase font-black tracking-widest">
          ENTER to confirm • ESC to cancel
        </p>
      </div>

      <button
        onClick={() => {
          setMode("draft");
          swapModal("DOWN", ClassificationHub);
        }}
        className="mt-auto text-[8px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-white"
      >
        ← Back
      </button>
    </div>
  );
}
