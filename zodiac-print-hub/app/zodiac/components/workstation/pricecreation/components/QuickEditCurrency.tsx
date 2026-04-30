"use client";

import { useRef, useEffect, useState } from "react";
import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { ClassificationHub } from "./ClassificationHub";
import { ZodiacInput } from "@components/common/ZodiacInput";

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

  // ✅ LOCAL CONTROL (prevents cursor loss)
  const [value, setValue] = useState(() => {
    if (current === "---" || current == null) return "";
    return String(current).replace(/[₵,]/g, "");
  });

  // ✅ ONE-TIME SAFE FOCUS (no re-trigger loops)
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

    setPricingDraft({
      [field]: Number.isFinite(num) ? num : 0,
    });

    // ✅ return to draft state (not modal-driven state)
    setMode("draft");

    swapModal("DOWN", ClassificationHub);
  };

  return (
    <div className="inner-ui-content inner-ui-down modalOpen p-6 text-white">
      <div className="max-w-md mx-auto w-full text-center">
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
              autoComplete="off"
              value={value}
              onChange={(e) => {
                const next = e.target.value;

                // numeric guard (soft, not blocking cursor)
                if (!/^[0-9.]*$/.test(next)) return;

                // single decimal enforcement
                if ((next.match(/\./g) || []).length > 1) return;

                setValue(next);
              }}
              className="bg-transparent text-center text-7xl font-black text-white outline-none py-4 w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commit(e.currentTarget.value);
                }

                if (e.key === "Escape") {
                  setMode("draft");
                  swapModal("DOWN", ClassificationHub);
                }
              }}
            />
          </div>
        </div>

        <p className="mt-8 text-[8px] text-white/20 uppercase font-black tracking-widest">
          ENTER to confirm • ESC to cancel
        </p>
      </div>
    </div>
  );
}
