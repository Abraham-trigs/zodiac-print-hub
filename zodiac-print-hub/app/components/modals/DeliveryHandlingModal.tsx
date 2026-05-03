"use client";

import { useState } from "react";
import { useDataActions, usePrices } from "@lib/client/hooks/store.hooks";
import {
  DeliveryRecord,
  DeliveryStatus,
} from "@/lib/shared/types/zodiac.types";
import { useModalStore } from "@store/useModalStore";

// Mock staff list - replace with useStaff() if you have a staff store
const PRINTER_STAFF = ["Kofi", "Ama", "Nana", "Yaw"];

export function DeliveryHandlingModal({
  delivery,
}: {
  delivery: DeliveryRecord;
}) {
  const { closeModal } = useModalStore();
  const { updateJobStatus, updateDelivery, confirmPayment, assignStaff } =
    useDataActions();

  const [status, setStatus] = useState<DeliveryStatus>(delivery.status);
  const [pickupDate, setPickupDate] = useState(delivery.pickupDate || "");
  const [isPaid, setIsPaid] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleFinalConfirm = () => {
    setIsSyncing(true);

    // 1. Sync Records
    updateDelivery(delivery.id, { status, pickupDate });

    if (isPaid) confirmPayment(delivery.jobId, `PAY-${Date.now()}`);
    if (selectedStaff) assignStaff(delivery.jobId, selectedStaff);

    // 2. Logic: If completed, move Job Status
    if (status === "COMPLETED") {
      updateJobStatus(delivery.jobId, "DELIVERED");
    }

    setTimeout(() => {
      closeModal("GLOBAL");
    }, 800);
  };

  return (
    <div className="glass-card p-6 w-full max-w-sm border-white/10 relative overflow-hidden bg-[#0A0A0A] backdrop-blur-2xl rounded-[2.5rem] shadow-2xl">
      {isSyncing && (
        <div className="absolute inset-0 bg-cyan-500 z-50 flex flex-col items-center justify-center animate-in fade-in">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-black font-black uppercase text-[10px] tracking-[0.3em]">
            Syncing Records
          </span>
        </div>
      )}

      <h2 className="text-xl font-bold tracking-tighter italic text-white mb-6">
        Fulfillment Ops
      </h2>

      <div className="flex flex-col gap-4">
        {/* STAFF ASSIGNMENT */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase opacity-40 font-black tracking-widest ml-1">
            Handled By
          </label>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-400 text-sm font-bold text-white appearance-none"
          >
            <option value="" disabled className="bg-black">
              Select Staff...
            </option>
            {PRINTER_STAFF.map((name) => (
              <option key={name} value={name} className="bg-black">
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* PAYMENT TOGGLE */}
        <button
          onClick={() => setIsPaid(!isPaid)}
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
            isPaid
              ? "bg-green-500/20 border-green-500/50"
              : "bg-white/5 border-white/10 opacity-60"
          }`}
        >
          <span className="text-[9px] font-black uppercase tracking-widest text-white">
            Payment Received
          </span>
          <div
            className={`w-8 h-4 rounded-full relative ${isPaid ? "bg-green-500" : "bg-white/20"}`}
          >
            <div
              className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isPaid ? "left-4.5" : "left-0.5"}`}
            />
          </div>
        </button>

        {/* DATE PICKER */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase opacity-40 font-black tracking-widest ml-1">
            Date
          </label>
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-400 text-sm text-white font-mono"
          />
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 gap-2 mt-2">
          <button
            onClick={() =>
              setStatus(status === "PAUSED" ? "SCHEDULED" : "PAUSED")
            }
            className={`w-full py-4 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] border ${
              status === "PAUSED"
                ? "bg-orange-500 text-white border-orange-400"
                : "bg-white/5 text-orange-400 border-orange-500/20"
            }`}
          >
            {status === "PAUSED" ? "Resume" : "Pause"}
          </button>

          <button
            onClick={handleFinalConfirm}
            className="w-full py-5 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] active:scale-95 shadow-xl"
          >
            Confirm & Finish
          </button>
        </div>
      </div>
    </div>
  );
}
