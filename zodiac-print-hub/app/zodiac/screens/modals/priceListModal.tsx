"use client";

import { useState, useMemo } from "react";
import { useDataStore } from "../../store/core/useDataStore";
import { useModalStore } from "../../store/useModalStore";
import { useAccessStore } from "../../store/useAccessStore"; // ✅ Added Access Store

export function PriceListModal() {
  const { prices, updatePrice } = useDataStore();
  const { closeModal } = useModalStore();
  const { can } = useAccessStore(); // ✅ Get permission checker

  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");

  // Determine if user has editing rights
  const isAdmin = can("EDIT_PRICES");

  const filteredPrices = useMemo(() => {
    return prices.filter((p) =>
      p.service.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, prices]);

  const handleEdit = (id: string, currentPrice: number) => {
    if (!isAdmin) return; // Guard clause
    setEditingId(id);
    setTempPrice(currentPrice.toString());
  };

  const handleSave = (id: string) => {
    const newPrice = parseFloat(tempPrice);
    if (!isNaN(newPrice)) {
      updatePrice(id, newPrice);
    }
    setEditingId(null);
  };

  return (
    <div className="glass-card p-6 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col gap-5 border border-cyan-500/20 shadow-2xl animate-in zoom-in-95">
      {/* Header & Search */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Master Price List
            </h2>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold">
              Financial Source of Truth
            </p>
          </div>
          <button
            onClick={() => closeModal("GLOBAL")}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs opacity-40 hover:opacity-100 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Filter services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors text-white"
            />
          </div>
          {/* ✅ Only show "New" button if Admin */}
          {isAdmin && (
            <button className="px-4 py-2 bg-cyan-500 text-black text-[10px] font-black rounded-xl uppercase hover:bg-cyan-400 active:scale-95 transition-all">
              + New
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[9px] uppercase opacity-40 tracking-[0.2em]">
              <th className="pb-2 pl-4">Service Description</th>
              <th className="pb-2">Unit</th>
              <th className="pb-2">Rate (₵)</th>
              <th className="pb-2 text-right pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrices.map((item) => (
              <tr
                key={item.id}
                className="bg-white/5 hover:bg-white/10 transition-all group"
              >
                <td className="p-4 rounded-l-xl text-sm font-medium group-hover:text-cyan-400 transition-colors">
                  {item.service}
                </td>
                <td className="p-4 text-[10px] opacity-50 font-mono uppercase tracking-tighter">
                  per {item.unit}
                </td>
                <td className="p-4 font-mono">
                  {editingId === item.id ? (
                    <input
                      autoFocus
                      className="w-20 bg-cyan-500/20 border border-cyan-500/50 rounded px-2 py-1 text-white outline-none"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      onBlur={() => handleSave(item.id)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSave(item.id)
                      }
                    />
                  ) : (
                    <span className="text-orange-400 font-bold">
                      ₵{item.priceGHS.toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="p-4 rounded-r-xl text-right pr-4">
                  {/* ✅ Only show the Edit Action if Admin */}
                  {isAdmin && (
                    <button
                      onClick={() => handleEdit(item.id, item.priceGHS)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                    >
                      {editingId === item.id ? "✅" : "⚙️"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-[9px] text-cyan-400 font-bold uppercase">
            {isAdmin ? "Admin Access: Full Control" : "Read-Only Mode"}
          </span>
        </div>
      </div>
    </div>
  );
}
