"use client";

import { useEffect } from "react";
import { useDataStore } from "@store/core/useDataStore";
import { selectMovementsArray } from "@store/selectors/data.selectors";
import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  History,
  User,
  Package,
  X,
} from "lucide-react";
import { useModalStore } from "@store/useModalStore";

interface Props {
  stockItemId: string;
}

/**
 * STOCK_LEDGER_SCREEN
 * The Industrial Audit Trail UI.
 * Reveals exactly where material went and who authorized it.
 */
export function StockLedgerScreen({ stockItemId }: Props) {
  const { closeModal } = useModalStore();
  const loadMovements = useDataStore((s) => s.loadMovements);

  // 1. Data Selection
  const allMovements = useDataStore(selectMovementsArray);
  const movements = allMovements
    .filter((m) => m.stockItemId === stockItemId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const item = useDataStore((s) => s.inventoryState.inventory[stockItemId]);

  // 2. Fresh Fetch on Mount
  useEffect(() => {
    if (stockItemId) loadMovements({ stockItemId });
  }, [stockItemId, loadMovements]);

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 animate-in slide-in-from-right duration-500 shadow-2xl border-l border-white/5">
      {/* --- HEADER: Identity & Balance --- */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-[1.5rem] bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
            <Package className="text-cyan-400" size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
              Material Ledger
            </h2>
            <p className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.3em] mt-2">
              {item?.material?.name || "Unknown Resource"} • Audit Trail
            </p>
          </div>
        </div>

        <button
          onClick={() => closeModal("DETAIL")}
          className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"
        >
          <X size={20} className="opacity-40" />
        </button>
      </div>

      {/* --- HUD: CURRENT STATE --- */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
          <span className="text-[8px] opacity-30 uppercase font-black tracking-widest block mb-2">
            Live Inventory
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono tracking-tighter">
              {item?.totalRemaining?.toFixed(1) || "0.0"}
            </span>
            <span className="text-[10px] font-black uppercase text-cyan-400 opacity-60">
              {item?.material?.unit}
            </span>
          </div>
        </div>
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
          <span className="text-[8px] opacity-30 uppercase font-black tracking-widest block mb-2">
            Transaction Count
          </span>
          <span className="text-4xl font-black font-mono tracking-tighter">
            {movements.length}
          </span>
        </div>
      </div>

      {/* --- THE LEDGER: TRANSACTION LIST --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        {movements.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
            <History size={40} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">
              No History Detected
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {movements.map((m) => (
              <div
                key={m.id}
                className="glass-card p-5 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-5">
                  {/* Status Icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      m.type === "RESTOCK"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : m.type === "WASTE"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-white/5 text-white/40"
                    }`}
                  >
                    {m.type === "RESTOCK" ? (
                      <ArrowUpRight size={22} />
                    ) : m.type === "WASTE" ? (
                      <AlertTriangle size={22} />
                    ) : (
                      <ArrowDownLeft size={22} />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-widest">
                        {m.type}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[9px] font-bold text-white/40 uppercase">
                        {m.referenceType || "MANUAL"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 opacity-30">
                      <User size={10} />
                      <span className="text-[8px] font-black uppercase tracking-tighter">
                        {format(new Date(m.createdAt), "MMM d, HH:mm")} • BY{" "}
                        {m.createdBy.slice(-6)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <div
                    className={`text-xl font-black font-mono tracking-tighter ${
                      m.type === "RESTOCK"
                        ? "text-emerald-400"
                        : m.type === "WASTE"
                          ? "text-red-400"
                          : "text-white"
                    }`}
                  >
                    {m.type === "RESTOCK" ? "+" : "-"}
                    {m.quantity}
                  </div>
                  <p className="text-[7px] opacity-20 font-black uppercase italic max-w-[140px] truncate mt-1">
                    {m.note || "Internal System Update"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- FOOTER: SYSTEM STATUS --- */}
      <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
        <p className="text-[7px] text-white/10 font-black uppercase tracking-[0.5em]">
          Zodiac Ledger Node • Encrypted History
        </p>
      </div>
    </div>
  );
}
