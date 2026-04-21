"use client";

import { useState } from "react";
import { useDataStore } from "../../store/core/useDataStore";

export function StockManagementModal() {
  const { inventory, restockItem } = useDataStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [newCost, setNewCost] = useState(0);

  const handleRestock = () => {
    if (!selectedId) return;
    restockItem(selectedId, amount, newCost);

    // Reset local state
    setSelectedId(null);
    setAmount(0);
    setNewCost(0);
  };

  return (
    <div className="glass-card p-6 w-full max-h-[85vh] flex flex-col gap-6 border border-orange-500/20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Control</h2>
          <p className="text-[10px] text-orange-400 uppercase tracking-widest">
            Real-time Stock Tracking
          </p>
        </div>
      </div>

      {/* 1. Inventory List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 custom-scrollbar pr-1">
        {inventory.map((item) => {
          const isLow = item.totalRemaining < item.threshold;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`bg-white/5 border p-4 rounded-2xl flex justify-between items-center transition-all cursor-pointer ${
                selectedId === item.id
                  ? "border-orange-500 bg-orange-500/5"
                  : "border-white/5 hover:bg-white/10"
              }`}
            >
              <div>
                <span className="text-sm font-bold block">
                  {item.materialName}
                </span>
                <span className="text-[9px] opacity-40 uppercase">
                  Min Level: {item.threshold} {item.unit}
                </span>
              </div>
              <div className="text-right">
                <div
                  className={`text-lg font-mono font-bold ${isLow ? "text-red-500 animate-pulse" : "text-cyan-400"}`}
                >
                  {item.totalRemaining}{" "}
                  <span className="text-[10px]">{item.unit}</span>
                </div>
                {isLow && (
                  <span className="text-[8px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-black uppercase">
                    Low Stock
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Restock Action (Feature 7.3) */}
      {selectedId && (
        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-orange-400">
              Restocking Entry
            </span>
            <button
              onClick={() => setSelectedId(null)}
              className="text-[10px] opacity-50"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] opacity-40 uppercase">
                Qty to Add
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="bg-blue-900/30 border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] opacity-40 uppercase">
                Current Unit Cost (₵)
              </label>
              <input
                type="number"
                value={newCost}
                onChange={(e) => setNewCost(Number(e.target.value))}
                className="bg-blue-900/30 border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleRestock}
            className="w-full py-3 bg-orange-500 text-black text-xs font-black rounded-xl uppercase tracking-widest active:scale-95 transition-all"
          >
            Update Inventory
          </button>
        </div>
      )}

      {!selectedId && (
        <p className="text-[10px] opacity-30 italic text-center">
          💡 Select a material above to record a new delivery or adjustment.
        </p>
      )}
    </div>
  );
}
