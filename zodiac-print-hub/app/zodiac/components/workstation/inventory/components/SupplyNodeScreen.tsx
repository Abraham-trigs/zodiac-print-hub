"use client";

import { useDataStore } from "@store/core/useDataStore";
import {
  ShoppingBag,
  AlertCircle,
  ArrowRight,
  Layers,
  Building2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  selectJobsArray,
  selectInventoryMap,
  selectPricesMap,
} from "@store/selectors/data.selectors";
import { apiClient } from "@root/lib/api/client";

export function SupplyNodeScreen() {
  const jobs = useDataStore(selectJobsArray);
  const inventory = useDataStore(selectInventoryMap);
  const prices = useDataStore(selectPricesMap);
  const [isSyncing, setIsSyncing] = useState(false);

  // 🧠 LOGIC: Identify which jobs are currently "Stock Blocked"
  const shortfallAnalytics = useMemo(() => {
    const blockedJobs = jobs.filter((j) => {
      if (j.status !== "PENDING") return false;
      const priceItem = prices[j.priceListId];
      if (!priceItem?.materialId) return false;
      const stock = inventory[priceItem.materialId];
      return stock ? stock.totalRemaining < j.quantity : false;
    });

    // Group by Supplier for "Smart Batching"
    const suggestions: Record<string, any> = {};
    blockedJobs.forEach((job) => {
      const mat = prices[job.priceListId]?.material;
      const supId = mat?.supplierId || "UNASSIGNED";

      if (!suggestions[supId]) {
        suggestions[supId] = {
          supplierName: mat?.supplier?.name || "Unassigned Provider",
          items: [],
        };
      }
      suggestions[supId].items.push({ job, mat });
    });

    return { blockedCount: blockedJobs.length, suggestions };
  }, [jobs, inventory, prices]);

  const handleBulkRequisition = async (supplierId: string) => {
    setIsSyncing(true);
    // 🚀 Phase 3 Trigger: Create Draft PO for this supplier's shortfall
    try {
      await new Promise((r) => setTimeout(r, 1000)); // Simulating logic
      alert("Batch Purchase Order Drafted for Supplier.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 text-white animate-in fade-in duration-500">
      {/* --- HUD --- */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
            Supply Node
          </h2>
          <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2">
            Shortfall & Reorder Intelligence
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
              {shortfallAnalytics.blockedCount} Jobs Blocked
            </span>
          </div>
        </div>
      </header>

      {/* --- PROPOSED ORDERS GRID --- */}
      <div className="grid grid-cols-1 gap-6 overflow-y-auto pr-2 custom-scrollbar">
        {Object.entries(shortfallAnalytics.suggestions).map(
          ([supId, data]: any) => (
            <div
              key={supId}
              className="glass-card border-white/5 bg-white/[0.02] overflow-hidden group"
            >
              <div className="p-8 flex items-start justify-between">
                <div className="flex gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 group-hover:bg-cyan-400 transition-all">
                    <Building2
                      size={28}
                      className="group-hover:text-black transition-all"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                      {data.supplierName}
                    </h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                      Fulfillment for {data.items.length} Pending Orders
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleBulkRequisition(supId)}
                  className="bg-white text-black px-8 py-4 rounded-[2rem] font-black uppercase text-[11px] flex items-center gap-3 hover:bg-cyan-400 active:scale-95 transition-all shadow-2xl shadow-white/5"
                >
                  {isSyncing ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <ShoppingBag size={18} />
                  )}
                  Generate Batch PO
                </button>
              </div>

              {/* --- BLOCKED ITEMS PREVIEW --- */}
              <div className="bg-black/20 p-6 flex flex-wrap gap-3 border-t border-white/5">
                {data.items.map(({ job, mat }: any) => (
                  <div
                    key={job.id}
                    className="px-4 py-2 bg-white/5 rounded-full flex items-center gap-3 border border-white/5"
                  >
                    <span className="text-[9px] font-black font-mono text-cyan-400">
                      {job.shortRef}
                    </span>
                    <span className="text-[9px] font-bold uppercase opacity-60 truncate max-w-[120px]">
                      {mat?.name}
                    </span>
                    <ArrowRight size={10} className="opacity-20" />
                    <span className="text-[9px] font-black text-red-400">
                      -{job.quantity}
                      {mat?.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ),
        )}

        {shortfallAnalytics.blockedCount === 0 && (
          <div className="py-32 flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-white/10 rounded-[3rem]">
            <CheckCircle2 size={64} />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-6">
              Warehouse Levels Optimal
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
