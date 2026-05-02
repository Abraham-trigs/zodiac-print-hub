"use client";

import { useDataStore } from "@store/core/useDataStore";
import {
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  Package,
  Clock,
  ShieldCheck,
  Banknote,
  Smartphone,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export function RiderDispatchMobile() {
  const { deliveryState, collectAndDeliver, updateDeliveryStatus, user } =
    useDataStore();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // 🧠 LOGIC: Show only jobs assigned to THIS rider that are currently "OUT_FOR_DELIVERY"
  const myDeliveries = Object.values(deliveryState.deliveries || {}).filter(
    (d: any) => d.status === "OUT_FOR_DELIVERY" && d.handledBy === user?.name,
  );

  const handleStandardComplete = async (deliveryId: string) => {
    setIsProcessing(deliveryId);
    try {
      await updateDeliveryStatus(deliveryId, "DELIVERED");
    } finally {
      setIsProcessing(null);
    }
  };

  const handlePODComplete = async (d: any, method: "CASH" | "MOMO_OFFLINE") => {
    setIsProcessing(d.id);
    const balanceDue =
      d.job.totalPrice -
      (d.job.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0);

    try {
      // 🚀 V2 POD Handshake: Record money and close delivery in one atomic step
      await collectAndDeliver({
        deliveryId: d.id,
        jobId: d.jobId,
        orgId: d.orgId,
        amount: balanceDue,
        method,
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const openMaps = (address: string) => {
    window.open(`https://google.com{encodeURIComponent(address)}`, "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white p-5 font-sans">
      <header className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Package size={20} className="text-black" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase italic tracking-tighter">
              Rider Node
            </h2>
            <p className="text-[8px] text-emerald-400 font-black uppercase tracking-[0.2em]">
              Active Manifest
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase">
            {user?.name || "Rider"}
          </p>
          <span className="w-2 h-2 inline-block rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </header>

      <div className="flex-1 space-y-4">
        {myDeliveries.map((d: any) => {
          // 🧠 POD LOGIC: Calculate if money is still owed
          const totalPaid =
            d.job?.payments?.reduce(
              (sum: number, p: any) => sum + p.amount,
              0,
            ) || 0;
          const balanceDue = (d.job?.totalPrice || 0) - totalPaid;
          const isFullyPaid = balanceDue <= 0;

          return (
            <div
              key={d.id}
              className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-4"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
                    Order Ref
                  </span>
                  <h3 className="text-2xl font-black text-emerald-400 font-mono italic">
                    #{d.job?.shortRef}
                  </h3>
                </div>
                <div
                  className={`px-3 py-1 rounded-full border ${isFullyPaid ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500" : "border-orange-500/20 bg-orange-500/5 text-orange-400"} text-[8px] font-black uppercase`}
                >
                  {isFullyPaid ? "Paid" : "Payment Due"}
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <button
                  onClick={() => openMaps(d.address || "Accra")}
                  className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10 transition-all text-left"
                >
                  <MapPin size={18} className="text-cyan-400" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black text-white/40 uppercase">
                      Destination
                    </p>
                    <p className="text-xs font-bold truncate">
                      {d.address || "Pickup"}
                    </p>
                  </div>
                </button>

                <a
                  href={`tel:${d.client?.phone}`}
                  className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10 transition-all text-left"
                >
                  <Phone size={18} className="text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-white/40 uppercase">
                      Contact
                    </p>
                    <p className="text-xs font-bold">{d.client?.phone}</p>
                  </div>
                </a>
              </div>

              {/* --- ACTION ZONE --- */}
              {isFullyPaid ? (
                <button
                  onClick={() => handleStandardComplete(d.id)}
                  disabled={isProcessing === d.id}
                  className="w-full py-6 bg-emerald-500 text-black rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-emerald-500/10"
                >
                  {isProcessing === d.id ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      Confirm Handover
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-[10px] font-black text-orange-400 uppercase">
                      Collect Balance
                    </span>
                    <span className="text-xl font-black font-mono">
                      ₵{balanceDue.toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handlePODComplete(d, "CASH")}
                      disabled={isProcessing === d.id}
                      className="py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2"
                    >
                      <Banknote size={16} /> Cash
                    </button>
                    <button
                      onClick={() => handlePODComplete(d, "MOMO_OFFLINE")}
                      disabled={isProcessing === d.id}
                      className="py-5 bg-cyan-400 text-black rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2"
                    >
                      <Smartphone size={16} /> Momo
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {myDeliveries.length === 0 && (
          <div className="py-32 text-center opacity-20 flex flex-col items-center">
            <CheckCircle2 size={64} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">
              Manifest Empty
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
