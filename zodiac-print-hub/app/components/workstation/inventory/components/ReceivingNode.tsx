"use client";

import { useDataStore } from "@store-core/useDataStore";
import { PackageCheck, Truck, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { apiClient } from "@client/api/client";
import { ZodiacScreen } from "@types/screen.types";

/**
 * RECEIVING_NODE_SCREEN
 * The final stage of the Procurement loop.
 * Handles the physical arrival of stock and synchronizes the Inventory Ledger.
 */
export const ReceivingNodeScreen: ZodiacScreen = {
  id: "RECEIVING_NODE",
  layoutMode: "DETAIL",

  TopComponent: () => {
    const { procurementState, loadPurchaseOrders, loadInventory } =
      useDataStore();
    const [processingId, setProcessingId] = useState<string | null>(null);

    // 🧠 Logic: Only show orders that are 'ORDERED' (In-Transit)
    const inTransit = Object.values(procurementState.activeOrders || {}).filter(
      (po: any) => po.status === "ORDERED",
    );

    const handleReceive = async (poId: string) => {
      setProcessingId(poId);
      try {
        // 🚀 V2 HANDSHAKE: Atomic receiving & stock increment
        await apiClient(`/api/procurement/orders/${poId}/receive`, {
          method: "POST",
        });

        // Parallel refresh of logistics and physical stock
        await Promise.all([loadPurchaseOrders(), loadInventory()]);
      } catch (err) {
        console.error("Receiving node error:", err);
      } finally {
        setProcessingId(null);
      }
    };

    return (
      <div className="flex flex-col h-full p-8 text-white animate-in fade-in zoom-in-95 duration-500">
        {/* --- HUB HEADER --- */}
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              Receiving Port
            </h2>
            <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2">
              Industrial Inventory Check-In
            </p>
          </div>

          <div className="flex gap-4">
            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
              <Truck size={16} className="text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                {inTransit.length} Incoming Stream(s)
              </span>
            </div>
          </div>
        </header>

        {/* --- INCOMING SHIPMENTS --- */}
        <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {inTransit.map((po: any) => (
            <div
              key={po.id}
              className="glass-card border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group rounded-[2.5rem]"
            >
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  {/* Status Icon */}
                  <div className="w-16 h-16 rounded-[2rem] bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 group-hover:bg-cyan-400 group-hover:border-cyan-400 transition-all duration-500">
                    <Truck
                      size={28}
                      className="text-cyan-400 group-hover:text-black transition-colors"
                    />
                  </div>

                  <div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
                      Identity Node
                    </span>
                    <h3 className="text-2xl font-black uppercase tracking-tight mt-1">
                      PO-{po.id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mt-1 opacity-60">
                      Partner: {po.supplier?.name || "Global Provider"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  {/* Manifest Preview */}
                  <div className="text-right hidden md:block">
                    <span className="text-[8px] opacity-20 uppercase font-black block mb-2 tracking-widest">
                      Payload Manifest
                    </span>
                    <div className="flex flex-col gap-1">
                      {po.items?.map((item: any, idx: number) => (
                        <p
                          key={idx}
                          className="text-xs font-black font-mono text-white/60 uppercase"
                        >
                          {item.quantity}× {item.material?.name || "Unit"} (
                          {item.buyUnit})
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Physical Trigger */}
                  <button
                    disabled={processingId === po.id}
                    onClick={() => handleReceive(po.id)}
                    className="px-10 py-6 bg-white text-black font-black uppercase text-[11px] rounded-[2rem] flex items-center gap-3 hover:bg-cyan-400 active:scale-95 transition-all shadow-2xl shadow-white/5 disabled:opacity-20"
                  >
                    {processingId === po.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <PackageCheck size={18} />
                    )}
                    Verify Arrival
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* --- EMPTY STATE --- */}
          {inTransit.length === 0 && (
            <div className="flex-1 py-40 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] opacity-10">
              <CheckCircle2 size={80} />
              <p className="text-xs font-black uppercase tracking-[1em] mt-8 ml-4">
                Node Clear • All Stock Logged
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
};
