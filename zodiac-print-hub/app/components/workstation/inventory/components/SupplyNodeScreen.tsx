"use client";

import { useDataStore } from "@store/core/useDataStore";
import {
  ShoppingBag,
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  TrendingDown,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import {
  selectJobsArray,
  selectInventoryMap,
  selectPricesMap,
} from "@store/selectors/data.selectors";
import { ShippedOrderNotification } from "@workstation/inventory/components/ShippedOrderNotification";
import { apiClient } from "@client/api/client";

export function SupplyNodeScreen() {
  const [activeTab, setActiveTab] = useState<"BLOCKS" | "VELOCITY">("BLOCKS");
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. DATA SOURCE & ACTIONS
  const jobs = useDataStore(selectJobsArray);
  const inventory = useDataStore(selectInventoryMap);
  const prices = useDataStore(selectPricesMap);

  const { procurementState, loadVelocityAnalytics } = useDataStore();
  const {
    activeOrders,
    suggestions: velocityData,
    isLoading: isLoadingVelocity,
  } = procurementState;

  // 🧠 LIVE FEED: Filter active orders that were JUST shipped but not yet received
  const transitAlerts = useMemo(
    () =>
      Object.values(activeOrders || {})
        .filter((po: any) => po.status === "ORDERED")
        .slice(0, 2),
    [activeOrders],
  );

  // 2. PHASE 2 LOGIC: Shortfall Aggregation
  const shortfallAnalytics = useMemo(() => {
    const blockedJobs = jobs.filter((j) => {
      if (j.status !== "PENDING") return false;
      const priceItem = prices[j.priceListId];
      if (!priceItem?.materialId) return false;
      const stock = inventory[priceItem.materialId];
      return stock ? stock.totalRemaining < j.quantity : false;
    });

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

  // 3. PHASE 4 LOGIC: Trigger Velocity Load via Global Store
  useEffect(() => {
    if (activeTab === "VELOCITY") {
      loadVelocityAnalytics();
    }
  }, [activeTab, loadVelocityAnalytics]);

  const handleBulkRequisition = async (supplierId: string) => {
    setIsSyncing(true);
    try {
      await apiClient("/api/procurement/orders/batch", {
        method: "POST",
        body: { supplierId },
      });
      // Optionally trigger a reload of purchase orders here
    } catch (err) {
      console.error("Batch PO failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 text-white animate-in fade-in duration-500">
      {/* --- SECTION: LOGISTICS HANDSHAKE (In-Transit Alerts) --- */}
      {transitAlerts.length > 0 && (
        <div className="mb-10 space-y-3">
          <span className="text-[8px] font-black uppercase text-emerald-500 tracking-[0.3em] ml-2">
            Incoming Stream
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transitAlerts.map((po: any) => (
              <ShippedOrderNotification
                key={po.id}
                payload={{ orderId: po.id, supplierName: po.supplier?.name }}
              />
            ))}
          </div>
        </div>
      )}

      {/* --- HEADER & NAVIGATION --- */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
            Supply Node
          </h2>
          <div className="flex gap-8 mt-6 border-b border-white/5">
            <button
              onClick={() => setActiveTab("BLOCKS")}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === "BLOCKS" ? "text-cyan-400" : "text-white/20 hover:text-white/40"}`}
            >
              Shortfall Blocks
              {activeTab === "BLOCKS" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("VELOCITY")}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === "VELOCITY" ? "text-cyan-400" : "text-white/20 hover:text-white/40"}`}
            >
              Predictive Runway
              {activeTab === "VELOCITY" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400" />
              )}
            </button>
          </div>
        </div>

        {activeTab === "BLOCKS" && (
          <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
              {shortfallAnalytics.blockedCount} Critical Gaps
            </span>
          </div>
        )}
      </header>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === "BLOCKS" ? (
          <div className="grid grid-cols-1 gap-6">
            {Object.entries(shortfallAnalytics.suggestions).map(
              ([supId, data]: any) => (
                <div
                  key={supId}
                  className="glass-card border-white/5 bg-white/[0.02] overflow-hidden group animate-in slide-in-from-bottom-2"
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
                          Fulfillment required for {data.items.length} orders
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBulkRequisition(supId)}
                      className="bg-white text-black px-8 py-4 rounded-[2rem] font-black uppercase text-[11px] flex items-center gap-3 hover:bg-cyan-400 transition-all active:scale-95 shadow-xl shadow-white/5"
                    >
                      {isSyncing ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <ShoppingBag size={18} />
                      )}
                      Batch Requisition
                    </button>
                  </div>
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
              <EmptyState
                icon={<CheckCircle2 size={64} />}
                text="Warehouse Levels Nominal"
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingVelocity ? (
              <div className="col-span-full py-20 text-center animate-pulse uppercase font-black text-[10px] opacity-20 tracking-[0.5em]">
                Crunching Burn Rates...
              </div>
            ) : (
              (velocityData || []).map((item: any) => (
                <div
                  key={item.materialId}
                  className={`glass-card p-6 border-white/5 bg-white/[0.02] relative overflow-hidden ${item.status === "REPLENISH" ? "border-orange-500/30" : ""}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight">
                        {item.name}
                      </h4>
                      <p className="text-[8px] opacity-30 font-bold uppercase">
                        {item.supplier || "No Supplier"}
                      </p>
                    </div>
                    <TrendingDown
                      size={14}
                      className={
                        item.status === "REPLENISH"
                          ? "text-orange-500 animate-pulse"
                          : "text-white/20"
                      }
                    />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[7px] font-black opacity-30 uppercase block mb-1">
                        Stock Runway
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-3xl font-black font-mono ${item.runwayDays < 5 ? "text-red-400" : "text-white"}`}
                        >
                          {item.runwayDays > 100 ? "∞" : item.runwayDays}
                        </span>
                        <span className="text-[9px] font-black uppercase opacity-40">
                          Days
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[7px] font-black opacity-30 uppercase block mb-1">
                        Burn Rate
                      </span>
                      <p className="text-xs font-black font-mono text-cyan-400">
                        -{item.burnRate}/day
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${item.runwayDays < 5 ? "bg-red-500" : "bg-emerald-500/50"}`}
                      style={{
                        width: `${Math.min((item.runwayDays / 30) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: any; text: string }) {
  return (
    <div className="py-32 flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-white/10 rounded-[3rem]">
      {icon}
      <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-6">
        {text}
      </p>
    </div>
  );
}
