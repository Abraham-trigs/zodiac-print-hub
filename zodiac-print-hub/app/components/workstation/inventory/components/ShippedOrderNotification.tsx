"use client";

import { Truck, ChevronRight, PackageCheck } from "lucide-react";
import { useZodiac } from "@store/zodiac.store";

interface Props {
  payload: {
    orderId: string;
    supplierName: string;
    message?: string;
  };
  onDismiss?: () => void;
}

/**
 * SHIPPED_ORDER_NOTIFICATION
 * Triggered when a supplier authorizes a shipment via the Partner Portal.
 * Designed for the Manager's Feed or Logistics Alert zone.
 */
export function ShippedOrderNotification({ payload, onDismiss }: Props) {
  const { setScreen } = useZodiac();

  const handleNavigateToReceiving = () => {
    // 🚀 Handshake: Take the manager directly to the receiving dock
    setScreen("RECEIVING_NODE", "DETAIL");
    if (onDismiss) onDismiss();
  };

  return (
    <div className="group relative w-full bg-[#0A0A0A] border border-emerald-500/20 rounded-[2rem] p-5 flex items-center gap-5 shadow-2xl shadow-emerald-500/5 animate-in slide-in-from-right duration-500 hover:border-emerald-500/40 transition-all">
      {/* --- STATUS ICON: Moving Truck --- */}
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 transition-all duration-500">
          <Truck
            size={20}
            className="text-emerald-500 group-hover:text-black"
          />
        </div>
        {/* Pulsing "In-Transit" Dot */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A0A0A] animate-pulse" />
      </div>

      {/* --- CONTENT: Supplier & Order ID --- */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[8px] font-black uppercase text-emerald-500 tracking-[0.2em]">
            Logistics Handshake
          </span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span className="text-[8px] font-mono font-bold text-white/20 uppercase">
            PO-{payload.orderId.slice(-6).toUpperCase()}
          </span>
        </div>

        <p className="text-[11px] font-black uppercase text-white leading-tight truncate">
          {payload.supplierName}{" "}
          <span className="text-white/40">marked as shipped</span>
        </p>

        <p className="text-[9px] font-bold text-white/20 uppercase mt-1 italic">
          Material is currently in-transit to node
        </p>
      </div>

      {/* --- ACTION: Move to Receiving --- */}
      <button
        onClick={handleNavigateToReceiving}
        className="h-12 px-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 hover:bg-white hover:text-black transition-all group/btn"
      >
        <span className="text-[9px] font-black uppercase tracking-widest hidden md:block">
          Receive
        </span>
        <PackageCheck
          size={14}
          className="opacity-40 group-hover/btn:opacity-100"
        />
        <ChevronRight
          size={14}
          className="opacity-20 group-hover/btn:opacity-100"
        />
      </button>
    </div>
  );
}
