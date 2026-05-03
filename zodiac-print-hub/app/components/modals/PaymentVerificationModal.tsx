"use client";

import { useState } from "react";
import { useDataStore } from "../../zodiac/store/core/useDataStore";
import { useModalStore } from "../../zodiac/store/useModalStore";

export function PaymentVerificationModal({ jobId }: { jobId: string }) {
  const [ref, setRef] = useState("");
  const { confirmPayment } = useDataStore();
  const { closeModal } = useModalStore();

  const handleVerify = () => {
    if (!ref) return;
    confirmPayment(jobId, ref);
    closeModal("GLOBAL");
  };

  return (
    <div className="glass-card p-6 w-full max-w-sm border-green-500/30 animate-in zoom-in-95">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-xl">
          💰
        </div>
        <div>
          <h2 className="text-xl font-bold">Smart Payment</h2>
          <p className="text-[10px] text-green-400 font-black uppercase">
            Verify Job #{jobId}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase opacity-40 font-bold">
            Transaction Reference / Job Code
          </label>
          <input
            autoFocus
            className="input-field font-mono text-green-400"
            placeholder="e.g. MO-12345678"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-2">
          <p className="text-[10px] opacity-50 italic text-center">
            💡 Feature 4.1: Entering the MoMo ID or Job Code auto-marks this as
            "Paid" in the Income analysis.
          </p>
        </div>

        <button
          onClick={handleVerify}
          disabled={!ref}
          className="w-full py-4 bg-green-500 text-black font-black rounded-2xl uppercase tracking-widest disabled:opacity-20 active:scale-95 transition-all shadow-lg shadow-green-500/20"
        >
          Verify Payment
        </button>
      </div>
    </div>
  );
}
