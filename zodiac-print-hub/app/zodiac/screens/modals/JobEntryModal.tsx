"use client";

import { useState } from "react";
import { useDataStore } from "../../store/core/useDataStore";
import { useModalStore } from "../../store/useModalStore";
import { ServiceSearchModal } from "./ServiceSearchModal";

export function JobEntryModal() {
  const {
    draft,
    setDraft,
    prices,
    createJob,
    calculateLiveEstimate,
    resetDraft,
  } = useDataStore();
  const { openModal } = useModalStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedService = prices.find((p) => p.id === draft.serviceId);
  const isLargeFormat =
    selectedService?.category === "Large Format" ||
    selectedService?.unit === "sqft";

  const handlePush = () => {
    if (!draft.serviceId || !draft.clientName) return;

    // Trigger Success State
    setIsSuccess(true);

    const total = calculateLiveEstimate();
    const materialUsed = isLargeFormat
      ? draft.width * draft.height * draft.quantity
      : draft.quantity;

    const newJob = {
      id: draft.id || `JOB-${Date.now()}`,
      clientName: draft.clientName,
      serviceId: draft.serviceId,
      quantity: draft.quantity,
      dimensions: isLargeFormat
        ? { w: draft.width, h: draft.height }
        : undefined,
      totalEstimate: total,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      materialWastage: 0,
    };

    // Delay the reset slightly so the user sees the "Success" state
    setTimeout(() => {
      createJob(newJob as any, materialUsed);
      resetDraft();
      setIsSuccess(false);
    }, 1500);
  };

  const canSubmit = draft.serviceId && draft.clientName;

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)]">
          <span className="text-black text-4xl">✓</span>
        </div>
        <h2 className="mt-6 text-green-400 font-black uppercase tracking-widest text-xl">
          Job Queued
        </h2>
        <p className="text-white/40 text-[10px] uppercase font-bold mt-2">
          Deducting Stock & Syncing...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full gap-5 p-6 animate-in slide-in-from-bottom duration-500">
      {/* 1. SERVICE TRIGGER */}
      <div className="w-full text-center space-y-2">
        <h2 className="text-white font-black text-xl uppercase italic tracking-tighter">
          {selectedService ? "Change Service" : "Select Service"}
        </h2>
        <button
          onClick={() => openModal("DETAIL", ServiceSearchModal)}
          className="w-full py-4 bg-cyan-500 text-black font-black uppercase text-lg rounded-[2rem] active:scale-95 transition-all shadow-xl shadow-cyan-500/20"
        >
          {selectedService ? selectedService.service : "Open"}
        </button>
      </div>

      {/* 2. CONDITIONAL DIMENSIONS */}
      {isLargeFormat && (
        <div className="w-full grid grid-cols-2 gap-3 animate-in zoom-in-95 slide-in-from-top-4 duration-300">
          <input
            type="number"
            value={draft.width || ""}
            onChange={(e) => setDraft({ width: Number(e.target.value) })}
            placeholder="W (ft)"
            className="w-full h-12 bg-white/10 border border-cyan-500/30 rounded-2xl text-white text-center font-black outline-none"
          />
          <input
            type="number"
            value={draft.height || ""}
            onChange={(e) => setDraft({ height: Number(e.target.value) })}
            placeholder="H (ft)"
            className="w-full h-12 bg-white/10 border border-cyan-500/30 rounded-2xl text-white text-center font-black outline-none"
          />
        </div>
      )}

      {/* 3. QUANTITY & DESTINATION */}
      <div className="w-full grid grid-cols-2 gap-3">
        <input
          type="number"
          value={draft.quantity || ""}
          onChange={(e) => setDraft({ quantity: Number(e.target.value) })}
          placeholder="QTY"
          className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl text-white text-center font-black outline-none"
        />
        <button
          onClick={() =>
            setDraft({
              deliveryType:
                draft.deliveryType === "PHYSICAL_PICKUP"
                  ? "PRINTER_DELIVERY"
                  : "PHYSICAL_PICKUP",
            })
          }
          className={`w-full h-12 rounded-2xl text-[9px] font-black uppercase border transition-all ${
            draft.deliveryType === "PRINTER_DELIVERY"
              ? "bg-orange-500 border-orange-400 text-white"
              : "bg-white/5 border-white/10 text-white/40"
          }`}
        >
          {draft.deliveryType === "PRINTER_DELIVERY" ? "Delivery" : "Pickup"}
        </button>
      </div>

      {/* 4. CLIENT NAME */}
      <input
        placeholder="CLIENT NAME"
        value={draft.clientName}
        onChange={(e) => setDraft({ clientName: e.target.value })}
        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-center outline-none uppercase font-black"
      />

      {/* 5. THE FINAL PUSH BUTTON */}
      <button
        disabled={!canSubmit}
        onClick={handlePush}
        className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all mt-auto ${
          canSubmit
            ? "bg-white text-black shadow-white/10 shadow-2xl active:scale-95"
            : "bg-white/5 text-white/10 grayscale cursor-not-allowed border border-white/5"
        }`}
      >
        {canSubmit ? "Push to Production" : "Awaiting Details"}
      </button>
    </div>
  );
}
