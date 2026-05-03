"use client";

import { useDataStore } from "@store/core/useDataStore";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { apiClient } from "@lib/client/api/client";

export function SupplierDashboard() {
  const { procurementState, loadPurchaseOrders } = useDataStore();
  const orders = Object.values(procurementState.activeOrders || {});

  const handleShipOrder = async (orderId: string) => {
    try {
      await apiClient(`/api/procurement/orders/${orderId}/ship`, {
        method: "POST",
      });
      await loadPurchaseOrders();
      alert("Order marked as Shipped. The shop has been notified.");
    } catch (err) {
      console.error("Shipping failed", err);
    }
  };

  return (
    <div className="flex flex-col h-full p-10 text-white bg-[#050505] animate-in fade-in duration-700">
      {/* --- PORTAL HEADER --- */}
      <header className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            Partner Portal
          </h2>
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em] mt-2">
            Incoming Fulfillment Requests
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
              Connected Node
            </span>
          </div>
        </div>
      </header>

      {/* --- DASHBOARD STATS --- */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <StatCard
          label="Pending"
          value={orders.filter((o) => o.status === "DRAFT").length}
          icon={<Clock size={16} />}
          color="orange"
        />
        <StatCard
          label="In Transit"
          value={orders.filter((o) => o.status === "ORDERED").length}
          icon={<Truck size={16} />}
          color="cyan"
        />
        <StatCard
          label="Completed"
          value={orders.filter((o) => o.status === "RECEIVED").length}
          icon={<CheckCircle2 size={16} />}
          color="emerald"
        />
      </div>

      {/* --- ACTIVE ORDERS LIST --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
        <h3 className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-4 px-2">
          Active Requirements
        </h3>

        {orders.map((order: any) => (
          <div
            key={order.id}
            className="glass-card p-8 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-all">
                  <Package
                    size={24}
                    className="text-white/40 group-hover:text-emerald-400"
                  />
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tight">
                    Order #{order.id.slice(-6).toUpperCase()}
                  </h4>
                  <p className="text-[9px] opacity-40 font-bold uppercase mt-1">
                    Received:{" "}
                    {format(new Date(order.createdAt), "MMM d, HH:mm")}
                  </p>
                </div>
              </div>

              {order.status === "DRAFT" && (
                <button
                  onClick={() => handleShipOrder(order.id)}
                  className="bg-white text-black px-8 py-4 rounded-[2rem] font-black uppercase text-[11px] flex items-center gap-3 hover:bg-emerald-400 active:scale-95 transition-all shadow-2xl"
                >
                  <Truck size={18} />
                  Mark as Shipped
                </button>
              )}

              <span
                className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase border ${getStatusStyles(order.status)}`}
              >
                {order.status}
              </span>
            </div>

            {/* LINE ITEMS */}
            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5"
                >
                  <span className="text-[11px] font-black uppercase">
                    {item.material?.name}
                  </span>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    {item.quantity} {item.buyUnit}(s)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20",
  };
  return (
    <div className={`p-6 rounded-[2rem] border ${colors[color]}`}>
      <div className="flex justify-between items-center mb-4 opacity-40">
        {icon}{" "}
        <span className="text-[8px] font-black uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-4xl font-black font-mono leading-none">{value}</p>
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
