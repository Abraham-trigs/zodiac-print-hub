"use client";

import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { ClassificationHub } from "../ClassificationHub";

interface Props {
  field: string;
  label: string;
  current: any;
}

export function QuickEditCurrency({ field, label, current }: Props) {
  const setDraft = useDataStore((s) => s.setDraft);
  const { swapModal } = useModalStore();

  const handleConfirm = (val: string) => {
    const num = parseFloat(val);
    setDraft({ [field]: isNaN(num) ? 0 : num });
    swapModal("DOWN", ClassificationHub);
  };

  return (
    <div className="flex flex-col h-full w-full p-6 text-white animate-in slide-in-from-bottom duration-500">
      <div className="max-w-md mx-auto w-full text-center">
        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-4 block">
          Set {label.replace(":", "")}
        </span>

        <div className="relative flex flex-col items-center">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-white/10 italic">₵</span>
            <input
              autoFocus
              type="number"
              step="0.01"
              className="bg-transparent text-center text-7xl font-black text-white outline-none py-4 w-full"
              placeholder="0.00"
              defaultValue={
                current === "---" ? "" : current.toString().replace("₵", "")
              }
              onKeyDown={(e) =>
                e.key === "Enter" && handleConfirm(e.currentTarget.value)
              }
            />
          </div>
          <div className="h-1 w-32 bg-cyan-400/20 rounded-full mt-2" />
        </div>

        <button
          onClick={() => swapModal("DOWN", ClassificationHub)}
          className="mt-16 text-[10px] text-white/20 uppercase font-black tracking-widest"
        >
          ← Cancel & Return
        </button>
      </div>
    </div>
  );
}
