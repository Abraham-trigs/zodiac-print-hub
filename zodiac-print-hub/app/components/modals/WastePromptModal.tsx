"use client";

import { useState } from "react";
import { useModalStore } from "../../zodiac/store/useModalStore";

export function WastePromptModal({
  job,
  onConfirm,
}: {
  job: any;
  onConfirm: (waste: number) => void;
}) {
  const [wasteAmount, setWasteAmount] = useState<number>(0);
  const { closeModal } = useModalStore();

  return (
    <div className="glass-card p-6 w-full max-w-sm border-orange-500 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
          ♻️
        </div>
        <h2 className="text-xl font-bold">Waste Report</h2>
      </div>

      <p className="text-xs opacity-60 mb-6">
        Job #{job.id} successful! Enter any material wasted (Trimmings, errors,
        etc.) to sync stock.
      </p>

      <div className="flex flex-col gap-1 mb-6">
        <label className="text-[10px] uppercase opacity-40 font-bold tracking-widest">
          Wasted Amount ({job.unit || "Yards"})
        </label>
        <input
          type="number"
          autoFocus
          className="bg-white/5 border border-white/10 p-4 rounded-2xl text-2xl font-mono text-orange-400 focus:border-orange-500 outline-none transition-all"
          placeholder="0.00"
          onChange={(e) => setWasteAmount(Number(e.target.value))}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            closeModal("GLOBAL");
            onConfirm(0);
          }}
          className="flex-1 py-3 text-xs opacity-40 hover:opacity-100 font-bold uppercase tracking-tighter"
        >
          No Waste
        </button>
        <button
          onClick={() => {
            closeModal("GLOBAL");
            onConfirm(wasteAmount);
          }}
          className="flex-1 py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95"
        >
          Record & Close
        </button>
      </div>
    </div>
  );
}
