"use client";

import { useEffect, useState } from "react";
import { useDataStore } from "@store-core/useDataStore";
import { useModalStore } from "@store/useModalStore";

import { WastePromptModal } from "./WastePromptModal";
import { DeliveryHandlingModal } from "./DeliveryHandlingModal";
import { PaymentVerificationModal } from "./PaymentVerificationModal";

import type { DeliveryRecord } from "../../lib/shared/types/zodiac.types";

/* =========================================================
   SELECTORS ONLY (Synced with Grouped Store)
========================================================= */
import {
  selectJobById,
  selectStaffArray, // ✅ FIXED: consistent with selectors naming
  selectPricesMap,
  selectDeliveriesArray,
  selectB2BMap, // 🔥 NEW: To show negotiation context
} from "@store/selectors/data.selectors";

export function JobDetailsModal({
  jobId,
  onClose,
}: {
  jobId: string;
  onClose: () => void;
}) {
  const { swapModal } = useModalStore();

  /* -------------------------
     SELECTED DATA (Synced Paths)
  --------------------------*/
  const job = useDataStore((s) => selectJobById(jobId)(s));
  const staffList = useDataStore(selectStaffArray);
  const prices = useDataStore(selectPricesMap);
  const deliveries = useDataStore(selectDeliveriesArray);
  const b2bDeals = useDataStore(selectB2BMap);

  const service = job ? prices[job.serviceId] : undefined;
  const b2bDeal = job?.b2bPushId ? b2bDeals[job.b2bPushId] : undefined;

  const existingDelivery = job
    ? deliveries.find((d) => d.jobId === job.id)
    : undefined;

  /* -------------------------
     TIMER STATE
  --------------------------*/
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Note: status names must match JobStatusEnum (e.g., IN_PROGRESS)
    if (job?.status !== "IN_PROGRESS") return;

    const startTime = (job as any)?.updatedAt
      ? new Date((job as any).updatedAt).getTime()
      : Date.now();

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [job?.status, job?.updatedAt]);

  if (!job) return null;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}h ` : ""}${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  /* -------------------------
     ACTIONS (Synced with frozen Service logic)
  --------------------------*/
  const triggerWasteAudit = () => {
    swapModal("GLOBAL", () => (
      <WastePromptModal
        job={{ ...job, unit: service?.unit }}
        onConfirm={(waste) => {
          // Logic Sync: Should call a unified job status update that handles ledger
          useDataStore.getState().updateJobStatus(job.id, "COMPLETED");
        }}
      />
    ));
  };

  const handleFulfillment = () => {
    if (existingDelivery) {
      swapModal("GLOBAL", () => (
        <DeliveryHandlingModal delivery={existingDelivery} />
      ));
      return;
    }

    const newDelivery: DeliveryRecord = {
      id: `DLV-${job.id}`,
      orgId: job.orgId,
      jobId: job.id,
      clientId: job.clientId,
      type: "PHYSICAL_PICKUP",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useDataStore.getState().addDelivery(newDelivery);
    swapModal("GLOBAL", () => <DeliveryHandlingModal delivery={newDelivery} />);
  };

  return (
    <div className="glass-card p-6 w-full max-w-md border border-white/10 flex flex-col gap-6 bg-zinc-900 text-white rounded-3xl">
      {/* HEADER */}
      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 items-center">
            <span className="text-[10px] bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded">
              #{job.id.slice(-6)}
            </span>
            {b2bDeal && (
              <span className="text-[10px] bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded border border-amber-400/20">
                B2B DEAL
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold">Client: {job.clientId}</h2>
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest">
            {service?.name || job.serviceName}
          </span>
        </div>
        <button
          onClick={onClose}
          className="opacity-40 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </header>

      {/* TIMER SECTION */}
      <div className="py-6 text-center bg-white/5 rounded-3xl border border-white/5">
        <div className="text-[10px] uppercase tracking-tighter opacity-40 mb-1">
          {job.status === "IN_PROGRESS"
            ? "Active Production Time"
            : "Status: " + job.status}
        </div>
        <div className="text-4xl font-mono tracking-tight">
          {formatTime(elapsed)}
        </div>
      </div>

      {/* STAFF ASSIGNMENT */}
      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
        <label className="text-[10px] uppercase opacity-40 mb-2 block">
          Assigned Staff
        </label>
        <select
          value={job.assignedStaffId || ""}
          onChange={(e) =>
            useDataStore.getState().assignStaff(job.id, e.target.value)
          }
          className="w-full bg-transparent text-cyan-400 outline-none"
        >
          <option value="" className="bg-zinc-900">
            Unassigned
          </option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id} className="bg-zinc-900">
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* JOB STATS */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="opacity-40 mb-1">Qty</div>
          <div className="font-bold">{job.quantity}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="opacity-40 mb-1">Size</div>
          <div className="font-bold">
            {job.width && job.height ? `${job.width}x${job.height}` : "N/A"}
          </div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="opacity-40 mb-1">Waste</div>
          <div className="font-bold text-rose-400">
            {job.materialWastage || 0}
          </div>
        </div>
      </div>

      {/* FINANCIAL STATUS */}
      <div className="flex justify-between items-center px-2">
        <span
          className={`text-[10px] font-bold px-3 py-1 rounded-full ${job.isPaid ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"}`}
        >
          {job.isPaid ? "FULLY PAID" : "PAYMENT PENDING"}
        </span>
        <span className="font-mono text-sm">
          GHS {job.totalPrice.toFixed(2)}
        </span>
      </div>

      {/* ACTION FOOTER */}
      <div className="flex flex-col gap-2 pt-2">
        {!job.isPaid && (
          <button
            className="btn-primary py-3 rounded-2xl bg-cyan-500 text-black font-bold"
            onClick={() =>
              swapModal("GLOBAL", () => (
                <PaymentVerificationModal jobId={job.id} />
              ))
            }
          >
            Verify Payment
          </button>
        )}

        {job.status === "PENDING" && (
          <button
            className="btn-secondary py-3 rounded-2xl bg-white/10 font-bold"
            onClick={() =>
              useDataStore.getState().updateJobStatus(job.id, "IN_PROGRESS")
            }
          >
            Start Production
          </button>
        )}

        {job.status === "IN_PROGRESS" && (
          <div className="flex gap-2">
            <button
              className="flex-1 py-3 rounded-2xl bg-emerald-500 text-black font-bold text-sm"
              onClick={triggerWasteAudit}
            >
              Complete Job
            </button>
            <button
              className="px-6 py-3 rounded-2xl bg-white/10 font-bold text-sm"
              onClick={() =>
                useDataStore.getState().updateJobStatus(job.id, "PAUSED")
              }
            >
              Pause
            </button>
          </div>
        )}

        {job.status === "COMPLETED" && (
          <button
            className="btn-primary py-3 rounded-2xl bg-white text-black font-bold"
            onClick={handleFulfillment}
          >
            {existingDelivery ? "Manage Delivery" : "Ready for Fulfillment"}
          </button>
        )}
      </div>
    </div>
  );
}
