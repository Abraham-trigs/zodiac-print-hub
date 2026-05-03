"use client";

import { useDataStore } from "@store/core/useDataStore";
import {
  Truck,
  MapPin,
  CheckCircle2,
  Phone,
  Package,
  Navigation,
} from "lucide-react";

export function DeliveryPipelineScreen() {
  const deliveries = useDataStore((s) =>
    Object.values(s.deliveryState.deliveries),
  );
  const active = deliveries.filter((d) => d.status !== "DELIVERED");

  return (
    <div className="flex flex-col h-full p-8 text-white animate-in fade-in duration-700">
      <header className="mb-10">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">
          Delivery Node
        </h2>
        <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2">
          Logistics & Dispatch Stream
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {active.map((item: any) => (
          <div
            key={item.id}
            className="glass-card p-6 border-white/5 bg-white/[0.02] flex items-center justify-between group"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-cyan-400 transition-all">
                <Truck
                  size={24}
                  className={
                    item.status === "OUT_FOR_DELIVERY"
                      ? "text-cyan-400 animate-pulse"
                      : "text-white/20"
                  }
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-xl font-black uppercase tracking-tight">
                    Job #{item.job?.shortRef}
                  </h4>
                  <span className="text-[8px] font-black px-2 py-1 bg-white/10 rounded uppercase">
                    {item.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-white/40 text-[10px] font-bold">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} /> {item.address || "Pickup"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone size={12} /> {item.job?.client?.phone}
                  </div>
                </div>
              </div>
            </div>

            <button className="px-6 py-3 bg-white text-black font-black uppercase text-[10px] rounded-xl flex items-center gap-2 hover:bg-cyan-400 transition-all">
              <Navigation size={14} />
              Assign Rider
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
