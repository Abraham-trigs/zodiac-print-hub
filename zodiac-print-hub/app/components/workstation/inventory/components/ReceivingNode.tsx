"use client";

import { useDataStore } from "@store/core/useDataStore";
import { PackageCheck, Truck, Calendar, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { apiClient } from "@root/lib/api/client";

export function ReceivingNode() {
  const { procurementState, loadPurchaseOrders, loadInventory } =
    useDataStore();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Logic: Only show orders that have been 'ORDERED' (sent to supplier) but not yet 'RECEIVED'
  const inTransit = Object.values(procurementState.activeOrders || {}).filter(
    (po: any) => po.status === "ORDERED",
  );

  const handleReceive = async (poId: string) => {
    setProcessingId(poId);
    try {
      await apiClient(`/api/procurement/orders/${poId}/receive`, {
        method: "POST",
      });
      await loadPurchaseOrders(); // Refresh lists
      await loadInventory(); // Refresh stock balances
      alert("Inventory successfully updated.");
    } catch (err) {
      console.error("Receiving error", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 text-white animate-in fade-in">
      <header className="mb-10">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">
          Receiving Node
        </h2>
        <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2">
          Inventory Check-In
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {inTransit.map((po: any) => (
          <div
            key={po.id}
            className="glass-card border-white/5 bg-white/[0.02] overflow-hidden group"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 group-hover:bg-cyan-400 group-hover:text-black transition-all">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Order #{po.id.slice(-4).toUpperCase()}
                  </h3>
                  <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mt-1">
                    Provider: {po.supplier?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <span className="text-[8px] opacity-30 uppercase font-black block mb-1">
                    Expected Yield
                  </span>
                  <p className="text-lg font-black font-mono">
                    {po.items
                      ?.map((i: any) => `${i.quantity} ${i.buyUnit}`)
                      .join(", ")}
                  </p>
                </div>

                <button
                  disabled={processingId === po.id}
                  onClick={() => handleReceive(po.id)}
                  className="px-8 py-4 bg-white text-black font-black uppercase text-[10px] rounded-2xl flex items-center gap-3 hover:bg-cyan-400 transition-all active:scale-95"
                >
                  {processingId === po.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <PackageCheck size={16} />
                  )}
                  Confirm Arrival
                </button>
              </div>
            </div>
          </div>
        ))}

        {inTransit.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-white/10 rounded-[3rem]">
            <PackageCheck size={64} />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-6">
              No pending shipments
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
