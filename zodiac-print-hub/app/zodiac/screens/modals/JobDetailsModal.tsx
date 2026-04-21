"use client";

import { useState, useEffect } from "react";
import { useDataStore } from "../../store/core/useDataStore";
import { useModalStore } from "../../store/useModalStore";
import { WastePromptModal } from "./WastePromptModal";
import { DeliveryHandlingModal } from "./DeliveryHandlingModal";
import { PaymentVerificationModal } from "./PaymentVerificationModal";
import { DeliveryRecord } from "../../types/zodiac.types";

export function JobDetailsModal({
  jobId,
  onClose,
}: {
  jobId: string;
  onClose: () => void;
}) {
  const {
    jobs,
    prices,
    deliveries,
    updateJobStatus,
    startJob,
    recordWastage,
    addDelivery,
    assignStaff, // Ensure this exists in your store to update job.assignedStaffId
  } = useDataStore();
  const { swapModal } = useModalStore();

  const job = jobs.find((j) => j.id === jobId);
  const service = prices.find((p) => p.id === job?.serviceId);
  const existingDelivery = deliveries.find((d) => d.jobId === jobId);

  // Mock Staff List for assignment (Feature 3.2)
  const staffList = [
    { id: "STF-01", name: "Kojo" },
    { id: "STF-02", name: "Ama" },
  ];

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (job?.status === "IN_PROGRESS" && job.startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - job.startTime!) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [job?.status, job?.startTime]);

  if (!job) return null;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + "h " : ""}${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  const triggerWasteAudit = () => {
    swapModal("GLOBAL", () => (
      <WastePromptModal
        job={{ ...job, unit: service?.unit }}
        onConfirm={(waste) => {
          recordWastage(job.id, waste);
          if (job.status === "IN_PROGRESS")
            updateJobStatus(job.id, "SUCCESSFUL");
        }}
      />
    ));
  };

  const handleFulfillment = () => {
    if (existingDelivery) {
      swapModal("GLOBAL", () => (
        <DeliveryHandlingModal delivery={existingDelivery} />
      ));
    } else {
      const newDelivery: DeliveryRecord = {
        id: `DLV-${job.id}`,
        jobId: job.id,
        type: "PHYSICAL_PICKUP",
        status: "PENDING_DATE",
        handledBy: "PRINTER",
      };
      addDelivery(newDelivery);
      swapModal("GLOBAL", () => (
        <DeliveryHandlingModal delivery={newDelivery} />
      ));
    }
  };

  return (
    <div className="glass-card p-6 w-full max-w-md border border-white/10 flex flex-col gap-6 animate-in slide-in-from-bottom-4 shadow-2xl">
      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded font-black tracking-tighter">
              #{job.id}
            </span>
            <span
              className={`text-[8px] px-2 py-0.5 rounded-full font-black ${job.isPaid ? "bg-green-500 text-black" : "bg-red-500/20 text-red-500"}`}
            >
              {job.isPaid ? "PAID" : "UNPAID"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">
            {job.clientName}
          </h2>
          <span className="text-[10px] text-cyan-400 uppercase font-black tracking-[0.2em]">
            {service?.service}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs opacity-40 hover:opacity-100 transition-all"
        >
          ✕
        </button>
      </header>

      {/* Production Clock */}
      <div className="relative overflow-hidden group py-10 bg-gradient-to-b from-white/5 to-transparent rounded-3xl border border-white/5 flex flex-col items-center">
        <span className="text-[10px] uppercase opacity-30 tracking-[0.3em] mb-2 font-black">
          {job.status === "IN_PROGRESS"
            ? "Active Production"
            : "Total Time Logged"}
        </span>
        <span
          className={`text-5xl font-mono font-black tracking-tighter ${job.status === "IN_PROGRESS" ? "text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "text-white/20"}`}
        >
          {formatTime(elapsed)}
        </span>
      </div>

      {/* ✅ FEATURE 3.2: Staff Assignment Section */}
      <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
        <label className="text-[10px] uppercase opacity-40 font-black tracking-widest">
          Assigned Personnel
        </label>
        <select
          value={job.assignedStaffId || ""}
          onChange={(e) => assignStaff(job.id, e.target.value)}
          className="bg-transparent text-sm font-bold text-cyan-400 outline-none"
        >
          <option value="" disabled>
            Select Staff Member
          </option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Qty", val: job.quantity, unit: service?.unit },
          {
            label: "Size",
            val: job.dimensions
              ? `${job.dimensions.w}x${job.dimensions.h}`
              : "N/A",
            unit: job.dimensions ? "ft" : "",
          },
          {
            label: "Waste",
            val: job.materialWastage || 0,
            unit: service?.unit,
            highlight: job.materialWastage > 0,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col items-center"
          >
            <span className="text-[8px] opacity-30 uppercase font-bold">
              {stat.label}
            </span>
            <span
              className={`text-xs font-black ${stat.highlight ? "text-orange-400" : "text-white"}`}
            >
              {stat.val}{" "}
              <span className="text-[8px] opacity-40 font-normal">
                {stat.unit}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {!job.isPaid && (
          <button
            onClick={() =>
              swapModal("GLOBAL", () => (
                <PaymentVerificationModal jobId={job.id} />
              ))
            }
            className="w-full py-3 border border-green-500/30 text-green-500 text-[10px] font-bold rounded-xl hover:bg-green-500/5 transition-all"
          >
            Verify Payment Reference
          </button>
        )}

        {job.status === "PENDING" && (
          <button
            onClick={() => startJob(job.id)}
            className="w-full py-4 bg-cyan-500 text-black font-black rounded-2xl uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
          >
            Start Production
          </button>
        )}

        {job.status === "IN_PROGRESS" && (
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={triggerWasteAudit}
              className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl uppercase shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              Mark Successful
            </button>
            <button
              onClick={() => updateJobStatus(job.id, "PAUSED")}
              className="w-full py-3 bg-white/5 text-white/40 text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-white/10"
            >
              Pause Production
            </button>
          </div>
        )}

        {job.status === "SUCCESSFUL" && (
          <div className="flex flex-col gap-2">
            <div className="text-center py-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center gap-2">
              <span className="text-green-500 font-black uppercase text-[10px] tracking-widest">
                ✔ Production Complete
              </span>
            </div>
            <button
              onClick={handleFulfillment}
              className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
            >
              {existingDelivery
                ? "Manage Delivery / Pickup"
                : "Arrange Fulfillment"}
            </button>
            <button
              onClick={triggerWasteAudit}
              className="w-full py-3 border border-orange-500/20 text-orange-400/60 text-[9px] uppercase font-bold rounded-xl"
            >
              Update Waste Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
