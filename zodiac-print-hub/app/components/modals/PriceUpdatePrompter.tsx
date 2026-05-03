"use client";

import { useModalStore } from "../store/useModalStore";

export function PriceUpdatePrompter({ itemName, increasePercent, newCost }) {
  const { closeModal } = useModalStore();

  return (
    <div className="glass-card p-6 w-full max-w-sm border-orange-500 bg-zinc-900 animate-in zoom-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xl">
          📈
        </div>
        <div>
          <h2 className="text-lg font-bold">Cost Surge Alert</h2>
          <p className="text-[10px] opacity-50 uppercase tracking-widest">
            Feature 19: Price Update Prompter
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed mb-6">
        Your restock cost for{" "}
        <span className="text-orange-400 font-bold">{itemName}</span> has risen
        by
        <span className="text-orange-400 font-bold"> {increasePercent}%</span>.
        <br />
        <br />
        New Unit Cost: <span className="font-mono font-bold">₵{newCost}</span>
      </p>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => {
            /* Navigate to Price CRUD */ closeModal("GLOBAL");
          }}
          className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95"
        >
          Update My Price List Now
        </button>
        <button
          onClick={() => closeModal("GLOBAL")}
          className="w-full py-3 text-xs opacity-40 hover:opacity-100 font-bold uppercase"
        >
          Ignore (Risk Profit Loss)
        </button>
      </div>
    </div>
  );
}
