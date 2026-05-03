"use client";

import { useDataStore } from "@store/core/useDataStore";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  BarChart3,
  LogOut,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { apiClient } from "@lib/client/api/client";

export const SupplierPortalDashboard = {
  id: "SUPPLIER_PORTAL",
  layoutMode: "DETAIL",
  TopComponent: () => {
    const { procurementState, loadPurchaseOrders, user } = useDataStore();
    const [isSyncing, setIsSyncing] = useState<string | null>(null);

    // 1. DATA SELECTION
    const orders = Object.values(procurementState.activeOrders || {});

    // 2. STATS CALCULATOR
    const stats = useMemo(
      () => ({
        pending: orders.filter((o) => o.status === "DRAFT").length,
        shipped: orders.filter((o) => o.status === "ORDERED").length,
        completed: orders.filter((o) => o.status === "RECEIVED").length,
        totalVolume: orders.reduce((sum, o) => sum + o.totalCost, 0),
      }),
      [orders],
    );

    const handleShipAction = async (orderId: string) => {
      setIsSyncing(orderId);
      try {
        await apiClient(`/api/procurement/orders/${orderId}/ship`, {
          method: "POST",
        });
        await loadPurchaseOrders();
      } finally {
        setIsSyncing(null);
      }
    };

    return (
      <div className="flex flex-col h-full bg-[#050505] text-white animate-in fade-in duration-700">
        {/* --- PORTAL NAV BAR --- */}
        <nav className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-black/20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Package className="text-emerald-500" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">
                Partner Portal
              </h1>
              <p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.3em] mt-1">
                Zodiac Supply Node
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right mr-4">
              <p className="text-[10px] font-black uppercase">
                {user?.name || "Authorized Provider"}
              </p>
              <p className="text-[8px] opacity-30 uppercase font-bold">
                Verified Supplier
              </p>
            </div>
            <button className="p-3 bg-white/5 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </nav>

        <div className="flex-1 p-10 overflow-hidden flex flex-col">
          {/* --- KPI HUD --- */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            <KPI
              icon={<Clock />}
              label="New Requests"
              value={stats.pending}
              color="text-orange-500"
            />
            <KPI
              icon={<Truck />}
              label="In Transit"
              value={stats.shipped}
              color="text-cyan-400"
            />
            <KPI
              icon={<CheckCircle2 />}
              label="Fulfilled"
              value={stats.completed}
              color="text-emerald-400"
            />
            <KPI
              icon={<BarChart3 />}
              label="YTD Volume"
              value={`₵${stats.totalVolume.toLocaleString()}`}
              color="text-white"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
            <header className="mb-6 flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                Supply Pipeline
              </h3>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-white/40 uppercase">
                  Live Connection
                </span>
              </div>
            </header>

            {orders.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
                <Package size={48} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">
                  Queue Clean • No Pending Orders
                </p>
              </div>
            ) : (
              orders.map((order: any) => (
                <div
                  key={order.id}
                  className="glass-card p-8 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group rounded-[2.5rem]"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-all">
                        <Package
                          size={28}
                          className="text-white/20 group-hover:text-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                          Reference: PO-{order.id.slice(-6).toUpperCase()}
                        </span>
                        <h4 className="text-2xl font-black uppercase tracking-tight mt-1">
                          Material Request
                        </h4>
                        <p className="text-[9px] opacity-40 font-bold uppercase mt-1 italic">
                          Issued:{" "}
                          {format(new Date(order.createdAt), "MMMM do, HH:mm")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {order.status === "DRAFT" && (
                        <button
                          onClick={() => handleShipAction(order.id)}
                          disabled={isSyncing === order.id}
                          className="bg-emerald-500 text-black px-8 py-4 rounded-[2rem] font-black uppercase text-[11px] flex items-center gap-3 hover:bg-white active:scale-95 transition-all shadow-2xl shadow-emerald-500/20"
                        >
                          {isSyncing === order.id ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Truck size={18} />
                          )}
                          Authorize Shipment
                        </button>
                      )}
                      <span
                        className={`px-5 py-2 rounded-full text-[9px] font-black uppercase border ${getStatusStyles(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* ITEM SPECS */}
                  <div className="grid grid-cols-2 gap-4">
                    {order.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-5 bg-black/40 border border-white/5 rounded-2xl flex justify-between items-center group/item hover:border-white/10"
                      >
                        <div>
                          <p className="text-[10px] font-black uppercase text-white/60 mb-1">
                            {item.material?.name}
                          </p>
                          <p className="text-[8px] font-bold text-white/20 uppercase">
                            Units Required
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black font-mono text-emerald-400 leading-none">
                            {item.quantity}
                          </p>
                          <p className="text-[9px] font-black text-white/20 uppercase">
                            {item.buyUnit}(s)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  },
};

function KPI({ icon, label, value, color }: any) {
  return (
    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col justify-between h-40">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>{icon}</div>
        <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">
          {label}
        </span>
      </div>
      <p className={`text-4xl font-black font-mono tracking-tighter ${color}`}>
        {value}
      </p>
    </div>
  );
}

function getStatusStyles(status: string) {
  if (status === "DRAFT")
    return "text-orange-400 border-orange-400/20 bg-orange-400/5";
  if (status === "ORDERED")
    return "text-cyan-400 border-cyan-400/20 bg-cyan-400/5";
  return "text-emerald-400 border-emerald-400/20 bg-emerald-400/5";
}
