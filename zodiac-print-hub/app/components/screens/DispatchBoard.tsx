"use client";

import { useDataStore } from "@store/core/useDataStore";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  ChevronRight,
  Navigation,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { useState } from "react";

export function DispatchBoard() {
  const { deliveryState, updateDeliveryStatus } = useDataStore();
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  // 🧠 LOGIC: Split deliveries into "The Shelf" vs "The Road"
  const deliveries = Object.values(deliveryState.deliveries || {});
  const pending = deliveries.filter(
    (d) => d.status === "PENDING" || d.status === "SCHEDULED",
  );
  const inTransit = deliveries.filter((d) => d.status === "OUT_FOR_DELIVERY");

  const handleDispatch = async (deliveryId: string) => {
    const rider = prompt("Enter Rider Name/ID:"); // Simple entry for now
    if (!rider) return;

    setIsSyncing(deliveryId);
    try {
      // 🚀 Trigger Service: Updates DB + Sends WhatsApp Alert
      await updateDeliveryStatus(deliveryId, "OUT_FOR_DELIVERY", rider);
    } finally {
      setIsSyncing(null);
    }
  };

  const handleComplete = async (deliveryId: string) => {
    setIsSyncing(deliveryId);
    try {
      await updateDeliveryStatus(deliveryId, "DELIVERED");
    } finally {
      setIsSyncing(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 text-white animate-in fade-in duration-700">
      <header className="mb-10">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
          Logistics Node
        </h2>
        <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2">
          Fleet & Fulfillment Control
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1 overflow-hidden">
        {/* --- COLUMN 1: THE SHELF (Ready for Dispatch) --- */}
        <section className="flex flex-col">
          <header className="flex justify-between items-center mb-6 px-2">
            <span className="text-[10px] font-black uppercase text-white/20 tracking-widest flex items-center gap-2">
              <Package size={14} /> Ready for Dispatch ({pending.length})
            </span>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
            {pending.map((d: any) => (
              <div
                key={d.id}
                className="glass-card p-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight">
                      Order #{d.job?.shortRef}
                    </h4>
                    <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">
                      {d.type}
                    </span>
                  </div>
                  <span className="text-[8px] opacity-20 font-mono">
                    {d.id.slice(-6)}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 text-white/40">
                    <MapPin size={12} className="text-cyan-400/50" />
                    <span className="text-[10px] font-bold truncate">
                      {d.address || "Warehouse Pickup"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-white/40">
                    <Phone size={12} className="text-cyan-400/50" />
                    <span className="text-[10px] font-bold">
                      {d.client?.phone}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDispatch(d.id)}
                  disabled={isSyncing === d.id}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all active:scale-95 shadow-xl"
                >
                  {isSyncing === d.id ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Navigation size={14} />
                  )}
                  Assign Rider
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* --- COLUMN 2: THE ROAD (In-Transit) --- */}
        <section className="flex flex-col border-l border-white/5 pl-10">
          <header className="flex justify-between items-center mb-6 px-2">
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
              <Truck size={14} className="animate-pulse" /> Out For Delivery (
              {inTransit.length})
            </span>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
            {inTransit.map((d: any) => (
              <div
                key={d.id}
                className="glass-card p-6 border-emerald-500/20 bg-emerald-500/[0.02] group"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <Truck size={18} className="text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase">
                        Rider: {d.handledBy}
                      </h4>
                      <p className="text-[8px] font-bold text-emerald-500 opacity-60 uppercase">
                        En-route to client
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleComplete(d.id)}
                  disabled={isSyncing === d.id}
                  className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95"
                >
                  <CheckCircle2 size={16} />
                  Confirm Handover
                </button>
              </div>
            ))}
            {inTransit.length === 0 && (
              <div className="py-20 text-center opacity-10 border-2 border-dashed border-white/10 rounded-[3rem]">
                <Navigation size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">
                  No active trips
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
